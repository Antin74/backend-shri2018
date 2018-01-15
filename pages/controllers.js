module.exports.allowCORS = function (req, res, next) {
  // Загололовки для разрешения кроссдоменных запросов.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
};
