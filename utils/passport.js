// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('./models/User'); // Import your User model

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "/auth/google/callback",
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       // Check if the user already exists
//       let user = await User.findOne({ googleId: profile.id });

//       if (user) {
//         return done(null, user);
//       }

//       // If not, create a new user
//       user = await User.create({
//         googleId: profile.id,
//         email: profile.emails[0].value,
//         first_name: profile.name.givenName,
//         last_name: profile.name.familyName,
//         isVerified: true, // Since it's Google auth, automatically verified
//       });

//       return done(null, user);
//     } catch (error) {
//       return done(error, null);
//     }
//   }
// ));

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });
