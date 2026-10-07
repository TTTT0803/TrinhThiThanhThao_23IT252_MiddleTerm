const session = require("express-session");
const { MongoStore } = require("connect-mongo");

module.exports = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI_WRITE, // writer có quyền trên collection sessions
    collectionName: "sessions",
    ttl: 60 * 60, // 1 giờ
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60,
  },
});