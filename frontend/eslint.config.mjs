import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore lock files and node_modules
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "node_modules/**",
    // Ignore build output
    ".turbo/**",
    ".vercel/**",
  ]),
]);

export default eslintConfig;
