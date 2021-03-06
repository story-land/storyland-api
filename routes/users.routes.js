const express = require('express');
const router = express.Router();
const secure = require('../middlewares/secure.mid');
const userController = require('../controllers/user.controller');
const uploader = require('../configs/storage.config');

router.get('/', secure.isAuthenticated, userController.getAllUsers);
router.get('/:id/profile', secure.isAuthenticated, userController.getUser);
router.put(
  '/profile',
  secure.isAuthenticated,
  uploader.single('avatar'),
  userController.updateUser
);

router.get('/books', secure.isAuthenticated, userController.getUserBooks);
router.get('/books/:id', secure.isAuthenticated, userController.getStateBook);
router.post(
  '/books/:id',
  secure.isAuthenticated,
  userController.createUserBook
);

router.get(
  '/:id/friends',
  secure.isAuthenticated,
  userController.getSocialUsers
);
router.post('/:id/follow', secure.isAuthenticated, userController.followUser);
router.delete(
  '/:id/follow',
  secure.isAuthenticated,
  userController.unfollowUser
);

router.get('/goals', secure.isAuthenticated, userController.getGoals);
router.post(
  '/goals/:days',
  secure.isAuthenticated,
  userController.getLastGoals
);
router.post('/creategoal', secure.isAuthenticated, userController.createGoal);

module.exports = router;
