import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";

const browserGlobals = {
  AbortController: "readonly",
  atob: "readonly",
  Blob: "readonly",
  btoa: "readonly",
  clearInterval: "readonly",
  clearTimeout: "readonly",
  console: "readonly",
  CustomEvent: "readonly",
  document: "readonly",
  Event: "readonly",
  File: "readonly",
  FileReader: "readonly",
  fetch: "readonly",
  FormData: "readonly",
  Headers: "readonly",
  HTMLElement: "readonly",
  HTMLFormElement: "readonly",
  HTMLInputElement: "readonly",
  location: "readonly",
  localStorage: "readonly",
  navigator: "readonly",
  Node: "readonly",
  MutationObserver: "readonly",
  Request: "readonly",
  Response: "readonly",
  setInterval: "readonly",
  setTimeout: "readonly",
  sessionStorage: "readonly",
  TextDecoder: "readonly",
  TextEncoder: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  window: "readonly",
};

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: browserGlobals,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  prettierConfig,
];
