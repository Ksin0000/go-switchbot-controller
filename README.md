# SwitchBot API コントローラー

このプログラムは、SwitchBot APIを使用してデバイス一覧を取得するためのGo言語で書かれたアプリケーションです。

## 必要条件

- Go 1.16以上
- SwitchBot APIトークン
- SwitchBot APIシークレット

## セットアップ

1. 必要なパッケージのインストール:
```bash
go mod init switchbot-controller
go get github.com/joho/godotenv
go get github.com/google/uuid
```

2. `.env`ファイルの作成:
プロジェクトのルートディレクトリに`.env`ファイルを作成し、以下の内容を設定してください：
```
SWITCHBOT_TOKEN=あなたのSwitchBotトークン
SECRET=あなたのSwitchBotシークレット
```

## 実行方法

以下のコマンドでプログラムを実行できます：

```bash
go run switchbot_aaa.go
```

## 機能

- SwitchBotデバイス一覧の取得
- API認証の自動処理
- レスポンスのJSON形式での表示
