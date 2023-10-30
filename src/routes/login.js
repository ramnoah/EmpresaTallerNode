const express = require('express');
const LoginController = require('../controllers/LoginController');
const jwtUtil = require('../controllers/jwt');

const router = express.Router();

router.get('/login', LoginController.login);
router.post('/login', LoginController.auth);
router.get('/logout', LoginController.logout);


module.exports = router;
