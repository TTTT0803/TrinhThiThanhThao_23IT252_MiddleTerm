const mongoose = require("mongoose");
const bookSchema = require("./models/bookSchema");

// autoIndex:false vì 2 tài khoản không có quyền createIndex trên books
const readConn = mongoose.createConnection(process.env.MONGO_URI_READ, {
  autoIndex: false,
});
const writeConn = mongoose.createConnection(process.env.MONGO_URI_WRITE, {
  autoIndex: false,
});

readConn.on("connected", () => console.log("[DB] Read connection OK"));
writeConn.on("connected", () => console.log("[DB] Write connection OK"));
readConn.on("error", (e) => console.error("[DB] Read error:", e.message));
writeConn.on("error", (e) => console.error("[DB] Write error:", e.message));

// Cùng collection "books", nhưng đi qua 2 tài khoản khác nhau
const BookRead = readConn.model("Book", bookSchema, "books"); // chỉ dùng find
const BookWrite = writeConn.model("Book", bookSchema, "books"); // chỉ dùng create

module.exports = { BookRead, BookWrite };