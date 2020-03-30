const fetch = require('node-fetch');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const uuid = require('uuid');
const prompt = require('prompt');

const properties = [
    {
        name: 'URL'
    }
];

prompt.start();

prompt.get(properties, function (err, result) {
    if (err) {
        console.log(err);
        return 1;
    }
    let url = null;
    if (result.URL.split('.')[0] == 'https://www' || result.URL.split('.')[0] == 'http://www')
        url = result.URL;
    else if (result.URL.split('.')[0] == 'www')
        url = `https://${result.URL}`;
    else
        url = `https://www.${result.URL}`;
    console.log(`Visiting:${url}...`);
    fetchData(url).then((result) => {
        if (result.error) {
            // error details
            console.log('Error: ' + result.error);
        }
        console.log(`Status Code: ${result.status}`);
        if (result.status == 200) {
            let $ = cheerio.load(result.data);
            collectInternalLinks($, 'both', url)
        }
    });
});

function collectInternalLinks($, option, url) {
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

    switch (option) {
        case 'relative':
            return writeLogsFile(allRelativeLinks, url);
        case 'absolute':
            return writeLogsFile(allAbsoluteLinks, url);
        case 'both':
            let mergedLinks = [];
            allRelativeLinks.map((item)=>{
                item = `${url}${item}`;
                mergedLinks.push(item);
            });
            allAbsoluteLinks.map((item)=>{
                mergedLinks.push(item);
            });
            return writeLogsFile(mergedLinks, url);
    }
}
function writeLogsFile(links, url) {
    const randomUUID = uuid.v4();
    fs.writeFile(`./logs/log-${randomUUID}.txt`, '', function (err) {
        if (err)
            return console.log(err);
        console.log('Logs file created!');
    });
    if (links) {
        links.map((link, index) => {
            fs.appendFileSync(`./logs/log-${randomUUID}.txt`, `\n${index + 1}-${link}`);
        });
    }
}
async function fetchData(url) {
    console.log("Crawling data...")
    // make http call to url
    let response = await axios(url).catch((err) => {
        console.log(`Cannot reach the URL! Maybe it's not true...`);
        // console.log(err);
    });

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
function findTag($, tag) {

}