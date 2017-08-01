'use strict'
const jtwc = require('./lib/jtwc');

//jtwc.parse('wp1117web.txt');
//jtwc.fetch().then(ret => console.log(ret));

jtwc.list().then(ret => console.log(ret));

//jtwc.get('10E').then(ret => ret.warn_info.getInfo().then(a => console.log(a)));
