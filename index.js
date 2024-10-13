const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const passport = require("passport");
const session = require("express-session");
const authRoutes = require("./routes/auth-routes");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // parse cookie header
require("./config/passport-setup");
const MongoStore = require("connect-mongo");

const port = process.env.PORT || 4000;

mongoose
  .connect(keys.MONGODB_URI)
  .then(() => {
    console.log("connected to mongo db");
  })
  .catch((err) => {
    console.error("Error connecting to mongo db:", err);
  });

// app.use(
//   cookieSession({
//     name: "sessionSocketFI",
//     keys: [keys.COOKIE_KEY],
//     maxAge: 24 * 60 * 60 * 1000, // 24 hour

//     // secure: process.env.NODE_ENV === "production", // Enable only in production for HTTPS
//     // httpOnly: true, // Prevent client-side access to cookies
//     // sameSite: "None", // Allow cookies in cross-site requests
//   })
// );
// // parse cookies
// app.use(cookieParser());

// Express Session Middleware
app.use(
  session({
    name: "sessionSocketFI", // Name of the session cookie
    secret: keys.COOKIE_KEY, // A secret string used to sign the session ID cookie
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something is stored
    cookie: {
      httpOnly: true, // Prevent access to cookie from JavaScript
      secure: process.env.NODE_ENV === "production", // Set to true only in production for HTTPS
      maxAge: 24 * 60 * 60 * 1000, // Cookie expires after 24 hours
      sameSite: "None", // Set to 'None' for cross-site cookies
    },
    store: MongoStore.create({
      // Use MongoDB to store session data
      mongoUrl: keys.MONGODB_URI, // MongoDB connection string
      collectionName: "sessions", // Collection name to store session data
    }),
  })
);

// initalize passport
app.use(passport.initialize());
// deserialize cookie from the browser
app.use(passport.session());

const allowedOrigin = [
  "http://localhost:5173",
  "http://www.localhost:5173",
  "http://localhost:4000",
  "https://auth-twitter.socket.fi",
];

app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: "https://www.socket.fi",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

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
