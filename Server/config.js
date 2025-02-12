const mongoose = require("mongoose");

const config = async () => {
  console.log('Attempting to connect to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI); 
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = config;
