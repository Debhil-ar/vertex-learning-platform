import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next. Providing a global
  // ignores list here replaces ESLint's implicit "**/node_modules/**"
  // default, so it must be restated explicitly alongside it.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "**/node_modules/**",
    // Standalone Studio workspace — has its own build output and lint setup.
    "studio/**",
  ]),
]);

export default eslintConfig;
