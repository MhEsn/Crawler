const fetch = require('node-fetch');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const uuid = require('uuid');

let url = "https://pspro.ir/";
console.log('Visited Page: ' + url);
fetchData(url).then((result) => {
    if (result.error)
        console.log('Error: ' + result.error);
    console.log('Status Code: ' + result.status);
    if (result.status == 200) {
        let $ = cheerio.load(result.data);
        collectInternalLinks($);
    }
});

function collectInternalLinks($) {
    var allRelativeLinks = [];
    var allAbsoluteLinks = [];

    var relativeLinks = $("a[href^='/']");
    relativeLinks.each(function () {
        allRelativeLinks.push($(this).attr('href'));
    });

    var absoluteLinks = $("a[href^='http']");
    absoluteLinks.each(function () {
        allAbsoluteLinks.push($(this).attr('href'));
    });
    return writeLogsFile(allAbsoluteLinks);
}
function writeLogsFile(logs) {
    const randomUUID = uuid.v4();
    fs.writeFile(`log-${randomUUID}.txt`, '', function (err) {
        if (err)
            return console.log(err);
        console.log('Logs file created!');
    });
    logs.map((link, index) => {
        fs.appendFileSync(`log-${randomUUID}.txt`, `\n${index + 1}-${link}`);
    });
}
async function fetchData(url) {
    console.log("Crawling data...")
    // make http call to url
    let response = await axios(url).catch((err) => console.log(err));

    if (response.status !== 200) {
        console.log("Error occurred while fetching data");
        return;
    }
    return response;
}
function searchWord($, words) {
    const body = $('html > body').text();
    words.map((word) => {
        if (body.toLowerCase().indexOf(word.toLowerCase()) !== -1) {
            console.log(word + ': found!');
        }
        else
            console.log(word + ': not-found!');
    })
}