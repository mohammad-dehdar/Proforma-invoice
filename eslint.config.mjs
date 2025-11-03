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
  ]),
  {
    settings: {
      // Ensure eslint-plugin-import resolves TS path aliases like @ui/* and @features/*
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      // Encourage use of aliases instead of deep relative paths to UI components
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "../**/components/ui/*",
                "../../**/components/ui/*",
                "../../../**/components/ui/*",
                "**/components/ui/*",
              ],
              message:
                "Use the alias @ui/* instead of relative paths to components/ui/*.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
