const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  profileId: {type: String, required: true, unique: true}
  // signature: {type: String, required: true, unique: true}
}, {
  timestamp: true
});

const User = mongoose.model("User", UserSchema, "user");

module.exports = User;
