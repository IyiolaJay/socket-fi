// const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const passport = require("passport");
const session = require("express-session");
const authRoutes = require("./routes/auth-routes");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const cors = require("cors");
const connectMongoDBSession = require("connect-mongodb-session");
// const cookieParser = require("cookie-parser"); // parse cookie header
require("./config/passport-setup");

const port = process.env.PORT || 4000;

mongoose
  .connect(keys.MONGODB_URI)
  .then(() => {
    console.log("connected to mongo db");
  })
  .catch((err) => {
    console.error("Error connecting to mongo db:", err);
  });


const MongoDBStore = connectMongoDBSession(session)
const sessionStore = new MongoDBStore({
  uri: keys.MONGODB_URI,
  collection: 'sessions',
})

app.use(
    session({
      name : "sessionSocket",
      secret: process.env.COOKIE_KEY,
      resave: false,
      saveUninitialized: true,
      maxAge: 24 * 60 * 60 * 1000,
      proxy: process.env.NODE_ENV === 'production' ? true : false,
      store: sessionStore,
      cookie:{
        sameSite : process.env.NODE_ENV === 'production' ? 'None' : 'lax',
        secure : process.env.NODE_ENV === 'production' ? true : false,
        // httpOnly : process.env.NODE_ENV === 'production' ? true : false,
      }
    })
  );
  
app.options("*", cors());
app.use(cors({
  origin: ["https://www.socket.fi"],
  credentials: true,
  optionsSuccessStatus: 204,
}));


// app.use(
//   cookieSession({
//     name: "sessionSocketFI",
//     keys: [keys.COOKIE_KEY],
//     maxAge: 24 * 60 * 60 * 100, // 24 hour
//     sameSite: "None",
    

//     // secure: process.env.NODE_ENV === "production", // Enable only in production for HTTPS
//     // httpOnly: true, // Prevent client-side access to cookies
//     // sameSite: "None", // Allow cookies in cross-site requests
//   })
// );

// app.use(
//   cors({
//     // origin: "http://localhost:5173",
//     origin: "https://www.socket.fi",
//     methods: ["GET", "POST", "OPTIONS"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   })
// );
// parse cookies
// app.use(cookieParser());

// initalize passport
app.use(passport.initialize());
// deserialize cookie from the browser
app.use(passport.session());

// const allowedOrigin = [
//   "http://localhost:5173",
//   "http://www.localhost:5173",
//   "http://localhost:4000",
//   "https://auth-twitter.socket.fi",
// ];



// app.options("*", cors());

app.use("/auth", authRoutes);

const authCheck = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      authenticated: false,
      message: "user has not been authenticated",
    });
  } else {
    next();
  }
};

app.get("/", authCheck, (req, res) => {
  res.status(200).json({
    authenticated: true,
    message: "user successfully authenticated",
    user: req.user,
    cookies: req.cookies,
  });
});

// connect react to nodejs express server
app.listen(port, () => console.log(`Server is running on port ${port}!`));
