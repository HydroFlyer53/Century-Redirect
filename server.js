const express = require('express');
const { chromium } = require('playwright');
const app = express();
const PORT = process.env.PORT || 3000;

// Update these to match the exact target fundraiser domain
const TARGET_URL = 'https://store.centuryresources.com/shop/shopping.aspx'; 
const TARGET_DOMAIN = 'store.centuryresources.com';

app.get('/', async (req, res) => {
    let browser;
    try {
        // 1. Launch a headless browser instance on the server
        browser = await chromium.launch({ headless: true });
        
        // 2. Create an isolated browser context (Variable declared ONCE here)
        const browserContext = await browser.newContext();

        // 3. Inject the session cookie into the target domain context
        await browserContext.addCookies([{
            name: 'ASP.NET_SessionId',
            value: 'rcihb320ev5wohgx2dfqrakn',
            domain: TARGET_DOMAIN,
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'Lax'
        }]);

        // 4. Open a new tab and navigate to the layout page
        const page = await browserContext.newPage();
        await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

        // 5. Grab the live page HTML to output to your user
        const content = await page.content();
        
        // Clean up the server process
        await browser.close();

        // Hand the pre-configured layout directly to the user
        res.send(content);

    } catch (error) {
        console.error('Automation engine error:', error);
        if (browser) await browser.close();
        res.status(500).send('Could not generate automated cloud session.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
