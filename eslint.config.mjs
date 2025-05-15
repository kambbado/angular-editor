// eslint.config.mjs
import globals from 'globals';
import typescriptEslintParser from '@typescript-eslint/parser';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import angularEslintPlugin from '@angular-eslint/eslint-plugin';
import angularEslintTemplatePlugin from '@angular-eslint/eslint-plugin-template';
import angularEslintTemplateParser from '@angular-eslint/template-parser';
import rxjsPlugin from 'eslint-plugin-rxjs-updated';
import prettierPlugin from 'eslint-plugin-prettier';
import smartToolsRxjs from '@smarttools/eslint-plugin-rxjs';

export default [
  {
    ignores: [
      'node_modules/',       // Ignore root node_modules dir
      'dist/',               // Ignore root dist dir
      'e2e/',                // Ignore root e2e dir
      'coverage/',           // Ignore root coverage dir
      '**/*.d.ts',         // Ignore all definition files
      '.cache/',       // Ignore any .cache folders and contents
      '**/*.config.*',     // Ignore config files like *.config.js/ts/mjs
      '**/karma*.*', // Ignore karma config files
      '**/jest*.*',  // Ignore jest config files
      '**/**/test.ts', // Ignore test files
      // Add any other specific files or folders with trailing '/'
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: typescriptEslintParser,
      parserOptions: {
        project: ['./tsconfig.eslint.json', './packages/**/tsconfig.eslint.json'],
        warnOnUnsupportedTypeScriptVersion: false,
        ecmaFeatures: { jsx: true },
        createDefaultProgram: true,
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.serviceworker,
      },
    },
    plugins: {
      prettier: prettierPlugin,
      '@typescript-eslint': typescriptEslintPlugin,
      '@angular-eslint': angularEslintPlugin,
      rxjs: rxjsPlugin, // Defined here, but not all rules apply globally
      '@smarttools/rxjs': smartToolsRxjs,
      '@angular-eslint/template': angularEslintTemplatePlugin,
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      ...typescriptEslintPlugin.configs.recommended.rules,
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/prefer-includes': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },
  {
    files: ['**/*.ts'],
     ignores: [
      'node_modules/',       // Ignore root node_modules dir
      'dist/',               // Ignore root dist dir
      'e2e/',                // Ignore root e2e dir
      'coverage/',           // Ignore root coverage dir
      '**/*.d.ts',         // Ignore all definition files
      '.cache/',       // Ignore any .cache folders and contents
      '**/*.config.*',     // Ignore config files like *.config.js/ts/mjs
      'coverage/**/**'
      // Add any other specific files or folders with trailing '/'
    ],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: ['./tsconfig.eslint.json'],
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      '@angular-eslint': angularEslintPlugin,
      rxjs: rxjsPlugin, // Defined here, but not all rules apply globally
      '@smarttools/rxjs': smartToolsRxjs,
    },
    rules: {
      ...angularEslintTemplatePlugin.configs['process-inline-templates']?.rules || {},
      ...rxjsPlugin.configs.recommended.rules,
      ...smartToolsRxjs.configs.recommended.rules,
      'max-len': ['error', { code: 220, comments: 240, ignoreUrls: true, ignoreComments: true, ignoreStrings: true, ignoreTrailingComments: true, ignoreTemplateLiterals: true, ignoreRegExpLiterals: true }],
      'no-bitwise': ['off', { int32Hint: true }],
      quotes: ['error', 'single'],
      'prefer-const': 'off',
      'no-prototype-builtins': 'off',
      'generator-star-spacing': 'error',
      'no-confusing-arrow': 'error',
      'no-duplicate-imports': 'error',
      '@angular-eslint/component-selector': 'off',
      '@angular-eslint/directive-selector': 'off',
      '@angular-eslint/directive-class-suffix': 'off',
      '@angular-eslint/component-class-suffix': 'off',
      '@typescript-eslint/adjacent-overload-signatures': 'warn',
      '@typescript-eslint/prefer-regexp-exec': 'off',
      '@angular-eslint/contextual-lifecycle': 'error',
      '@angular-eslint/no-conflicting-lifecycle': 'warn',
      '@angular-eslint/no-host-metadata-property': 'off',
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/no-inputs-metadata-property': 'error',
      '@angular-eslint/no-output-native': 'off',
      '@angular-eslint/no-output-on-prefix': 'off',
      '@angular-eslint/no-output-rename': 'off',
      '@angular-eslint/no-outputs-metadata-property': 'error',
      '@angular-eslint/template/banana-in-box': 'off',
      '@angular-eslint/template/no-negated-async': 'off',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'off',
      'semi': ['error'],
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/ban-types': [
        'off',
        {
          types: {
            Object: 'Avoid using the `Object` type. Did you mean `object`?',
            Function: 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`.',
            Boolean: 'Avoid using the `Boolean` type. Did you mean `boolean`?',
            Number: 'Avoid using the `Number` type. Did you mean `number`?',
            String: 'Avoid using the `String` type. Did you mean `string`?',
            Symbol: 'Avoid using the `Symbol` type. Did you mean `symbol`?',
          },
        },
      ],
      '@typescript-eslint/consistent-type-definitions': 'error',
      '@typescript-eslint/dot-notation': 'off',
      '@typescript-eslint/explicit-member-accessibility': ['off', { accessibility: 'explicit' }],
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/member-delimiter-style': [
        'off',
        {
          multiline: { delimiter: 'none', requireLast: true },
          singleline: { delimiter: 'semi', requireLast: false },
        },
      ],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-parameter-properties': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/prefer-function-type': 'off',
      '@typescript-eslint/triple-slash-reference': ['error', { path: 'always', types: 'prefer-import', lib: 'always' }],
      '@typescript-eslint/type-annotation-spacing': 'off',
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/prefer-namespace-keyword': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/typedef': [
        2,
        {
          arrowParameter: true,
          variableDeclaration: false,
          memberVariableDeclaration: false,
          parameter: true,
          propertyDeclaration: true,
          arrayDestructuring: false,
          objectDestructuring: false,
          variableDeclarationIgnoreFunction: false,
        },
      ],
      '@typescript-eslint/member-ordering': [
        'error',
        { default: ['protected-field', 'constructor', 'protected-method'] },
      ],
      'no-debugger': 'error',
      'no-empty': 'off',
      'no-eval': 'error',
      'no-fallthrough': 'error',
      'no-invalid-this': 'off',
      'no-irregular-whitespace': 'off',
      'no-new-wrappers': 'error',
      'no-useless-escape': 'off',
      'no-restricted-imports': ['error', { paths: ['rxjs/Rx', 'rxjs/internal/operators', 'rxjs/internal'] }],
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@smarttools/rxjs/no-async-subscribe': ['error'],
      '@smarttools/rxjs/no-implicit-any-catch': ['error', { allowExplicitAny: true }],
      'rxjs/no-implicit-any-catch': ['error', { allowExplicitAny: true }],
      'rxjs/no-ignored-observable': 'error',
      'rxjs/no-ignored-subscription': 'off',
      'rxjs/no-nested-subscribe': 'error',
      'rxjs/no-unbound-methods': 'error',
      'rxjs/throw-error': 'error',
      'rxjs/no-unsafe-subject-next': 'error',
      '@angular-eslint/prefer-signals': ['error', { 'preferInputSignals': false }],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
    },
  },
  {
    files: ['**/*.ts'],
    ignores: ['**/*.config.*'],
    languageOptions: {
      parser: typescriptEslintParser,
    },
    plugins: {
      '@angular-eslint/template': angularEslintTemplatePlugin,
    },
    processor: '@angular-eslint/template/extract-inline-html',
    rules: {
      'require-jsdoc': 'off',
    },
  },
  {
    files: ['*.component.html'],
    languageOptions: {
      parser: angularEslintTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularEslintTemplatePlugin,
    },
    rules: {
      ...angularEslintTemplatePlugin.configs.recommended.rules,
      'max-len': ['error', { code: 220, comments: 240, ignoreUrls: true, ignoreComments: true, ignoreStrings: true, ignoreTrailingComments: true, ignoreTemplateLiterals: true, ignoreRegExpLiterals: true }],
      'lines-around-comment': [
        'error',
        {
          beforeBlockComment: true,
          afterBlockComment: true,
          beforeLineComment: true,
          afterLineComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
          allowObjectStart: true,
          allowObjectEnd: true,
          allowArrayStart: true,
          allowArrayEnd: true,
        },
      ],
      'no-multiple-empty-lines': [2, { max: 3, maxEOF: 1 }],
      '@angular-eslint/template/banana-in-a-box': 'off',
      '@angular-eslint/template/cyclomatic-complexity': 'off',
      '@angular-eslint/template/no-call-expression': 'off',
      '@angular-eslint/template/no-negated-async': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/prefer-regexp-exec': 'off',
      '@typescript-eslint/prefer-string-starts-ends-with': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-implied-eval': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'prettier/prettier': ['error', { parser: 'typescript' }],
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'no-irregular-whitespace': 'off',
      '@angular-eslint/prefer-signals': 'error',
    },
  },
];
