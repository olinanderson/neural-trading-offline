const Data = require("./data");

const ohlcArray = [{
    "open": 165.695,
    "high": 166.07,
    "low": 165,
    "close": 166.02,
    "volume": 65110,
    "date": 1.58315952e12
},
{
    "open": 166.008,
    "high": 166.46,
    "low": 165.7436,
    "close": 165.86,
    "volume": 61899,
    "date": 1.58315958e12
},
{
    "open": 165.8877,
    "high": 166.1,
    "low": 165.18,
    "close": 165.2091,
    "volume": 61444,
    "date": 1.58315964e12
},
{
    "open": 165.2329,
    "high": 165.45,
    "low": 164.75,
    "close": 164.955,
    "volume": 104423,
    "date": 1.5831597e12
},
{
    "open": 164.98,
    "high": 165.21,
    "low": 164.48,
    "close": 164.48,
    "volume": 48823,
    "date": 1.58315976e12
},
{
    "open": 164.5,
    "high": 164.7,
    "low": 163.95,
    "close": 164.22,
    "volume": 61990,
    "date": 1.58315982e12
},
{
    "open": 164.22,
    "high": 164.32,
    "low": 163.75,
    "close": 163.87,
    "volume": 51791,
    "date": 1.58315988e12
},
{
    "open": 163.88,
    "high": 164.9349,
    "low": 163.79,
    "close": 164.905,
    "volume": 46708,
    "date": 1.58315994e12
},
{
    "open": 164.94,
    "high": 164.99,
    "low": 164.25,
    "close": 164.25,
    "volume": 50696,
    "date": 1.58316e12
},
{
    "open": 164.29,
    "high": 164.9,
    "low": 164.21,
    "close": 164.72,
    "volume": 41064,
    "date": 1.58316006e12
},
{
    "open": 164.695,
    "high": 165.55,
    "low": 164.59,
    "close": 165.45,
    "volume": 54358,
    "date": 1.58316012e12
},
{
    "open": 165.38,
    "high": 165.82,
    "low": 165,
    "close": 165.19,
    "volume": 39556,
    "date": 1.58316018e12
},
{
    "open": 165.2,
    "high": 165.865,
    "low": 164.995,
    "close": 165.57,
    "volume": 28993,
    "date": 1.58316024e12
},
{
    "open": 165.57,
    "high": 165.8,
    "low": 165.485,
    "close": 165.73,
    "volume": 41368,
    "date": 1.5831603e12
},
{
    "open": 165.7,
    "high": 166.43,
    "low": 165.53,
    "close": 166.12,
    "volume": 47095,
    "date": 1.58316036e12
},];


const buySellDaysArray = [
    {
        "buy": 1,
        "sell": 0,
        "date": 1.58315958e12
    },
    {
        "buy": 0,
        "sell": 1,
        "date": 1.5831603e12
    },
];

const ohlcArrayMatched = [{
    "open": 165.695,
    "high": 166.07,
    "low": 165,
    "close": 166.02,
    "volume": 65110,
    "date": 1.58315952e12,
    "decision": 0
},
{
    "open": 166.008,
    "high": 166.46,
    "low": 165.7436,
    "close": 165.86,
    "volume": 61899,
    "date": 1.58315958e12,
    "decision": 1
},
{
    "open": 165.8877,
    "high": 166.1,
    "low": 165.18,
    "close": 165.2091,
    "volume": 61444,
    "date": 1.58315964e12,
    "decision": 1
},
{
    "open": 165.2329,
    "high": 165.45,
    "low": 164.75,
    "close": 164.955,
    "volume": 104423,
    "date": 1.5831597e12,
    "decision": 1
},
{
    "open": 164.98,
    "high": 165.21,
    "low": 164.48,
    "close": 164.48,
    "volume": 48823,
    "date": 1.58315976e12,
    "decision": 1
},
{
    "open": 164.5,
    "high": 164.7,
    "low": 163.95,
    "close": 164.22,
    "volume": 61990,
    "date": 1.58315982e12,
    "decision": 1
},
{
    "open": 164.22,
    "high": 164.32,
    "low": 163.75,
    "close": 163.87,
    "volume": 51791,
    "date": 1.58315988e12,
    "decision": 1
},
{
    "open": 163.88,
    "high": 164.9349,
    "low": 163.79,
    "close": 164.905,
    "volume": 46708,
    "date": 1.58315994e12,
    "decision": 1
},
{
    "open": 164.94,
    "high": 164.99,
    "low": 164.25,
    "close": 164.25,
    "volume": 50696,
    "date": 1.58316e12,
    "decision": 1
},
{
    "open": 164.29,
    "high": 164.9,
    "low": 164.21,
    "close": 164.72,
    "volume": 41064,
    "date": 1.58316006e12,
    "decision": 1
},
{
    "open": 164.695,
    "high": 165.55,
    "low": 164.59,
    "close": 165.45,
    "volume": 54358,
    "date": 1.58316012e12,
    "decision": 1
},
{
    "open": 165.38,
    "high": 165.82,
    "low": 165,
    "close": 165.19,
    "volume": 39556,
    "date": 1.58316018e12,
    "decision": 1
},
{
    "open": 165.2,
    "high": 165.865,
    "low": 164.995,
    "close": 165.57,
    "volume": 28993,
    "date": 1.58316024e12,
    "decision": 1
},
{
    "open": 165.57,
    "high": 165.8,
    "low": 165.485,
    "close": 165.73,
    "volume": 41368,
    "date": 1.5831603e12,
    "decision": 0
},
{
    "open": 165.7,
    "high": 166.43,
    "low": 165.53,
    "close": 166.12,
    "volume": 47095,
    "date": 1.58316036e12,
    "decision": 0
},];

const initial = [{
    ticker: "MSFT",
    day: "Fri Jan 07 2022",
    ohlcArray: ohlcArray,
},
{
    ticker: "MSFT",
    day: "Mon Nov 01 2021",
    ohlcArray: ohlcArray,
},
{
    ticker: "MSFT",
    day: "Wed Nov 10 2021",
    ohlcArray: ohlcArray,
},
{
    ticker: "MSFT",
    day: "Thu Jan 06 2022",
    ohlcArray: ohlcArray,
},
{
    ticker: "MSFT",
    day: "Tue Jan 04 2022",
    ohlcArray: ohlcArray,
}];

const data = new Data(initial);

test("Checks if the data is in ascending order", () => {
    expect(data.checkDateOrder(initial)).toStrictEqual([
        {
            ticker: "MSFT",
            day: "Mon Nov 01 2021",
            ohlcArray: ohlcArray,
        },
        {
            ticker: "MSFT",
            day: "Wed Nov 10 2021",
            ohlcArray: ohlcArray,
        },
        {
            ticker: "MSFT",
            day: "Tue Jan 04 2022",
            ohlcArray: ohlcArray,
        },
        {
            ticker: "MSFT",
            day: "Thu Jan 06 2022",
            ohlcArray: ohlcArray,
        },
        {
            ticker: "MSFT",
            day: "Fri Jan 07 2022",
            ohlcArray: ohlcArray,
        },
    ]);
});

test("Checks if there are any empty days of data.", () => {
    expect(data.checkEmptyDays([
        {
            ticker: "MSFT",
            day: "Mon Nov 01 2021",
            ohlcArray: ohlcArray,
        },
        {
            ticker: "MSFT",
            day: "Wed Nov 10 2021",
            ohlcArray: [],
        },
        {
            ticker: "MSFT",
            day: "Tue Jan 04 2022",
            ohlcArray: ohlcArray,
        },
        {
            ticker: "MSFT",
            day: "Thu Jan 06 2022",
            ohlcArray: [],
        },
        {
            ticker: "MSFT",
            day: "Fri Jan 07 2022",
            ohlcArray: ohlcArray,
        },
    ])).toStrictEqual([{
        ticker: "MSFT",
        day: "Mon Nov 01 2021",
        ohlcArray: ohlcArray,
    },
    {
        ticker: "MSFT",
        day: "Tue Jan 04 2022",
        ohlcArray: ohlcArray,
    },
    {
        ticker: "MSFT",
        day: "Fri Jan 07 2022",
        ohlcArray: ohlcArray,
    },]);
});

test("tests the matchInOut function is working correctly.", () => {
    expect(data.matchInOut([{
        ticker: "MSFT",
        day: "Mon Nov 01 2021",
        ohlcArray: ohlcArray,
    },
    ], [{
        ticker: "MSFT",
        day: "Mon Nov 01 2021",
        buySellDaysArray: buySellDaysArray,
    },
    ])).toStrictEqual([ohlcArrayMatched]);
});