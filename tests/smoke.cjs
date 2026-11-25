/* Run with Playwright and Chromium. Set SITE_URL to test a published copy. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = process.env.SITE_URL || 'http://127.0.0.1:8765/';
  try {
    const response = await page.goto(base, { waitUntil:'networkidle' });
    assert.equal(response.status(), 200);
    assert.match(await page.title(), /趣解清明上河圖/);
    assert.equal(await page.locator('.stop').count(), 6);
    assert.equal(await page.locator('#detail-title').textContent(), '城郊初見');
    const left = () => page.locator('#viewport').evaluate(el => el.scrollLeft);
    assert.ok(await left() > 2000, 'starts on the right');
    assert.ok(await page.locator('#prev').isDisabled());
    await page.locator('.stop').nth(3).click();
    assert.equal(await page.locator('#detail-title').textContent(), '虹橋過船');
    const bridgeLeft = await left();
    assert.equal(await page.locator('.pin').nth(3).getAttribute('aria-pressed'), 'true');
    await page.locator('.pin').nth(3).click();
    await page.locator('#zoom-in').click();
    assert.equal(await page.locator('#zoom-label').textContent(),'125%');
    await page.locator('#zoom-reset').click();
    assert.ok(Math.abs(await left() - bridgeLeft) < 3, 'reset re-centers the selected scene');
    await page.locator('#viewport').focus();
    await page.keyboard.press('ArrowLeft');
    assert.ok(await left() < bridgeLeft, 'arrow pans left');
    await page.locator('#pan').focus();
    await page.keyboard.press('Home');
    assert.equal(await left(),0);
    await page.keyboard.press('End');
    assert.ok(await left() > bridgeLeft);
    await page.locator('.stop').nth(3).click();
    const box = await page.locator('#viewport').boundingBox();
    await page.mouse.move(box.x+120,box.y+80);
    await page.mouse.down();
    await page.mouse.move(box.x+270,box.y+80,{steps:10});
    await page.mouse.up();
    assert.ok(await left() < bridgeLeft-100,'pointer drag pans the scroll');
    await page.locator('[data-scene=market]').click();
    assert.equal(await page.locator('#detail-title').textContent(), '市井百業');
    assert.ok(await page.locator('#next').isDisabled());
    await page.locator('#prev').click();
    assert.equal(await page.locator('#detail-title').textContent(), '穿過城門');
    await page.locator('#q-start').click();
    for(const [index,answer] of [1,1,2].entries()){
      await page.locator('.answer').nth(answer).click();
      assert.ok(await page.locator('#q-feedback').isVisible());
      if(index === 1) assert.match(await page.locator('#q-feedback').textContent(), /正確答案/);
      await page.locator('#q-next').click();
    }
    assert.match(await page.locator('#q-title').textContent(), /2 \/ 3/);
    await page.getByRole('button',{name:/再試一次/}).click();
    assert.match(await page.locator('#q-progress').textContent(), /1 \/ 3/);
    await page.locator('#top').scrollIntoViewIfNeeded();
    await page.locator('.viewport').scrollIntoViewIfNeeded();
    await page.locator('.footer').scrollIntoViewIfNeeded();
    await page.waitForLoadState('networkidle');
    for (const picture of await page.locator('img').all()) {
      const [ok, src] = await picture.evaluate(img=>[img.complete && img.naturalWidth > 0,img.src]);
      assert.ok(ok,'image loaded: '+src);
    }

    const mobile = await browser.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:1,hasTouch:true,reducedMotion:'reduce'});
    mobile.on('pageerror', error=>errors.push(error.message));
    await mobile.goto(base,{waitUntil:'networkidle'});
    assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),'no horizontal overflow outside viewer');
    await mobile.locator('.stop').nth(2).tap();
    assert.equal(await mobile.locator('#detail-title').textContent(),'汴河船隊');
    const cdp = await mobile.context().newCDPSession(mobile);
    const touch = await mobile.locator('#viewport').boundingBox();
    const initial = await mobile.locator('#viewport').evaluate(el=>el.scrollLeft);
    const y = Math.round(touch.y + 35);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:80,y}]});
    for (let x=100; x<=280; x+=20) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.ok(await mobile.locator('#viewport').evaluate(el=>el.scrollLeft) < initial,'touch drag pans the scroll');
    assert.deepEqual(errors,[]);
    console.log('PASS desktop/mobile layout, images, station navigation, mouse/touch/keyboard pan, zoom, quiz and reset');
  } finally {
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
