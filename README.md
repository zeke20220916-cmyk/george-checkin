# George 的个人成长助理

一个给 George 使用的家庭成长打卡工具，支持：

- 今日任务打卡
- 晚间家长确认结算
- 积分和连续达标奖励
- 月度神秘宝箱
- 奖励商店
- 勋章称号
- 攀岩课资格
- Firebase 多终端同步

## 本地运行

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

打开：

```text
http://localhost:4173/
```

注意：Firebase Authentication 当前授权了 `localhost`，本地测试请使用 `localhost`，不要使用 `127.0.0.1`。

## Firebase

Firebase 配置在：

```text
firebase-config.js
```

Firestore 安全规则在：

```text
firestore.rules
```

当前规则只允许 `zeke20220916@gmail.com` 读写：

```text
families/george/state/current
```

部署规则：

```bash
npx firebase-tools deploy --only firestore:rules
```

## GitHub Pages 部署

1. 在 GitHub 创建一个公开或私有仓库，例如：

```text
george-checkin
```

2. 添加远端并推送：

```bash
git remote add origin git@github.com:YOUR_USERNAME/george-checkin.git
git branch -M main
git push -u origin main
```

3. 在 GitHub 仓库中开启 Pages：

```text
Settings -> Pages -> Deploy from a branch -> main -> /root
```

4. 部署成功后，把 GitHub Pages 域名加入 Firebase：

```text
Firebase Console
-> Authentication
-> Settings
-> Authorized domains
-> Add domain
```

添加：

```text
YOUR_USERNAME.github.io
```

不要带 `https://`，不要带路径。
