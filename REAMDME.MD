# FastGet

FastGetはFastServerに追加される予定のLOCAL_APIを使ったテスト拡張機能です。これはテストようでありAPIのエンドポイントの変更や仕様の変更がある可能性があります。

---

## 特徴

- **FSS 追加ボタンの表示**  
  SpigotMC のリソースページに、プラグインやリソースのダウンロードをより簡単にする FSS ボタンを表示します。

- **動的な言語マップの読み込み**  
  `langs/` フォルダ内の JSON ファイル（例: `index.json`、各言語用マッピングファイル）を読み込み、ページ内のテキストを自動で翻訳または置換

- **コンテンツスクリプトによるカスタマイズ**  
  ページのテキストを動的に操作するため、複数のコンテンツスクリプト（`content.js`、`help.js`、`lang.js`、`logo_replace.js`）を利用

- **カスタム CSS アニメーション**  
  `xpAnimation.css` でアニメーションのCSSを設定

---

## 構成

   FastGet/
├── content.js < これメイン的な
├── help.js < 検索ボックスボタン追加
├── lang.js < 日本語化するためのファイル
├── logo_replace.js < ただロゴを置き換えるだけです
├── xpAnimation.css　< 経験値アニメーションのcss
├── manifest.json < Chromeの設定ファイル
├── icon.png <アイコン
├── img/ < 素材
│   ├── spigot.png
│   ├── yt.png
│   ├── google.png
│   └── info.png
└── langs/ >
    ├── index.json < ファイル一覧を記載する場所
    ├── ALL.json < 一旦ここに全て書いてます
    ├── forms.json < 例としてファイルごとに置き換え文字を変えてもいいかと思います
    └── chats.json < 例としてファイルごとに置き換え文字を変えてもいいかと思います