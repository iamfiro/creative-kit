import { constants } from 'buffer';
import fs from 'fs';
import { ensureDirectoryExists } from './shared';
import path from 'path';

type ThemeValue = string | number;
type TokenCategory = Record<string, ThemeValue> | { light: Record<string, ThemeValue>; dark: Record<string, ThemeValue> };
type TokenStructure = Record<string, TokenCategory>;

const CONFIG = {
    variablePrefix: 'ck',
    tokenPath: path.resolve(__dirname, '../src/token/token.json'),
    output: {
        constants: path.resolve(__dirname, '../src/constants'),
        css: path.resolve(__dirname, '../src/styles/base.css')
    }
} as const;

// Function to remove directory and its contents
function removeDirectory(dirPath: string) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
            const curPath = path.join(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                removeDirectory(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dirPath);
    }
}

const tokenContent = JSON.parse(fs.readFileSync(CONFIG.tokenPath, 'utf8')) as TokenStructure;
if(!tokenContent) {
    throw new Error('❌ 디자인 토큰 파일을 찾을 수 없습니다.');
}

function isColorCategory(value: TokenCategory): value is { light: Record<string, ThemeValue>; dark: Record<string, ThemeValue> } {
    return typeof value === 'object' && 'light' in value && 'dark' in value;
}

function firstLetterToUpperCase(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateConstants(category: string, values: TokenCategory) {
    let variables = '';

    if(isColorCategory(values)) {
        const lightValues = values.light;
        const darkValues = values.dark;

        Object.entries(lightValues).forEach(([key]) => {
            variables += `    ${key}: 'var(--${CONFIG.variablePrefix}-${category}-${key})',\n`;
        });

        Object.entries(darkValues).forEach(([key]) => {
            variables += `    ${key}Dark: 'var(--${CONFIG.variablePrefix}-${category}-${key})',\n`;
        });

        return variables;
    };

    Object.entries(values).forEach(([key]) => {
        variables += `    ${key}: 'var(--${CONFIG.variablePrefix}-${category}-${key})',\n`;
    });

    return variables;
}

function generateCSSVariables(category: string, values: TokenCategory): { light: string; dark: string } {
    const formatValue = (value: string | number) => typeof value === 'number' ? `${value}px` : value;

    if(isColorCategory(values)) {
        const lightCSS = Object.entries(values.light)
            .map(([key, value]) => `    --${CONFIG.variablePrefix}-${category}-${key}: ${formatValue(value)};\n`)
            .join('');

        const darkCSS = Object.entries(values.dark)
            .map(([key, value]) => `    --${CONFIG.variablePrefix}-${category}-${key}: ${formatValue(value)};\n`)
            .join('');

        return {
            light: lightCSS,
            dark: darkCSS
        };
    }

    const commonCSS = Object.entries(values)
        .map(([key, value]) => `    --${CONFIG.variablePrefix}-${category}-${key}: ${formatValue(value)};\n`)
        .join('');
    
    return { light: commonCSS, dark: '' };
}

try {
    // Remove existing constants directory
    removeDirectory(CONFIG.output.constants);
    console.log('✅ 기존 상수 디렉토리가 삭제되었습니다.');

    let cssContent = '/* Auto-generated code. DO NOT modify directly. */\n/* To make changes, edit src/token/token.json */\n\n:root {\n';
    const darkThemeVariables: string[] = [];

    // Generate CSS variables
    Object.entries(tokenContent).forEach(([category, values]) => {
        const cssVariables = generateCSSVariables(category, values);
        cssContent += `    /* ${category} */\n${cssVariables.light}\n`;

        if(cssVariables.dark) {
            darkThemeVariables.push(`    /* ${category} */\n${cssVariables.dark}\n`);
        }
    });

    // if dark theme variables exist, add them to the CSS file
    if(darkThemeVariables.length > 0) {
        cssContent += '}\n\n/* Dark theme variables */\n[data-theme="dark"] {\n';
        cssContent += darkThemeVariables.join('\n');
    }
    cssContent += '}';

    // Write CSS file
    ensureDirectoryExists(CONFIG.output.css);
    fs.writeFileSync(CONFIG.output.css, cssContent);

    console.log('✅ CSS 파일이 생성되었습니다.');

    // Create new constants directory and generate files
    ensureDirectoryExists(CONFIG.output.constants);
    ensureDirectoryExists(CONFIG.output.constants + '/sample.ts');

    Object.entries(tokenContent).forEach(([category, values]) => {
        let constantsContent = '/* Auto-generated code. DO NOT modify directly. */\n/* To make changes, edit src/token/token.json */\n\n';

        const constants = generateConstants(category, values);
        constantsContent += `export const ${firstLetterToUpperCase(category)} = {\n${constants}};`;

        fs.writeFileSync(`${CONFIG.output.constants}/${category}.ts`, constantsContent);
    });

    console.log('✅ 새로운 상수 파일이 생성되었습니다.');

} catch (error) {
    throw new Error(`❌ 토큰 생성 중 오류가 발생했습니다.\n${error}`);
}