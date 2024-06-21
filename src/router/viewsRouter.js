const express = require('express');
const router = express.Router();
const productsController = require("../controllers/products.controllers")

router.get("/", productsController.renderHome);

module.exports = router;
