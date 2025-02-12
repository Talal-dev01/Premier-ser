const mongoose = require("mongoose");

const userSaved = new mongoose.Schema({
  cmsId: {
    type: [String],
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("userSaved", userSaved);
