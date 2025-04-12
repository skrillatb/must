import must from './scraper/must.js';
import fs from 'node:fs';

const FOLDER_NAME = "must_exports";
const MUST_USERNAME = "must_username";

if (!fs.existsSync(FOLDER_NAME)) {
    fs.mkdirSync(FOLDER_NAME);
}

const SCRAPES = [
    {
        name: "want",
        url: `https://mustapp.com/@${MUST_USERNAME}/want`,
        file: "want.json"
    },
    {
        name: "watched",
        url: `https://mustapp.com/@${MUST_USERNAME}/watched`,
        file: "watched.json"
    },
    {
        name: "shows",
        url: `https://mustapp.com/@${MUST_USERNAME}/shows`,
        file: "shows.json"
    },
];


async function main() {
    for (const item of SCRAPES) {
        try {
            console.log(`Scraping ${item.name}...`);
            const data = await must(item.url);
            console.log(`${item.name} scraped`);

            const filePath = `${FOLDER_NAME}/${item.file}`;

            if (fs.existsSync(filePath)) {
                const existingData = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
                const existingIds = new Set(existingData.map(item => item.id));
                const newData = data.filter(item => !existingIds.has(item.id));

                await fs.promises.writeFile(
                    filePath,
                    JSON.stringify([...existingData, ...newData], null, 2)
                );
            } else {
                await fs.promises.writeFile(
                    filePath,
                    JSON.stringify(data, null, 2)
                );
            }

            console.log(`${item.name} saved ! ${filePath} ${data.length} items`);
        } catch (error) {
            console.error(`Error processing ${item.name}:`, error);
        }
    }
}


const run = async () => main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

run();
