const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log('Navigating to tvo...');
  await page.goto('https://thamizhan.vercel.app/tvo?embed=true&source=supro', { waitUntil: 'networkidle2' });
  
  console.log('Done waiting. Current URL:', page.url());
  
  await browser.close();
})();
