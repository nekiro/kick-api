const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
	{
		ignores: ["lib/**/*", "coverage/**/*", "node_modules/**/*", "src/types/global.d.ts"],
	},
	{
		files: ["**/*.{js,ts}"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: "./tsconfig.json",
				tsconfigRootDir: __dirname,
				ecmaVersion: 2022,
				sourceType: "module",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
		},
		rules: {
			// Basic rules
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": "warn",

			// Your custom rules from the old config
			"@typescript-eslint/no-use-before-define": "off",
			quotes: ["warn", "double", { avoidEscape: true }],
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-var-requires": "off",
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-explicit-any": "off",
		},
	},
];
