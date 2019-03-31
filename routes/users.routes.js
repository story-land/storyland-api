const express = require('express');
const router = express.Router();
const secure = require('../middlewares/secure.mid');
const userController = require('../controllers/user.controller');

router.get('/profile', secure.isAuthenticated, userController.getUser);
router.put('/profile', secure.isAuthenticated, userController.updateUser);

router.get('/books', secure.isAuthenticated, userController.getUserBooks);
router.post(
  '/books/:id',
  secure.isAuthenticated,
  userController.createUserBook
);

router.get('/goals', secure.isAuthenticated, userController.getGoals);
router.post('/creategoal', secure.isAuthenticated, userController.createGoal);

module.exports = router;
