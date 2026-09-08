import { test, expect } from '@playwright/test';

test('quiet map has eight labels, only Srikar, and correct direct links', async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.getByRole('button',{name:'Learn More'}).click();
  await expect(page.locator('#landmarks > *')).toHaveCount(8);
  await expect(page.locator('.map-character')).toHaveCount(1);
  await expect(page.locator('#traveller,.map-topbar,.map-help,.map-zoom,footer')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Night mode'})).toBeHidden();
  for(const [name,href] of [['Eternis','https://eternis.ai'],['Freysa','https://freysa.ai']]){
    await expect(page.getByRole('link',{name,exact:true})).toHaveAttribute('href',href);
    await page.route(href+'/**',route=>route.fulfill({body:'Destination'}));
    await page.getByRole('link',{name,exact:true}).click();await expect(page).toHaveURL(href+'/');await page.goBack();
  }
  await page.getByRole('button',{name:'Blog',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('No essays are published here yet.');
  await page.keyboard.press('Escape');await expect(page.getByRole('region',{name:'World map',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Chat with Srikar’s agent'}).click();
  await expect(page.getByRole('dialog')).toContainText('The agent is not connected yet.');
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await expect(page.getByRole('button',{name:'Chat with Srikar’s agent'})).toBeFocused();
  expect(errors).toEqual([]);
});

test('About Me opens a parchment page and returns directly to the island',async({page},info)=>{
  await page.goto('/#world');await page.getByRole('link',{name:'About Me'}).click();
  await expect(page).toHaveURL(/about.html$/);
  await expect(page.getByRole('heading',{name:'About Me'})).toBeVisible();
  await expect(page.locator('.parchment')).toHaveCSS('animation-name','unfold');
  await page.screenshot({path:`qa/${info.project.name}-parchment.png`,animations:'disabled'});
  await page.getByRole('link',{name:'Back to the island'}).click();
  await expect(page.getByRole('region',{name:'World map',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Investments',exact:true}).click();
  await expect(page).toHaveURL(/investments.html$/);
  await expect(page.getByRole('heading',{name:'Investments'})).toBeVisible();
  await expect(page.getByText('The company list is coming soon.')).toBeVisible();
  await expect(page.locator('footer')).toHaveCount(0);
});

test('reading pages handle small screens, themes, and reduced motion',async({page},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const path of ['/about.html','/investments.html']){
    await page.goto(path);
    for(const width of [1440,768,390,320]){
      await page.setViewportSize({width,height:844});
      await expect(page.getByRole('heading',{level:1})).toBeInViewport();
      await expect(page.getByRole('button',{name:'Night mode'})).toBeInViewport();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    }
    await page.getByRole('button',{name:'Night mode'}).click();
    await expect(page.getByRole('button',{name:'Night mode'})).toHaveAttribute('aria-pressed','true');
    await page.screenshot({path:`qa/${info.project.name}-${path.slice(1)}-mobile-night.png`});
    await page.getByRole('button',{name:'Night mode'}).click();
  }
  await page.goto('/about.html');await expect(page.locator('.parchment')).toHaveCSS('animation-name','none');
});

test('mobile labels remain reachable by scrolling and keyboard without map controls',async({page},info)=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/#world');
  await page.locator('.map-art-day').evaluate(im=>im.decode());
  await page.screenshot({path:`qa/${info.project.name}-quiet-map-mobile.png`});
  for(const label of await page.locator('#landmarks > *').all()){
    await label.focus();await expect(label).toBeInViewport();
  }
  await page.getByRole('link',{name:'About Me'}).click();await expect(page).toHaveURL(/about.html$/);
  await page.goBack();await expect(page.getByRole('region',{name:'World map',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Learn More'})).toBeVisible();
});
