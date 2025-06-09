export default {
  printWidth: 120,
  singleQuote: true,
  semi: false,
  quoteProps: 'consistent',
  arrowParens: 'avoid',
  overrides: [
    {
      files: '*.scss',
      options: {
        printWidth: 9999,
      },
    },
  ],
}
