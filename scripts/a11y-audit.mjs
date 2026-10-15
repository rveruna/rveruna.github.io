// Runs axe-core (WCAG 2.0 to 2.2, A and AA rules) in a real browser against the built site, in the states
// where accessibility problems tend to hide: light and dark, phone and desktop, reduced motion, an open
// dialog and an open command palette. Fails on any violation.
// Usage: npm run a11y-audit   (builds first)
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'dist');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  const target = fs.existsSync(file) && fs.statSync(file).isFile() ? file : path.join(root, 'index.html');
  res.writeHead(200, { 'content-type': types[path.extname(target)] ?? 'application/octet-stream' });
  fs.createReadStream(target).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/`;

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const desktop = { viewport: { width: 1440, height: 900 } };
const phone = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };

/** Each scenario sets up a page state, then axe checks the whole page. */
const scenarios = [
  { name: 'desktop, light', ctx: { ...desktop, colorScheme: 'light' } },
  { name: 'desktop, dark', ctx: { ...desktop, colorScheme: 'dark' } },
  { name: 'phone, light', ctx: { ...phone, colorScheme: 'light' } },
  { name: 'phone, dark', ctx: { ...phone, colorScheme: 'dark' } },
  { name: 'desktop, reduced motion', ctx: { ...desktop, reducedMotion: 'reduce' } },
  {
    name: 'desktop, career route scrolled',
    ctx: desktop,
    setup: async (page) => {
      await page.evaluate(() => document.getElementById('journey').scrollIntoView());
      await page.mouse.wheel(0, 1400);
      await page.waitForTimeout(400);
    },
  },
  {
    name: 'desktop, case-study dialog open',
    ctx: desktop,
    setup: async (page) => {
      await page.route('https://rveruna.github.io/**', (r) => r.abort());
      await page.locator('[data-project-id="greenest-time"]').click();
      await page.waitForSelector('dialog.case[open]');
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'phone, case-study dialog open',
    ctx: phone,
    setup: async (page) => {
      await page.route('https://rveruna.github.io/**', (r) => r.abort());
      await page.locator('[data-project-id="greenest-time"]').click();
      await page.waitForSelector('dialog.case[open]');
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'desktop, code-only case study open (no demo)',
    ctx: desktop,
    setup: async (page) => {
      await page.locator('[data-project-id="claude-workflow-kit"]').click();
      await page.waitForSelector('dialog.case[open]');
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'desktop, command palette open',
    ctx: desktop,
    setup: async (page) => {
      await page.keyboard.press('Control+k');
      await page.waitForSelector('dialog.palette[open]');
      await page.keyboard.type('pro');
      await page.waitForTimeout(200);
    },
  },
  {
    name: 'desktop, dark, command palette open',
    ctx: { ...desktop, colorScheme: 'dark' },
    setup: async (page) => {
      await page.keyboard.press('Control+k');
      await page.waitForSelector('dialog.palette[open]');
      await page.waitForTimeout(200);
    },
  },
];

const browser = await chromium.launch();
let violations = 0;

for (const s of scenarios) {
  const context = await browser.newContext(s.ctx);
  const page = await context.newPage();
  await page.goto(base);
  await page.waitForSelector('h1');
  await page.waitForTimeout(500);
  await s.setup?.(page);
  // The embedded demos are other sites. axe would scan inside them, which makes this audit depend on whether a
  // third-party page has finished loading (and on its own bugs). Each demo is audited in its own repo.
  // What this site owns, the frame's accessible name, is asserted directly below.
  const results = await new AxeBuilder({ page }).exclude('iframe').withTags(TAGS).analyze();
  const frameTitles = await page
    .locator('iframe')
    .evaluateAll((fs) => fs.map((f) => f.getAttribute('title')?.trim()));
  const untitled = frameTitles.filter((t) => !t).length;
  // axe's aria-dialog-name rule only matches role="dialog", not native <dialog>, so an unnamed native dialog
  // passes axe. Found by deliberately removing a dialog's label (see "mutation check" in the README).
  const unnamedDialogs = await page.locator('dialog[open]').evaluateAll(
    (ds) =>
      ds.filter((d) => {
        const label = d.getAttribute('aria-label')?.trim();
        const by = d.getAttribute('aria-labelledby');
        const byText = by && document.getElementById(by)?.textContent?.trim();
        return !label && !byText;
      }).length,
  );
  violations += results.violations.length + untitled + unnamedDialogs;
  const failed = results.violations.length + untitled + unnamedDialogs > 0;
  console.log(`${failed ? 'FAIL' : 'PASS'}  ${s.name}`);
  for (const v of results.violations) {
    console.log(
      `   - ${v.id}: ${v.help} [${v.impact}] (${v.nodes.length} element${v.nodes.length === 1 ? '' : 's'})`,
    );
    for (const n of v.nodes.slice(0, 3)) console.log(`       ${n.target.join(' ')}`);
  }
  if (untitled) console.log(`   - frame-title: ${untitled} embedded frame(s) have no title attribute`);
  if (unnamedDialogs)
    console.log(`   - dialog-name: ${unnamedDialogs} open <dialog>(s) have no accessible name`);
  await context.close();
}

await browser.close();
server.close();
console.log(`\n${violations} violations across ${scenarios.length} scenarios`);
process.exit(violations === 0 ? 0 : 1);
