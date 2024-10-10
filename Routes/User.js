

const express = require('express');
const { Login, Register, Logout } = require('../Controllers/User');
let router = express.Router();


router.route('/login').post(Login)
router.route('/register').post(Register)
router.route('/logout').get(Logout)
// router.post('/verify-otp', verifyOTP);


module.exports = router;