const express = require('express');
const { chromium } = require('playwright-core');
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// ⚙️ EASY CONFIGURATION VARIABLES (EDIT HERE)
// ==========================================
const DEFAULT_GROUP_ID   = "Y55901"; 
const DEFAULT_FIRST_NAME = "John";               
const DEFAULT_LAST_NAME  = "Doe";                

const TARGET_URL = 'https://store.centuryresources.com/shop/index.aspx';
// ==========================================

app.get(/.*/, async (req, res) => {
    // Keep Render connection alive
    res.setHeader('Content-Type', 'text/html');
    res.write(' '); 

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
                '--single-process'
            ]
        });
        
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        const page = await context.newPage();

        const requestedPath = req.url;
        const currentTargetUrl = requestedPath === '/' ? TARGET_URL : `https://targetwebsite.com${requestedPath}`;
        
        await page.goto(currentTargetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // --- STEP 1: Enter Group ID ---
        const groupIDInput = page.locator('#txtGroupID');
        if (await groupIDInput.count() > 0) {
            await page.fill('#txtGroupID', DEFAULT_GROUP_ID);
        }

        // --- STEP 2: Click the dynamic school link ---
        try {
            await page.waitForSelector('a.school[schoolordernum="55901"]', { timeout: 4000 });
            await page.click('a.school[schoolordernum="55901"]');
        } catch (e) {
            console.log("School link skipped or not visible.");
        }

        // Give the page layout a small stability pause (600ms) to process transitions
        await page.waitForTimeout(600);

        // --- STEP 3: Populate Student Names (FORCE INJECTION) ---
        // We use page.evaluate to inject text instantly via JavaScript.
        // This bypasses Playwright's visibility/animation blocks completely.
        await page.evaluate((config) => {
            const firstNameField = document.getElementById('student_namef');
            const lastNameField = document.getElementById('student_namel');
            
            if (firstNameField && lastNameField) {
                firstNameField.value = config.firstName;
                firstNameField.dispatchEvent(new Event('input', { bubbles: true }));
                firstNameField.dispatchEvent(new Event('change', { bubbles: true }));

                lastNameField.value = config.lastName;
                lastNameField.dispatchEvent(new Event('input', { bubbles: true }));
                lastNameField.dispatchEvent(new Event('change', { bubbles: true }));
                
                console.log("Forced text injection successful.");
            }
        }, { firstName: DEFAULT_FIRST_NAME, lastName: DEFAULT_LAST_NAME });

        // Click the final save button
        try {
            await page.click('#btnWStudent', { force: true, timeout: 3000 });
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 4000 }).catch(() => null);
        } catch (e) {
            console.log("Submit button click timed out or form auto-submitted.");
        }

        // Capture automated state structural source markup
        let htmlContent = await page.content();
        await browser.close();

        // Dynamically fix asset paths
        htmlContent = htmlContent.replace(/(src|href)="\/(?!\/)/g, `$1="https://targetwebsite.com/`);

        res.end(htmlContent);

    } catch (error) {
        console.error('Server Automation Error:', error);
        if (browser) await browser.close();
        res.end('<h3>System timed out initializing backend layout. Please refresh to try again.</h3>');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Self-Contained Server Pipeline live on port ${PORT}`);
});
