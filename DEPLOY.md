# 把 Nota 官网挂到公网（让其他人能访问）

> **nota.fun 当前状态（2026-10-30 查询）**：域名已被注册，NS 指向 `ns2.hosting.reg.ru`，A 记录 `31.31.196.17`，当前 HTTP 访问超时（对方服务器未响应/未建站）。如果你不是这个域名的所有者，无法使用它；如果你拥有它，请登录注册商（reg.ru 或你购买的平台）修改 DNS/NS 指向你的托管。


当前有两类办法：**临时演示**（几分钟就能给别人看）和**永久部署**（需要域名 / 托管账号 / 服务器）。

---

## 一、临时公网地址（现在就能用）

### 方式 A：localhost.run（免费、不用注册）

要求：这台电脑保持开机、不要关掉 SSH 窗口。

```powershell
ssh -o StrictHostKeyChecking=no -R 80:localhost:8080 nokey@localhost.run
```

运行后会输出一个类似下面的地址：

```
https://xxxxxxxx.lhr.life tunneled with tls termination
```

把这个 `https://...lhr.life/` 地址发给别人即可访问。当前已启动的临时地址：

> **https://6a247d275ac1fc.lhr.life/**

停止：在 SSH 窗口按 `Ctrl+C` 或关闭窗口。重新启动会生成新地址。

### 方式 B：Cloudflare Quick Tunnel（免费、不用注册）

```powershell
cloudflared tunnel --url http://127.0.0.1:8080
```

会输出 `https://xxxx.trycloudflare.com`。如果所在网络无法解析 `argotunnel.com`（本项目实测会失败），改用方式 A。

> 临时方式的共同限制：电脑必须开机且网站/隧道进程在跑；URL 是随机域名，重启会变；不适合长期对外。

---

## 二、永久部署（推荐）

先选一个真实域名：**`.xy` 不是可注册的公网顶级域名**，`nota.fun` 无法在公网解析。可以买 `nota.xyz`、`nota.fun`、`nota.pics` 等（约 ¥30–100/年）。

### 方案 1：GitHub Pages（网站）+ GitHub Releases（安装包）——最省钱的免费方案

适合：不想买服务器，能接受 GitHub 在国内访问速度一般。

1. 新建一个公开仓库（例如 `nota-site`）。
2. 上传 `nota-site/` 里的**网站代码**：`index.html`、`styles.css`、`app.js`、`assets/`（**不要**上传 `downloads/` 里 200 多 MB 的安装包）。
3. 仓库 **Settings → Pages**：Source 选 `Deploy from a branch`，分支 `main`、目录 `/root`，保存。
4. 等 1–2 分钟，得到 `https://<用户名>.github.io/nota-site/`。
5. 新建 **Release**（例如标签 `v1.22.0`），把 4 个安装包作为 Release assets 上传（单文件最大 2 GB，完全够用）。
6. 修改 `index.html` 里下载按钮的 `href`，指向 Release 资源地址，例如：

   ```
   https://github.com/<用户名>/nota-site/releases/download/v1.22.0/Nota-1.22.0-portable.exe
   ```

   全局搜索 `downloads/Nota-` 可找到全部按钮。
7. **绑定域名**：Pages → Custom domain 填你的域名；在域名 DNS 里加 CNAME 指向 `<用户名>.github.io`；开启 HTTPS。

优点：免费、自动 HTTPS、无需服务器。
注意：GitHub Pages 单文件上限 100 MB，所以 130 MB 的 `win-x64.zip` 必须放 Release；90 MB 便携版也接近上限，建议一并放 Release。

### 方案 2：对象存储 + CDN（国内访问更稳）

适合：主要给国内用户下载，愿意花少量存储/流量费用。

- 阿里云 OSS / 腾讯云 COS / Cloudflare R2 / Backblaze B2
- 把 `nota-site/` 整个目录（含 `downloads/`）上传到 Bucket，开启**静态网站托管**
- 绑定自定义域名 + HTTPS
- 国内云厂商绑定域名通常需要 **ICP 备案**；不想备案可以选香港/海外区域或 Cloudflare R2 自定义域名

优点：下载稳定、带宽足、支持大文件；缺点：流量会产生费用（对象存储下载流量费），域名/备案有门槛。

### 方案 3：云服务器 + Nginx（完全可控）

适合：已经有服务器 / 想自己管理。

```bash
# 服务器上（以 Ubuntu + Nginx 为例）
sudo apt install nginx
# 把 nota-site 整个目录上传到 /var/www/nota-site
# nginx 配置 root 指向该目录，配置域名 server_name 和 HTTPS（certbot）
```

优点：可以放全部安装包、不限单文件大小；缺点：需要服务器成本、维护、域名备案（大陆服务器）。

---

## 三、更新版本时的流程

1. 构建新的安装包，复制进 `downloads/`，删除旧版本；
2. 修改 `index.html`：版本号、下载文件链接、大小、SHA-256；
3. 重新上传网站（Pages 推送仓库 / OSS 上传覆盖 / 服务器 rsync）；
4. 如果安装包放在 GitHub Releases，重新上传 Release 并更新下载链接。

## 四、安全 / 合规提醒

- 临时隧道只暴露官网静态文件，但电脑需保持开机；不用时记得关掉 SSH/cloudflared 进程。
- 安装包没有代码签名，页面已注明 Windows SmartScreen / Android 未知来源提示。
- 国内公网 + 大陆服务器/域名需遵守备案要求；不要用临时隧道做长期下载站。

## 五、需要别人协助部署时

如果需要我继续帮你部署，请提供以下任意一种：

1. **GitHub 仓库**（公开仓库地址或你创建好后告诉我）——我可以整理成 GitHub Pages + Releases 的最终文件；
2. **域名 + 托管平台账号**（Cloudflare / Netlify / Vercel 等，注意大文件限制）；
3. **云服务器 SSH 信息**（建议先用测试机）；
4. 或者只想先给别人看：直接用上面的临时隧道地址。
