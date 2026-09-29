const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Update these to match the exact target fundraiser path
const TARGET_URL = 'https://store.centuryresources.com/shop/shopping.aspx'; 
const TARGET_BASE_DOMAIN = 'store.centuryresources.com';

// Handle all traffic passing through the root or sub-directories
app.get('*', async (req, res) => {
    try {
        // Construct the full destination URL depending on what asset the browser is requesting
        const requestedPath = req.url;
        const currentTargetUrl = requestedPath === '/' ? TARGET_URL : `${TARGET_BASE_DOMAIN}${requestedPath}`;

        // 2. Fetch the data directly from the target server on the backend
        // We manually attach your custom cookie to every single request passing through
        const response = await axios({
            method: 'get',
            url: currentTargetUrl,
            headers: {
                'Cookie': 'ASP.NET_SessionId=rcihb320ev5wohgx2dfqrakn',
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0'
            },
            responseType: req.url.match(/\.(png|jpg|jpeg|gif|webp|woff|woff2|ttf|pdf)\$/i) ? 'arraybuffer' : 'text'
        });

        // 3. Set the correct headers so CSS parses as CSS, images as images, etc.
        if (response.headers['content-type']) {
            res.setHeader('Content-Type', response.headers['content-type']);
        }

        let data = response.data;

        // 4. Clean fix for layout assets: Rewrite any relative forward-slash paths 
        // to force them to use the target's absolute path domain instead of your domain
        if (typeof data === 'string') {
            data = data.replace(/(src|href)="\/(?!\/)/g, `$1="${TARGET_BASE_DOMAIN}/`);
        }

        // Send the complete, working site straight to the user
        res.send(data);

    } catch (error) {
        console.error('Traffic Proxy Error:', error.message);
        res.status(500).send('Unable to tunnel the session safely.');
    }
});

app.listen(PORT, () => {
    console.log(`Live session mirror active on port ${PORT}`);
});
