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

const TARGET_BASE_URL = 'https://targetwebsite.com';
const TARGET_URL      = 'https://store.centuryresources.com/shop/index.aspx'; 
const TARGET_DOMAIN   = 'targetwebsite.com';
// ==========================================

app.get('/healthz', (req, res) => res.status(200).send('OK'));

app.get(/.*/, async (req, res) => {
    // If the request is for an asset (image, css, js) rather than a main page load, exit early
    if (req.url.match(/\.(png|jpg|jpeg|gif|webp|woff|woff2|ttf|css|js)\$/i)) {
        return res.status(404).send('Not Found');
    }

    console.log("[Automation Engine] Pre-populating form data to lock down session state...");
    let browser;
    
    try {
        // 1. Launch a headless browser natively on Render's server hardware
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--single-process']
        });
        
        const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
        const page = await context.newPage();

        // 2. Navigate to the start of the fundraiser setup
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });

        // --- STEP 1: Enter Group ID ---
        const groupIDInput = page.locator('#txtGroupID');
        if (await groupIDInput.count() > 0) {
            await page.fill('#txtGroupID', DEFAULT_GROUP_ID);
        }

        // --- STEP 2: Wait for and Click the dynamic school link ---
        try {
            await page.waitForSelector('a.school[schoolordernum="55901"]', { timeout: 2500 });
            await page.click('a.school[schoolordernum="55901"]');
        } catch (e) {
            console.log("School link transition skipped or element already modified.");
        }

        // Stability delay for DOM state recalculations
        await page.waitForTimeout(500);

        // --- STEP 3: Populate Student Names and Form Data ---
        // Inject values using page.evaluate to completely avoid animation visibility blocks
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
            }
        }, { firstName: DEFAULT_FIRST_NAME, lastName: DEFAULT_LAST_NAME });

        // --- STEP 4: Submit to bind data firmly to the Cookie Session ---
        try {
            await page.click('#btnWStudent', { force: true, timeout: 2000 });
            // Wait briefly for the network request to hit their database clusters
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 4000 }).catch(() => null);
        } catch (e) {
            console.log("Submit execution complete.");
        }

        // 3. EXTRACT THE FORMATTED COOKIE: Find the active cookie bound to this completed session
        const allCookies = await context.cookies();
        let activeSessionId = null;

        for (const cookie of allCookies) {
            if (cookie.name === 'ASP.NET_SessionId') {
                activeSessionId = cookie.value;
                break;
            }
        }

        // Close the background server browser resource
        await browser.close();

        if (activeSessionId) {
            console.log(`[Automation Engine] Success! Session secured: ${activeSessionId}`);
            
            // 4. HANDOFF: Assign the pre-loaded, pre-submitted session cookie directly to your user's device
            res.setHeader('Set-Cookie', [
                `ASP.NET_SessionId=${activeSessionId}; Domain=.${TARGET_DOMAIN}; Path=/; Secure; SameSite=None; Max-Age=3600`
            ]);
            
            // 5. Instantly redirect their screen to the real website
            // Because their browser now holds the active cookie, the page loads flawlessly styled
            // and positioned exactly past the registration step!
            return res.redirect(302, TARGET_URL);
        } else {
            throw new Error("Failed to capture a valid session identifier from background worker.");
        }

    } catch (error) {
        console.error('Server Pre-Population Error:', error.message);
        if (browser) await browser.close();
        // Fallback redirection safely to prevent the user seeing an empty screen
        res.redirect(302, TARGET_URL);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Self-Automating Cookie Gateway active on port ${PORT}`);
});
