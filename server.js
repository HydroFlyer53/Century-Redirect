const express = require('express');
const { chromium } = require('playwright');
const app = express();
const PORT = process.env.PORT || 3000;

const TARGET_URL = 'https://store.centuryresources.com/shop/shopping.aspx'; 
const TARGET_DOMAIN = '://store.centuryresources.com';

app.get('/', async (req, res) => {
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        
        // 2. Create an isolated browser context
        const context = await browser.newContext();

        // 3. Inject the ASP.NET_SessionId cookie directly into the target domain context
        await context.addCookies([{
            name: 'ASP.NET_SessionId',
            value: 'rcihb320ev5wohgx2dfqrakn',
            domain: TARGET_DOMAIN,
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'Lax'
        }]);

        // 4. Open a tab and navigate to the pre-loaded setup page
        const page = await context.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

        // [OPTIONAL] Add automated clicks/typing here if needed:
        // await page.fill('#first-name-input', 'John');
        // await page.click('#submit-btn');

        // 5. Grab the live HTML structural snapshot to show your user
        const content = await page.content();
        
        // Clean up the server resource
        await browser.close();

        // Hand the fully working page over to the user
        res.send(content);

    } catch (error) {
        console.error('Automation failed:', error);
        if (browser) await browser.close();
        res.status(500).send('Could not generate automated cloud session.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
