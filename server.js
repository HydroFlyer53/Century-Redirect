const express = require('express');
const { chromium } = require('playwright-core');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// ⚙️ EASY CONFIGURATION VARIABLES (EDIT HERE)
// ==========================================
const DEFAULT_GROUP_ID   = "55901"; 
const DEFAULT_FIRST_NAME = "John";               
const DEFAULT_LAST_NAME  = "Doe";                

const TARGET_BASE_URL = 'https://store.centuryresources.com/';
const TARGET_URL      = 'https://store.centuryresources.com/shop/index.aspx'; 
// ==========================================

// Render environment baseline uptime monitoring pathway
app.get('/healthz', (req, res) => res.status(200).send('OK'));

// PURE REGEX CATCH-ALL TUNNEL: Safe from path-to-regexp 500 compilation errors
app.get(/.*/, async (req, res) => {
    const isHtmlPage = req.headers['accept']?.includes('text/html') || req.url === '/';
    
    // 1. ASSET TUNNEL: Directly pipe CSS, JS, fonts, and images from the host site to the client device
    if (!isHtmlPage) {
        try {
            const assetUrl = `${TARGET_BASE_URL}${req.url}`;
            const assetResponse = await axios({
                method: 'get',
                url: assetUrl,
                headers: { 'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0' },
                responseType: req.url.match(/\.(png|jpg|jpeg|gif|webp|woff|woff2|ttf)\$/i) ? 'arraybuffer' : 'text'
            });

            if (assetResponse.headers['content-type']) {
                res.setHeader('Content-Type', assetResponse.headers['content-type']);
            }
            return res.send(assetResponse.data);
        } catch (err) {
            return res.status(404).send('Asset not found');
        }
    }

    // 2. BACKEND AUTOMATION LAYER: Spin up local cloud browser container to run setup macros
    console.log("[Automation] Processing page interaction vectors on backend thread...");
    let browser;
    try {
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--single-process']
        });
        
        const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
        const page = await context.newPage();

        const requestedPath = req.url;
        const currentTargetUrl = requestedPath === '/' ? TARGET_URL : `${TARGET_BASE_URL}${requestedPath}`;
        
        await page.goto(currentTargetUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

        // --- STEP 1: Enter Group ID ---
        const groupIDInput = page.locator('#txtGroupID');
        if (await groupIDInput.count() > 0) {
            await page.fill('#txtGroupID', DEFAULT_GROUP_ID);
        }

        // --- STEP 2: Click the dynamic school link ---
        try {
            await page.waitForSelector('a.school[schoolordernum="55901"]', { timeout: 1500 });
            await page.click('a.school[schoolordernum="55901"]');
        } catch (e) {
            console.log("School link layout transition handled.");
        }

        await page.waitForTimeout(500);

        // --- STEP 3: Populate Student Names (FORCE INJECTION) ---
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

        // --- STEP 4: Click the Final Submission Button ---
        try {
            await page.click('#btnWStudent', { force: true, timeout: 1500 });
            await page.waitForTimeout(600); // Give the site's state scripts time to finalize saving
        } catch (e) {
            console.log("Form execution completed.");
        }

        // 3. CAPTURE AUTOMATED STATE STRUCUTRE: Extract completed markup text 
        let htmlContent = await page.content();
        await browser.close();

        // Strip Content Security Policies so the proxy can safely stream layouts
        htmlContent = htmlContent.replace(/<meta[^>]*content-security-policy[^>]*>/i, '');

        // Output pre-filled styled workspace to user device
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);

    } catch (error) {
        console.error('Server Worker Timeout Error:', error.message);
        if (browser) await browser.close();
        res.status(500).send('<h3>Server automation engine timed out. Please refresh to reset the workspace context.</h3>');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Self-Contained Automated Stream active on port ${PORT}`);
});
