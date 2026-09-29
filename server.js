const express = require('express');
const { chromium } = require('playwright-core');
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// ⚙️ EASY CONFIGURATION VARIABLES (EDIT HERE)
// ==========================================
const DEFAULT_GROUP_ID   = "55901"; 
const DEFAULT_FIRST_NAME = "John";               
const DEFAULT_LAST_NAME  = "Doe";                

const TARGET_URL = 'https://store.centuryresources.com/shop/index.aspx';
// ==========================================

// Tell Express to process requests instantly so Render doesn't time out
app.get(/.*/, async (req, res) => {
    // Send a temporary "loading" response header instantly to keep the port open and active
    res.setHeader('Content-Type', 'text/html');
    res.write(' '); // Drops a small buffer space to force the browser to stay connected

    let browser;
    try {
        browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--no-first-run',
                '--no-zygote',
                '--single-process' // Reduces memory footprint drastically on Render's free layer
            ]
        });
        
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        const page = await context.newPage();

        const requestedPath = req.url;
        const currentTargetUrl = requestedPath === '/' ? TARGET_URL : `https://targetwebsite.com${requestedPath}`;
        
        // Use a looser wait condition so it uses less server performance
        await page.goto(currentTargetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // --- STEP 1: Enter Group ID ---
        const groupIdField = await page.$('#txtGroupID');
        if (groupIdField) {
            await page.fill('#txtGroupID', DEFAULT_GROUP_ID);
        }

        // --- STEP 2: Click the dynamic school link ---
        try {
            await page.waitForSelector('a.school[schoolordernum="55901"]', { timeout: 3000 });
            await page.click('a.school[schoolordernum="55901"]');
        } catch (e) {
            console.log("School link didn't appear or wasn't required.");
        }

        // --- STEP 3: Populate Student Names ---
        const firstNameField = await page.$('#student_namef');
        if (firstNameField) {
            await page.fill('#student_namef', DEFAULT_FIRST_NAME);
            await page.fill('#student_namel', DEFAULT_LAST_NAME);
            
            await page.click('#btnWStudent');
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null);
        }

        // 3. Grab the live code contents
        let htmlContent = await page.content();
        await browser.close();

        // 4. Map the asset directories natively
        htmlContent = htmlContent.replace(/(src|href)="\/(?!\/)/g, `$1="https://targetwebsite.com/`);

        // Close the stream connection and deliver the page to the device window
        res.end(htmlContent);

    } catch (error) {
        console.error('Server Automation Error:', error);
        if (browser) await browser.close();
        res.end('<h3>Unable to process automated pipeline on thin instance layers. Refresh the link to try again.</h3>');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Optimized Server Pipeline online listening on port ${PORT}`);
});
