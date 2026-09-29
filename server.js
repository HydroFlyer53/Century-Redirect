const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// ⚙️ EASY CONFIGURATION VARIABLES (EDIT HERE)
// ==========================================
const DEFAULT_GROUP_ID   = "55901"; // Change this to your target Group ID
const DEFAULT_FIRST_NAME = "John";               // Change this to your default First Name
const DEFAULT_LAST_NAME  = "Doe";                // Change this to your default Last Name

// Target Base Domain Info
const TARGET_BASE_URL = 'https://store.centuryresources.com/shop/index.aspx'; 
// ==========================================

app.get('*', (req, res) => {
    const requestedPath = req.url;
    const fullTargetDestination = `${TARGET_BASE_URL}${requestedPath}`;

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Loading Fundraiser Environment...</title>
            <style>
                body { margin: 0; padding: 0; font-family: sans-serif; background: #ffffff; overflow: hidden; }
                iframe { width: 100vw; height: 100vh; border: none; }
                #loader-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #ffffff; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 9999; transition: opacity 0.5s ease; }
                .spinner { border: 4px solid rgba(0,0,0,.1); width: 40px; height: 40px; border-radius: 50%; border-left-color: #007bff; animation: spin 1s linear infinite; margin-bottom: 20px; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </head>
        <body>

            <div id="loader-overlay">
                <div class="spinner"></div>
                <h3>Initializing Automated Registration Setup...</h3>
                <p style="color: #666; font-size: 14px;">Please wait while the system configures your session.</p>
            </div>

            <iframe id="target-frame" src="${fullTargetDestination}"></iframe>

            <script>
                const iframe = document.getElementById('target-frame');
                const overlay = document.getElementById('loader-overlay');

                const GROUP_ID_VALUE = "${DEFAULT_GROUP_ID}";
                const FIRST_NAME_VALUE = "${DEFAULT_FIRST_NAME}";
                const LAST_NAME_VALUE = "${DEFAULT_LAST_NAME}";

                let step1Done = false;
                let step2Done = false;
                let step3Done = false;

                function executeAutomationMacro(doc) {
                    // --- STEP 1: Enter Group ID ---
                    if (!step1Done) {
                        const groupIdField = doc.getElementById('txtGroupID');
                        if (groupIdField) {
                            groupIdField.value = GROUP_ID_VALUE;
                            groupIdField.dispatchEvent(new Event('input', { bubbles: true }));
                            groupIdField.dispatchEvent(new Event('change', { bubbles: true }));
                            step1Done = true;
                            console.log("Step 1: Group ID injected.");
                        }
                    }

                    // --- STEP 2: Wait for & Click the dynamic school link ---
                    if (step1Done && !step2Done) {
                        const schoolLink = doc.querySelector('a.school[schoolordernum="55901"]');
                        if (schoolLink) {
                            schoolLink.click();
                            step2Done = true;
                            console.log("Step 2: Dynamic link found and clicked.");
                        }
                    }

                    // --- STEP 3: Populate Student Names and Submit Form ---
                    if (step2Done && !step3Done) {
                        const firstNameField = doc.getElementById('student_namef');
                        const lastNameField = doc.getElementById('student_namel');
                        const submitButton = doc.getElementById('btnWStudent');

                        if (firstNameField && lastNameField && submitButton) {
                            firstNameField.value = FIRST_NAME_VALUE;
                            firstNameField.dispatchEvent(new Event('input', { bubbles: true }));
                            firstNameField.dispatchEvent(new Event('change', { bubbles: true }));

                            lastNameField.value = LAST_NAME_VALUE;
                            lastNameField.dispatchEvent(new Event('input', { bubbles: true }));
                            lastNameField.dispatchEvent(new Event('change', { bubbles: true }));
                            
                            console.log("Step 3: First and Last name injected.");

                            setTimeout(() => {
                                submitButton.click();
                                step3Done = true;
                                console.log("Final Step: Form submitted successfully.");
                                
                                overlay.style.opacity = '0';
                                setTimeout(() => overlay.style.display = 'none', 500);
                            }, 800);
                        }
                    }
                }

                iframe.addEventListener('load', () => {
                    const macroPoller = setInterval(() => {
                        try {
                            const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
                            if (frameDoc && frameDoc.readyState === 'complete') {
                                executeAutomationMacro(frameDoc);
                                
                                if (step3Done) {
                                    clearInterval(macroPoller);
                                }
                            }
                        } catch (e) {
                            clearInterval(macroPoller);
                            overlay.style.display = 'none';
                        }
                    }, 300);
                });
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Dynamic Multi-User Automation Hub active on port ${PORT}`);
});
