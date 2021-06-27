const functions = require('firebase-functions');
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const runtimeOpts = {
    memory:'512MB',
    timeoutSeconds: 15
}
exports.getDaisoJAN = functions
    .region('asia-northeast1')
    .runWith(runtimeOpts)
    .https.onRequest((req, resp) => {
  JAN = req.query['JAN'];
  (async () => {
    const re = await fetch('https://www.daisonet.com/product/'+String(JAN));
    const html = await re.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const text = document.querySelector('meta[name="og:title"]').content;
    resp.set('Access-Control-Allow-Origin', '*');
    resp.status(200).send(text);
    resp.end();
  })();

});