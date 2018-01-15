const express = require('express');
const path = require('path');
const controller = require('./controllers');
const graphqlRoutes = require('../graphql/routes');

const router = express.Router();

router.use('/graphql/', controller.allowCORS);
router.use('/graphql/', graphqlRoutes);

router.use(express.static(path.join(__dirname, 'public')));

module.exports = router;
