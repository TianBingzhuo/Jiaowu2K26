import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const docsSiteRoot = path.resolve(scriptDir, '..');
const projectRoot = path.resolve(docsSiteRoot, '..');
const generatedRoot = path.join(docsSiteRoot, 'src', 'content', 'docs');
const publicRoot = path.join(docsSiteRoot, 'public');
const runtimeRoot = path.join(docsSiteRoot, '.runtime');

const canonicalEntries = [
  'README.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'CHANGELOG.md',
  'brainstorm',
  'product',
  'modules',
  'engineering',
  'gates',
  'reference',
  'docs',
  'archive',
];

const copiedAssetExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.pdf', '.txt',
  '.json', '.yaml', '.yml', '.csv', '.rtf', '.docx',
]);

const sectionTitles = new Map([
  ['brainstorm', '问题、体验与游戏机制洞察'],
  ['product', '产品定义与边界'],
  ['modules', 'F-001～F-014 功能模块'],
  ['engineering', '架构、技术栈与设计系统'],
  ['gates', '赛事交付与质量门禁'],
  ['reference', '研究、资源与环境'],
  ['docs', '协作说明与历史审核'],
]);

function assertChild(parent, child, label) {
  const relative = path.relative(parent, child);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} 不在允许目录内：${child}`);
  }
}

function normalizeRelative(value) {
  return value.split(path.sep).join('/');
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function stripInlineMarkdown(value) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function splitFrontmatter(source) {
  const normalized = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  if (lines[0]?.trim() !== '---') {
    return { frontmatter: [], bodyLines: lines };
  }

  const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (end < 0) {
    return { frontmatter: [], bodyLines: lines };
  }

  return {
    frontmatter: lines.slice(1, end),
    bodyLines: lines.slice(end + 1),
  };
}

function findAndRemoveFirstHeading(bodyLines, fallbackTitle) {
  let fenced = false;
  for (let index = 0; index < bodyLines.length; index += 1) {
    const line = bodyLines[index];
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (!fenced) {
      const match = line.match(/^#\s+(.+?)\s*#*\s*$/);
      if (match) {
        const title = stripInlineMarkdown(match[1]) || fallbackTitle;
        const next = [...bodyLines];
        next.splice(index, 1);
        if (next[index] === '') next.splice(index, 1);
        return { title, bodyLines: next };
      }
    }
  }
  return { title: fallbackTitle, bodyLines };
}

function hasFrontmatterKey(lines, key) {
  return lines.some((line) => new RegExp(`^${key}\\s*:`).test(line));
}

function rewritePortalLinks(markdown) {
  return markdown.replace(
    /(\]\([^\n)]*?)PROJECT-MANIFEST\.json/g,
    '$1PROJECT-MANIFEST.md',
  );
}

function transformMarkdown(source, sourceRelative, options = {}) {
  const { frontmatter, bodyLines } = splitFrontmatter(source);
  const fallbackTitle = path.basename(sourceRelative, path.extname(sourceRelative));
  const heading = findAndRemoveFirstHeading(bodyLines, fallbackTitle);
  const metadata = [...frontmatter];

  if (!hasFrontmatterKey(metadata, 'title')) {
    metadata.unshift(`title: ${yamlString(heading.title)}`);
  }
  if (!hasFrontmatterKey(metadata, 'editUrl')) metadata.push('editUrl: false');
  if (options.archive && !hasFrontmatterKey(metadata, 'pagefind')) {
    metadata.push('pagefind: false');
  }

  let body = rewritePortalLinks(heading.bodyLines.join('\n')).trimStart();
  if (options.archive) {
    body = body.replace(
      /^(```|~~~)(TYPESCRIPT)\s*$/gm,
      (_, fence, language) => `${fence}${language.toLowerCase()}`,
    );
  }
  if (sourceRelative === 'README.md') {
    body = [
      '<section class="j2k26-command-deck not-content" aria-label="Jiaowu2K26 项目指挥台">',
      '  <div class="j2k26-command-topline"><span>LOCAL PLAYBOOK // CONTROL ROOM</span><span class="j2k26-live-dot">SOURCE SYNCED</span></div>',
      '  <div class="j2k26-command-copy">',
      '    <p class="j2k26-kicker">ADVENTUREX 2026 · ORIGINAL CAREER UNIVERSE</p>',
      '    <h1><span>UNIVERSITY</span><strong>CAREER OS</strong></h1>',
      '    <p class="j2k26-deck-lead">把学习、选课、成长、校园生活与协作，组织成可解释、可回放、由学生掌舵的大学生涯。</p>',
      '  </div>',
      '  <div class="j2k26-command-grid">',
      '    <a href="/project-manifest/"><span>01 // PLAY CALL</span><strong>查看当前任务</strong><small>阶段、Gate、Owner 与可认领工作</small></a>',
      '    <a href="/docs/project-structure/"><span>02 // ROSTER</span><strong>匹配我的位置</strong><small>角色入口、仓库地图与文件归属</small></a>',
      '    <a href="/modules/"><span>03 // SYSTEM MAP</span><strong>展开功能阵容</strong><small>F-001 → F-014 模块规格与状态</small></a>',
      '  </div>',
      '</section>',
      '',
      '> **本地 PLAYBOOK：** 本页面来自项目规范源，浏览站只负责导航、全文搜索和阅读，不产生第二套产品事实。',
      '>',
      '> 新同学请先看 [5 分钟配置与一键阅读](docs/GETTING-STARTED.md)；想知道当前能做什么，请看 [任务路由器](AGENTS.md)。',
      '',
      body,
    ].join('\n');
  }

  return `---\n${metadata.join('\n')}\n---\n\n${body.trimEnd()}\n`;
}

async function walkFiles(root) {
  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) stack.push(fullPath);
      if (entry.isFile()) files.push(fullPath);
    }
  }
  return files.sort((left, right) => left.localeCompare(right, 'zh-CN'));
}

async function collectCanonicalFiles() {
  const files = [];
  for (const relative of canonicalEntries) {
    const source = path.join(projectRoot, relative);
    const stat = await fs.stat(source);
    if (stat.isFile()) files.push(source);
    if (stat.isDirectory()) files.push(...await walkFiles(source));
  }
  return files;
}

function generatedRelativeFor(sourceRelative) {
  if (sourceRelative === 'README.md') return 'index.md';
  return sourceRelative;
}

async function writeModuleIndexes() {
  const modulesRoot = path.join(generatedRoot, 'modules');
  const moduleDirectories = await fs.readdir(modulesRoot, { withFileTypes: true });
  for (const entry of moduleDirectories) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(modulesRoot, entry.name);
    const indexPath = path.join(directory, 'index.md');
    try {
      await fs.access(indexPath);
      continue;
    } catch {
      // Generated below.
    }
    const files = (await fs.readdir(directory))
      .filter((name) => name.toLowerCase().endsWith('.md'))
      .sort((left, right) => {
        const order = ['SPEC.md', 'STATUS.md', 'PROMPT.md'];
        return order.indexOf(left) - order.indexOf(right);
      });
    const links = files.map((name) => {
      const labels = { 'SPEC.md': '功能规格', 'STATUS.md': '状态与阻塞', 'PROMPT.md': 'AI 协作提示' };
      return `- [${labels[name] ?? name}](${name})`;
    });
    const markdown = [
      '---',
      `title: ${yamlString(entry.name)}`,
      'editUrl: false',
      '---',
      '',
      `本页是模块 **${entry.name}** 的浏览入口。规范事实仍由本目录下的规格、状态与协作提示共同维护。`,
      '',
      ...links,
      '',
    ].join('\n');
    await fs.writeFile(indexPath, markdown, 'utf8');
  }
}

async function writeSectionIndexes() {
  for (const [directoryName, title] of sectionTitles) {
    const directory = path.join(generatedRoot, directoryName);
    const indexPath = path.join(directory, 'index.md');
    try {
      await fs.access(indexPath);
      continue;
    } catch {
      // Generated below.
    }
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const linkableEntries = [];
    for (const entry of entries) {
      if (entry.name === 'index.md' || entry.name === 'assets') continue;
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        linkableEntries.push(entry);
        continue;
      }
      if (entry.isDirectory()) {
        try {
          await fs.access(path.join(directory, entry.name, 'index.md'));
          linkableEntries.push(entry);
        } catch {
          // Asset-only directories (for example screenshot evidence) are not pages.
        }
      }
    }
    const links = linkableEntries
      .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
      .map((entry) => {
        const target = entry.isDirectory() ? `${entry.name}/` : entry.name;
        return `- [${entry.name.replace(/\.md$/i, '')}](${target})`;
      });
    const markdown = [
      '---',
      `title: ${yamlString(title)}`,
      'editUrl: false',
      '---',
      '',
      `这是 **${title}** 的统一导航页。`,
      '',
      ...links,
      '',
    ].join('\n');
    await fs.writeFile(indexPath, markdown, 'utf8');
  }
}

function tableCell(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.join('、').replaceAll('|', '\\|');
  if (typeof value === 'object') return '`复杂对象，见原始 JSON`';
  return String(value).replaceAll('|', '\\|').replaceAll('\n', '<br>');
}

async function writeManifestPage() {
  const sourcePath = path.join(projectRoot, 'PROJECT-MANIFEST.json');
  const raw = await fs.readFile(sourcePath, 'utf8');
  const manifest = JSON.parse(raw);
  const status = manifest.status ?? {};
  const current = manifest.current_work ?? {};
  const tasks = Array.isArray(current.ready_tasks) ? current.ready_tasks : [];
  const technology = manifest.technology_proposal ?? {};

  const lines = [
    '---',
    'title: "当前状态与可认领任务"',
    'description: "由 PROJECT-MANIFEST.json 构建生成的人类可读视图。"',
    'editUrl: false',
    '---',
    '',
    '> **机器事实源仍是项目根目录 `PROJECT-MANIFEST.json`。** 本页每次启动或构建文档站时自动重新生成，不要直接编辑。',
    '',
    `[下载原始 Manifest](/PROJECT-MANIFEST.json)`,
    '',
    '## 当前阶段',
    '',
    '| 字段 | 当前值 |',
    '|---|---|',
    `| phase | ${tableCell(status.phase)} |`,
    `| implementation | ${tableCell(status.implementation)} |`,
    `| current gate | ${tableCell(current.current_gate)} |`,
    `| active slice | ${tableCell(current.active_slice)} |`,
    `| WIP limit | ${tableCell(current.wip_limit)} |`,
    `| sync status | ${tableCell(current.sync_status)} |`,
    `| last synced | ${tableCell(current.last_synced_at)} |`,
    '',
    '## 当前任务队列',
    '',
    '| ID | 优先级 | 状态 | 任务 | 角色 | Owner |',
    '|---|---:|---|---|---|---|',
    ...tasks
      .sort((left, right) => (left.priority ?? 999) - (right.priority ?? 999) || String(left.id).localeCompare(String(right.id)))
      .map((task) => `| ${tableCell(task.id)} | ${tableCell(task.priority)} | ${tableCell(task.status)} | ${tableCell(task.title)} | ${tableCell(task.roles)} | ${tableCell(task.owner)} |`),
    '',
    '## 技术提案（尚须按 Gate 审核）',
    '',
    '| 领域 | 候选 |',
    '|---|---|',
    `| 审批状态 | ${tableCell(technology.approval_status)} |`,
    `| 前端 | ${tableCell(technology.frontend_candidate)} |`,
    `| 后端 | ${tableCell(technology.backend_candidate)} |`,
    `| 数据库 | ${tableCell(technology.database_candidate)} |`,
    `| AI | ${tableCell(technology.ai_candidate)} |`,
    `| 部署 | ${tableCell(technology.deployment_candidate)} |`,
    '',
    '## 禁止夸大的内容',
    '',
    ...(manifest.do_not_claim ?? []).map((item) => `- ${item}`),
    '',
  ];

  await fs.writeFile(path.join(generatedRoot, 'PROJECT-MANIFEST.md'), lines.join('\n'), 'utf8');
  await fs.copyFile(sourcePath, path.join(publicRoot, 'PROJECT-MANIFEST.json'));
}

async function main() {
  assertChild(docsSiteRoot, generatedRoot, '生成内容目录');
  assertChild(docsSiteRoot, runtimeRoot, '运行状态目录');

  await fs.rm(generatedRoot, { recursive: true, force: true });
  await fs.mkdir(generatedRoot, { recursive: true });
  await fs.mkdir(publicRoot, { recursive: true });
  await fs.mkdir(runtimeRoot, { recursive: true });

  const canonicalFiles = await collectCanonicalFiles();
  let markdownCount = 0;
  let archiveMarkdownCount = 0;
  let assetCount = 0;
  const sourceHash = createHash('sha256');

  for (const sourcePath of canonicalFiles) {
    const sourceRelative = normalizeRelative(path.relative(projectRoot, sourcePath));
    const extension = path.extname(sourcePath).toLowerCase();
    if (extension !== '.md' && !copiedAssetExtensions.has(extension)) continue;
    if (/^\.env(?:\.|$)/i.test(path.basename(sourcePath))) continue;

    const targetRelative = generatedRelativeFor(sourceRelative);
    const targetPath = path.join(generatedRoot, ...targetRelative.split('/'));
    assertChild(generatedRoot, targetPath, '生成文件');
    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    const bytes = await fs.readFile(sourcePath);
    sourceHash.update(sourceRelative).update('\0').update(bytes);
    if (extension === '.md') {
      const isArchive = sourceRelative.startsWith('archive/');
      const transformed = transformMarkdown(bytes.toString('utf8'), sourceRelative, { archive: isArchive });
      await fs.writeFile(targetPath, transformed, 'utf8');
      markdownCount += 1;
      if (isArchive) archiveMarkdownCount += 1;
    } else {
      await fs.copyFile(sourcePath, targetPath);
      assetCount += 1;
    }
  }

  await writeModuleIndexes();
  await writeSectionIndexes();
  await writeManifestPage();

  const report = {
    schema_version: '1.0',
    generated_at: new Date().toISOString(),
    canonical_root: process.env.J2K26_CANONICAL_ROOT ?? normalizeRelative(projectRoot),
    markdown_sources: markdownCount,
    active_markdown_sources: markdownCount - archiveMarkdownCount,
    archive_markdown_sources: archiveMarkdownCount,
    copied_assets: assetCount,
    canonical_source_sha256: sourceHash.digest('hex').toUpperCase(),
    note: 'Generated files are a read-only browser projection. Edit canonical project files, never src/content/docs.',
  };
  await fs.writeFile(path.join(runtimeRoot, 'sync-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`Synced ${markdownCount} Markdown sources (${archiveMarkdownCount} archived, hidden from search) and ${assetCount} assets.`);
}

await main();
