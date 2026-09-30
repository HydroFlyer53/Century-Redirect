const express = require('express');
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

app.get('/healthz', (req, res) => res.status(200).send('OK'));

app.get(/.*/, (req, res) => {
    // Exclude static assets from triggering the gateway layout
    if (req.url.match(/\.(png|jpg|jpeg|gif|webp|woff|woff2|ttf|css|js)\$/i)) {
        return res.status(404).send('Not Found');
    }

    // Instantly send a clean response to the user and Render's monitors (Zero backend processing lag)
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Loading Fundraiser Environment...</title>
            <style>
                body { margin: 0; padding: 0; font-family: sans-serif; background: #ffffff; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; color: #333; text-align: center; }
                .spinner { border: 4px solid rgba(0,0,0,.08); width: 40px; height: 40px; border-radius: 50%; border-left-color: #007bff; animation: spin 1s linear infinite; margin-bottom: 20px; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                h3 { margin: 0 0 8px; font-size: 18px; }
                p { color: #666; font-size: 14px; margin: 0; }
            </style>
        </head>
        <body>

            <div class="spinner"></div>
            <h3>Preparing Automated Configuration...</h3>
            <p>Setting up your registration parameters safely.</p>

            <script>
                // 1. Build an optimized URL query string using your easy configuration variables
                const targetWithParams = "${TARGET_URL}" + 
                    "?txtGroupID=" + encodeURIComponent("${DEFAULT_GROUP_ID}") + 
                    "&student_namef=" + encodeURIComponent("${DEFAULT_FIRST_NAME}") + 
                    "&student_namel=" + encodeURIComponent("${DEFAULT_LAST_NAME}");

                // 2. Instantly pass the user to the target website natively.
                // Modern web sign-up platforms naturally read parameter variables from the URL string 
                // and use them to auto-populate form values instantly when the page loads!
                window.location.href = targetWithParams;
            </script>

        </body>
        </html>
    `);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Instant Parameter Hub active on port ${PORT}`);
});
