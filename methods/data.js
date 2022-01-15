const chalk = require("chalk"),
    _ = require("lodash"),
    { mean, std } = require("mathjs");



class Data {
    constructor(ohlcDays = [], buySellDays = [], timeSteps = 500) {

        this.buySellDays = buySellDays;
        this.ohlcDays = ohlcDays;
        this.timeSteps = timeSteps;

    }


    optimizeBuySell(ohlcDay) {

        var optimizedData1 = { profit: 0, buyArray: [], sellArray: 0 };
        var optimizedData2 = { profit: 0, buyArray: [], sellArray: 0 };
        var newProfit1 = 0;
        var newProfit2 = 0;

        // Getting rid of the first 15 minutes (untradeable)
        let ohlcArray = _.takeRight(ohlcDay.ohlcArray, ohlcDay.ohlcArray.length - 15);

        const loopLength = ohlcArray.length;

        // Checking for 1 buy/sell
        for (let i = 0; i < loopLength; i++) { // buy 
            for (let j = i + 1; j < loopLength; j++) { // sell
                // Making sure the buy point comes before the sell point
                if (j < i) {
                    continue;
                }
                newProfit1 = calcProfit(ohlcArray[i], ohlcArray[j]);
                if (newProfit1 > optimizedData1.profit) {
                    optimizedData1 = {
                        profit: newProfit1,
                        buyArray: [ohlcArray[i]],
                        sellArray: [ohlcArray[j]]
                    };

                }
            }
        }

        for (let i = 0; i < loopLength; i++) {
            // console.log("Percentage complete:", (i / loopLength) * 100 + " %   -   time elapsed:", (Date.now() - start) / 1000);
            for (let j = i + 1; j < loopLength; j++) {
                for (let k = j + 1; k < loopLength; k++) {
                    for (let l = k + 1; l < loopLength; l++) {
                        if (l < k) {
                            continue;
                        }
                        newProfit2 = calcProfit(ohlcArray[i], ohlcArray[j]) + calcProfit(ohlcArray[k], ohlcArray[l]);
                        if (newProfit2 > optimizedData2.profit) {
                            optimizedData2 = {
                                profit: newProfit2,
                                buyArray: [ohlcArray[i], ohlcArray[k]],
                                sellArray: [ohlcArray[j], ohlcArray[l]]
                            };

                        }
                    }
                    if (k < j) {
                        continue;
                    }
                }
                if (j < i) {
                    continue;
                }
            }
        }

        var optimized = optimizedData2;

        if (optimizedData1.profit >= optimizedData2.profit) {
            optimized = optimizedData1;
        }



        var returnArray = [];
        for (let i = 0; i < optimized.buyArray.length; i++) {
            returnArray.push({
                date: optimized.buyArray[i].date,
                buy: 1,
                sell: 0
            }, {
                date: optimized.sellArray[i].date,
                buy: 0,
                sell: 1
            });
        }


        return { profit: optimized.profit, optimizedArray: returnArray };

    }



    checkDateOrder(ohlcDays) {
        return ohlcDays.sort((a, b) => {

            let A = Date.parse(a.day);
            let B = Date.parse(b.day);

            return A - B;
        });
    }

    checkEmptyDays(ohlcDays) {
        // The first array callback returns undefined for any days with no data in them 
        return ohlcDays.map(element => {
            if (element.ohlcArray.length !== 0) {
                return element;
            }
        })
            // The second array callback gets rid of undefined entries in the array 
            .filter(x => {
                return x !== undefined;
            });
    }

    matchInOut(ohlcDays, buySellDays, longBuySellArray = []) {
        try {
            var placeholderBuySell = [];

            if (!longBuySellArray.length && buySellDays.length) {
                for (let i = 0; i < buySellDays.length; i++) {
                    for (let j = 0; j < buySellDays[i].buySellDaysArray.length; j++) {
                        placeholderBuySell.push(buySellDays[i].buySellDaysArray[j]);
                    }
                }
            } else {
                placeholderBuySell = longBuySellArray;
            }

            var lastChange = "short"; // defaulting the last change to short... (hold/hasn't been bought yet)
            var returnArray = []; // making the training array the same length as the number of training days
            for (let i = 0; i < ohlcDays.length; i++) {
                returnArray.push([]);
                for (let j = 0; j < ohlcDays[i].ohlcArray.length; j++) {
                    var currentInput = ohlcDays[i].ohlcArray[j];
                    var inputArray = [
                        currentInput.open,
                        currentInput.high,
                        currentInput.low,
                        currentInput.close,
                        currentInput.volume,
                        currentInput.date
                    ];
                    // defaulting to shorting
                    var outputArray = [0, 1];
                    if (lastChange === "long") {
                        outputArray = [1, 0];
                    }

                    // Checking the long buy/sell array to see if it should switch to long/short
                    if (placeholderBuySell.length) {
                        for (let k = 0; k < placeholderBuySell.length; k++) {
                            var currentOutput = placeholderBuySell[k];
                            if (currentInput.date === currentOutput.date) {
                                if (currentOutput.buy === 1) {
                                    lastChange = "long";
                                } else if (currentOutput.sell === 1) {
                                    lastChange = "short";
                                }
                                break;
                            }
                        }
                    }
                    returnArray[i].push(_.concat(inputArray, outputArray));
                }
            }
            return returnArray;
        } catch (err) {
            console.log(chalk.redBright(err));
        }
    }

    addRSI(array, timePeriod = 14) {
        try {
            return array.map((trainingArray) => {
                var rsiArray = [];
                var placeholderArray = [];
                var newTrainingArray = trainingArray;

                // RS = avgUp/avgDown
                // RSI = 100 - 100/(1+RS)
                var avgUt;
                var avgDt;
                var fromRightArray;

                for (let i = 0; i < trainingArray.length; i++) {
                    avgUt = 0;
                    avgDt = 0;
                    placeholderArray.push(trainingArray[i]);
                    if (i < timePeriod) {
                        for (let j = 1; j < placeholderArray.length; j++) {
                            var alpha = 2 / (placeholderArray.length + 1);
                            var Ut = placeholderArray[j][3] - placeholderArray[j - 1][3];
                            var Dt = placeholderArray[j - 1][3] - placeholderArray[j][3];

                            if (placeholderArray[j][3] > placeholderArray[j - 1][3]) {
                                avgUt = alpha * Ut + (1 - alpha) * avgUt - 1;
                            } else if (placeholderArray[j - 1][3] > placeholderArray[j][3]) {
                                avgDt = alpha * Dt + (1 - alpha) * avgDt - 1;
                            }
                        }
                        rsiArray.push(100 - 100 / (1 + avgUt / avgDt));
                    } else {
                        fromRightArray = _.takeRight(placeholderArray, timePeriod);
                        for (let k = 1; k < fromRightArray.length; k++) {
                            // avgUt = calcEMA(fromRightArray, timePeriod, k, avgUt, avgDt, "Ut");
                            // avgDt = calcEMA(fromRightArray, timePeriod, k, avgUt, avgDt, "Dt");
                            avgUt = calcWildersSmoothingMethod(
                                fromRightArray,
                                timePeriod,
                                k,
                                avgUt,
                                avgDt,
                                "Ut"
                            );
                            avgDt = calcWildersSmoothingMethod(
                                fromRightArray,
                                timePeriod,
                                k,
                                avgUt,
                                avgDt,
                                "Dt"
                            );
                        }
                        rsiArray.push(100 - 100 / (1 + avgUt / avgDt));
                    }
                }

                for (let i = 0; i < trainingArray.length; i++) {
                    newTrainingArray[i].splice(4, 0, rsiArray[i]);
                }
                return newTrainingArray;
            });
        } catch (err) {
            console.log(chalk.redBright(err));
        }
    }


    addSMA(trainingArray, timePeriod) {
        try {
            var smaArray;
            var placeholderArray;
            var newTrainingArray = trainingArray;

            for (let i = 0; i < trainingArray.length; i++) {
                smaArray = [];
                placeholderArray = [];
                for (let j = 0; j < trainingArray[i].length; j++) {
                    placeholderArray.push(trainingArray[i][j][3]);
                    if (j < timePeriod) {
                        smaArray.push(_.sum(placeholderArray) / (j + 1));
                    } else {
                        smaArray.push(
                            _.sum(_.takeRight(placeholderArray, timePeriod)) / timePeriod
                        );
                    }
                }

                for (let k = 0; k < trainingArray[i].length; k++) {
                    newTrainingArray[i][k].splice(4, 0, smaArray[k]);
                }
            }

            return newTrainingArray;
        } catch (err) {
            console.log(chalk.redBright(err));
        }
    }


    percentScale(array, numToPercentScale) {
        try {
            var returnArray = [];
            var newArray = array;

            for (let i = 0; i < array.length; i++) {
                returnArray.push([]);
                var benchmark = array[i][0][0]; // Setting the benchmark to the first opening price
                returnArray[i] = newArray[i].map((dataPoint) => {
                    var placeholderArray = [];
                    for (let k = 0; k < numToPercentScale; k++) {
                        // console.log(dataPoint[k], benchmark);
                        placeholderArray.push(calcPercent(dataPoint[k], benchmark));
                    }
                    for (let m = numToPercentScale; m < dataPoint.length; m++) {
                        placeholderArray.push(dataPoint[m]);
                    }
                    return placeholderArray;
                });
            }
            return returnArray;
        } catch (err) {
            console.log(chalk.redBright(err));
        }
    }

    deleteFifteen(array) {
        return array.map((dayArray) => {
            if (dayArray.length > 15) {
                return _.takeRight(dayArray, dayArray.length - 15);
            } else {
                return dayArray;
            }
        });
    }

    movingStandardize(array, timeScale, numOfInputs) {
        try {
            var lengthArray = [];
            var returnArray = [];
            var lengthCounter = 0;
            for (let i = 0; i < array.length; i++) {
                lengthCounter += array[i].length;
                lengthArray.push(lengthCounter);
                returnArray.push([]);
            }

            var longArray = [];
            for (let i = 0; i < array.length; i++) {
                for (let j = 0; j < array[i].length; j++) {
                    longArray.push(array[i][j]);
                }
            }

            var longReturnArray = [];
            var placeholderArray = [];
            for (let i = 0; i < longArray.length; i++) {
                placeholderArray.push(longArray[i]);
                if (i >= timeScale) {
                    let rightArray = _.takeRight(placeholderArray, timeScale);
                    let meanArray = means(rightArray, numOfInputs);
                    let stdArray = standardDeviations(rightArray, numOfInputs);
                    let standardizedPoint = standardize(
                        [placeholderArray[i]],
                        meanArray,
                        stdArray,
                        numOfInputs
                    )[0];
                    longReturnArray.push(standardizedPoint);
                } else {
                    longReturnArray.push(longArray[i]);
                }
            }

            for (let i = 0; i < longReturnArray.length; i++) {
                for (let j = 0; j < lengthArray.length; j++) {
                    if (i < lengthArray[j]) {
                        returnArray[j].push(longReturnArray[i]);
                        break;
                    }
                }
            }
            returnArray.shift();
            return returnArray;
        } catch (err) {
            console.log(chalk.redBright(err));
        }
    }


    minMaxNormalize(array, numToNormalize) {
        try {

            var maxArray = [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 100, 1000000];
            var minArray = [-2.5, -2.5, -2.5, -2.5, -2.5, -2.5, 0, 0];

            for (let i = 0; i < array[0][0].length - 3; i++) { // length of 11 ... 
                let longArray = [];
                for (let j = 0; j < array.length; j++) {
                    for (let k = 0; k < array[0].length; k++) {
                        longArray.push(array[j][k][i]);
                    }
                }

                if (i !== 6) {
                    maxArray[i] = Math.max(...longArray);
                    minArray[i] = Math.min(...longArray);
                }
            }

            // Fixing some of the min and max array indices
            minArray[7] = 0;

            var returnArray = [];
            for (let i = 0; i < array.length; i++) {
                // maxArray.push(maxes(array[i], numToNormalize));
                // minArray.push(mins(array[i], numToNormalize));
                returnArray.push(
                    normalize(
                        array[i],
                        maxArray,
                        minArray
                        // maxes(array[i], numToNormalize),
                        // mins(array[i], numToNormalize)
                    )
                );
            }

            // console.log("maxArray:", maxArray)
            // console.log("minArray:", minArray)
            return returnArray;
        } catch (err) {
            console.log(chalk.redBright(err));
        }
    }


    timeStepFormat(array, timesteps) {
        try {
            // Array will be of format [[], [], [], [], [], []]
            var longArray = _.flattenDepth(array, 1);
            var placeholderArray = [];
            var featureArray = [];
            var labelArray = [];


            for (let i = 0; i < longArray.length - 1; i++) {
                placeholderArray.push(longArray[i]);
                if (i > timesteps) {
                    // labelArray.push(_.takeRight(longArray[i + 1], 2));
                    labelArray.push(longArray[i + 1][longArray[i + 1].length - 2]);
                    featureArray.push(
                        _.takeRight(placeholderArray, timesteps).map((element) => {
                            return _.take(element, element.length - 2);
                        })
                    );
                }
            }


            return { labelArray: labelArray, featureArray: featureArray };
        } catch (err) {
            console.log(chalk.redBright(err));
        }
    }

    deleteDate(featureArray) {
        return featureArray.map((timeStep) => {
            return timeStep.map((array) => {
                // Getting rid of the last entry (date)
                return array.filter((element, index) => index < array.length - 1);
            });
        });
    }

    format() {
        const start = Date.now();

        // Checking the data is in ascending order
        let formattedData = this.checkDateOrder(this.ohlcDays);

        console.log("Cumulative execution time for checkDateOrder", chalk.greenBright((Date.now() - start) / 1000), "seconds to execute.");

        // Checking if there's any empty days in the data and deleting if so 
        formattedData = this.checkEmptyDays(formattedData);

        console.log("Cumulative execution time for checkEmptyDays", chalk.greenBright((Date.now() - start) / 1000), "seconds to execute.");

        // Matching the buy/sell data with the ohlcDays into one long array
        formattedData = this.matchInOut(formattedData, this.buySellDays);

        console.log("Cumulative execution time for matchInOut", chalk.greenBright((Date.now() - start) / 1000), "seconds to execute.");

        // Adding RSI to the data 
        formattedData = this.addRSI(formattedData);

        console.log("Cumulative execution time for addRSI", chalk.greenBright((Date.now() - start) / 1000), "seconds to execute.");

        // Adding SMA20 to the data
        formattedData = this.addSMA(formattedData, 20);

        console.log("Cumulative execution time for addSMA20", chalk.greenBright((Date.now() - start) / 1000), "seconds to execute.");

        // Adding SMA45 to the data
        formattedData = this.addSMA(formattedData, 45);

        console.log("Cumulative execution time for addSMA40", chalk.greenBright((Date.now() - start) / 1000), "seconds to execute.");

        // Scaling all the data to a percent scale (open, high, low, close, SMA20, SMA45)
        formattedData = this.percentScale(formattedData, 6);

        console.log("Cumulative execution time for percentScale", chalk.greenBright((Date.now() - start) / 1000), "seconds to execute.");

        // Standardizing all of the data with a moving standard deviation of 2000
        formattedData = this.movingStandardize(formattedData, 2000, 4);

        console.log("Cumulative execution time for movingStandardize", chalk.greenBright((Date.now() - start) / 1000), "seconds to execute.");

        // This function gets rid of the first 15 minutes of the day (as it's unpredictable, and RSI calculations are not 100%)
        formattedData = this.deleteFifteen(formattedData);

        console.log("Cumulative execution time for deleteFifteen", chalk.greenBright((Date.now() - start) / 1000), "seconds to execute.");

        // Converting all the values of the array between 0 and 1
        formattedData = this.minMaxNormalize(formattedData, 8);

        console.log("Cumulative execution time for minMaxNormalize", chalk.greenBright((Date.now() - start) / 1000), "seconds to execute.");

        var { featureArray, labelArray } = this.timeStepFormat(formattedData, this.timeSteps);

        console.log("Cumulative execution time for timeStepFormat", chalk.greenBright((Date.now() - start) / 1000), "seconds to execute.");

        // Deleting the date form the featureArray for training purposes
        featureArray = this.deleteDate(featureArray);

        console.log("Cumulative execution time for deleteDate", chalk.greenBright((Date.now() - start) / 1000), "seconds to execute.");

        for (let i = 0; i < 100; i++) {
            // console.log(featureArray[i][0], labelArray[i]);
        }


    };

}

// Functions
function calcProfit(buyPoint, sellPoint, BC = 1, SC = 1) {
    // Returns the % profit, with commissions factored in. 
    var numOfShares = 25;

    var SPP = buyPoint.close * numOfShares;
    var SSP = sellPoint.close * numOfShares;
    // BC = buying commission price
    // SC = selling commission price


    return ((SSP - SC) - (SPP + BC)) / (SPP + BC) * 100;

}

function calcWildersSmoothingMethod(
    array,
    timePeriod,
    index,
    avgUt,
    avgDt,
    upOrDown
) {
    var Ut = array[index][3] - array[index - 1][3];
    var Dt = array[index - 1][3] - array[index][3];

    if (array[index][3] > array[index - 1][3] && upOrDown === "Ut") {
        avgUt = (1 / timePeriod) * Ut + (13 / timePeriod) * avgUt - 1;
    } else if (array[index - 1][3] > array[index][3] && upOrDown === "Dt") {
        avgDt = (1 / timePeriod) * Dt + (13 / timePeriod) * avgDt - 1;
    }

    if (upOrDown === "Ut") {
        return avgUt;
    } else if (upOrDown === "Dt") {
        return avgDt;
    }
}

function calcPercent(dataPoint, benchmark) {
    return ((dataPoint - benchmark) / benchmark) * 100;
}


function means(array, numOfInputs) {
    // Will return an array with the standard deviations for the inputs, and will look like this
    // [[], [], [], [], []] <= for 5 inputs, each array will have a list of the inputs
    var placeholderArray = [];
    var meanArray = [];

    for (let i = 0; i < numOfInputs; i++) {
        placeholderArray.push([]);
        for (let j = 0; j < array.length; j++) {
            placeholderArray[i].push(array[j][i]);
        }
        meanArray.push(mean(placeholderArray[i]));
    }
    return meanArray;
}

function standardize(array, meanArray, stdArray, numToStandardize) {
    return array.map((element) => {
        let placeholderArray = [];
        for (let i = 0; i < numToStandardize; i++) {
            placeholderArray.push(zScore(element, i, meanArray, stdArray));
        }
        for (let i = numToStandardize; i < element.length; i++) {
            placeholderArray.push(element[i]);
        }
        return placeholderArray;
    });
}

function standardDeviations(array, numOfInputs) {
    // Will return an array with the standard deviations for the inputs, and will look like this
    // [[], [], [], [], []] <= for 5 inputs, each array will have a list of the inputs
    var placeholderArray = [];
    var stdArray = [];

    for (let i = 0; i < numOfInputs; i++) {
        placeholderArray.push([]);
        for (let j = 0; j < array.length; j++) {
            placeholderArray[i].push(array[j][i]);
        }
        stdArray.push(std(placeholderArray[i]));
    }

    return stdArray;
}

function zScore(element, index, meanArray, stdArray) {
    return (element[index] - meanArray[index]) / stdArray[index];
}


function normalize(
    array,
    maxArray,
    minArray,
    upperBound = 0.9,
    lowerBound = 0.1
) {
    return array.map((element) => {
        let placeholderArray = [];
        for (let i = 0; i < element.length - 3; i++) {
            placeholderArray.push(
                (element[i] - minArray[i]) / (maxArray[i] - minArray[i])
            );
        }
        return _.concat(placeholderArray, _.takeRight(element, 3));
    });
}

module.exports = Data;