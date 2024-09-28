const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true, // Ensure it's running in headless mode
    protocolTimeout: 60000 // Increase the timeout to 60 seconds (60000 ms)
  });

  const page = await browser.newPage();
  const searchTerm = process.argv[2] || 'lasagna';
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}&tbm=isch`;

  await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 0 }); // Ensure no timeout on the page load

  const imgSrc = await page.evaluate(() => {
    const firstImg = document.querySelector('img');
    return firstImg ? firstImg.src : null;
  });

  if (imgSrc) {
    console.log(`First image URL: ${imgSrc}`);
  } else {
    console.log('No image found.');
  }

  await browser.close();
})();

