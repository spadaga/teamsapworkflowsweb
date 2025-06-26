
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_SAP_API_TARGET || 'https://c6674ca9trial.it-cpitrial03-rt.cfapps.ap21.hana.ondemand.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/http'
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request to:', proxyReq.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Proxy response status:', proxyRes.statusCode);
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(500).send('Proxy error occurred');
      },
      logLevel: 'debug'
    })
  );
};

// const { createProxyMiddleware } = require('http-proxy-middleware');

// module.exports = function(app) {
//   app.use(
//     '/api',
//     createProxyMiddleware({
//       target: 'https://c6674ca9trial.it-cpitrial03-rt.cfapps.ap21.hana.ondemand.com',
//       changeOrigin: true,
//       pathRewrite: {
//         '^/api': '/http', // Adjust if the SAP API base path differs
//       },
//       onProxyReq: function (proxyReq, req, res) {
//         console.log('Proxying request to:', proxyReq.path);
//       },
//       onProxyRes: function (proxyRes, req, res) {
//         console.log('Proxy response status:', proxyRes.statusCode);
//       },
//       onError: function (err, req, res) {
//         console.error('Proxy error:', err);
//         res.status(500).send('Proxy error occurred');
//       },
//       logLevel: 'debug',
//     })
//   );
// };
