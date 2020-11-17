const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  charId: { type: Number },
});

module.exports = mongoose.model("User", userSchema);
