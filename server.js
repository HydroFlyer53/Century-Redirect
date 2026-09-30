const express = require('express');
const { chromium } = require('playwright-core');
const app = express();
const PORT = process.env.PORT || 3000;

// ================PreConf Dat.1========================
const DEFAULT_GROUP_ID   = "YOUR_GROUP_ID_HERE"; 
const DEFAULT_FIRST_NAME = "John";               
const DEFAULT_LAST_NAME  = "Doe";                

const TARGET_BASE_URL = 'https://store.centuryresources.com/';
const TARGET_URL      = 'https://store.centuryresources.com/shop/index.aspx'; 
const TARGET_DOMAIN   = 'store.centuryresources.com';

app.get('/healthz', (req, res) => res.status(200).send('OK'));

app.get('/api/generate-session', async (req, res) => {
    let browser;
    try {
        console.log("[Background Worker] Launching background headless shell context...");
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--single-process']
        });
        
        const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
        const page = await context.newPage();

        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });

        // --- STEP 1: Group ID ---
        const groupIDInput = page.locator('#txtGroupID');
        if (await groupIDInput.count() > 0) {
            await page.fill('#txtGroupID', DEFAULT_GROUP_ID);
        }

        // --- STEP 2: Click Link ---
        try {
            await page.waitForSelector('a.school[schoolordernum="55901"]', { timeout: 1500 });
            await page.click('a.school[schoolordernum="55901"]');
        } catch (e) {}

        await page.waitForTimeout(400);

        // --- STEP 3: Student Details ---
        await page.evaluate((config) => {
            const firstNameField = document.getElementById('student_namef');
            const lastNameField = document.getElementById('student_namel');
            if (firstNameField && lastNameField) {
                firstNameField.value = config.firstName;
                firstNameField.dispatchEvent(new Event('input', { bubbles: true }));
                lastNameField.value = config.lastName;
                lastNameField.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }, { firstName: DEFAULT_FIRST_NAME, lastName: DEFAULT_LAST_NAME });

        // --- STEP 4: Submit ---
        try {
            await page.click('#btnWStudent', { force: true, timeout: 1500 });
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 3000 }).catch(() => null);
        } catch (e) {}

        // Extract the unique session ID string
        const allCookies = await context.cookies();
        let activeSessionId = null;
        for (const cookie of allCookies) {
            if (cookie.name === 'ASP.NET_SessionId') {
                activeSessionId = cookie.value;
                break;
            }
        }

        await browser.close();

        if (activeSessionId) {
            console.log(`[Background Worker] Session secured successfully: ${activeSessionId}`);
            return res.json({ success: true, sessionId: activeSessionId });
        } else {
            return res.json({ success: false, error: 'Cookie extraction failed' });
        }

    } catch (error) {
        if (browser) await browser.close();
        console.error('[Background Worker Error]:', error.message);
        return res.json({ success: false, error: error.message });
    }
});

// 3. MAIN CATCH-ALL ROUTE: Instantly serves a styled loading screen
app.get(/.*/, (req, res) => {
    // Exclude static asset requests from triggering the automation loop
    if (req.url.match(/\.(png|jpg|jpeg|gif|webp|woff|woff2|ttf|css|js)\$/i)) {
        return res.status(404).send('Not Found');
    }

    // Instantly send an HTML page to the user's browser, preventing Render from flagging a timeout
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Setting Up Your Fundraiser Session...</title>
            <style>
                body { margin: 0; padding: 0; font-family: sans-serif; background: #f4f6f9; display: flex; justify-content: center; align-items: center; height: 100vh; color: #333; text-align: center; }
                .card { background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); max-width: 400px; width: 90%; }
                .spinner { border: 4px solid rgba(0,0,0,.08); width: 44px; height: 44px; border-radius: 50%; border-left-color: #007bff; animation: spin 1s linear infinite; margin: 0 auto 20px; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                h3 { margin: 10px 0; font-size: 20px; color: #222; }
                p { color: #666; font-size: 14px; margin-bottom: 0; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="spinner"></div>
                <h3>Configuring Registration...</h3>
                <p>Please wait while we automatically set up your session variables.</p>
            </div>

            <script>
                // Call our background API helper function instantly from the client device context
                fetch('/api/generate-session')
                    .then(res => res.json())
                    .then(data => {
                        if (data.success && data.sessionId) {
                            // Inject the freshly generated cookie onto their device browser space safely
                            document.cookie = "ASP.NET_SessionId=" + data.sessionId + "; domain=.${TARGET_DOMAIN}; path=/; max-age=3600; Secure; SameSite=None";
                            
                            // Instantly forward them to the fully loaded target landing platform path
                            window.location.href = "${TARGET_URL}";
                        } else {
                            // Safe fallback redirect if the backend scraper hits a structural glitch
                            window.location.href = "${TARGET_URL}";
                        }
                    })
                    .catch(() => {
                        window.location.href = "${TARGET_URL}";
                    });
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Self-Automating Cookie Gateway active on port ${PORT}`);
});
