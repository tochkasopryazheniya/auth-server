const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');
const authMiddleware = require('../middleware/auth-middleware');


/* GET home page. */
router.post('/registration', userController.registration);

router.post('/login', userController.login);

router.post('/logout', userController.logout);

router.get('/activate/:link', userController.activate);

router.get('/refresh', userController.refresh);

router.get('/users', authMiddleware, userController.getUsers);

router.get('/info', (req, res) => {
    console.log(process.env.CLIENT_URL)
    res.json({hello: process.env.CLIENT_URL})
});

module.exports = router;
