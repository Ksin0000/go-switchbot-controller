# Go-Switchbot-Controller

GoのWailsを使ってスイッチボットを操作したり、windowsをスリープしたりする。

## 実行方法

1.  プロジェクトのルートに `.env` ファイルを作成し、SwitchBotのトークンとシークレットを記述します。
    ```
    SWITCHBOT_TOKEN=your_token_here
    SECRET=your_secret_here
    ```

## エアコン操作（IRリモコン: Virtual Infrared Remote）

- 画面のデバイス一覧でリモコン種別が `Air Conditioner` の項目に、エアコン専用コントロール（温度/モード/風量/電源）を追加しました。
- 「送信」ボタンで SwitchBot API の `setAll` コマンドを呼び出します。
  - API パラメーター形式: `"{temperature},{mode},{fan speed},{power state}"`
  - 例: `26,1,3,on`（26℃/Auto/Medium/電源ON）
  - モード: 1=Auto, 2=Cool, 3=Dry, 4=Fan, 5=Heat
  - 風量: 1=Auto, 2=Low, 3=Medium, 4=High
  - 電源: `on` または `off`

備考: アプリ内部では `setAll:26,1,3,on` のようなショートハンド文字列をUIから送信し、バックエンドで SwitchBot API の `command: setAll` に変換して送出しています。

## About

This is the official Wails React-TS template.

You can configure the project by editing `wails.json`. More information about the project settings can be found
here: https://wails.io/docs/reference/project-config

## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

To build a redistributable, production mode package, use `wails build`.

Windows用には`wails build -platform windows`を実行して`build/bin/go-switchbot-controller.exe`をダブルクリック
