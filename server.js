const express = require('express');
const { chromium } = require('playwright');
const crypto = require('node:crypto');

const app = express();
const port = Number(process.env.PORT || 3000);
const targetUrl = process.env.TARGET_URL || 'https://store.centuryresources.com/shop/index.asp';
const groupId = process.env.GROUP_ID || '55901';
const firstName = process.env.STUDENT_FIRST_NAME;
const lastName = process.env.STUDENT_LAST_NAME;
const sessionTimeoutMs = Number(process.env.SESSION_TIMEOUT_MS || 30 * 60 * 1000);
const sessions = new Map();

app.use(express.json());
app.use(express.static('public'));

function publicSession(session) {
  return {
    id: session.id,
    status: session.status,
    message: session.message,
    url: session.pageUrl || null,
    viewUrl: process.env.BROWSER_VIEW_URL_TEMPLATE
      ? process.env.BROWSER_VIEW_URL_TEMPLATE.replace('{sessionId}', session.id)
      : null
  };
}

async function runCenturyFlow(session) {
  let browser;
  try {
    session.status = 'starting';
    session.message = 'Opening the Century store...';

    const launchOptions = { headless: process.env.HEADLESS !== 'false' };
    if (process.env.BROWSER_WS_ENDPOINT) {
      browser = await chromium.connectOverCDP(process.env.BROWSER_WS_ENDPOINT);
    } else {
      browser = await chromium.launch(launchOptions);
    }

    session.browser = browser;
    session.context = await browser.newContext();
    session.page = await session.context.newPage();
    await session.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 });

    session.status = 'selecting-group';
    session.message = `Selecting group ${groupId}...`;
    await session.page.locator('#txtGroupID').fill(groupId);

    const school = session.page.locator(`a.school[schoolordernum="${groupId}"]`);
    await school.waitFor({ state: 'visible', timeout: 30_000 });
    await school.click();

    session.status = 'entering-student';
    session.message = 'Entering the student information...';
    await session.page.locator('#student_namef').waitFor({ state: 'visible', timeout: 30_000 });
    await session.page.locator('#student_namef').fill(firstName);
    await session.page.locator('#student_namel').fill(lastName);

    session.status = 'opening-shop';
    session.message = 'Opening the shopping session...';
    await Promise.all([
      session.page.waitForURL('**/shop/shopping.aspx**', { timeout: 45_000 }),
      session.page.locator('#btnWStudent').click()
    ]);

    session.pageUrl = session.page.url();
    session.status = 'ready';
    session.message = 'The shopping session is ready.';
  } catch (error) {
    session.status = 'error';
    session.message = error instanceof Error ? error.message : String(error);
    if (session.page) {
      session.pageUrl = session.page.url();
    }
  }
}

app.post('/api/sessions', async (request, response) => {
  if (!firstName || !lastName) {
    return response.status(500).json({
      error: 'Missing STUDENT_FIRST_NAME or STUDENT_LAST_NAME environment variable.'
    });
  }

  const session = {
    id: crypto.randomUUID(),
    status: 'queued',
    message: 'Preparing your private browser session...',
    createdAt: Date.now(),
    page: null,
    context: null,
    browser: null,
    pageUrl: null
  };
  sessions.set(session.id, session);
  void runCenturyFlow(session);

  return response.status(202).json(publicSession(session));
});

app.get('/api/sessions/:id', (request, response) => {
  const session = sessions.get(request.params.id);
  if (!session) {
    return response.status(404).json({ error: 'Session not found.' });
  }
  return response.json(publicSession(session));
});

app.listen(port, () => {
  console.log(`Century session launcher listening on port ${port}`);
});

setInterval(async () => {
  const cutoff = Date.now() - sessionTimeoutMs;
  for (const [id, session] of sessions) {
    if (session.createdAt < cutoff) {
      await session.context?.close().catch(() => {});
      await session.browser?.close().catch(() => {});
      sessions.delete(id);
    }
  }
}, 60_000).unref();
