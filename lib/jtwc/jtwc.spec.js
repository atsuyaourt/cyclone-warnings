'use strict'
const sinon = require('sinon');
const expect = require('chai').expect;

const axios = require('axios');
const jtwc = require('./jtwc');

let sandbox;
beforeEach(() => sandbox = sinon.sandbox.create());
afterEach(() => sandbox.restore());

describe('JTWC module', () => {
  const data = `
    <?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
    <channel>
      <title>JTWC TROPICAL CYCLONE INFORMATION FEED</title>
      <link>https://metoc.ndbc.noaa.gov/web/guest/jtwc</link>
      <description>JTWC Tropical Cyclone Information</description>
      <pubDate>Tue, 01 Aug 2017 11:06:06 +0000</pubDate>
      <lastBuildDate>Tue, 01 Aug 2017 11:06:06 +0000</lastBuildDate>
      <generator>ContentFeeder 2.0</generator>
      <item>
        <title>Current Northwest Pacific/North Indian Ocean* Tropical Systems</title>
        <link>https://metoc.ndbc.noaa.gov/web/guest/jtwc</link>
        <description><![CDATA[<p><b>Typhoon  07W (Noru) Warning #47 </b><br>
          <b>Issued at 01/0900Z<b>
          <ul>
            <li><a href='https://metoc.ndbc.noaa.gov/ProductFeeds-portlet/img/jtwc/products/wp0717web.txt' target='newwin'>TC Warning Text </a></li>
            <li><a href='https://metoc.ndbc.noaa.gov/ProductFeeds-portlet/img/jtwc/products/wp0717.gif' target='newwin'>TC Warning Graphic</a></li>
          </ul>
          <br>
          <p><b>Tropical Depression  13W (Thirteen) Warning #02 </b><br>
          <b>Issued at 01/0900Z<b>
          <ul>
            <li><a href='https://metoc.ndbc.noaa.gov/ProductFeeds-portlet/img/jtwc/products/wp1317web.txt' target='newwin'>TC Warning Text </a></li>
            <li><a href='https://metoc.ndbc.noaa.gov/ProductFeeds-portlet/img/jtwc/products/wp1317.gif' target='newwin'>TC Warning Graphic</a></li>
            <li><a href='https://metoc.ndbc.noaa.gov/ProductFeeds-portlet/img/jtwc/products/wp1317prog.txt' target='newwin'>Prognostic Reasoning</a></li>
          </ul>
          <br>
        ]]></description>
        <author>CDO.JTWC.fct@navy.mil (JTWC CDO)</author>
        <category>Northwest Pacific/North Indian Ocean* Tropical Systems</category>
      </item>
      <item>
        <title>Current Central/Eastern Pacific Tropical Systems</title>
        <link>https://metoc.ndbc.noaa.gov/web/guest/jtwc</link>
        <description><![CDATA[<p><b>Tropical Storm  10E (Irwin) Warning #40 </b><br>
          <b>Issued at 01/1000Z<b>
          <ul>
            <li><a href='https://metoc.ndbc.noaa.gov/ProductFeeds-portlet/img/jtwc/products/ep1017web.txt' target='newwin'>TC Warning Text </a></li>
            <li><a href='https://metoc.ndbc.noaa.gov/ProductFeeds-portlet/img/jtwc/products/ep1017.tcw' target='newwin'>JMV 3.0 Data</a></li>
          </ul>
        ]]></description>
        <author>CDO.JTWC.fct@navy.mil (JTWC CDO)</author>
        <category>Central/Eastern Pacific Tropical Systems</category>
      </item>
    </rss>
    `

  describe('list', () => {
    it('should return an empty array in case of timeout', (done) => {
      const rejected = new Promise((_, r) => r());
      sandbox.stub(axios, 'get').returns(rejected);
      jtwc.list()
        .catch((res) => {expect(res).to.be.empty })
        .then(done, done);
    });

    it('should return an empty array if response data is empty', (done) => {
      const resolved = new Promise((r) => r({data: ''}));
      sandbox.stub(axios, 'get').returns(resolved);
      jtwc.list()
        .then((res) => {expect(res).to.be.empty})
        .then(done, done);
    });

    it('should return a valid object', (done) => {
      const resolved = new Promise((r) => r({ data }));
      sandbox.stub(axios, 'get').returns(resolved);
      jtwc.list()
        .then((res) => {expect(res).to.be.not.empty})
        .then(done, done);
    });
  });

  describe('get', () => {
    it('should return an empty array in case of timeout', (done) => {
      const rejected = new Promise((_, r) => r());
      sandbox.stub(axios, 'get').returns(rejected);
      jtwc.get()
        .catch((res) => {expect(res).to.be.empty })
        .then(done, done);
    });

    it('should return an empty array if response data is empty', (done) => {
      const resolved = new Promise((r) => r({data: ''}));
      sandbox.stub(axios, 'get').returns(resolved);
      jtwc.get()
        .then((res) => {expect(res).to.be.empty})
        .then(done, done);
    });

    it('should return a valid object', (done) => {
      const resolved = new Promise((r) => r({ data }));
      sandbox.stub(axios, 'get').returns(resolved);
      jtwc.get()
        .then((res) => {expect(res).to.be.not.empty})
        .then(done, done);
    });
  });
});