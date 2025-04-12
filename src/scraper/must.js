import puppeteer from "puppeteer";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const must = async (url) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    let previousCount = 0;
    let triesWithoutNewItems = 0;
    const maxTries = 10;

    while (triesWithoutNewItems < maxTries) {
        const itemCount = await page.evaluate(() => {
            return document.querySelectorAll(".profile__list_content .poster.js_item").length;
        });

        if (itemCount > previousCount) {
            previousCount = itemCount;
            triesWithoutNewItems = 0; 
        } else {
            triesWithoutNewItems++;
        }

        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });

        await wait(1000);
    }

    const watched = await page.evaluate(() => {
        const items = document.querySelectorAll(".profile__list_content .poster.js_item");
        const results = [];

        for (const el of items) {
            const title = el.querySelector(".poster__title")?.textContent?.trim() || null;

            const bgStyle = el.querySelector(".poster__art")?.getAttribute("style") || "";
            const imageMatch = bgStyle.match(/url\(["']?(.*?)["']?\)/);
            const image = imageMatch ? imageMatch[1] : null;

            const trailer = el.querySelector(".poster__trailer")?.getAttribute("data-trailer") || null;

            if (title) {
                results.push({ title, image, trailer });
            }
        }

        return results;
    });

    await browser.close();
    return watched;
};

export default must; 