const mongoose = require("mongoose");

module.exports = new mongoose.Schema(
  {
    code: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, default: "" },
    price: { type: Number, required: true }, // giá gốc
    vat: { type: Number, required: true }, // % VAT
    priceAfterTax: { type: Number, required: true }, // giá sau thuế
  },
  { timestamps: true },
);