const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books.controller');

router.get('/', booksController.getBooks);
router.post('/create', booksController.createBook);
router.post('/:search', booksController.getSearchBooks);
router.get('/:id', booksController.getOneBook);

module.exports = router;
