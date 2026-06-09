import { chromium } from 'playwright-core';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:5173/');
await page.waitForTimeout(2000);
const costBtn = await page.locator('nav button:has-text("COST")').first();
if (await costBtn.count()) await costBtn.click();
await page.waitForTimeout(500);
const foodInput = page.locator('label:has-text("Food cost") input');
await foodInput.fill('90');
await page.waitForTimeout(1000);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(500);
const results = await page.evaluate(() => {
  const sentiments = Array.from(document.querySelectorAll('[data-sentiment]')).map(el => ({
    sentiment: el.getAttribute('data-sentiment'),
    text: el.textContent.trim().slice(0, 60)
  }));
  const profitSigns = Array.from(document.querySelectorAll('[data-profit-sign]')).map(el => ({
    category: el.getAttribute('data-category'),
    sign: el.getAttribute('data-profit-sign')
  }));
  const netProfitBar = document.querySelector('[data-category="net-profit"] > div:nth-child(2) > div[style*="position: absolute"] > div');
  const barStyle = netProfitBar ? netProfitBar.getAttribute('style') : 'not found';
  const caveat = document.querySelector('[data-role="estimate-caveat"]');
  const caveatText = caveat ? caveat.textContent.trim().slice(0, 80) : 'not found';
  return { sentiments, profitSigns, barStyle, caveatText };
});
console.log(JSON.stringify(results, null, 2));
await browser.close();
