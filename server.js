const mongoose = require("mongoose"),
  axios = require("axios"),
  dotenv = require("dotenv"),
  _ = require("lodash"),
  fs = require("fs"),
  chalk = require("chalk");

const Data = require("./methods/data");

dotenv.config();

// Mongoose Schemas
const ohlcDay = require("./models/ohlcDay"),
  buySellDay = require("./models/buySellDay"),
  botBuySellDay = require("./models/botBuySellDay"),
  predictionDay = require("./models/predictionDay");

const apiKey = process.env.FINNHUB_API_KEY;

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

const patchYear = async (ticker) => {
  try {

    console.log(chalk.yellowBright("Patching data for", ticker));

    let today = new Date();

    let fromDate = +new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      7,
      30
    );
    let toDate = +new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      14
    );

    for (let i = 0; i < 365; i++) {




      const request = `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=1&from=${fromDate / 1000
        }&to=${toDate / 1000}&token=${apiKey}`;


      const response = await axios.get(request);


      if (response.data.s !== "no_data") {
        let query = await ohlcDay.findOne({ ticker: ticker, day: new Date(fromDate).toDateString() });

        if (!query) {
          query = await ohlcDay.create(
            {
              ticker: ticker,
              day: new Date(fromDate).toDateString(),
              ohlcArray: [],
            });
          console.log(chalk.yellowBright("Creating new ohlcDay for", new Date(fromDate).toDateString()));
        }


        var placeholder = [];

        for (let i = 0; i < response.data.t.length; i++) {
          placeholder.push({
            open: response.data.o[i],
            high: response.data.h[i],
            low: response.data.l[i],
            close: response.data.c[i],
            volume: response.data.v[i],
            date: response.data.t[i] * 1000,
          });
        }
        query.ohlcArray = placeholder;
        query.save();
        console.log(chalk.greenBright("Updating and saving ohlc array for", new Date(fromDate).toDateString()), chalk.redBright(ticker));


      }

      await timer(1000);

      fromDate -= 86400000;
      toDate -= 86400000;

    }

    console.log(chalk.yellowBright("Done patching data for", ticker, "for the last year."), chalk.redBright(ticker));

  } catch (err) {
    console.error(chalk.red(err.name, err.message, err.lineNumber));
  }
};

const timer = ms => new Promise(res => setTimeout(res, ms));

const optimizeAndSave = async (ohlcDays) => {
  try {
    const todaysDate = new Date().toDateString();

    for (let i = 0; i < ohlcDays.length; i++) {

      let current = ohlcDays[i];

      // Making sure the day isn't empty 
      if (current.ohlcArray.length) {


        // Since it takes a long time, there is a file called optimized.json that stores which 
        // days have been optimized so far. Checking that the day hasn't been optimized yet
        let optimized = JSON.parse(fs.readFileSync("./assets/optimized.json"));
        var optimizedAlready = false;

        for (let j = 0; j < optimized.optimizedDayArray.length; j++) {
          if (optimized.optimizedDayArray[j] == current.day) {
            optimizedAlready = true;
          }
        }

        if (!optimizedAlready) {

          console.log(chalk.grey("Optimizing data for " + chalk.yellowBright(current.day)) + "...");

          let query = await buySellDay.findOne({ ticker: current.ticker, day: current.day });

          if (!query) {
            // create a new buySell day
            query = await buySellDay.create({ ticker: current.ticker, day: current.day, profit: 0, buySellDaysArray: [] });
            console.log(chalk.yellowBright("Creating new buySellDay for", current.day));
          }

          // Optimizing new array
          let start = Date.now();
          let data = new Data();
          let { profit, optimizedArray } = data.optimizeBuySell(ohlcDays[i]);

          query.buySellDaysArray = optimizedArray;
          query.profit = profit;
          query.save();

          console.log(chalk.blue("Done optimizing buy/sell input for " + chalk.yellowBright(current.day) + ". Optimization took " + chalk.yellowBright(((Date.now() - start) / 60000).toFixed(4)) + " mins. Profit was calculated to optimize at " + chalk.yellowBright((profit).toFixed(2) + " %") + ", with " + chalk.greenBright(optimizedArray.length / 2) + " trades."));
          let newOptimized = {
            day: todaysDate,
            optimizedDayArray: [...optimized.optimizedDayArray, current.day]
          };

          fs.writeFileSync("./assets/optimized.json", JSON.stringify(newOptimized));

          console.log("\n");

        } else {
          console.log(chalk.grey("Data is already optimized for " + chalk.yellowBright(current.day)) + "...");
        }
      }
    }


  } catch (err) {
    console.log(err);
  }
};

const loop = async () => {
  try {
    await connectDB();

    let allOhlcDays = await ohlcDay.find({ ticker: "MSFT" })
      .sort({ _id: -1 });

    await optimizeAndSave(allOhlcDays);

    console.log(chalk.greenBright("Done optimizing buy/sell configurations for all days."));

  } catch (err) {
    console.log(err);
  }
};


loop();;


// November 13th 2020 7:30am, MS: 1605277800000
// November 13th 2020 2:00pm, MS: 1605301200000

// December 24th 2020 7:30am, MS: 1608820200000
// December 24th 2020 2:00pm, MS: 1608843600000

