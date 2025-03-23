import fs from 'fs';

const tokenPath = '../react/src/token/token.json';
const tokenContent = fs.readFileSync(tokenPath, 'utf-8');
const tokenJson = JSON.parse(tokenContent);
console.log(tokenJson)