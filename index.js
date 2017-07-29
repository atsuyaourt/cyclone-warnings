'use strict'
var jtwc = require('./lib/jtwc');

//jtwc.parse('wp1117web.txt');
jtwc.fetch().then(ret => console.log(ret));
