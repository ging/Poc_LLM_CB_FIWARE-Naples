// babel.config.js

require('dotenv').config();

module.exports = {
  presets: [
    '@babel/preset-env'
  ],
  plugins: [
    ['transform-define', {
      'process.env.OPENAI_API_KEY': process.env.OPENAI_API_KEY || 'default-key'
    }]
  ]
};
