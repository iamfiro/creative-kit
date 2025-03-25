import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import json from "@rollup/plugin-json";
import svgr from "@svgr/rollup";
import swc from "@rollup/plugin-swc";
import strip from '@rollup/plugin-strip';
import dts from "rollup-plugin-dts"
import { defineConfig } from "rollup";

const currentPath = new URL(".", import.meta.url).pathname;

const config = defineConfig([
  {
    input: "src/index.ts",
    output: [
      {
        format: "esm",
        dir: "./",
        sourcemap: false,
        exports: "named",
        preserveModules: true,
        preserveModulesRoot: "src",
      },
      {
        format: "cjs",
        dir: "./",
        sourcemap: false,
        exports: "named",
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({ extensions: [".ts", ".tsx", ".svg"] }),
      commonjs(),
      svgr({
        svgrOptions: { exportType: "default" },
        include: /\.svg$/,
      }),
      postcss({
        inject: false, // 스타일을 JS에 인라인하지 않고 별도 CSS 파일로 추출
        extract: true, // CSS 파일을 별도로 생성
        minimize: true, // CSS 최소화
        modules: false, // CSS 모듈 비활성화 (필요 시 true로 설정)
        use: ["sass"],
      }),
      json(),
      swc({
        exclude: ["**/*.scss", "**/*.css"], // SCSS 파일은 SWC가 처리하지 않도록 설정
        swc: {
          jsc: {
            parser: {
              syntax: "typescript", // TypeScript 문법 사용
              tsx: true, // TSX (TypeScript + JSX) 지원
              runtime: "automatic", // React의 JSX 변환을 자동(runtime: 'classic'이면 React import 필요)
            },
            transform: {
              react: { runtime: "automatic" }, // React JSX 변환 방식 (React 17+)
            },
            baseUrl: currentPath, // 현재 디렉터리를 기준으로 모듈 경로 설정
            paths: { "@/*": ["./src/*"] }, // `@`를 `./src`로 매핑하여 import 단축
          },
          sourceMaps: false, // 소스 맵 비활성화 (배포용 최적화)
          minify: true, // 코드 최소화 (파일 크기 줄이기)
        },
      }),
      strip({
        functions: [
          'console.log',
          'console.info',
          'console.debug',
        ],
        sourceMap: false,
        exclude:   ['**/*.svg'],
      }),
    ],
    external: ["react", "react-dom"],
  },
  {
    // 타입 정의 파일 생성용 설정
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
]);

export default config;
