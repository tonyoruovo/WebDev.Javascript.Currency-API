const { generateRequestUrl, normaliseResponse } = require('google-translate-api-browser');
const https = require('https');

const defaultOptions = {
  client: 'gtx',
  from: 'ua',
  to: 'en',
  hl: 'en',
  raw: false,
  tld: 'com',
}

const url = (text, options) => generateRequestUrl(text, {...defaultOptions, ...options });

const translate = ({text, from = "en", to = "fr", callback}) => https.get(url(text, {from, to}), (resp) => {
	  let data = '';
	
	  resp.on('data', (chunk) => {
	    data += chunk;
	  });

	  resp.on('end', () => {
 		   callback(normaliseResponse(JSON.parse(data)));
  	  });
	}).on("error", (err) => {
	  console.log("Error: " + err.message);
	}
);
/*
const args = process.argv.reduce((acc, cur, curIn, array) => {
	if(curIn > 1) {
		if(curIn < array.length - 2) (acc || []).push(((acc || []).pop() || '') + (curIn > 2 ? ' ' : '') + cur);
		else acc.push(cur);
		return acc;
	} else return [];
}, []);*/
//console.info(args);
const str = (s, n) => { if(n <= 0) return ''; for(let i = 0; i < n; i++) s += s; return s;}
const stringifyStr = (str) => `"${str}"`;
const stringifyNum = (num) => `${num}`;
const stringifyBig = (bg) => stringifyStr;
const stringifyUndef = () => `null`;
const stringifyFunc = stringifyUndef;
const stringifyBool = (b) => `${b}`;
const stringifyArray = (a) => `[${a.map(x => typeof x === "object" ? Array.isArray(x) ? stringifyArray(x) : stringifyObj(x) : stringify(x)).join(", ")}]`;
const stringifyObj = (obj) => `{${Object.keys(obj).map(x => (stringify(x)) + ": " + (typeof obj[x] === "object" ? Array.isArray(obj[x]) ? stringifyArray(obj[x]) : stringifyObj(obj[x]) : stringify(obj[x]))).join(", ")}}`;
const stringify = (v, tabs = 1) => {
	if(Array.isArray(v)) return stringifyArray(v);
	switch(typeof v) {
		case "number": return stringifyNum(v);
		case "bignum": return stringifyBig(v);
		case "undefined": return stringifyUndef(v);
		case "function": return stringifyFunc(v);
		case "boolean": return stringifyBool(v);
		case "object": return `{\n${str("\t", tabs)}${Object.keys(v).map(x => (stringify(x)) + ": " + (typeof v[x] === "object" ? Array.isArray(v[x]) ? stringifyArray(v[x]) : stringifyObj(v[x]) : stringify(v[x]))).join(",\n" + str("\t", tabs))}\n}`;
		case "string":
		default: return stringifyStr(v);
	}
}
let done = false;
let res;
((val) => {
	res = {'msgId': val[0], 'en': {'UK': val[1], 'US': val[1]}, 'fr': {}, 'es': {}, 'ar': {}, 'zh': {}, 'hi': {}, 'sw': {}}
	// res["fr"] = (res["fr"] || []).push(trans)
	if(!Array.isArray(val[1])) {
		const numOfLangs = 7;
		let dones = 0;
		//french
		translate({text: val[1],callback: (trans) => {res["fr"] = {"FR": trans.text}; dones++; done = dones > numOfLangs; console.log(stringify(res));}});
		//spanish
		translate({text: val[1],to: "es",callback: (trans) => {res["es"] = {"ES": trans.text}; dones++; done = dones > numOfLangs; console.log(stringify(res));}});
		//arabic
		translate({text: val[1],to: "ar",callback: (trans) => {res["ar"] = {"SA": trans.text}; dones++; done = dones > numOfLangs; console.log(stringify(res));}});
		//chinese-simplified
		translate({text: val[1],to: "zh-cn",callback: (trans) => {res["zh"] = {...res["zh"], "CN": trans.text}; dones++; done = dones > numOfLangs; console.log(stringify(res));}});
		//chinese-traditional
		translate({text: val[1],to: "zh-tw",callback: (trans) => {res["zh"] = {...res["zh"], "HK": trans.text}; dones++; done = dones > numOfLangs; console.log(stringify(res));}});
		//hindi
		translate({text: val[1],to: "hi",callback: (trans) => {res["hi"] = {"IN": trans.text}; dones++; done = dones > numOfLangs; console.log(stringify(res));}});
		//swahili
		translate({text: val[1],to: "sw",callback: (trans) => {res["sw"] = {"KE": trans.text}; dones++; done = dones > numOfLangs; console.log(stringify(res));}});
	} else if(Array.isArray(val[1])) {
		const numOfLangs = 7 * val[1].length;
		let dones = 0;//{"FR": [...res["fr"]["FR"], trans]}
		//french
		val[1].forEach((x, i) => translate({text: x,callback: (trans) => {if(!res["fr"]["FR"])res["fr"]["FR"] = [];res["fr"]["FR"][i] = trans.text; dones++; done = dones > numOfLangs; console.log(stringify(res));}}));
		//spanish
		val[1].forEach((x, i) => translate({text: x,to: "es",callback: (trans) => {if(!res["es"]["ES"])res["es"]["ES"] = [];res["es"]["ES"][i] = trans.text; dones++; done = dones > numOfLangs; console.log(stringify(res));}}));
		//arabic
		val[1].forEach((x, i) => translate({text: x,to: "ar",callback: (trans) => {if(!res["ar"]["SA"])res["ar"]["SA"] = [];res["ar"]["SA"][i] = trans.text; dones++; done = dones > numOfLangs; console.log(stringify(res));}}));
		//chinese-simplified
		val[1].forEach((x, i) => translate({text: x,to: "zh-cn",callback: (trans) => {if(!res["zh"]["CN"])res["zh"]["CN"] = [];res["zh"]["CN"][i] = trans.text; dones++; done = dones > numOfLangs; console.log(stringify(res));}}));
		//chinese-traditional
		val[1].forEach((x, i) => translate({text: x,to: "zh-tw",callback: (trans) => {if(!res["zh"]["HK"])res["zh"]["HK"] = [];res["zh"]["HK"][i] = trans.text; dones++; done = dones > numOfLangs; console.log(stringify(res));}}));
		//hindi
		val[1].forEach((x, i) => translate({text: x,to: "hi",callback: (trans) => {if(!res["hi"]["IN"])res["hi"]["IN"] = [];res["hi"]["IN"][i] = trans.text; dones++; done = dones > numOfLangs; console.log(stringify(res));}}));
		//swahili
		val[1].forEach((x, i) => translate({text: x,to: "sw",callback: (trans) => {if(!res["sw"]["KE"])res["sw"]["KE"] = [];res["sw"]["KE"][i] = trans.text; dones++; done = dones > numOfLangs; console.log(stringify(res));}}));
	} else { done = true; }
})(["conto", "Convert to"]);
