'use strict'
let path = require("path");
let axios = require('axios');
let cheerio = require('cheerio');

let base_url = 'https://metoc.ndbc.noaa.gov/RSSFeeds-portlet/img/jtwc/jtwc.rss';

function fetch() {
  return axios.get(base_url).then(res => {
    let $ = cheerio.load(res.data, {xmlMode: true});
    return $('item').map((_, item) => {
      let $$ = cheerio.load($(item).find('description').text());

      return $$('ul').map((_, ul) => {
        let links = $$(ul).find('a')
          .map((_, a) => $$(a).attr('href'))
          .filter((_, link) => /^(?!ab)\w+.txt$/.test(path.basename(link)));
        return links[0];
      }).get();
    }).get();
  })
  .then(links => Promise.all(links.map(parse)))
  .then(objs => {
    return objs.reduce((obj, o) => {
      let key = Object.keys(o)[0];
      obj[key] = o[key];
      return obj;
    }, {});
  });
}

function parse(fileUrl) {
  let fileName = path.basename(fileUrl);
  let name = fileName.match(/\w+/)[0].replace('web', '');

  return axios.get(fileUrl).then((res) => {
    let data = res.data;

    let tc_info = data.match(/\d{6}Z/g).reduce((obj, el) => {
      const lat_reg = /\d+\.\d+[NS]/;
      const lon_reg = /\d+\.\d+[EW]/;
      const speed_reg = /\d+\ KT/;

      let dat = data.slice(data.indexOf(el));

      if (!lat_reg.test(dat)) return (obj);

      const lat = dat.match(lat_reg)[0];
      const lon = dat.match(lon_reg)[0];

      let max_sust_wind = dat.slice(dat.indexOf('MAX SUSTAINED WINDS')).match(speed_reg);
      if (!max_sust_wind) return (obj);
      max_sust_wind = max_sust_wind[0];

      let wind_gust = dat.slice(dat.indexOf('GUST')).match(speed_reg);
      wind_gust = wind_gust[0];

      let wind_radii = dat.split('RADIUS').
        slice(1, 4).reduce((obj, el) => {
          let quad = el.match(/\d+\ NM\ \w+\ \w+/g);
          el = el.match(speed_reg)[0];
          obj[el] = quad;
          return (obj);
        }, {});

      obj[el] = {
        lat, lon, max_sust_wind, wind_gust, wind_radii
      };
      return (obj);

    }, {});

    return {
      [name]: tc_info
    }

  });
}

exports.fetch = fetch;
