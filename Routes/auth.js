const express = require('express');
const passport = require('passport');
const router = express.Router();


// Initiate Google authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google auth callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // On successful authentication, redirect to frontend with token in query params
  const { token } = req.user;
  res.redirect(`http://localhost:3000/dashboard?token=${token}`);
});

module.exports = router;
