const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://c6674ca9trial.it-cpitrial03-rt.cfapps.ap21.hana.ondemand.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/http', // Adjust if the SAP API base path differs
      },
      onProxyReq: function (proxyReq, req, res) {
        console.log('Proxying request to:', proxyReq.path);
      },
      onProxyRes: function (proxyRes, req, res) {
        console.log('Proxy response status:', proxyRes.statusCode);
      },
      onError: function (err, req, res) {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error occurred');
      },
      logLevel: 'debug',
    })
  );
};