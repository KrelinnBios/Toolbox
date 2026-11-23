# Toolbox

<p align="center">
  <img src="favicon.svg" width="128" alt="Toolbox 图标">
</p>

<p align="center">
  <strong>导航 · 资源 · 工具</strong><br>
  按用途整理的资源导航与在线工具
</p>

<p align="center">
  <a href="https://toolbox.krelinnbios.com"><img src="https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E8%AE%BF%E9%97%AE-toolbox.krelinnbios.com-2f6f73?style=flat-square" alt="在线访问"></a>
  <img src="https://img.shields.io/badge/%E5%B9%B3%E5%8F%B0-%E6%B5%8F%E8%A7%88%E5%99%A8-247344?style=flat-square" alt="浏览器">
  <img src="https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF-MIT%20License-1f5f9c?style=flat-square" alt="MIT License">
</p>

## 项目简介

Toolbox 是一个静态工具箱，包含资源导航和 35 个可直接使用的在线计算工具。资源导航按用途整理为十六个分类，同一分类内按相近用途连续排列。可按分类浏览或搜索站点，点击卡片会在新标签页打开目标网站。

## 功能概览

- 在线工具：35 个计算器分为收入与定价、增长与留存、成本与规划、日常生活、时间与效率、内容创作六类，支持搜索、货币标识切换、计算场景切换和订阅开支汇总。
- 资源导航：收录站点按用途分为十六个分类，同一分类内按相近用途连续排列。
- 站点搜索：按站点名称、描述、域名或分类名称实时筛选，并显示匹配数量。
- 目录联动：资源导航和在线工具页均支持点击目录跳转到对应分类，滚动页面时目录自动高亮当前分类。
- 移动适配：窄屏下分类目录变为横向排列，站点卡片切换为单列显示。
- 搜索引擎发现：提供站点地图、爬虫规则与规范网址，覆盖首页、工具目录及 35 个计算器。
- 缺失页面：未知路径显示独立的 404 页面，以简洁的文字提示页面未找到。

## 界面预览

<p align="center">
  <img src="screenshots/PixPin_2026-09-26_01-13-30.png" width="85%" alt="Toolbox 界面预览">
</p>

## 使用方式

访问 <https://toolbox.krelinnbios.com>，可搜索站点或按分类浏览。在线计算器位于 [工具页面](https://toolbox.krelinnbios.com/tools)，支持部分计算场景切换；货币切换只改变金额标识，不进行汇率换算。

本地预览需通过 HTTP 服务打开 `index.html` 或 `tools.html`，无需安装 npm 依赖或构建。计算测试需 Node.js 24 或更高版本，运行 `node --test test/calculations.test.mjs`。

### 提交 Google 搜索

1. 部署后，确认 `https://toolbox.krelinnbios.com/sitemap.xml` 返回 XML，`https://toolbox.krelinnbios.com/robots.txt` 包含站点地图地址。
2. 在 [Google Search Console](https://search.google.com/search-console/) 添加站点并完成所有权验证；可使用网域资源，通过 DNS TXT 记录验证。
3. 在「站点地图」中提交 `https://toolbox.krelinnbios.com/sitemap.xml`。
4. 使用「网址检查」检查首页和重要工具网址，执行实时测试并请求编入索引，随后查看收录状态。

站点地图帮助发现页面，不保证收录或排名。Cloudflare Pages 会将 `/tools.html` 重定向至 `/tools`，因此站点地图和 canonical 使用不带扩展名的线上网址。计算器由 JavaScript 渲染，在 Search Console 中应检查渲染后的内容；各计算器的 canonical 保留有效的 `tool` 参数，去掉场景锚点和其他参数。新增、删除或改名工具时，同步维护 `sitemap.xml`；更换域名时，同步更新站点地图、`robots.txt` 及 HTML/JS 中的规范网址。

根目录的 `404.html` 用于 Cloudflare Pages 的缺失路径响应，避免不存在的网址回退到首页并返回 `200`。错误页使用根路径引用资源，确保多层路径下也能正常显示；它带有 `noindex`，不列入站点地图。部署后可用任意不存在的多层路径确认返回状态为 `404`，并检查错误页正常显示。普通本地静态服务器可直接预览 `404.html`，但未知路径回退和无扩展名路由取决于服务器配置。

## 项目结构

- `index.html`、`toolbox.css`、`toolbox.js`、`sites.js`：资源导航页面、样式、交互与站点数据。
- `tools.html`、`calculators.css`、`calculators.js`：在线工具目录与计算器入口。
- `calculations.js`、`calculator-views.js`、`calculator-copy.js`、`calculator-ui.js`：计算公式、场景视图、中文文案及表单与结果渲染。
- `scrollbar.js`、`favicon.svg`：移动端浮层滚动条与站点图标。
- `sitemap.xml`、`robots.txt`：搜索引擎站点地图与爬虫规则。
- `404.html`：Cloudflare Pages 的缺失页面。
- `test/`、`screenshots/`、`docs/agent/`：计算回归测试、界面截图与项目维护规范。

## 隐私与数据

- 本地处理：搜索、筛选和排序均在浏览器本地完成，输入的关键词不会发送到任何服务。
- 工具计算：所有计算在浏览器本地完成，数字和订阅名称不会上传或持久保存；刷新页面后恢复默认输入。
- 访问统计：资源导航、工具目录、全部计算器和 404 页面均接入同一 VibeCafé 产品的统计，上报页面浏览事件，点击计算场景按钮切换网址也会计数。脚本通过 localStorage 保存随机访客标识，上报数据包含统计认证标识、访客标识和事件类型，不包含页面网址、搜索词或计算输入，也不使用 Cookie；浏览器启用“请勿跟踪”或“全局隐私控制”时不会上报。当前脚本汇总产品访问量，不提供按页面网址拆分的统计。
- 跳转访问：站点卡片直接指向目标网站，不经过中间跳转页面；目标网站的数据处理由其自身隐私政策说明。
- 第三方资源：站点图标通过 Google 图标服务加载，会向该服务发送目标站点域名；页面字体通过 Google Fonts 加载。

## 内容边界

- 站点名称与描述由本项目整理，仅说明主要用途；与收录站点及其运营方无隶属关系，收录不代表推荐。
- 外部站点的可用性和服务质量由各站点运营方负责。
- 计算结果基于输入和简化假设，仅用于估算与规划，不构成财务、税务、法律或投资建议。
- “订阅服务”分类中的部分链接包含邀请码或推广参数，使用前请自行确认服务内容、价格和适用条款。

## 许可协议

本项目代码和项目自有文档依据 [MIT License](./LICENSE) 发布，允许使用、修改、分发和商业使用，但须保留许可证与版权声明。

收录的第三方站点、名称、图标、服务和内容不因被本项目链接而自动纳入 MIT License，各站点适用其自身条款和权利声明。

## 反馈与贡献

问题、站点建议和失效链接请提交至 [Issues](https://github.com/KrelinnBios/Toolbox/issues)。
