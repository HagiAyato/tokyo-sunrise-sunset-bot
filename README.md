# tokyo-sunrise-sunset-bot

## 概要
東京の日の出・日の入りをお知らせするBlueskyのbotを構築するためのGoogle Apps Scriptプロジェクトです。
Bluesky APIを通じて、テキストやリンクカードを含む投稿を自動化する機能を提供します。

## 構成ファイル
- [`post_bluesky.gs`](post_bluesky.gs)  
  Blueskyへの投稿処理を行うメインスクリプトです。API認証、テキストの整形、ハッシュタグ処理、画像アップロードなどを担当します。
- [`main_process.gs`](main_process.gs)  
  日次で実行されるメイン処理です。Sunrise-Sunset APIから情報を取得し、明日の予告投稿と、日の出・日の入り時刻へのトリガー設定を行います。
- [`util.gs`](util.gs)  
  HTTP通信の信頼性を向上させるためのユーティリティです。エラー時のリトライ処理などを実装しています。
- [`appsscript.json`](appsscript.json)  
  Google Apps Scriptのプロジェクト設定ファイルです。

## 主な機能

### 日次セットアップ処理
`daily_setup`  
毎日定時（例：23時）に実行され、以下の処理を行います：
- Sunrise-Sunset APIから翌日の東京の日の出・日の入り・南中時刻を取得。
- 取得した情報を元に、翌日の予告をBlueskyに投稿。
- 翌日の日の出・日の入り時刻に合わせて、投稿用トリガーを動的に設定。

### Blueskyへの投稿
`postToBlueSky`  
Bluesky APIにログインし、記事情報（タイトル・リンク・説明・サムネイル画像）を投稿します。
以下の機能をサポートしています：
- **文字数制限対応**: 300文字を超える投稿は自動的にトリミングされます。
- **ハッシュタグ自動検出**: 本文中のハッシュタグを解析し、BlueskyのFacet形式に変換します。
- **リンクカード作成**: URL、タイトル、説明文、サムネイル画像を指定してリッチなリンクカードを作成できます。
- **画像アップロード**: サムネイル画像をBlobとしてアップロードし、投稿に添付します。

### テスト投稿
`testPostToBlueSky`  
スクリプトプロパティからテスト用のユーザーID・パスワードを取得し、BlueSkyへの投稿をテストします。

### 通信エラー時のリトライ処理
`fetchWithRetry`  
外部APIへのアクセス時にサーバーエラー（500系）やタイムアウトが発生した場合、指数バックオフ（Exponential Backoff）アルゴリズムを用いて自動的に再試行します。

## 動作環境
Google Apps Script (V8 Runtime)

## セットアップ
本プロジェクトを実行するには、Google Apps Scriptの「スクリプトプロパティ」に以下の設定が必要です。

| プロパティ名 | 説明 |
| --- | --- |
| `bsky_uid` | Blueskyのアカウントハンドル（例: `example.bsky.social`） |
| `bsky_pass` | BlueskyのApp Password（アプリパスワード） |

## 使用API
- [Sunrise-Sunset API](https://api.sunrise-sunset.org)  
  緯度・経度を指定して、日の出・日の入り・南中時刻などの情報を取得できる無料のAPIです。

## 参考記事
- [GASを使ってblueskyで投稿をする方法](https://note.com/uwaaauwaaaa/n/nbcd279d4cf26)
- [GASでBlueskyのBotをつくった備忘録](https://note.com/keiga/n/n527865bcf0d5)
- [GASのコードをGitHubで管理する](https://sayjoyblog.com/gas_github_connection/)
- [GASをVSCodeで開発する](https://qiita.com/BONZINE/items/f6000de23ffd3c344881)