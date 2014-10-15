TypeScript + AngularJS プロジェクトひな形
=========================================

概要
----

TypeScript + AngularJS による SPA（Single Page Application）プロジェクトのひな形です。View は [EJS](http://www.embeddedjs.com/) で処理しますので、
開発コードとプロダクトコードを切り替えることもできます。

CSS は [Compass](http://compass-style.org/) を用いて処理します。

出荷用に Minify する仕組みもあります。

準備
----

[Node.js](http://nodejs.org/) をインストールして npm が使える状態にしてください。

ビルドシステムに [gulp](http://gulpjs.com/) を使用しますのでインストールしてください（当然事前に Node + npm も）。

    npm install -g gulp

次のコマンドでこのプロジェクトが依存しているパッケージをインストールしてください。

    npm install

[Compass](http://compass-style.org/) を使用しますのでインストールしてください（当然事前に ruby + gem も）。

    gem install compass

次のコマンドでプロジェクトの初期化をしてください。

    gulp init

開発
----

以下のコマンドで開発サーバが起動します。[http://localhost:8000](http://localhost:8000) で確認できます。

    gulp serve

このサーバ起動中は、各ソースコードの変更を検出するとコンパイル等の処理が自動で走り、自動でリロードします。

テスト
-----

以下のコマンドでテストが走ります。テストブラウザとして Google Chrome を用いるのでインストールしておいてください。

    gulp test

以下のコマンドを実行するとテスト対象コードおよびテストコードの変更を監視し、変更検出の都度テストを行うモードになります。

    gulp tdd

プロダクトパッケージの作成
--------------------------

以下のコマンドで Minify 等々を施したファイル群が target/dist 配下に作成されます。

    gulp build

以下のコマンドでプロダクトパッケージ実際に使用した動作確認を行うためのステージングサーバ起動します。
開発サーバ同様 [http://localhost:8000](http://localhost:8000) で動作確認ができます。

    gulp stage

リバースプロキシ
----------------

Webサービスとの連携を考慮し、開発サーバおよびステージングサーバは /api から始まる HTTP リクエストを
 [http://localhost:9000](http://localhost:9000) に転送します。