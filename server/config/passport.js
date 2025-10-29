const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/userModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // If user exists, ensure provider info is updated if they are logging in with a new provider
          if (!user.provider) {
            user.provider = "google";
            user.providerId = profile.id;
            await user.save();
          }
          return done(null, user);
        } else {
          // If user does not exist, create a new one
          const newUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            provider: "google",
            providerId: profile.id,
            avatar: profile.photos[0].value,
          });
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/v1/auth/facebook/callback",
      profileFields: ["id", "displayName", "emails", "photos"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0].value;
        if (!email) {
          return done(new Error("Facebook email permission not granted."), false);
        }
        let user = await User.findOne({ email: email });

        if (user) {
          if (!user.provider) {
            user.provider = "facebook";
            user.providerId = profile.id;
            await user.save();
          }
          return done(null, user);
        } else {
          const newUser = await User.create({
            name: profile.displayName,
            email: email,
            provider: "facebook",
            providerId: profile.id,
            avatar: profile.photos[0].value,
          });
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0].value;
        if (!email) {
          return done(new Error("GitHub email not public."), false);
        }
        let user = await User.findOne({ email: email });

        if (user) {
          if (!user.provider) {
            user.provider = "github";
            user.providerId = profile.id;
            await user.save();
          }
          return done(null, user);
        } else {
          const newUser = await User.create({
            name: profile.displayName || profile.username,
            email: email,
            provider: "github",
            providerId: profile.id,
            avatar: profile.photos[0].value,
          });
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});