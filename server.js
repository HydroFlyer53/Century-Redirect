const express = require('express');
const { chromium } = require('playwright-core'); // Uses the local binary Render downloaded
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

app.get(/.*/, async (req, res) => {
    let browser;
    try {
        // 1. Launch the local Chromium engine built into your Render server instance
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Mandatory flags for cloud server performance
        });
        
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        const page = await context.newPage();

        // 2. Load the target web view directly under native contexts
        const requestedPath = req.url;
        const currentTargetUrl = requestedPath === '/' ? TARGET_URL : `https://targetwebsite.com${requestedPath}`;
        
        await page.goto(currentTargetUrl, { waitUntil: 'networkidle' });

        // --- STEP 1: Enter Group ID ---
        const groupIdField = await page.$('#txtGroupID'); // Fixed syntax: backslash removed
        if (groupIdField) {
            await page.fill('#txtGroupID', DEFAULT_GROUP_ID);
        }

        // --- STEP 2: Click the dynamic school link ---
        // Waits up to 5 seconds for the link to show up after the ID entry
        try {
            await page.waitForSelector('a.school[schoolordernum="55901"]', { timeout: 5000 });
            await page.click('a.school[schoolordernum="55901"]');
        } catch (e) {
            console.log("School link didn't appear or wasn't required.");
        }

        // --- STEP 3: Populate Student Names ---
        const firstNameField = await page.$('#student_namef'); // Fixed syntax: backslash removed
        if (firstNameField) {
            await page.fill('#student_namef', DEFAULT_FIRST_NAME);
            await page.fill('#student_namel', DEFAULT_LAST_NAME);
            
            // Click the final validation button
            await page.click('#btnWStudent');
            await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => null);
        }

        // 3. Capture the post-automation structural content
        let htmlContent = await page.content();
        
        // Clean up the browser instance resources safely
        await browser.close();

        // 4. Inject a quick path-rewriter script so the user's browser loads styles/images natively
        htmlContent = htmlContent.replace(/(src|href)="\/(?!\/)/g, `$1="https://targetwebsite.com/`);

        // Send the fully set up, styled page over to the device screen
        res.send(htmlContent);

    } catch (error) {
        console.error('Local Cloud Automation Error:', error);
        if (browser) await browser.close();
        res.status(500).send('Unable to initialize automated session on server hardware.');
    }
});

app.listen(PORT, () => {
    console.log(`Local Server Automation Pipeline active on port ${PORT}`);
});
