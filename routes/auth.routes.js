const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const secure = require('../middlewares/secure.mid');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/profile', secure.isAuthenticated, auth.getUser);
router.put('/profile', secure.isAuthenticated, auth.updateUser);
router.post('/logout', auth.logout);

module.exports = router;