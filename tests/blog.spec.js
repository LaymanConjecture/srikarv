import {test,expect} from '@playwright/test';
test('each blog title opens its own reloadable post page and returns',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/blog.html');
 const links=await page.locator('.blog-posts a').evaluateAll(els=>els.map(e=>({title:e.textContent,href:e.getAttribute('href')})));
 expect(links.length).toBeGreaterThanOrEqual(8);
 expect(links.some(link=>link.href==='posts/inside-an-h100.html')).toBe(true);
 for(const {title,href} of links){
  await page.getByRole('link',{name:title,exact:true}).click();
  await expect(page).toHaveURL(new RegExp(href+'$'));
  await expect(page.getByRole('heading',{level:1,name:title,exact:true})).toBeVisible();
  await page.reload();await expect(page.locator('.aphorisms, .post-body, .post-status, .essay').first()).toBeVisible();
  await page.getByRole('link',{name:'Back to Blog'}).click();
 }
 await page.setViewportSize({width:320,height:844});
 await page.getByRole('link',{name:links[0].title}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.getByRole('button',{name:'Night mode'}).click();
 await expect(page.getByRole('button',{name:'Night mode'})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('footer')).toHaveCount(0);expect(errors).toEqual([]);
});
