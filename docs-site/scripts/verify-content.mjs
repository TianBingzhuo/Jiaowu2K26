import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const docsSiteRoot = path.resolve(scriptDir, '..');
const generatedRoot = path.join(docsSiteRoot, 'src', 'content', 'docs');

async function walkMarkdown(root) {
  const results = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) results.push(fullPath);
    }
  }
  return results.sort();
}

function withoutFencedCode(markdown) {
  const lines = markdown.split(/\r?\n/);
  let fenced = false;
  return lines.map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return '';
    }
    return fenced ? '' : line;
  }).join('\n');
}

function linkTarget(raw) {
  const trimmed = raw.trim();
  if (trimmed.startsWith('<')) {
    const end = trimmed.indexOf('>');
    return end >= 0 ? trimmed.slice(1, end) : trimmed;
  }
  return trimmed.split(/\s+["']/)[0];
}

async function exists(target) {
  try {
    const stat = await fs.stat(target);
    if (stat.isDirectory()) {
      await fs.access(path.join(target, 'index.md'));
    }
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const markdownFiles = await walkMarkdown(generatedRoot);
  const failures = [];
  let checkedLinks = 0;

  for (const markdownPath of markdownFiles) {
    const relativeMarkdownPath = path.relative(generatedRoot, markdownPath);
    const isArchive = relativeMarkdownPath === 'archive' || relativeMarkdownPath.startsWith(`archive${path.sep}`);
    const source = await fs.readFile(markdownPath, 'utf8');
    if (!/^---\r?\n[\s\S]*?^title\s*:/m.test(source)) {
      failures.push(`${path.relative(generatedRoot, markdownPath)}: missing title frontmatter`);
    }

    if (isArchive) continue;

    const scan = withoutFencedCode(source);
    const matches = scan.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g);
    for (const match of matches) {
      let target = linkTarget(match[1]);
      if (!target || target.startsWith('#')) continue;
      if (/^(?:https?:|mailto:|tel:|data:|[A-Za-z]:[\\/])/.test(target)) continue;
      if (target.startsWith('/')) continue;

      target = target.split('#')[0].split('?')[0];
      if (!target) continue;
      try { target = decodeURIComponent(target); } catch { /* Keep original. */ }
      const resolved = path.resolve(path.dirname(markdownPath), target);
      checkedLinks += 1;
      if (!await exists(resolved)) {
        failures.push(`${path.relative(generatedRoot, markdownPath)} -> ${target}`);
      }
    }
  }

  const report = `Verified ${markdownFiles.length} generated pages and ${checkedLinks} local links.`;
  if (failures.length > 0) {
    console.error(report);
    console.error('Broken or invalid content:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }
  console.log(report);
}

await main();
