const path = require('path');
const productsController = require('../controllers/products');

const express = require('express');

const rootDir = require('../util/path');
const adminData = require('./admin');

const router = express.Router();

router.get('/', productsController.getProducts);

module.exports = router;
