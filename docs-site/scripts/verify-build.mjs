import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const docsSiteRoot = path.resolve(scriptDir, '..');
const distRoot = path.join(docsSiteRoot, 'dist');

function assertInside(parent, child) {
  const relative = path.relative(parent, child);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`构建资产越出 dist：${child}`);
  }
}

async function mustExist(relative) {
  const target = path.join(distRoot, ...relative.split('/'));
  assertInside(distRoot, target);
  await fs.access(target);
  return target;
}

async function main() {
  const homePath = await mustExist('index.html');
  const home = await fs.readFile(homePath, 'utf8');
  const linkTags = [...home.matchAll(/<link\b[^>]*>/g)].map((match) => match[0]);
  const stylesheetHrefs = linkTags
    .filter((tag) => /\brel=["']stylesheet["']/.test(tag))
    .map((tag) => tag.match(/\bhref=["']([^"']+)["']/)?.[1])
    .filter(Boolean);

  if (stylesheetHrefs.length < 2) {
    throw new Error(`首页只引用了 ${stylesheetHrefs.length} 个样式表，疑似构建路径导致核心 CSS 丢失。`);
  }

  const cssParts = [];
  for (const href of stylesheetHrefs) {
    if (!href.startsWith('/')) continue;
    const clean = href.split(/[?#]/, 1)[0].replace(/^\/+/, '');
    const assetPath = await mustExist(clean);
    cssParts.push(await fs.readFile(assetPath, 'utf8'));
  }
  const css = cssParts.join('\n');
  const requiredMarkers = ['@layer starlight.core', '--j2k26-orange', '.j2k26-command-deck'];
  const missingMarkers = requiredMarkers.filter((marker) => !css.includes(marker));
  if (missingMarkers.length > 0) {
    throw new Error(`核心布局或游戏主题 CSS 缺失：${missingMarkers.join('、')}`);
  }
  if (!home.includes('j2k26-command-deck')) {
    throw new Error('首页 Career Control Room 未进入构建产物。');
  }

  await Promise.all([
    mustExist('docs/project-structure/index.html'),
    mustExist('project-manifest/index.html'),
    mustExist('contributing/index.html'),
    mustExist('pagefind/pagefind.js'),
    mustExist('PROJECT-MANIFEST.json'),
  ]);

  console.log(`Verified built portal: ${stylesheetHrefs.length} stylesheets, Starlight core, Career Control Room, Pagefind and key handoff pages.`);
}

await main();
