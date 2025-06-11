const express = require('express');
const { signup, login, makeAdmin } = require('../controller/user.controller');
const router = express.Router();



router.post('/signup', signup);
router.post('/login', login);
router.patch('/make-admin/:userId', makeAdmin)






module.exports = router