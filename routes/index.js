const express = require('express');
const router = express.Router();
const PouchDB = require('pouchdb');
const userController = require('../controllers/user-controller');
const authMiddleware = require('../middleware/auth-middleware');

const users = new PouchDB('datalake/users');

/* GET home page. */
router.post('/registration', userController.registration);

router.post('/login', userController.login);

router.post('/logout', userController.logout);

router.get('/activate/:link', userController.activate);

router.get('/refresh', userController.refresh);

router.get('/users', authMiddleware, userController.getUsers);
router.get('/', function (req,res) {
    res.json({message: 'Hello'})
});

module.exports = router;
