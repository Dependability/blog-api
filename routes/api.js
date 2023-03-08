const express = require("express");
const router = express.Router();
const apiController = require('../controllers/apiControllers');


//Authenticate.
router.post('/login', apiController.login);
router.post('/register', apiController.register);

//CRUD Post
router.get('/posts', apiController.getPosts);
router.get('/posts/:id', apiController.getPost);

router.post('/posts', apiController.verifyToken, apiController.createPost);
router.put('/posts/:id', apiController.verifyToken, apiController.updatePost);
router.delete('/posts/:id', apiController.verifyToken, apiController.deletePost);

//Crud Comment
router.get('/posts/:id/comments', apiController.getComments);
router.post('/posts/:id/comments', apiController.verifyToken, apiController.createComment);
router.put('/posts/:id/comments/:commentId', apiController.verifyToken, apiController.updateComment);
router.delete('/posts/:id/comments/:commentId', apiController.verifyToken, apiController.deleteComment);

module.exports = router;