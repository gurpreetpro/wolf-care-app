module.exports = function(api) {
  api.cache(true);
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Remove console.log in production
      ...(isProduction ? ['transform-remove-console'] : []),
    ],
  };
};
