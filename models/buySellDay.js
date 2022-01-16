var mongoose = require("mongoose");

var buySellDays = new mongoose.Schema({
  ticker: String,
  day: String,
  profit: Number,
  buySellDaysArray: [
    {
      open: Number,
      high: Number,
      low: Number,
      close: Number,
      volume: Number,
      date: Number,
      dateString: String,
      buy: Number,
      sell: Number,
      _id: false,
    },
  ],
});

module.exports = mongoose.model("buySellDays", buySellDays);
