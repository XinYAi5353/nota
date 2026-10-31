# Nota 官网（下载 + 教程）

**官网地址：http://notafun.com/**

一个纯静态的 Nota 官网：白色极简风，包含功能介绍、界面预览、Windows / Android 下载、完整教程和常见问题。

## 目录结构

```
nota-site/
├── index.html                 # 官网页面（单页，含下载 + 教程 + FAQ）
├── styles.css                 # 样式
├── app.js                     # 移动菜单 / 导航高亮 / 复制 SHA / 手风琴
├── assets/                    # 截图与 favicon
└── downloads/                 # 安装包（下载按钮指向 GitHub Releases）
    ├── Nota-1.25.1-portable.exe
    ├── Nota-1.25.1-win-x64.zip
    ├── Nota-1.25.1-android.apk
    └── Nota-1.25.1-source.zip
```

当前版本 **v1.25.1**（2026-10-30）。

## 本地预览 / 本地域名 http://notafun.com/

### 方式 A：本机域名 http://notafun.com/（推荐）

本机 hosts 已添加 IPv6 映射：

```
::1    nota.xy
```

80 端口目前被 Steam++ / Watt Toolkit 的 **IPv4** 监听占用，本机用 **IPv6 loopback** 解决，**不需要关闭任何软件**：

```powershell
.\serve-nota-xy.ps1
```

然后访问 <http://notafun.com/> 即可（网站监听 `[::1]:80`，只影响本机 IPv6 回环）。

### 方式 B：http://127.0.0.1:8080/

如果不想用本地域名，也可以先普通端口预览：

```powershell
.\serve.ps1
```

然后访问 <http://127.0.0.1:8080/>。

> **说明**：`.xy` 目前不是可注册的公网顶级域名，`http://notafun.com/` 是本地 / 内网使用的地址。如果要让互联网上的用户访问，需要：真实域名（把 XY 换成你的后缀）→ DNS 解析 → 静态托管 / 对象存储 → 在托管平台绑定自定义域名。站点里的绝对地址（canonical / og:url）已按 `http://notafun.com/` 配置，换成真实域名时全局搜索替换即可。

## 本地预览

任选一种方式（在 `nota-site` 目录下）：

```bash
# 方式 1：Python（推荐，Windows 自带 python 即可）
python -m http.server 8080

# 方式 2：Node
npx serve . -l 8080
```

然后浏览器打开 <http://127.0.0.1:8080>。

> 注意：不要直接双击 `index.html` 用 `file://` 打开，部分浏览器会限制 `download` 属性；请用本地服务器或部署到静态托管。

## 部署到公网

这是纯静态站点，**不需要后端**，任何静态托管都可以：

| 平台 | 适用情况 | 注意 |
| --- | --- | --- |
| 阿里云 OSS / 腾讯云 COS / Cloudflare R2 | 推荐：大安装包 | 把整个目录上传到 Bucket，开启静态网站托管；大文件下载走对象存储最稳 |
| GitHub Pages | 免费、方便更新教程 | **单文件上限 100 MB**，`win-x64.zip`（130 MB）需要换成 OSS/Release 链接；90 MB 的便携版也接近上限 |
| Netlify / Vercel | 部署快、自动 HTTPS | 大文件建议放对象存储，页面里改成外链 |
| Nginx / Apache 自建服务器 | 完全可控 | 把目录放进网站根目录即可 |

如果安装包太大不想上传，可以：

1. 把 `downloads/` 里的安装包放到网盘 / OSS / GitHub Release；
2. 修改 `index.html` 里所有 `href="downloads/..."` 为对应外链（搜索 `downloads/Nota-` 即可找到全部位置）。

## 更新新版本（发布流程）

1. 把新版本安装包复制进 `downloads/`；
2. 修改 `index.html`：
   - 顶部版本号（`v1.25.1`，搜索 `version-pill`）；
   - 下载卡片里的版本、大小、`href` 文件名；
   - SHA-256 完整值与卡片上显示的短哈希（`data-copy` 属性 + 按钮上方文本）；
3. 更新教程 / FAQ 里提到的版本修复说明（如有）；
4. 全站搜索旧版本号，确认没有残留。

可以用 PowerShell 快速获取 SHA-256：

```powershell
Get-FileHash .\downloads\Nota-*.exe -Algorithm SHA256
```

## 自定义

- **配色**：`styles.css` 顶部 `:root` 变量（`--accent` 主色、`--ink` 文字色等）；
- **文案**：全部集中在 `index.html`，无需构建；
- **截图**：替换 `assets/` 下同名图片即可（建议 16:9，宽度 ≥ 1200px）；
- **教程**：直接增删 `#tutorials` 里的 `<details class="tuto">` 块，自动手风琴逻辑会生效；
- **FAQ**：增删 `#faq` 里的 `<details class="faq-item">` 块。

## 说明

- 站内所有资源（截图 / 安装包）都在本地，没有外部 CDN 依赖，离线也能预览；
- 安装包未做代码签名，Windows SmartScreen / Android 未知来源提示已在教程与 FAQ 中说明；
- Nota 与任何第三方制谱软件无关联；VexFlow、Salamander 钢琴采样、pdfjs 等开源组件致谢见页脚。
