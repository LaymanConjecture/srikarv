import { mkdir, copyFile, rm, readdir } from 'node:fs/promises';

// An explicit allowlist keeps local writing out of every deployment.
await rm('dist', { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });
for (const file of ['index.html', 'style.css', 'main.js', '404.html', 'CNAME', '.nojekyll']) {
  await copyFile(file, `dist/${file}`);
}
for (const file of ['valley-day.webp', 'valley-night.webp', 'owl-flight.webp', 'owl-rest.webp', 'favicon.svg']) {
  await copyFile(`assets/${file}`, `dist/assets/${file}`);
}
console.log('Built landing page only. Unpublished writing excluded.');
