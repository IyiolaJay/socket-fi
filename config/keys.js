require("dotenv").config();

// const DB_PASSWORD = process.env.DB_PASSWORD;
// const DB_USER = process.env.DB_USER;
const COOKIE_KEY = "process.env.COOKIE_KEY";

const MONGODB = {
  MONGODB_URI: `mongodb+srv://iyiola_dev:iyiola081719@cluster0.nfszgum.mongodb.net/solcurate-db-dev?retryWrites=true&w=majority`,
};

const SESSION = {
  COOKIE_KEY: COOKIE_KEY,
};

const KEYS = {
  ...MONGODB,
  ...SESSION,
};

module.exports = KEYS;
