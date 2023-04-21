const fs = require("fs");

const scraperObject = {
  url: "https://www.willys.se/",
  async scraper(browser, sortiment, category) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    await page.goto(`${this.url}${sortiment}`, {waitUntil: "domcontentloaded"});
    // Wait for the required DOM to be rendered
    // await page.waitForSelector(".sc-504002c3-0");
    const selectorForLoadMoreButton = 'button[data-testid="load-more-btn"]';
    let loadMoreVisible = await isElementVisible(
      page,
      selectorForLoadMoreButton
    );
    while (loadMoreVisible) {
      await page
        .click('button[id="onetrust-reject-all-handler"]')
        .catch(() => {});
      await page.click('span[data-testid="modal-close-btn"]').catch(() => {});

      await page.click(selectorForLoadMoreButton).catch(() => {});

      loadMoreVisible = await isElementVisible(page, selectorForLoadMoreButton);
    }

    let products = await page.evaluate(() => {
      const list = [];
      const items = document.querySelectorAll(
        ".sc-d29e4bca-0"
      );
      for (const item of items) {
        const name = item.querySelector(
          ".sc-d29e4bca-5"
        ).innerHTML;

        const weight = item.querySelector(
          ".sc-d29e4bca-8"
        ).innerText;

        imageUrl = item.querySelector(
          '.sc-bc8bed15-0 img[itemprop="image"]'
        );

        const price1 = item.querySelector(
          ".sc-9270b5eb-2"
        ).innerHTML;
        const price2 = item.querySelector(
          ".sc-9270b5eb-5"
        ).innerHTML;
        let price;
        if (price2 != null) {
          price = +`${price1}.${price2}`;
        } else {
          price = +price1;
        }

        const weightUnit = item.querySelector(
          ".sc-d29e4bca-8"
        ).innerHTML;

        list.push({
          name: name,
          weight: weight,
          imageUrl: imageUrl?.src ?? '',
          price: price,
          weightUnit: weightUnit,
        });
      }

      return list;
    });

    console.log(products);

    products = products.map((p) => {
      return { ...p, category: category };
    });

    fs.writeFile(
      `${sortiment.split("/").join("-")}.json`,
      JSON.stringify(products),
      "utf8",
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log(
          `The data has been scraped and saved successfully! View it at './${sortiment}.json'`
        );
      }
    );

    await page.close();
  },
};

const isElementVisible = async (page, cssSelector) => {
  let visible = true;
  await page
    .waitForSelector(cssSelector, { visible: true, timeout: 3000 })
    .catch(() => {
      visible = false;
    });
  return visible;
};

module.exports = scraperObject;
