const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books.controller');
const secure = require('../middlewares/secure.mid');

router.get('/', booksController.getBooks);
router.get('/:id', booksController.getOneBook);
router.get('/me/:type', secure.isAuthenticated, booksController.getUserBooks);
router.post('/', booksController.createBook);
router.post('/me/:id/:type', booksController.createUserBook);

module.exports = router;
