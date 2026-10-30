# Nota · 让五线谱自己弹起来

Nota 五线谱演奏台的官方网站：功能介绍、界面预览、Windows / Android 下载、完整教程与常见问题。

- **官网（GitHub Pages）**：<https://nihaowshixiaow.github.io/nota/>
- **计划绑定域名**：<http://notafun.com/>（域名购买后配置 DNS 即可）
- **下载**：[GitHub Releases](https://github.com/nihaowshixiaow/nota/releases/tag/v1.22.0)

## 网站内容

- 首页：产品介绍 / 下载入口
- 界面预览：曲库、识别导入、手机音符键盘
- 下载：Windows 便携版、Windows zip、Android APK、源码包（SHA-256 校验）
- 7 篇教程：快速开始、识谱导入、编辑乐谱、播放设置、参考图对照、导出备份、识谱优化
- 常见问题 FAQ
- 移动端响应式 + 纯静态，无后端、无外部 CDN 依赖

## 本地预览

```bash
python -m http.server 8080
# 打开 http://127.0.0.1:8080
```

或 Windows 下双击 `serve.ps1`（如果存在）。

## 部署

本站为纯静态站点，已配置为 **GitHub Pages**（`main` 分支根目录）。

- Pages 地址：<https://nihaowshixiaow.github.io/nota/>
- 下载文件放在 [Releases](https://github.com/nihaowshixiaow/nota/releases)，避免超过 Pages 单文件 100 MB 限制
- 域名绑定：购买 `notafun.com` 后，在 DNS 添加 GitHub Pages 的 A 记录（185.199.108.153 / 109.153 / 110.153 / 111.153）和 `www` CNAME 到 `nihaowshixiaow.github.io`，再在仓库 Settings → Pages 填自定义域名即可（详见 `DEPLOY.md`）

## 版本

当前网站对应 Nota **v1.22.0**（2026-10-30）。

## 说明

- 安装包没有代码签名，Windows SmartScreen / Android 未知来源提示已在教程与 FAQ 中说明
- Nota 与任何第三方制谱软件无关联
- 开源致谢：VexFlow（MIT）、Salamander Grand Piano（CC-BY 3.0）、pdfjs（Apache-2.0）、React / Vite / Electron / Capacitor
