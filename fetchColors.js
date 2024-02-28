const { JSDOM } = require("jsdom");
const {writeFileSync} = require("node:fs");

/**@type {(s: string) => string} */
function toCase(s) {
    return s;
}

fetch("https://en.wikipedia.org/wiki/List_of_colors_(alphabetical)").then(async res => {
    const text = await res.text();
    const document = new JSDOM(text).window.document;
    const colors = {};
    
    document.querySelectorAll("div > p[title]")
    .forEach(x => {
        let t = x.getAttribute("title");
        colors[toCase(x.parentElement.textContent.trim())] = t.substring(t.indexOf('#')).trim();
    })
    // writeFileSync("./wikipedia-colors.js", "const colors = " + JSON.stringify(colors, null, "\t"), { encoding: "utf-8"});
    writeFileSync("./wikipedia-colors.js", "const colors=" + JSON.stringify(colors), { encoding: "utf-8"});
})


