const fs = require("node:fs");
const {JSDOM} = require("jsdom");
const currencies = require("./currencies.json");
const string = (char, n) => {
    if(!char) return undefined;
    if(!n || n <= 0) return "";
    return `${char}${string(char, n - 1)}`;
}
const formatNum = (n, unit) => {
    if(!n) return undefined;
    else if(typeof n !== 'number') return undefined;
    else if(!unit || unit < 0) return n;
    const asString = Math.abs(n).toString();
    return `${string('0', unit - asString.length)}${asString}`;
}
const lastDayIn = (month, leapYear) => {
    switch (month) {
        default:
            return 31;
        case 9:
        case 4:
        case 6:
        case 11:
            return 30;
        case 2:
            return leapYear ? 29 : 28;
    }
}
const ignore = ['usd', 'xxx', 'xbt', 'btc']
const months = 12;
console.log("initialising...");
currencies.forEach(async x => {
    console.log(`Analysing ${x.info.iso}...`);
    if(ignore.includes(x.info.iso)) return;
    for (let i = 0; i < months; i++) {
        const array = [];
        const address = `https://fxtop.com/en/historical-exchange-rates.php?A=1&C1=USD&C2=${x.info.iso.toUpperCase()}&TR=1&DD1=01&MM1=${formatNum(i + 1, 2)}&YYYY1=1953&B=1&P=&I=1&DD2=${formatNum(lastDayIn(i + 1, false), 2)}&MM2=${formatNum(i + 1, 2)}&YYYY2=1953&btnOK=Go%21`;
        const res = await JSDOM.fromURL(address);
        let rows;
        try {
            rows = res.window.document.querySelector("body > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(9) > td > table:nth-child(2) > tbody").children;
        } catch (e) {
           console.log(`could not retrive data from ${x.info.iso}-${x.info["iso-num"]}`);
           return;
        }
        for (let j = 0; j < rows.length; j++) {
            const row = rows[j];
            const column = row.children;
            const obj = {};
            obj.date = column[0].textContent;
            obj.rate = Number.parseFloat(column[1].textContent);
            obj.percent = column[2].textContent;
            array.push(obj);
        }
        // if(!fs.existsSync(`./currency/1953/${formatNum(i + 1, 2)}`)) fs.mkdir(`./currency/1953/${formatNum(i + 1, 2)}`);
        fs.writeFileSync(`./fxtop/currency/1953/${x.info.iso}-${formatNum(i + 1, 2)}.json`, JSON.stringify(array, null, 2));
        console.log(`Retrived and saved ${x.info.iso} for month ${i + 1}...`);
    }
});

