#!/usr/bin/env node
/* This file grades an html file for the presence of HTML tags and other attributes - teaches CLI dev and DOM parsing

References:
+ Cheerio
 https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html
 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var urlfile = "url.txt";
var assertFileExists = function(infile)  {
    var instr = infile.toString();
    if(!fs.existsSync(instr))  {
	console.log("%s does not exist. Exitting. ", instr);
	process.exit(1); // http;//nodejs.org/api/process.html#process_process_exit_code
	}
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
    };

var checkHtmlFile = function(htmlfile,checksfile){
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks){
	var present = $(checks[ii]).length >0;
	out[checks[ii]] =present;
	}
   return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var restToFile = function(result, response) {
    if (result instanceof Error) {
	console.error('Error: ' + util.format(response.message));
	}
    else {
//	console.error("Wrote %s", urlfile);
	fs.writeFileSync(urlfile, result);

	}

};


if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url_addr>', 'Heroku URL')
		.parse(process.argv);
    if (program.url.length >0){
	rest.get(program.url).on('complete',restToFile);
	sleep(2000);
	var checkJson = checkHtmlFile(urlfile, program.checks);
	}
    else {
	var checkJson = checkHtmlFile(program.file, program.checks);}


   var outJson = JSON.stringify(checkJson, null, 4);

    console.log(outJson);
}
else {
    exports.checkHtmlFile = checkHtmlFile;
}