const pageScraperWillys = require("./pageScraperWillys");

async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;

    // Willys
    await pageScraperWillys.scraper(
      browser,
      "sortiment/kott-chark-och-fagel",
      "Grönsaker"
    );
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
