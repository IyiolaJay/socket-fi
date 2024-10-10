require("dotenv").config();

const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_USER = process.env.DB_USER;
const COOKIE_KEY = process.env.COOKIE_KEY;

const MONGODB = {
  MONGODB_URI: `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.r9pru.mongodb.net/socketfi?retryWrites=true&w=majority&appName=Cluster0/user`,
};

const SESSION = {
  COOKIE_KEY: COOKIE_KEY,
};

const KEYS = {
  ...MONGODB,
  ...SESSION,
};

module.exports = KEYS;
