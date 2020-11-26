const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.set("useCreateIndex", true);

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: [true, "that email is already in use"],
  },
  password: { type: String, required: [true, "Please enter a password"] },
  charId: { type: Number },
});

module.exports = mongoose.model("User", userSchema);
