import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts', // 입력 파일 경로
  output: [
    {
      file: 'dist/index.js', // 출력 파일 경로
      format: 'cjs', // CommonJS 형식
    },
    {
      file: 'dist/index.esm.js', // 출력 파일 경로
      format: 'esm', // ES 모듈 형식
    },
  ],
  plugins: [
    resolve(), // Node 모듈을 가져오기 위한 플러그인
    commonjs(), // CommonJS 모듈을 ES6로 변환하는 플러그인
    typescript(), // TypeScript 파일을 컴파일하는 플러그인
    terser(), // 코드 압축을 위한 플러그인
  ],
};