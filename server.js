const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// ⚙️ EASY CONFIGURATION VARIABLES (EDIT HERE)
// ==========================================
const DEFAULT_GROUP_ID   = "55901"; // Put your Group ID here
const DEFAULT_FIRST_NAME = "John";               // Put your default First Name here
const DEFAULT_LAST_NAME  = "Doe";                // Put your default Last Name here

// Target Base Domain Info
const TARGET_BASE_URL = 'https://store.centuryresources.com/shop/index.aspx'; 
// ==========================================

app.get(/.*/, (req, res) => {
    const requestedPath = req.url;
    const fullTargetDestination = `${TARGET_BASE_URL}${requestedPath}`;

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Fundraiser Automation Gateway</title>
            <style>
                body { margin: 0; padding: 0; font-family: sans-serif; background: #f4f6f9; display: flex; justify-content: center; align-items: center; height: 100vh; color: #333; text-align: center; }
                .card { background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 450px; width: 90%; }
                .btn { display: inline-block; background: #007bff; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; margin-top: 20px; cursor: pointer; border: none; font-size: 16px; box-shadow: 0 4px 10px rgba(0,123,255,0.25); transition: background 0.2s; }
                .btn:hover { background: #0056b3; }
                p { color: #666; font-size: 15px; line-height: 1.5; }
            </style>
        </head>
        <body>

            <div class="card">
                <h2>Automated Registration Portal</h2>
                <p>Click the button below to launch your session. The system will open the platform natively and automatically configure your registration variables.</p>
                <button class="btn" id="launch-btn">Launch & Setup Session</button>
            </div>

            <script>
                document.getElementById('launch-btn').addEventListener('click', () => {
                    // 1. Open the target website natively in its own window tab
                    const targetWindow = window.open("${fullTargetDestination}", "_blank");

                    if (!targetWindow) {
                        alert("Pop-up blocked! Please allow pop-ups for this website to let the automation framework run.");
                        return;
                    }

                    // 2. Pass configuration values down safely
                    const GROUP_ID_VALUE = "${DEFAULT_GROUP_ID}";
                    const FIRST_NAME_VALUE = "${DEFAULT_FIRST_NAME}";
                    const LAST_NAME_VALUE = "${DEFAULT_LAST_NAME}";

                    let step1Done = false;
                    let step2Done = false;
                    let step3Done = false;

                    // 3. Monitor and interact with the opened target tab context
                    const macroPoller = setInterval(() => {
                        try {
                            const doc = targetWindow.document;
                            
                            if (doc && doc.readyState === 'complete') {
                                
                                // --- STEP 1: Enter Group ID ---
                                if (!step1Done) {
                                    const groupIdField = doc.getElementById('txtGroupID');
                                    if (groupIdField) {
                                        groupIdField.value = GROUP_ID_VALUE;
                                        groupIdField.dispatchEvent(new Event('input', { bubbles: true }));
                                        groupIdField.dispatchEvent(new Event('change', { bubbles: true }));
                                        step1Done = true;
                                        console.log("Step 1 Complete: Group ID injected.");
                                    }
                                }

                                // --- STEP 2: Click the dynamic school link ---
                                if (step1Done && !step2Done) {
                                    const schoolLink = doc.querySelector('a.school[schoolordernum="55901"]');
                                    if (schoolLink) {
                                        schoolLink.click();
                                        step2Done = true;
                                        console.log("Step 2 Complete: Dynamic link clicked.");
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
                                        
                                        console.log("Step 3 Complete: Input texts injected.");

                                        setTimeout(() => {
                                            submitButton.click();
                                            step3Done = true;
                                            console.log("Macro Execution Cycle Complete.");
                                            clearInterval(macroPoller);
                                        }, 500);
                                    }
                                }
                            }
                        } catch (e) {
                            // Clear polling if user manually closes the popup window context
                            if (targetWindow.closed) {
                                clearInterval(macroPoller);
                            }
                        }
                    }, 300); // Check layout status shifts every 300 milliseconds
                });
            </script>
        </body>
        </html>
    `);
});

app.get('/', (req, res) => {
    res.redirect('/home');
});

app.listen(PORT, () => {
    console.log(`Automation Gateway online on port ${PORT}`);
});
