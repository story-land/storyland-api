const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books.controller');
const secure = require('../middlewares/secure.mid');

router.get('/', booksController.getBooks);
router.get('/:id', booksController.getOneBook);
router.post('/', booksController.createBook);

module.exports = router;
