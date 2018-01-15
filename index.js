const express = require('express');
const bodyParser = require('body-parser');

const pagesRoutes = require('./pages/routes');

const app = express();

app.use(bodyParser.json());
app.use(pagesRoutes);

app.listen(3000, function () { console.log('Express app listening on localhost:3000'); });
