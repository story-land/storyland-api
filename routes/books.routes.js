const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books.controller');

router.get('/', booksController.getBooks);
router.get('/:search', booksController.getSearchBooks);
router.get('/:id', booksController.getOneBook);
router.post('/', booksController.createBook);

module.exports = router;
