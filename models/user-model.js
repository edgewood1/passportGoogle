const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  googleID: String
});

// name of the collection , name of schema to use on it.
// name of collection pluralize in mLab
const User = mongoose.model("user", userSchema);

module.exports = User;
