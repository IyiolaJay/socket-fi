const express = require("express");
const app = express();
const passport = require("passport");
const passportSetup = require("./config/passport-setup");
const session = require("express-session");
const authRoutes = require("./routes/auth-routes");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // parse cookie header

const port = process.env.PORT || 4000;

mongoose
  .connect(keys.MONGODB_URI)
  .then(() => {
    console.log("connected to mongo db");
  })
  .catch((err) => {
    console.error("Error connecting to mongo db:", err);
  });

app.use(
  session({
    name: "sessionSocketFI",
    secret: keys.COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === "production", // Only set cookies over HTTPS
      httpOnly: true, // Prevent client-side access to cookies
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Cross-site in production, strict in dev
    },
  })
);

// parse cookies
app.use(cookieParser());

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

const allowedOrigin = [
  "http://localhost:5173",
  "http://localhost:4000",
  "https://auth-twitter.socket.fi",
  "https://socket.fi",
];

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use("/auth", authRoutes);

const authCheck = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      authenticated: false,
      message: "User has not been authenticated",
    });
  } else {
    next();
  }
};

app.get("/", authCheck, (req, res) => {
  res.status(200).json({
    authenticated: true,
    message: "User successfully authenticated",
    user: req.user,
    cookies: req.cookies,
  });
});

app.listen(port, () => console.log(`Server is running on port ${port}!`));
