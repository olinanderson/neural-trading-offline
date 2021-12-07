const mongoose = require("mongoose"),
  config = require("config"),
  chalk = require("chalk");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://olinanderson:30031541Treehouse18!@personalprojects-7qlhe.mongodb.net/NeuralTrading-Production?retryWrites=true&w=majority"
    );

    console.log(
      chalk.blueBright("MongoDB connected to"),
      chalk.yellow("NeuralTrading-Production")
    );
  } catch (err) {
    console.log(err.message);
    // Exit process with failure
    // process.exit(1);
  }
};

module.exports = connectDB;
