const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books.controller');

router.get('/', booksController.getBooks);
router.post('/:search', booksController.getSearchBooks);
router.get('/:id', booksController.getOneBook);
router.post('/', booksController.createBook);

module.exports = router;
