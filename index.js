require("dotenv").config();
require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]); // sửa lỗi DNS querySrv ECONNREFUSED

const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const { BookRead, BookWrite } = require("./db");
const sessionMiddleware = require("./session");

// ===== Thông tin cá nhân hóa =====
const STUDENT = {
  name: process.env.HO_TEN || "Họ Tên Của Bạn", // đổi thành tên thật hoặc đặt HO_TEN trong .env
  mssv: "23IT252",
};
const CODE_PREFIX = STUDENT.mssv.slice(-3);        // "252"
const VAT = Number(STUDENT.mssv.slice(-1)) + 5;    // 2 + 5 = 7 (%)

const app = express();
app.set("trust proxy", 1); // cần khi chạy sau proxy của Render (cookie secure)

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Dữ liệu dùng chung cho mọi view (footer)
app.use((req, res, next) => {
  res.locals.student = STUDENT;
  res.locals.vat = VAT;
  next();
});

// READ -> tài khoản reader
app.get("/", async (req, res) => {
  try {
    req.session.visits = (req.session.visits || 0) + 1; // chứng minh session lưu trên Atlas
    const books = await BookRead.find().sort({ createdAt: -1 }).lean();
    const error = req.session.error;
    req.session.error = null;
    res.render("home", {
      books,
      error,
      prefix: CODE_PREFIX,
      visits: req.session.visits,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi đọc dữ liệu: " + err.message);
  }
});

// WRITE -> tài khoản writer
app.post("/books", async (req, res) => {
  try {
    const { code, title, author } = req.body;
    const price = Number(req.body.price);

    // Bộ lọc mã sản phẩm: bắt buộc có tiền tố = 3 số cuối MSSV
    if (!code || !code.trim().startsWith(CODE_PREFIX)) {
      req.session.error = `Từ chối: mã sản phẩm phải bắt đầu bằng "${CODE_PREFIX}"`;
      return res.redirect("/");
    }
    if (!title || !title.trim() || isNaN(price) || price < 0) {
      req.session.error = "Dữ liệu không hợp lệ";
      return res.redirect("/");
    }

    // Tính giá sau thuế trước khi lưu xuống đám mây
    const priceAfterTax = Math.round(price * (1 + VAT / 100));

    await BookWrite.create({
      code: code.trim(),
      title: title.trim(),
      author: (author || "").trim(),
      price,
      vat: VAT,
      priceAfterTax,
    });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.session.error = "Lỗi ghi dữ liệu: " + err.message;
    res.redirect("/");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));