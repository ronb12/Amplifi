import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";


export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        db: "readonly",
        auth: "readonly",
        firebase: "readonly",
        storage: "readonly"
      }
    },
    rules: {
      // Add or adjust rules as needed
    }
  }
];
