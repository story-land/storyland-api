const express = require('express');
const router = express.Router();
const uploader = require('../configs/storage.config');
const booksController = require('../controllers/books.controller');

router.get('/', booksController.getBooks);
router.get('/register', booksController.getRegisterBooks);
router.post('/scancover', uploader.single('cover'), booksController.scanCover);
router.post('/:search', booksController.getSearchBooks);
router.get('/:id', booksController.getOneBook);

module.exports = router;
