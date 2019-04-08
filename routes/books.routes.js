const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books.controller');

router.get('/', booksController.getBooks);
router.get('/register', booksController.getRegisterBooks);
router.post('/create', booksController.createBook);
router.post('/:search', booksController.getSearchBooks);
router.get('/:id', booksController.getOneBook);

module.exports = router;
