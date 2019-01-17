const path = require('path');
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  type: 'react-app',
  webpack: {
    aliases: {
      src: path.resolve('src'),
      public: path.resolve('public'),
      components: path.resolve('src/components')
    }
  },
  devServer: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
};
