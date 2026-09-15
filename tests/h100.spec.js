import {test,expect} from '@playwright/test';
const url='/posts/inside-an-h100.html';
test('atlas connects all forty explanations to models, search, layers, isolation, and deep links',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
 await expect(page.locator('.part-entry')).toHaveCount(40);
 await expect(page.locator('#viewport')).toHaveClass(/model-ready/);
 const canvas=page.locator('#viewport canvas');await expect(canvas).toHaveAttribute('data-scale','package');
 const parts=await page.locator('.part-entry').evaluateAll(els=>els.map(el=>({id:el.id.slice(5),scale:el.dataset.scale,title:el.querySelector('summary').firstChild.textContent})));
 // Searching across scales must switch the model and select a modeled component.
 for(const p of parts){
  await page.locator('#part-search').fill(p.title);
  await page.locator(`#part-results button[data-part="${p.id}"]`).click();
  await expect(canvas).toHaveAttribute('data-scale',p.scale);await expect(canvas).toHaveAttribute('data-selected',p.id);
  await expect(page.locator('#selected-part h3')).toHaveText(p.title);
  const visible=(await canvas.getAttribute('data-visible-parts')).split(',');expect(visible).toContain(p.id);
 }
 await page.locator('#part-search').fill('no such component xyz');await expect(page.locator('#result-count')).toHaveText(/No matching parts/);
 await page.locator('#part-search').fill('HBM3');await page.locator('#part-results [data-part=hbm]').click();
 await page.getByRole('button',{name:'Isolate part',exact:true}).click();await expect(canvas).toHaveAttribute('data-visible-parts','hbm');
 await page.getByRole('button',{name:'Show context',exact:true}).click();
 await page.locator('.layers summary').click();await page.getByLabel('Memory',{exact:true}).uncheck();expect((await canvas.getAttribute('data-visible-parts')).split(',')).not.toContain('hbm');
 await page.getByRole('button',{name:'Show all systems',exact:true}).click();expect((await canvas.getAttribute('data-visible-parts')).split(',')).toContain('hbm');
 await page.locator('#explode').fill('100');await expect(page.locator('#explode-value')).toHaveText('100%');
 await page.getByRole('button',{name:'Reset view',exact:true}).click();await expect(page.locator('#explode')).toHaveValue('35');
 await page.getByRole('button',{name:'Rotate model left'}).click();await page.getByRole('button',{name:'Rotate model right'}).click();await page.getByRole('button',{name:'Zoom in',exact:true}).click();await page.getByRole('button',{name:'Zoom out',exact:true}).click();
 await page.getByRole('link',{name:'Full explanation'}).click();await expect(page.locator('#part-hbm')).toHaveAttribute('open','');await page.reload();await expect(page.locator('#part-hbm')).toHaveAttribute('open','');
 await expect(page.locator('#selected-part h3')).toHaveText('HBM3 memory stacks');expect(errors).toEqual([]);
});
test('roofline uses dense instruction ceilings and correct dimensions',async({page})=>{
 await page.goto(url);await page.getByRole('button',{name:'64 FLOP/B',exact:true}).click();await expect(page.locator('#roofline-result')).toHaveText('214.4 TFLOPS');await expect(page.locator('#roofline-bound')).toHaveText('HBM bandwidth ceiling');
 await page.getByRole('button',{name:'1,024 FLOP/B',exact:true}).click();await expect(page.locator('#roofline-result')).toHaveText('989 TFLOPS');
 await page.locator('#precision').selectOption('67');await expect(page.locator('#roofline-result')).toHaveText('67 TFLOPS');await expect(page.locator('#roofline-bound')).toHaveText('Compute ceiling');
 await page.getByRole('button',{name:'1 FLOP/B',exact:true}).click();await expect(page.locator('#roofline-result')).toHaveText('3.4 TFLOPS');
 await page.locator('#precision').selectOption('1979');await expect(page.locator('#roofline-balance')).toContainText('591 FLOP/byte');
});
test('layouts, themes and expanded explanations stay readable at narrow widths',async({page})=>{
 await page.goto(url);await expect(page.locator('#viewport')).toHaveClass(/model-ready/);
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});
  await page.getByRole('button',{name:'Expand all explanations'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Night mode'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.getByRole('button',{name:'Collapse all',exact:true}).click();await expect(page.locator('.part-entry[open]')).toHaveCount(0);
 await expect(page.locator('footer')).toHaveCount(0);
});
test('the complete article survives failed 3D imports and disabled JavaScript',async({page,browser})=>{
 await page.route('**/assets/h100/vendor/three.module.js',route=>route.abort());await page.goto(url);
 await expect(page.locator('#explore')).toHaveClass(/model-failed/);
 await page.locator('#part-search').fill('Tensor Memory');await page.locator('#part-results [data-part=tma]').click();await expect(page.locator('#selected-part h3')).toHaveText('Tensor Memory Accelerator');
 const context=await browser.newContext({javaScriptEnabled:false});const plain=await context.newPage();await plain.goto(new URL(url,page.url()).href);
 await expect(plain.locator('.part-entry')).toHaveCount(40);await plain.locator('#part-tensor summary').click();await expect(plain.locator('#part-tensor .part-summary')).toBeVisible();await context.close();
});
