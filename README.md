# Century link session

This service creates a fresh Playwright browser context for each visitor and runs the Century Resources flow:

1. Open the store page.
2. Select group `55901`.
3. Fill the configured student first and last names.
4. Submit the form and wait for `shopping.aspx`.

The Century `ASP.NET_SessionId` remains inside that browser context. It is never sent to the frontend.

## Run locally

```powershell
$env:STUDENT_FIRST_NAME = "Example"
$env:STUDENT_LAST_NAME = "Student"
npm install
npx playwright install chromium
npm start
```

Open `http://localhost:3000`.

## Render

Render can deploy this repository using `render.yaml`. Set these environment variables in the Render dashboard:

- `STUDENT_FIRST_NAME`
- `STUDENT_LAST_NAME`
- `BROWSER_VIEW_URL_TEMPLATE` when an interactive browser provider is configured. The value may contain `{sessionId}`.

A normal Render HTTP page cannot expose a server-side Playwright context to a visitor. For the visitor to interact with the already-authenticated shopping page, connect the service to a browser-streaming provider or add a WebRTC/noVNC viewer. Until `BROWSER_VIEW_URL_TEMPLATE` is configured, the app intentionally reports that the automated session is ready but has no viewer.

Do not store target-site cookies, credentials, or session IDs in source control or URLs. Review Century Resources' terms before making the shared account publicly accessible.
