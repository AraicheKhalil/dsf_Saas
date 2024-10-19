const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('../Models/User'); // Your User model
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const lifetime = process.env.JWT_LIFETIME;

// Passport Google Strategy configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,  // Put your Google Client ID here
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,  // Put your Google Client Secret here
  callbackURL: "/auth/google/callback",  // Google will redirect here after authentication
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { id, emails, name, photos } = profile;
    const email = emails[0].value;
    
    // Check if the user already exists
    let user = await User.findOne({ googleId: id });
    
    if (!user) {
      // If user doesn't exist, create a new user
      user = await User.create({
        googleId: id,
        email: email,
        first_name: name.givenName,
        last_name: name.familyName,
        profile_picture: photos[0].value,
        isVerified: true,  // Verified through Google
      });
    }
    
    // Generate JWT token
    const token = jwt.sign({ _id: user._id, email: user.email }, secret, { expiresIn: lifetime });
    
    // Pass the user and token to the done function
    return done(null, { user, token });

  } catch (error) {
    return done(error, false);
  }
}));

// Serialize the user to store in session (optional, if using session)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});
