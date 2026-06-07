import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(["!**/*"]),
  {
    extends: compat.extends("../../.eslintrc.json"),
  },
  {
    files: ["**/*.ts"],

    languageOptions: {
      ecmaVersion: 5,
      sourceType: "script",

      parserOptions: {
        project: [
          "projects/angular-editor-app/tsconfig.app.json",
          "projects/angular-editor-app/tsconfig.spec.json",
          "projects/angular-editor-app/e2e/tsconfig.json",
        ],

        createDefaultProgram: true,
      },
    },

    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],

      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],

      "@angular-eslint/no-host-metadata-property": "warn",
    },
  },
  {
    files: ["**/*.html"],
    rules: {},
  },
]);
