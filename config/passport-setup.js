const passport = require("passport");
const TwitterStrategy = require("passport-twitter");
const User = require("../models/user-model");

require("dotenv").config();

const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

// serialize the user.id to save in the cookie session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  // console.log("=========deserializing========")
  console.time("executionTime");
  // User.findById(id)
  //   .then((user) => {
  //     if (!user) {
  //       return done(null, false);
  //     }
      done(null, user);
    // })
    // .catch((err) => {
    //   console.error("Error during deserialization:", err);
    //   done(err);
    // });

  console.timeEnd("executionTime"); 
});

passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: "/auth/twitter/redirect",
    },
    async (token, tokenSecret, profile, done) => {
      try {
        console.time("executionTime2");

        const currentUser = await User.findOneAndUpdate(
          { twitterId: profile._json.id_str },
          {
            $set: {
              name: profile._json.name,
              screenName: profile._json.screen_name,
              age: profile._json.created_at,
              profileImageUrl: profile._json.profile_image_url,
              // twitterAccess: token,
            },
          },
          { new: true, upsert: true }
        );
        console.timeEnd("executionTime2"); 

        // console.log(currentUser);
        // console.log("success");

        done(null, currentUser);
      } catch (err) {
        console.error("Error during authentication:", err);
        done(err);
      }
    }
  )
);
