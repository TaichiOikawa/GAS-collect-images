# 画像収集システム [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/TaichiOikawa/GAS-collect-images/blob/main/LICENCE)

**北見北斗高校 生徒会執行部**

**「画像収集システム」** は生徒から画像を収集し、Google Driveに保存するWebアプリケーションです。
Google Apps Script(GAS)上で動作することを想定しています。


## 使用技術
[<img src="https://img.shields.io/badge/-TypeScript-000000.svg?logo=typescript&style=for-the-badge">](https://www.typescriptlang.org/)

### フロントエンド
[<img src="https://img.shields.io/badge/-React-000000.svg?logo=react&style=for-the-badge">](https://react.dev/)
[<img src="https://img.shields.io/badge/-Vite-000000.svg?logo=vite&style=for-the-badge">](https://vite.dev/)
[<img src="https://img.shields.io/badge/-TailwindCSS-000000.svg?logo=tailwindcss&style=for-the-badge">](https://tailwindcss.com/)
[<img src="https://img.shields.io/badge/-shadcn/ui-000000.svg?logo=shadcnui&style=for-the-badge">](https://ui.shadcn.com/)

### バックエンド
[<img src="https://img.shields.io/badge/-Node.js-000000.svg?logo=node.js&style=for-the-badge">](https://nodejs.org/)
[<img src="https://img.shields.io/badge/-Google%20Apps%20Script-000000.svg?logo=googleappsscript&style=for-the-badge">](https://developers.google.com/apps-script)

### その他
- [Clasp](https://github.com/google/clasp) (Develop GAS projects locally)
- [ESLint](https://eslint.org/) (Linter)
- [Prettier](https://prettier.io/) (Linter)
- [jotai](https://jotai.org/) (Frontend: State Management)
- [Motion](https://motion.dev/) (Frontend: Animation Library)
- [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) (Frontend: Vite Plugin)
- [esbuild](https://esbuild.github.io/) (Backend: Builder)


## Features
📸 **画像収集**: 画像を収集し、指定されたGoogle Driveのフォルダーに保存します。スプレッドシートにもデータを挿入します。

👤: **ユーザー管理機能**: ユーザーを管理します。ログイン機能はなく、端末ごとで登録されます。

📝 **統計機能**: 画像が何枚送信されたか、ユーザーは何人いるのかを表示します。

👑 **ランキング機能**: 送信した画像の枚数のランキングを表示します。


## Getting Started
### Require
- Git
- Node.js v20
- yarn v4
- Google Account

### 1. claspをインストール
```bash
npm install -g @google/clasp
```

Google Apps Script APIを有効化: https://script.google.com/home/usersettings
![Enable Apps Script API](https://user-images.githubusercontent.com/744973/54870967-a9135780-4d6a-11e9-991c-9f57a508bdf0.gif)

### 2. claspにログイン
```
clasp login
```


### 3. リポジトリをクローン
```bash
git clone https://github.com/TaichiOikawa/GAS-collect-images.git
```

### 4. GASとリンク
まず、新規Google Apps Scriptを作成、
