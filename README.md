# Toolbox

<p align="center">
  <strong>工具导航 · 一站收纳</strong><br>
  代替浏览器收藏夹的个人工具导航站
</p>

<p align="center">
  <img src="https://img.shields.io/badge/%E5%B9%B3%E5%8F%B0-HTML%20%2B%20CSS%20%2B%20JS-f7df1e?style=flat-square" alt="HTML + CSS + JS">
  <img src="https://img.shields.io/badge/%E9%83%A8%E7%BD%B2-Cloudflare%20Pages-f38020?style=flat-square" alt="Cloudflare Pages">
</p>

## 项目简介

Toolbox 是一个静态网页工具导航站，用于集中管理和快速访问常用在线工具。通过分类整理图片素材、图像处理、文件处理、音视频处理和常用工作区等站点，替浏览器收藏夹分担压力。

项目部署在 [toolbox.krelinnbios.com](https://toolbox.krelinnbios.com/)，纯前端实现，无需后端服务。

## 功能概览

**分类浏览：** 按工具类型分类展示，包括图片素材、图像处理、文件处理、音视频处理和常用工作区。

**即时搜索：** 输入关键词实时筛选站点名称和描述，快速定位目标工具。

**标签筛选：** 点击分类标签只显示该类别站点，再次点击恢复全部显示。

**统计反馈：** 实时显示当前显示的站点数量，搜索无结果时提示换词。

**响应式设计：** 适配桌面和移动端，提供一致的浏览体验。

## 使用方式

访问 [toolbox.krelinnbios.com](https://toolbox.krelinnbios.com/) 直接使用。

- 浏览分类查看所有工具
- 使用搜索框输入关键词快速筛选
- 点击分类标签按类别筛选
- 点击站点名称直接跳转

## 本地预览

下载项目后，用浏览器打开 `index.html` 即可本地预览。无需安装依赖或运行构建步骤。

```bash
git clone https://github.com/KrelinnBios/Toolbox.git
cd Toolbox
# 直接在浏览器中打开 index.html
```

## 添加新站点

编辑 `sites.js` 文件，在对应分类的 `items` 数组中添加站点信息：

```javascript
{
  name: "站点名称",
  url: "https://example.com/",
  desc: "站点描述"
}
```

添加后刷新页面即可看到新站点。部署到 Cloudflare Pages 后，推送到 GitHub 会自动重新部署。

## 项目结构

```
Toolbox/
├── index.html       网页主体结构
├── toolbox.css      样式文件，包含滚动条自定义样式
├── toolbox.js       搜索、筛选和渲染逻辑
├── sites.js         站点数据和分类定义
└── favicon.svg      网站图标
```

## 隐私与数据

- Toolbox 是纯静态网页，不收集用户数据
- 所有站点链接直接跳转到目标网站，不经过中间服务器
- 搜索和筛选在浏览器本地完成，不发送网络请求

## 内容边界

- 本项目为个人工具导航站，收录的站点与作者无隶属关系
- 站点描述部分来自目标网站自身描述，用于帮助用户识别工具用途
- 站点可用性和服务质量由各站点运营方负责，本项目仅提供导航链接
- 使用第三方站点时，请遵守对应站点的服务条款和使用规范

## 许可协议

本项目依据 [MIT License](./LICENSE) 发布，允许使用、修改、分发和商业使用，但须保留许可证与版权声明。

收录的第三方站点不因被本项目链接而自动纳入 MIT 许可，各站点服务和内容适用其自身条款。

## 反馈与贡献

欢迎通过 [GitHub Issue](https://github.com/KrelinnBios/Toolbox/issues) 提交问题、建议新增站点或改进导航体验。
