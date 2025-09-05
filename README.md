# Go-Switchbot-Controller

GoのWailsを使ってスイッチボットを操作したり、windowsをスリープしたりする。

## 実行方法

1.  プロジェクトのルートに `.env` ファイルを作成し、SwitchBotのトークンとシークレットを記述します。
    ```
    SWITCHBOT_TOKEN=your_token_here
    SECRET=your_secret_here
    ```

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

