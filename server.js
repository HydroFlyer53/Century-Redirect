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

// Get your free API Token from browserless.io to handle remote rendering
const BROWSERLESS_TOKEN = "2VLl5theLHlTqSD335f62ea762ba003f39ef2d2ff47b76afa"; 
// ==========================================

app.get('/', async (req, res) => {
    try {
        // 1. Connect to a remote cloud browser context that bypasses local device limitations
        const browser = await chromium.connectOverCDP(
            `wss://chrome.browserless.io?token=${BROWSERLESS_TOKEN}&--window-size=1280,720`
        );
        
        const context = await browser.newContext();
        const page = await context.newPage();

        // 2. Open the page natively (All CSS/JS formats perfectly because it runs on a real Chrome engine)
        await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

        // --- STEP 1: Enter Group ID ---
        await page.fill('#txtGroupID', DEFAULT_GROUP_ID);

        // --- STEP 2: Click the dynamic school link ---
        // Playwright automatically waits for the element to appear on the screen
        await page.click('a.school[schoolordernum="55901"]');

        // --- STEP 3: Populate Student Names and Submit Form ---
        await page.fill('#student_namef', DEFAULT_FIRST_NAME);
        await page.fill('#student_namel', DEFAULT_LAST_NAME);
        
        // Click the final save button
        await page.click('#btnWStudent');

        // 3. HANDOFF: Instead of a static text snapshot, redirect the user 
        // straight to the live, interactive browser session handle.
        // Browserless provides a built-in interactive URL for active sessions.
        const sessionUrl = `https://browserless.io{BROWSERLESS_TOKEN}`;
        
        res.redirect(sessionUrl);

    } catch (error) {
        console.error('Cloud Automation Error:', error);
        res.status(500).send('Unable to initialize automated device stream.');
    }
});

app.listen(PORT, () => {
    console.log(`Cloud Stream Hub active on port ${PORT}`);
});
