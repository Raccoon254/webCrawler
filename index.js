const puppeteer = require("puppeteer");
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "crawler",
});

const baseUrl = "https://clarivate.com/blog/?wpv_post_search=web+of+science&wpv_aux_current_post_id=219851&wpv_aux_parent_post_id=219851&wpv_view_count=44195&wpv_paged=2";

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Increase the navigation timeout to 60 seconds (60000 ms)
    page.setDefaultNavigationTimeout(60000000);

    await page.goto(baseUrl);

    let currentPage = 1;
    let totalCards = 0;
    let hasNextPage = true;

    while (hasNextPage) {
        const url = `${baseUrl}&wpv_paged=${currentPage}`;
        await page.goto(url);

        const cards = await page.$$('.grid-column.col-12.col-md-6.col-lg-4 .card');

        for (const card of cards) {
            const title = await card.$eval('h2', (element) => element.textContent.trim());
            const link = await card.$eval('a', (element) => element.href);
            const image = await card.$eval('img', (element) => element.src);

            console.log('Title:', title);
            console.log('Link:', link);
            console.log('Image:', image);

            // Store the data in the database using the MySQL connection
            // Example query: connection.query('INSERT INTO your_table (title, link, image) VALUES (?, ?, ?)', [title, link, image]);

            totalCards++;

            console.log('\x1b[33m%s\x1b[0m', "Reached " + totalCards + " cards!");
            if (totalCards === 500) {
                console.log('Halfway there! Total cards:', totalCards);
            } else if (totalCards === 1000) {
                console.log('\x1b[33m%s\x1b[0m', 'Congratulations! Reached 1000 cards!');
                break;
            }
        }

        const nextPageLink = await page.$('.wpv-filter-next-link');
        hasNextPage = nextPageLink !== null;

        if (hasNextPage) {
            currentPage++;
        }
    }

    // Log the URL of the current page
    console.log("Current page URL:", page.url());




    const loadData = async () => {
        try {
        } catch (error) {
            console.error(
                "Error while trying to log latest app data:",
                error.message
            );
        }
    };

    setInterval(loadData, 4000);

    // Wait for 24 hours (86400000 ms)
    await new Promise((resolve) => setTimeout(resolve, 86400000));

    // Add a termination notification
    console.log("Process terminated successfully after 24 hrs.");

    // Close the browser
    await browser.close();
})();
