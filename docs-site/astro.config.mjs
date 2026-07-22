import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'http://127.0.0.1:4321',
  integrations: [
    starlight({
      title: 'JIAOWU2K26 // PLAYBOOK',
      description: '大学生涯决策与体验层：产品、架构、模块、交付与研究的一站式事实入口。',
      favicon: '/favicon.svg',
      logo: {
        src: './src/assets/j2k26-logo.svg',
        alt: 'JIAOWU2K26',
      },
      locales: {
        root: {
          label: '简体中文',
          lang: 'zh-CN',
        },
      },
      sidebar: [
        {
          label: 'START // 先从这里开始',
          items: [
            { label: '项目总览', link: '/' },
            { label: '5 分钟配置与一键阅读', link: '/docs/getting-started/' },
            { label: '项目结构与角色导航', link: '/docs/project-structure/' },
            { label: 'AI 与队友任务路由器', link: '/agents/' },
            { label: '当前状态与可认领任务', link: '/project-manifest/' },
          ],
        },
        {
          label: 'CONTRIBUTE // 参与项目',
          collapsed: true,
          items: [
            { label: '贡献协议', link: '/contributing/' },
            { label: 'GitHub 图形化协作', link: '/engineering/github-collab/' },
            { label: '安全与负责任披露', link: '/security/' },
            { label: '项目级变更记录', link: '/changelog/' },
          ],
        },
        {
          label: 'PRODUCT // 产品定义',
          autogenerate: { directory: 'product', collapsed: false },
        },
        {
          label: 'MODULES // 功能模块',
          autogenerate: { directory: 'modules', collapsed: true },
        },
        {
          label: 'ENGINEERING // 架构与设计',
          autogenerate: { directory: 'engineering', collapsed: false },
        },
        {
          label: 'DELIVERY // 协作与门禁',
          collapsed: true,
          items: [
            { label: '质量门禁', autogenerate: { directory: 'gates', collapsed: false } },
            { label: '接手与结构说明', autogenerate: { directory: 'docs', collapsed: false } },
          ],
        },
        {
          label: 'RESEARCH // 洞察与资料',
          collapsed: true,
          items: [
            { label: '问题与机制洞察', autogenerate: { directory: 'brainstorm', collapsed: false } },
            { label: '研究与资源', autogenerate: { directory: 'reference', collapsed: true } },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
      lastUpdated: false,
      pagination: true,
      credits: true,
      pagefind: true,
      head: [
        { tag: 'meta', attrs: { name: 'robots', content: 'noindex,nofollow' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#070a10' } },
      ],
    }),
  ],
});
