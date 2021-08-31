const express = require('express');
const themeController = require('../../controllers/theme.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/', themeController.getThemes);

module.exports = router;
