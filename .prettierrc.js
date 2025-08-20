module.exports = {
  // Basic formatting
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  doubleQuote: false,
  
  // Indentation
  tabWidth: 2,
  useTabs: false,
  
  // Line length
  printWidth: 100,
  
  // Brackets
  bracketSpacing: true,
  bracketSameLine: false,
  
  // Arrow functions
  arrowParens: 'avoid',
  
  // JSX
  jsxSingleQuote: false,
  jsxBracketSameLine: false,
  
  // HTML
  htmlWhitespaceSensitivity: 'css',
  
  // End of line
  endOfLine: 'lf',
  
  // Quotes in objects
  quoteProps: 'as-needed',
  
  // Vue files
  vueIndentScriptAndStyle: false,
  
  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',
  
  // Override for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
        tabWidth: 2,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      options: {
        parser: 'typescript',
        printWidth: 100,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
      },
    },
    {
      files: ['*.js', '*.jsx'],
      options: {
        parser: 'babel',
        printWidth: 100,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
      },
    },
    {
      files: '*.css',
      options: {
        parser: 'css',
        printWidth: 100,
        tabWidth: 2,
      },
    },
    {
      files: '*.scss',
      options: {
        parser: 'scss',
        printWidth: 100,
        tabWidth: 2,
      },
    },
    {
      files: '*.html',
      options: {
        parser: 'html',
        printWidth: 100,
        tabWidth: 2,
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
  ],
};
