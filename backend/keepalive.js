// Simple keep-alive pinger for the PropertyZap backend on Render
// NOTE: This must run from some always-on environment (your local machine, a tiny cron job service, etc.).

import fetch from 'node-fetch';

const BACKEND_URL = 'https://propertyzap-em0g.onrender.com/';

async function pingBackend() {
  try {
    const res = await fetch(BACKEND_URL, { timeout: 10000 });
    if (res.ok) {
      console.log('✅ Keep-alive ping successful at', new Date().toLocaleTimeString());
    } else {
      console.log('❌ Keep-alive ping failed with status', res.status, 'at', new Date().toLocaleTimeString());
    }
  } catch (err) {
    console.log('❌ Keep-alive ping error:', err.message);
  }
}

// Ping immediately when script starts
pingBackend();

// Then ping every 10 minutes
setInterval(pingBackend, 10 * 60 * 1000);

console.log('Keep-alive script started. Will ping backend every 10 minutes:', BACKEND_URL);


