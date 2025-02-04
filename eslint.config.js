import eslint from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/*.snap", "coverage", "lib", "node_modules", "pnpm-lock.yaml"],
  },
  { linterOptions: { reportUnusedDisableDirectives: "error" } },
  eslint.configs.recommended,
  {
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    files: ["**/*.js", "**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ["*.config.*s"] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    extends: [vitest.configs.recommended],
    files: ["**/*.test.*"],
    rules: { "@typescript-eslint/no-unsafe-assignment": "off" },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
);
