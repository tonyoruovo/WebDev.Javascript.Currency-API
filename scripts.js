const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("node:fs");
const https = require("node:https");

/**
 * Implementing java wild card in type script such as: \
 * \
 * JAVA
 * ```java
 * interface List<T> {
 *  //...implementation details...
 * }
 * // use wild card
 * final List<?> l = //...
 * ```
 * \
 * TYPESCRIPT
 * ```ts
 * interface List<T = any> {
 *  //...implementation details...
 * }
 * // use wild card
 * readonly List l = //...
 * ```
 */
export function f(){}

// reading a file in node
fs.readFile("./scripts.js", { encoding: "utf-8" }, (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  //do something with the data
  console.log(data);
});

//reading a json file in node
const currencies = require("./list-1.json");
console.log(currencies);

// open a network and extract a webpage
https.get("https://www.example.com", (res) => {
  process.stdout.write("status code: " + res.statusCode + "\n");
  process.stdout.write(
    "headers: " + JSON.stringify(res.headers, null, 2) + "\n"
  );

  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => process.stdout.write("data " + data + "\n"));
});

//parsing HTML with js web-like syntax
https.get("https://www.example.com", (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk))
  .on("end", () => {
    const web = new JSDOM(data); //We need to install this module using `npm i jsdom`
    console.log(web.window.document.querySelector("p").textContent);
  });
});

//expose your IP address
const exposeIp = () => {
  const { networkInterfaces } = require('os');
  
  const nets = networkInterfaces();
  const results = Object.create(null); // or just '{}', an empty object
  
  for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
          // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
          if (net.family === 'IPv4' && !net.internal) {
              if (!results[name]) {
                  results[name] = [];
              }
  
              results[name].push(net.address);
          }
      }
  }
}

//The correct user-agent
const userAgent = {
    //"User-Agent": "PostmanRuntime/7.29.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "Postman-Token": randomUUID(),
    "Connection": "keep-alive",
    "Host":"seekflag.com",
    "Pragma": 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.51',
    'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Microsoft Edge";v="114"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
}


/**
 * Function i used to sift through wkipedia and down load the countries name and flags to a `./flags`
 * folder
 */
const createCountriesDB = async function() {
  console.log("initialising...");
  let res = await fetch("https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes");
  console.log("https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes retrieved");
  let text = await res.text();
  const wkp = new JSDOM(text);
  const c = [];
  const rows = wkp.window.document.querySelector("#mw-content-text > div.mw-parser-output > table > tbody").children;
  for (let i = 0; i < rows.length; i++) {
      const row = rows.item(i);
      console.log(`Analysing and parsing row ${i}`);
      if(row.children.length === 8){
          const country = {};
          country["common-name"] = row.children.item(0).textContent.toLowerCase().trim();
          country["official-name"] = row.children.item(1).textContent.toLowerCase().trim();
          country["sovereignty"] = row.children.item(2).textContent.toLowerCase().trim();
          country["iso-2"] = row.children.item(3).textContent.toLowerCase().trim();
          country["iso-3"] = row.children.item(4).textContent.toLowerCase().trim();
          country["iso-num"] = Number.parseInt(row.children.item(5).textContent.toLowerCase().trim());
          country["code-link"] = row.children.item(6).textContent.toLowerCase().trim();
          country["top-level-domain-name"] = row.children.item(7).textContent.toLowerCase().trim();
          country["flag"] = `./flags/${country["iso-2"]}.svg`;
          try {
              res = await fetch(`https://flagcdn.com/${country["iso-2"]}.svg`);
              console.log(`flag of ${country["common-name"]} downloaded!`);
              text = await res.text();
              fs.writeFileSync(country.flag, text);
              console.log(`flag of ${country["common-name"]} saved!`);
          } catch (error) {
              console.error(` no flag for ${country["common-name"]} was found!`);
          }
          c.push(country);
      }
  }
  fs.writeFileSync("countries.json", JSON.stringify(c, null, 2));
  console.log("done!");
}

/**
 * Function i used to sift through wikipedia and download the currencies and their symbols `./flags`
 * folder
 */
const createCurrenciesDB = async function () {
  const search = (s1, s2) => {
    if (s2.length <= 5)
      if (s1.length === s2.length) return s1 === s2;
      else if (s1.length > s2.length) return s1.indexOf(s2) >= 0;
      else return s2.indexOf(s1) >= 0;
    else if (s1.length > s2.length) return s1.indexOf(s2) >= 0;
    else if (s2.length > s1.length) return s2.indexOf(s1) >= 0;
    return s1 === s2;
  };
  console.log("initialising...");
  const res = await fetch("https://en.wikipedia.org/wiki/ISO_4217");
  console.log("https://en.wikipedia.org/wiki/ISO_4217 retrieved");
  const text = await res.text();
  const res2 = await fetch(
    "https://currencycalculate.com/list-of-currency-symbols/"
  );
  console.log(
    "https://currencycalculate.com/list-of-currency-symbols/ retrieved"
  );
  const text2 = await res2.text();
  const wkp = new JSDOM(text);
  const cc = new JSDOM(text2);
  const c = [];
  const rows = wkp.window.document.querySelector(
    "#mw-content-text > div.mw-parser-output > table:nth-child(34) > tbody"
  ).children;
  const rows2 = cc.window.document.querySelector(
    "#content > div > div > div > div.nv-content-wrap.entry-content > figure.wp-block-table > table > tbody"
  ).children;
  const symbols = {};
  for (let i = 0; i < rows2.length; i++) {
    const row = rows2.item(i);
    const column = row.children;
    if (column.length === 4) {
      const symbol = column.item(3).textContent.toLowerCase().trim();
      symbols[column.item(2).textContent.toLowerCase().trim()] =
        symbol.length > 0 ? symbol : null;
    }
  }
  // console.table(symbols);
  for (let i = 0; i < rows.length; i++) {
    const row = rows.item(i);
    // console.log(`Analysing and parsing row ${i}`);
    const column = row.children;
    if (column.length === 5) {
      const currency = { info: {}, "secondary-unit-info": {} };
      currency.info["iso"] = column.item(0).textContent.toLowerCase().trim();
      currency.info["iso-num"] = Number.parseInt(
        column.item(1).textContent.toLowerCase().trim()
      );
      currency.info[
        "symbol"
      ] = `./symbol/${currency.info["iso"]}-${currency.info["iso-num"]}.svg`;
      currency.info.unicode = symbols[currency.info.iso];
      const decimal = Number.parseInt(
        column.item(2).textContent.toLowerCase().trim()
      );
      currency["secondary-unit-info"]["rate"] = decimal
        ? new Decimal(10).pow(decimal).toString()
        : null;
      let ctry = column.item(4).textContent.trim().split(",");
      ctry = ctry.map((x) => {
        const pi = x.indexOf("("); //parenthesis index
        const bi = x.indexOf("["); //bracket index
        if (pi >= 0) x = x.substring(0, pi);
        if (bi >= 0) x = x.substring(0, bi);
        return x.trim();
      });
      ctry = ctry.filter((x) => x.length > 0 && x.indexOf(")") < 0);
      ctry = ctry.map((x) => {
        for (let i = 0; i < countries.length; i++) {
          if (search(x.toLowerCase(), countries[i]["common-name"]))
            return countries[i]["iso-3"];
          else if (search(x.toLowerCase(), countries[i]["official-name"]))
            return countries[i]["iso-3"];
        }
        console.error(x);
        return x;
      });
      currency.users = ctry;
      c.push(currency);
    } else console.log(`row ${i} is an illegal row`);
  }
  fs.writeFileSync("currencies.json", JSON.stringify(c, null, 2));
  console.log("done!");
};

/**
 * Function i used to sift through wikipedia and download the historical currencies and their symbols `./flags`
 * folder
 */
const createHCurrenciesDB = async function () {

  const removeBracketLinks = s => {
      const bi = s.indexOf("["); //bracket index
      if (bi >= 0) s = s.substring(0, bi);
      return s.trim();
  }
  const convertParenToList = s => {
      const pi = s.indexOf("(");
      if(pi >= 0){
          let k = s.substring(0, pi).trim().split('/');
          if(k[0].length !== 3) return [s];
          k = k.concat(s.substring(pi + 1, s.indexOf(")")).split('/'));
          k = k.map(x => x.trim());
          return k;
      }
      return [s];
  }

console.log("initialising...");
const res = await fetch("https://en.wikipedia.org/wiki/ISO_4217");
console.log("https://en.wikipedia.org/wiki/ISO_4217 retrieved");
const text = await res.text();
const wkp = new JSDOM(text);
const c = [];
const rows = wkp.window.document.querySelector(
  "#mw-content-text > div.mw-parser-output > table:nth-child(39) > tbody"
).children;
for (let i = 0; i < rows.length; i++) {
  const row = rows.item(i);
  const column = row.children;
  if (column.length === 7) {
    const currency = { info: {}, "secondary-unit-info": {}, "life-span": {} };
    currency.info["iso"] = removeBracketLinks(column.item(0).textContent.toLowerCase().trim());
    currency.info["iso-num"] = Number.parseInt(
      removeBracketLinks(column.item(1).textContent.toLowerCase().trim())
    );
    currency.info[
      "symbol"
    ] = `./h-symbol/${currency.info["iso"]}-${currency.info["iso-num"]}.svg`;
    const decimal = Number.parseInt(
      removeBracketLinks(column.item(2).textContent.toLowerCase().trim())
    );
    currency["secondary-unit-info"]["rate"] = decimal
      ? new Decimal(10).pow(decimal).toString()
      : null;
    currency.info["name"] = removeBracketLinks(column.item(3).textContent.toLowerCase().trim());

    let val = removeBracketLinks(column.item(4).textContent.toLowerCase().trim());
    currency["life-span"].created = (val && val.length >= 4 ? val : null);
    val = removeBracketLinks(column.item(5).textContent.toLowerCase().trim());
    currency["life-span"].deprecated = (val && val.length >= 4 ? val : null);
    val = removeBracketLinks(column.item(6).textContent.toLowerCase().trim());
    currency["life-span"]["replaced-by"] = (val && val.length >= 3 ? convertParenToList(val) : [])

    c.push(currency);
  } else console.log(`row ${i} is an illegal row`);
}
fs.writeFileSync("h-currencies.json", JSON.stringify(c, null, 2));
console.log("done!");
};

/**
 * Function i used to sift through cdn.devit and download the svg format of currency symbols
 */
const downloadSymbols = () =>{
    console.log("initialising...");
    currencies.forEach(async x => {
        const res = await fetch(`https://cdn.devit.software/selectors/sdk/images/currencies/symbols/square/${x.info.iso}.svg`);
        if(res.status < 200 || res.status > 299) {
            console.error(`Failed to get a valid response from https://cdn.devit.software/selectors/sdk/images/currencies/symbols/square/${x.info.iso}.svg. Got ${res.status} instead`);
            return;
        }
        console.log(`https://cdn.devit.software/selectors/sdk/images/currencies/symbols/square/${x.info.iso}.svg retrieved`);
        const text = await res.text();
        fs.writeFileSync(`./symbol/${x.info.iso}-${x.info["iso-num"]}.svg`, text);
    });
}

/**
 * Function i used to sift through cdn.devit and download the svg format of historic currency symbols
 */
const downloadSymbols2 = () =>{
    const ctr = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    console.log("initialising...");
    currencies.forEach(async x => {
        const iso = x.info.iso || x.info["non-standard-iso"];
        const path = `https://cdn.devit.software/selectors/sdk/images/currencies/symbols/square/${iso}.svg`;

        fetch(path, {signal: ctr.signal}).then(async res => {
            clearTimeout(timeoutId);
            if(res.status < 200 || res.status > 299){
                console.error(`Failed to get a valid response from ${path}. Got ${res.status} instead`);
                return;
            }
            console.log(`${path} retrieved`);
            const text = await res.text();
            fs.writeFileSync(`./h-symbol/${iso}-${x.info["iso-num"]}.svg`, text);
        });
    });
}
/**
 * Crawls yahoo finance to get historical data of currencies
 */
const downloadData = () => {
    currencies.forEach(async x => {
        if(x.info.iso === 'usd') return;
        const url = `https://query1.finance.yahoo.com/v7/finance/download/USD${x.info.iso.toUpperCase()}=X?period1=1133395200&period2=1687564800&interval=1d&events=history&includeAdjustedClose=true`;
        const res = await fetch(url);
        if(res.status < 200 || res.status > 299){
            console.log(`Failed to fetch ${new Intl.DisplayNames('en', {type: 'currency'}).of(x.info.iso)} whose code is ${x.info.iso}-${x.info["iso-num"]}`);
            return;
        }
        const text = await res.text();
        fs.writeFileSync(`./hist/${x.info.iso.toUpperCase()}-${x.info["iso-num"]}-USD.csv`, text);
    });
}
/**
 * Converts csv files to json files
 */
const covertCSVToJSON = () => {
  const currencies = require("./currencies.json");
  const csv = require("csvtojson");
  
  fs.readdir("./hist", {encoding: "utf-8"}, (e, f) => {
      if(e) console.error(e);
      f.forEach(p => {
          const json = csv().fromFile(`./hist/${p}`);
          json.then(res => {
              const n = p.split('.');
              fs.writeFileSync(`./json/${n[0]}.json`, JSON.stringify(res, null, 2));
          })
      });
  })
}

/**
 * Crawls wikipedia for list of crypto currencies and stores them in a json file
 */
async function compileCrypto() {
    /**@param {string} s @returns {string} */
    const removeBracketLinks = s => {
        return s.replace(/\[.+\]/g, "").trim();
        // const bi = s.indexOf("["); //bracket index
        // if (bi >= 0) s = s.substring(0, bi);
        // return s.trim();
    }

    const web = await JSDOM.fromURL("https://en.wikipedia.org/wiki/List_of_cryptocurrencies");
    const rows = web.window.document.querySelector("#mw-content-text > div.mw-parser-output > table:nth-child(7) > tbody").children
    const curs = [];
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const column = row.children;
        const c = {};
        c.info = {}
        c.info.codes = removeBracketLinks(column.item(2).textContent).split(",").map(x => x.trim());
        c.info.symbol = `./symbols/${c.info.codes[0]}-${removeBracketLinks(column.item(0).textContent)}.svg`;
        c.info.creator = removeBracketLinks(column.item(3).textContent);
        c.info.unicode = c.info.codes[c.info.codes.length - 1];
        c.info.name = removeBracketLinks(column.item(1).textContent);
        c.info.desc = removeBracketLinks(column.item(7).textContent);
        c["life-span"] = { "created-at": removeBracketLinks(column.item(0).textContent) }
        curs[i] = c;
    }
    fs.writeFileSync("crypto-currencies.json", JSON.stringify(curs, null, 2));
}

/**
 * Crawls yahoo finance to get historical data of crypto-currencies
 */
const downloadCryptoData = () => {
  const currencies = require("./crypto-currencies.json");
  currencies.forEach(async x => {
      // if(x.info.iso === 'usd') return;
      const url = `https://query1.finance.yahoo.com/v7/finance/download/${x.info.codes[0].toUpperCase()}-USD?period1=1410912000&period2=1687737600&interval=1d&events=history&includeAdjustedClose=true`;
      const res = await fetch(url);
      if(res.status < 200 || res.status > 299){
          console.log(`Failed to fetch ${x.info.codes[0].toUpperCase()}`);
          return;
      }
      // const str = fs.createWriteStream(`./crypto-csv/${x.info.codes[0].toUpperCase()}-USD.csv`);
      // await res.body.pipeTo(str);
      // res.
      // ctj().fromStream(res.body.getReader())
      // .subscribe((data) => {
      //     str.write(data);
      // }).end();
      const text = await res.text();
      fs.writeFileSync(`./crypto-csv/${x.info.codes[0].toUpperCase()}-USD.csv`, text);
      // ctj().fromFile(`./crypto-json/${x.info.codes[0].toUpperCase()}-${x.info["iso-num"]}-USD.csv`)
  });
}
