import { test, expect } from '@playwright/test';

const places=['About Me','Blog','Science of Progress','Eternis','Autonomous Government','Freysa','Holons','Investments'];

async function enter(page) {
  await page.goto('/');
  await page.getByRole('button',{name:'Learn More'}).click();
  await expect(page.getByRole('region',{name:'World map',exact:true})).toBeVisible();
  await page.locator('.map-art-day').evaluate(image=>image.decode());
}

test('all eight destinations open, visits persist, and Blog has no published posts',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await enter(page);
  for(const name of places) {
    await page.getByRole('button',{name:`Visit ${name}`,exact:true}).click();
    const dialog=page.getByRole('dialog');
    await expect(dialog.getByRole('heading',{name,exact:true})).toBeVisible();
    if(name==='Blog')await expect(dialog.getByText('No essays are published here yet.')).toBeVisible();
    await dialog.getByRole('button',{name:'Back to map'}).click();
  }
  await expect(page.locator('#discovery-count')).toHaveText('8 of 8 places visited');
  await page.reload();
  await page.getByRole('button',{name:'Learn More'}).click();
  await expect(page.locator('#discovery-count')).toHaveText('8 of 8 places visited');
});

test('walking reaches a place; Escape dismisses its panel before leaving the world',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await enter(page);
  await page.getByRole('button',{name:'Visit About Me',exact:true}).click();
  await expect(page.locator('#traveller')).toHaveClass(/is-walking/);
  await expect(page.getByRole('dialog')).toBeVisible({timeout:10000});
  await expect(page.locator('#traveller')).not.toHaveClass(/is-walking/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('region',{name:'World map',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Learn More'})).toBeFocused();
  expect(errors).toEqual([]);
});

test('guide and residents offer working choices without publishing essays',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await enter(page);
  await page.getByRole('button',{name:'Meet your guide'}).click();
  await expect(page.getByRole('dialog').getByRole('heading',{name:'Where shall we go?'})).toBeVisible();
  await page.getByRole('button',{name:'Show me the projects'}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Freysa',exact:false}).click();
  await expect(page.getByRole('dialog').getByRole('heading',{name:'Freysa',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Back to map'}).click();
  await page.getByRole('button',{name:'Talk to The archivist',exact:true}).click();
  await expect(page.getByRole('dialog').getByRole('heading',{name:'The library is quiet.'})).toBeVisible();
  await page.getByRole('dialog').getByRole('button',{name:'Visit Blog',exact:false}).click();
  await expect(page.getByRole('dialog').getByText('No essays are published here yet.')).toBeVisible();
  await page.getByRole('button',{name:'Back to map'}).click();
  await page.getByRole('button',{name:'Talk to The keeper',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Visit Holons',exact:false}).click();
  await expect(page.getByRole('dialog').getByRole('heading',{name:'Holons',exact:true})).toBeVisible();
});

test('keyboard movement, zoom and returning during a walk preserve a usable map',async({page})=>{
  await enter(page);
  const before=await page.locator('#traveller').getAttribute('style');
  await page.keyboard.press('ArrowRight');
  expect(await page.locator('#traveller').getAttribute('style')).not.toBe(before);
  const oldWidth=await page.locator('#map-stage').evaluate(el=>el.clientWidth);
  await page.getByRole('button',{name:'Zoom in'}).click();
  expect(await page.locator('#map-stage').evaluate(el=>el.clientWidth)).toBeGreaterThan(oldWidth);
  await page.getByRole('button',{name:'Find my traveller'}).click();
  await expect(page.getByRole('region',{name:'World map',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Visit Eternis',exact:true}).click();
  await page.getByRole('button',{name:'Back to the clearing'}).click();
  await expect(page.getByRole('button',{name:'Learn More'})).toBeVisible();
  await page.getByRole('button',{name:'Learn More'}).click();
  await expect(page.locator('#traveller')).not.toHaveClass(/is-walking/);
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('mobile Places navigation, both appearances and readable destination panels',async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
  await enter(page);
  await page.screenshot({path:`qa/${testInfo.project.name}-map-mobile-day.png`});
  await page.getByRole('button',{name:'Places',exact:true}).click();
  await page.getByRole('navigation',{name:'Places to visit'}).getByRole('button',{name:/Autonomous Government/}).click();
  await expect(page.getByRole('dialog').getByRole('heading',{name:'Autonomous Government'})).toBeVisible();
  await page.screenshot({path:`qa/${testInfo.project.name}-map-mobile-dialog.png`});
  await page.getByRole('button',{name:'Back to map'}).click();
  await page.getByRole('button',{name:'Night mode'}).click();
  await expect(page.locator('.map-art-night')).toHaveCSS('opacity','1');
  await expect(page.getByRole('button',{name:'Owl sounds'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Owl sounds'}).click();
  await expect(page.getByRole('button',{name:'Owl sounds'})).toHaveAttribute('aria-pressed','false');
  await page.screenshot({path:`qa/${testInfo.project.name}-map-mobile-night.png`});
  for(const size of [{width:320,height:568},{width:768,height:1024},{width:1440,height:900}]) {
    await page.setViewportSize(size);
    await expect(page.getByRole('button',{name:'Places',exact:true})).toBeInViewport();
    await expect(page.getByRole('button',{name:'Zoom in'})).toBeInViewport();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  }
  await page.screenshot({path:`qa/${testInfo.project.name}-map-desktop-night.png`});
});

test('map remains usable when local storage is blocked',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{
    Storage.prototype.getItem=()=>{throw new Error('blocked');};
    Storage.prototype.setItem=()=>{throw new Error('blocked');};
  });
  await enter(page);
  await page.getByRole('button',{name:'Visit Blog',exact:true}).click();
  await expect(page.getByRole('dialog').getByRole('heading',{name:'Blog',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Back to map'}).click();
  await expect(page.locator('#discovery-count')).toHaveText('1 of 8 places visited');
});
