import fs from 'fs';
import { ensureDirectoryExists } from './shared';
import path from 'path';

type ThemeValue = string | number;
type SemanticTheme = Record<string, ThemeValue>;

type ColorStructure = {
    foundation: Record<string, Record<string, ThemeValue>>;
    semantic: {
        light: Record<string, SemanticTheme>;
        dark: Record<string, SemanticTheme>;
    };
};

type TokenStructure = {
    color: ColorStructure;
    [key: string]: Record<string, Record<string, ThemeValue>> | ColorStructure | Record<string, ThemeValue>;
};

const CONFIG = {
    variablePrefix: 'ck',
    tokenPath: path.resolve(__dirname, '../src/token/token.json'),
    output: {
        constants: path.resolve(__dirname, '../src/constants'),
        css: path.resolve(__dirname, '../src/styles/base.css')
    }
} as const;

const tokenContent = JSON.parse(fs.readFileSync(CONFIG.tokenPath, 'utf8')) as TokenStructure;
if (!tokenContent) {
    throw new Error('❌ 디자인 토큰 파일을 찾을 수 없습니다.');
}

function firstLetterToUpperCase(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// 참조 토큰 값 해석
function resolveTokenReference(value: string | ThemeValue, tokens: TokenStructure): string {
    // If not a reference, return as is
        if (typeof value !== 'string' || !value.startsWith('{') || !value.endsWith('}')) {
            return String(value);
        }

    // Extract path from reference (e.g., "color.foundation.neutral.100")
    const path = value.slice(1, -1).split('.');
    
    // Navigate through token structure to get actual value
    let resolved: any = tokens;
    for (const segment of path) {
        if (!resolved[segment]) {
            console.warn(`Warning: Could not resolve token reference ${value}`);
            return value; // Return original if can't resolve
        }
        resolved = resolved[segment];
    }

    return resolved;
}

// Foundation 및 기본 토큰을 CSS 변수로 생성
function generateFoundationCSSVariables(tokens: TokenStructure): string {
    let cssVars: string[] = [];

    // Process foundation colors
    if (tokens.color && tokens.color.foundation) {
        Object.entries(tokens.color.foundation).forEach(([palette, colors]) => {
            Object.entries(colors).forEach(([shade, value]) => {
                cssVars.push(`    --${CONFIG.variablePrefix}-color-foundation-${palette}-${shade}: ${value};`);
            });
        });
    }

    // Process other flat token categories (like spacing)
    Object.entries(tokens).forEach(([category, values]) => {
        if (category !== 'color' && typeof values === 'object' && !('semantic' in values)) {
            Object.entries(values as Record<string, ThemeValue>).forEach(([key, value]) => {
                cssVars.push(`    --${CONFIG.variablePrefix}-${category}-${key}: ${value};`);
            });
        }
    });

    return cssVars.join('\n');
}

// Light theme semantic variables
function generateLightThemeVariables(tokens: TokenStructure): string {
    let cssVars: string[] = [];

    if (tokens.color?.semantic?.light) {
        Object.entries(tokens.color.semantic.light).forEach(([category, values]) => {
            Object.entries(values).forEach(([key, value]) => {
                const resolvedValue = resolveTokenReference(value, tokens);
                cssVars.push(`    --${CONFIG.variablePrefix}-color-semantic-${category}-${key}: ${resolvedValue};`);
            });
        });
    }

    return cssVars.join('\n');
}

// Dark theme semantic variables
function generateDarkThemeVariables(tokens: TokenStructure): string {
    let cssVars: string[] = [];

    if (tokens.color?.semantic?.dark) {
        Object.entries(tokens.color.semantic.dark).forEach(([category, values]) => {
            Object.entries(values).forEach(([key, value]) => {
                const resolvedValue = resolveTokenReference(value, tokens);
                cssVars.push(`    --${CONFIG.variablePrefix}-color-semantic-${category}-${key}: ${resolvedValue};`);
            });
        });
    }

    return cssVars.join('\n');
}

// Semantic 토큰을 TypeScript 코드로 변환
function generateSemanticConstants(semantic: Record<string, SemanticTheme>): string {
    // 최상위 color 객체 선언
    const colorCategories = Object.entries(semantic).map(([category, values]) => {
        const tokenEntries = Object.entries(values)
            .map(([key, _]) => {
                return `        ${key}: 'var(--${CONFIG.variablePrefix}-color-semantic-${category}-${key})',`;
            })
            .join('\n');
        return `    ${category}: {\n${tokenEntries}\n    },`;
    }).join('\n\n');
    
    return `export const Color = {\n${colorCategories}\n};\n`;
}

// 일반 토큰을 TypeScript 코드로 변환 (spacing, typography 등)
function generateTokenConstants(category: string, values: Record<string, ThemeValue>): string {
    const tokenEntries = Object.entries(values)
        .map(([key, _]) => `    ${key}: 'var(--${CONFIG.variablePrefix}-${category}-${key})',`)
        .join('\n');
    
    return `export const ${firstLetterToUpperCase(category)} = {\n${tokenEntries}\n};`;
}

try {
    // CSS 파일 생성
    let cssContent = '/* Auto-generated. Do not modify directly. */\n\n';
    
    // Foundation and base tokens
    cssContent += ':root {\n';
    cssContent += generateFoundationCSSVariables(tokenContent);
    cssContent += '\n\n';
    
    // Light theme semantic tokens (default theme)
    cssContent += '    /* Light Theme Semantic Tokens */\n';
    cssContent += generateLightThemeVariables(tokenContent);
    cssContent += '\n}\n\n';
    
    // Dark theme
    cssContent += '[data-theme="dark"] {\n';
    cssContent += '    /* Dark Theme Semantic Tokens */\n';
    cssContent += generateDarkThemeVariables(tokenContent);
    cssContent += '\n}\n';
    
    ensureDirectoryExists(CONFIG.output.css);
    fs.writeFileSync(CONFIG.output.css, cssContent);
    console.log('✅ 모든 디자인 토큰의 CSS 파일이 생성되었습니다.');
    
    // Constants 파일 생성
    ensureDirectoryExists(CONFIG.output.constants);
    
    // Semantic color constants (theme-aware)
    if (tokenContent.color?.semantic?.light) {
        const semanticConstants = generateSemanticConstants(tokenContent.color.semantic.light);
        fs.writeFileSync(`${CONFIG.output.constants}/semanticColors.ts`, semanticConstants);
        console.log('✅ Semantic Color 상수 파일이 생성되었습니다.');
    }
    
    // Generate constants for other token types (spacing, typography, etc.)
    Object.entries(tokenContent).forEach(([category, values]) => {
        if (category !== 'color' && typeof values === 'object') {
            // Handle flat token structures (like spacing)
            if (!('semantic' in values) && Object.values(values).every(v => typeof v !== 'object')) {
                const constants = generateTokenConstants(category, values as Record<string, ThemeValue>);
                fs.writeFileSync(`${CONFIG.output.constants}/${category}.ts`, constants);
                console.log(`✅ ${firstLetterToUpperCase(category)} 상수 파일이 생성되었습니다.`);
            }
        }
    });
} catch (error) {
    throw new Error(`❌ 토큰 생성 중 오류 발생: ${error}`);
}