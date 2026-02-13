# X Theme Color Changer

X（旧Twitter）のテーマカラーを自由に変更できるChrome拡張機能です。

## 機能

- X（Twitter）のテーマカラーを好きな色に変更
- カラーピッカーで直感的な色選択
- リアルタイムでテーマを反映


https://github.com/user-attachments/assets/0599ec97-3de6-4308-ae79-ae969d56c79b



## インストール

1. リポジトリをクローン
   ```bash
   git clone https://github.com/waaaaall/x-theme-color.git
   cd x-theme-color
   ```

2. Chromeで `chrome://extensions/` を開く

3. 右上の「デベロッパーモード」を有効化

4. 「パッケージ化されていない拡張機能を読み込む」をクリック

5. クローンしたフォルダを選択

## 使い方

1. X（Twitter）またはX.comにアクセス

2. 拡張機能アイコンをクリック

3. テーマ色を選択

設定は自動保存されます。

## ファイル構成

```
├── manifest.json    # 拡張機能の設定
├── content.js       # スタイル適用スクリプト
├── popup.html       # ポップアップUI
└── popup.js         # ポップアップロジック
```
