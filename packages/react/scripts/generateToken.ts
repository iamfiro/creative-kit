import { constants } from 'buffer';
import fs from 'fs';
import { ensureDirectoryExists } from './shared';

type ThemeValue = string | number;
type TokenCategory = Record<string, ThemeValue> | { light: Record<string, ThemeValue>; dark: Record<string, ThemeValue> };
type TokenStructure = Record<string, TokenCategory>;

const CONFIG = {
    variablePrefix: 'ck',
    tokenPath: './src/token/token.json',
    output: {
        constants: './src/constants',
        css: './src/styles/base.css',
    }
} as const;

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

    // Write constants file
    // sample.ts를 뒤에 추가 하는 이유는, (왜지 답 아시는 분은 PR 부탁드립니다)
    ensureDirectoryExists(CONFIG.output.constants + '/sample.ts');

    Object.entries(tokenContent).forEach(([category, values]) => {
        let constantsContent = '/* Auto-generated code. DO NOT modify directly. */\n/* To make changes, edit src/token/token.json */\n\n';

        const constants = generateConstants(category, values);
        constantsContent += `export const ${firstLetterToUpperCase(category)} = {\n${constants}};`;

        fs.writeFileSync(`${CONFIG.output.constants}/${category}.ts`, constantsContent);
    });

    console.log('✅ 상수 파일이 생성되었습니다.');

} catch (error) {
    throw new Error(`❌ 토큰 생성 중 오류가 발생했습니다.\n${error}`);
}