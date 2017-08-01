'use strict'
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * @typedef cycloneInfo
 * @type {Object}
 * @property {string} name Cyclone name
 * @property {string} category Cyclone category
 * @property {number} warn_num Warning number
 * @property {WarningLink} warn_info Warning information
 * @property {string} issued_at When the warning was issued
 */

const base_url = 'https://metoc.ndbc.noaa.gov/RSSFeeds-portlet/img/jtwc/jtwc.rss';

const wsRe = /(\w+\s+){1,2}/;
const codeRe = /\d+\w+/;
const nameRe = /\(\w+\)/;
const warnRe = /Warning\s+#\d+/;

/**
 * Shows all active cyclones
 * 
 * @returns {cycloneInfo[]}
 */
function listCyclones() {
  return axios.get(base_url).then(res => {
    let $ = cheerio.load(res.data, {xmlMode: true});
    return $('item').map((_, item) => {
      let desc = $(item).find('description').text();
      const re = new RegExp(
        wsRe.source + codeRe.source + '\\s+' + nameRe.source + '\\s+' + warnRe.source, 'g');
      let info = desc.match(re);
      if (info) {
        return info.map(cycloneHeader => {
          const code = cycloneHeader.match(codeRe)[0];
          return {[code] : getCycloneInfo(desc, cycloneHeader)};
        });
      }
    }).get().reduce((obj, o) => {
      let key = Object.keys(o)[0];
      obj[key] = o[key];
      return obj;
    }, {});
  })
  .catch((res) => {
      return Promise.reject({});
  });
};

/**
 * Gets information about a specific active cyclone
 * 
 * @param {string} tcCode The cyclone code
 * @returns {cycloneInfo} Information about the cyclone
 */
function getCyclone(tcCode) {
  if (tcCode === undefined){
    return listCyclones()
  }
  return axios.get(base_url).then(res => {
    let $ = cheerio.load(res.data, {xmlMode: true});
    return $('item').map((_, item) => {
      let desc = $(item).find('description').text();

      const re = new RegExp(
        wsRe.source + tcCode + '\\s+' + nameRe.source + '\\s+' + warnRe.source);
      let info = desc.match(re);
      if (info) {
        return getCycloneInfo(desc, info[0]);
      }
    }).get(0);
  });
};

/**
 * Extracts and parses cyclone information
 * 
 * @param {string} desc The source of the information
 * @param {string} cycloneHeader Contains most of the information about the cyclone
 * @returns {cycloneInfo} Cyclone information
 */
function getCycloneInfo(desc, cycloneHeader) {
  const code = cycloneHeader.match(codeRe)[0];
  const category = cycloneHeader.match(wsRe)[0].trim();
  const name = cycloneHeader.match(nameRe)[0].replace(/[\(\)]/g, '');
  const warn_num = cycloneHeader.match(warnRe)[0].replace(/[(Warning)#\s]/g, '');

  let txtSlice = desc.slice(desc.indexOf(cycloneHeader) + cycloneHeader.length);

  const issued_at = txtSlice.match(/\d+\/\d+Z/)[0];

  let $$ = cheerio.load(txtSlice);
  const link = $$('ul').first().map((i, ul) => {
    return $$(ul).find('a')
      .map((_, a) => $$(a).attr('href'))
      .filter((_, link) => /^(?!ab)\w+.txt$/.test(path.basename(link)))
      .get(0);
  }).get(0);
  const warn_info = new WarningLink(link);

  return { name, category, warn_num, warn_info, issued_at};
}

/**
 * Cyclone warning link
 * 
 * @class WarningLink
 */
class WarningLink {
  /**
   * Creates an instance of WarningLink.
   * @param {string} link 
   * @memberof WarningLink
   */
  constructor(link) {
    this.link = link;
  }

  /**
   * Get warning information
   * 
   * @returns 
   * @memberof WarningLink
   */
  getInfo() {
    let fileName = path.basename(this.link);
    // let name = fileName.match(/\w+/)[0].replace('web', '');

    return axios.get(this.link).then((res) => {
      let data = res.data;

      let tc_info = data.match(/\d{6}Z/g).reduce((obj, el) => {
        const lat_reg = /\d+\.\d+[NS]/;
        const lon_reg = /\d+\.\d+[EW]/;
        const speed_reg = /\d+\ KT/;

        let dat = data.slice(data.indexOf(el));

        if (!lat_reg.test(dat)) return (obj);

        /**
         * @type {string}
         */
        const lat = dat.match(lat_reg)[0];
        /**
         * @type {string}
         */
        const lon = dat.match(lon_reg)[0];

        /**
         * @type {string}
         */
        let max_sust_wind = dat.slice(dat.indexOf('MAX SUSTAINED WINDS')).match(speed_reg);
        if (!max_sust_wind) return (obj);
        max_sust_wind = max_sust_wind[0];

        /**
         * @type {string}
         */
        let wind_gust = dat.slice(dat.indexOf('GUST')).match(speed_reg);
        wind_gust = wind_gust[0];

        /**
         * @type {string[]}
         */
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

      }, []);

      return tc_info;

    });
  }
}

module.exports = {
  list: listCyclones,
  get: getCyclone
}
