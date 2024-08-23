// babel.config.js

require('dotenv').config();


module.exports = {
  presets: [
    '@babel/preset-env'
  ],
  plugins: [
    ['transform-define', {
      'process.env.OPENAI_API_KEY': process.env.OPENAI_API_KEY || 'default-key',
      'process.env.INITIAL_LATITUDE': process.env.INITIAL_LATITUDE || 41.65606,
      'process.env.INITIAL_LONGITUDE': process.env.INITIAL_LONGITUDE || -0.87734,
      'process.env.INITIAL_ZOOM': process.env.INITIAL_ZOOM || 13,

    }]
  ]
};
