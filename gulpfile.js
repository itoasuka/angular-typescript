'use strict';

/*
 * モジュールの取得
 */
var gulp = require('gulp');                         // gulp 本体
var runSequence = require('run-sequence').use(gulp);// 並行実行
var $ = require('gulp-load-plugins')();             // gulp プラグインの読み込み
var path = require('path');                         // path に関するユーティリティ
var del = require('del');                           // ファイル削除
var karma = require('karma').server;                // Karma
var bower = require('bower');                       // Bower

/*
 * プロジェクトにより設定が変わりそうなもの
 */
var moduleName = 'myApp';                                   // AngularJS モジュール名
var apiPath = '/api';                                       // リバースプロキシするパス

/*
 * パスの設定
 */
var srcMain = 'src/main';                                   // メインソースコード
var srcTest = 'src/test';                                   // テストコード
var staticContents = path.join(srcMain, 'webapp');          // 静的コンテンツ
var tsMain = path.join(srcMain, 'typescript');              // TypeScript メイン
var tsMainFiles = path.join(tsMain, '**/*.ts');             // TypeScript ファイル群
var ejsMain = path.join(srcMain, 'ejs');                    // EJS メイン
var ejsMainFiles = path.join(ejsMain, '**/*.ejs');          // EJS ファイル群
var ejsMainIncludes = path.join(ejsMain, '**/_*.ejs');      // EJS インクルード用
var ejsAngularViews = path.join(ejsMain, 'views/**/*.ejs'); // AngularJS 用ビューのEJS
var scssMain = path.join(srcMain, 'scss');                  // SCSS メイン
var scssMainFiles = path.join(scssMain, '**/*.scss');       // SCSS ファイル群
var outBase = 'target';                                     // 出力先ベース
var distOut = path.join(outBase, 'dist');                   // 出荷用ベース
var mainOut = path.join(outBase, 'main');                   // メイン出力ベース
var tmpOut  = path.join(outBase, 'tmp');                    // テンポラリ出力ベース

var jsMainOut = path.join(mainOut, 'scripts');              // JavaScript 出力ベース
var jsTmpOut  = path.join(tmpOut, 'scripts');               // JavaScript テンポラリ出力ベース
var angularViews = path.join(mainOut, 'views/**/*.html');   // AngularJS 用ビュー


/*
 * タスク clean : コンパイル結果等を削除する
 */
gulp.task('clean', del.bind(null, [outBase]));

/*
 * タスク bower:install : bower install 相当を実行する。
 */
gulp.task('bower:install', function (callback) {
    bower.commands.install()
        .on('end', function () {
            callback();
        });
});

/*
 * タスク tsd:reinstall : tad reinstall 相当を実行する。
 */
gulp.task('tsd:reinstall', function (callback) {
    $.tsd({
        command: 'reinstall',
        config: './tsd.json'
    }, callback);
});

/*
 * サーバの設定
 */
(function () {
    /**
     * リバースプロキシを設定する
     * 別途起動している Web サービスを提供するサーバに接続する際に使用する
     */
    var reverseProxy = function () {
        var url, proxy, options;
        url = require('url');
        proxy = require('proxy-middleware');
        // リバースプロキシ先
        options = url.parse('http://localhost:9000' + apiPath);
        // リバースプロキシで転送するパス
        options.route = apiPath;
        return proxy(options);
    };
    /**
     * 開発用サーバのミドルウェア
     */
    var devMiddleware = function (connect) {
        return [
            connect().use(
                '/bower_components',
                connect.static('./bower_components')
            ),
            connect().use(
                '/node_modules',
                connect.static('./node_modules')
            ),
            connect().use(
                '/scripts',
                connect.static(tsMain)
            ),
            reverseProxy()
        ];
    };
    /**
     * デプロイ用資源の確認用サーバのミドルウェア
     */
    var prodMiddleware = function () {
        return [reverseProxy()];
    };

    /*
     * タスク connect : 開発用 Web サーバを起動する
     */
    gulp.task('connect', function () {
        $.connect.server({
            root: [mainOut, staticContents],
            port: 8000,
            livereload: true,
            middleware: devMiddleware
        });
    });

    /*
     * タスク connect:prod : ステージングサーバを起動する
     */
    gulp.task('connect:prod', function () {
        $.connect.server({
            root: [distOut],
            port: 8000,
            livereload: false,
            middleware: prodMiddleware
        });
    });
})();

/*
 * EJS タスクの設定
 */
(function () {
    function task(mode, target, dest) {
        return gulp.src(target)
            .pipe($.plumber())
            .pipe($.ejs({
                mode: mode
            }))
            .pipe(gulp.dest(dest));
    }

    /*
     * タスク ejs : テンプレートエンジン EJS の処理を行う
     *
     * テンプレート用変数 mode に 'dev' が設定される。
     * ファイル名がアンダースコアから始まるテンプレートは処理されない。
     */
    gulp.task('ejs', function () {
        return task('dev', [ejsMainFiles, '!' + ejsMainIncludes], mainOut)
            .pipe($.connect.reload());
    });

    /*
     * タスク ejs:prod : テンプレートエンジン EJS の出荷用の処理を行う
     *
     * テンプレート用変数 mode に 'prod' が設定される。
     * ファイル名がアンダースコアから始まるテンプレートは処理されない。
     * AngularJS 用ビューも処理しない
     */
    gulp.task('ejs:prod', function () {
        return task('prod', [ejsMainFiles, '!' + ejsMainIncludes, '!' + ejsAngularViews], mainOut);
    });

    /*
     * タスク ejs:prod : テンプレートエンジン EJS の出荷用の処理を行う
     *
     * テンプレート用変数 mode に 'prod' が設定される。
     * ファイル名がアンダースコアから始まるテンプレートは処理されない。
     * AngularJS 用ビューの処理のみ行う。
     */
    gulp.task('ejs:views', function () {
        return task('prod', [ejsAngularViews, '!' + ejsMainIncludes], path.join(mainOut, 'views'));
    });
})();

/*
 * HTML Minify の設定
 */
function htmlmin() {
    return $.htmlmin({
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeComments: true,
        removeCommentsFromCDATA: true,
        removeOptionalTags: true
    });
}

/*
 * TypeScript コンパイルの設定
 */
(function () {
    function tscOption() {
        return {
            out: 'app.js',
            target: 'ES5',
            noImplicitAny: true,
            sourcemap: true,
            sourceRoot: './',
            mapRoot: '../../../scripts'
        };
    }

    /*
     * タスク tsc : TypeScript コンパイルを行う
     */
    gulp.task('tsc', function () {
        return gulp.src([tsMainFiles])
            .pipe($.plumber())
            .pipe($.tsc(tscOption()))
            .pipe(gulp.dest(jsTmpOut));
    });

    /*
     * タスク tsc:prod : TypeScript コンパイルを行う。minify 対策のため ngInject の処理も行う。
     */
    gulp.task('tsc:prod', function () {
        var opt = tscOption();
        opt.sourcemap = false;
        return gulp.src([tsMainFiles])
            .pipe($.plumber())
            .pipe($.tsc(opt))
            .pipe($.ngAnnotate())
            .pipe(gulp.dest(jsMainOut));
    });
})();

gulp.task('ngAnnotate', ['tsc'], function () {
    return gulp.src([path.join(jsTmpOut, '**/*.js')])
        .pipe($.plumber())
        .pipe($.sourcemaps.init({loadMaps:true}))
        .pipe($.ngAnnotate({
            sourcemap: true,
            sourceroot: './',
            remove: true,
            add: true
        }))
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest(jsMainOut))
        .pipe($.connect.reload());
});

/*
 * タスク ngTemplate : AngularJS テンプレートをプリコンパイル
 */
gulp.task('ngTemplate', ['ejs:views'], function () {
    return gulp.src(path.join(mainOut, 'views/**/*.html'))
        .pipe(htmlmin())
        .pipe($.angularTemplatecache({
            root: 'views/',
            module: moduleName
        }))
        .pipe(gulp.dest(jsMainOut));
});

/*
 * タスク compass : Compass でコンパイルする
 */
gulp.task('compass', function () {
    return gulp.src(scssMainFiles)
        .pipe($.plumber())
        .pipe($.compass({
            css: path.join(mainOut, 'styles'),
            sass: scssMain,
            comments: false,
            import_path: 'bower_components',
            relative: false
        }))
        .pipe($.autoprefixer('last 2 version'))
        .pipe(gulp.dest(path.join(mainOut, 'styles')))
        .pipe($.connect.reload());
});

/*
 * タスク test : Karma でテストする
 */
gulp.task('test', function (callback) {
    karma.start({
        configFile: 'karma.conf.js',
        singleRun: true
    }, callback);
});

/*
 * タスク tdd : Karma でテストする。ソースコードの変更を監視し、変更があった場合再テストする
 */
gulp.task('tdd', function (callback) {
    karma.start({
        configFile: 'karma.conf.js'
    }, callback);
});

/*
 * タスク watch : 変更を監視する
 */
gulp.task('watch', function () {
    gulp.watch([path.join(staticContents, '**/*')], function () {
        gulp.src([path.join(staticContents, '**/*')])
            .pipe($.connect.reload())
    });
    gulp.watch([tsMainFiles], ['ngAnnotate']);
    gulp.watch([ejsMainFiles], ['ejs']);
    gulp.watch([scssMainFiles], ['compass'])
});

/*
 * タスク serve : テストサーバを起動する
 */
gulp.task('serve', function (callback) {
    runSequence(
        'clean',
        ['ejs', 'ngAnnotate', 'compass'],
        'watch',
        'connect',
        callback
    )
});

/*
 * タスク usemin : 出荷用に HTML から参照している CSS や JavaScript をまとめて HTML も Minify する
 */
gulp.task('usemin', ['ejs:prod', 'tsc:prod', 'compass', 'ngTemplate'], function () {
    return gulp.src([path.join(staticContents, '**/*.html'), path.join(mainOut, '**/*.html'), '!' + angularViews])
        .on('error', $.util.log)
        .pipe($.usemin({
            css: [$.minifyCss(), $.rev()],
            html: [htmlmin()],
            js: [$.uglify(), $.rev()]
        }))
        .pipe(gulp.dest(distOut));
});

/*
 * タスク copy : 出荷用のディレクトリにコンテンツをコピーする
 */
gulp.task('copy', function () {
    gulp.src([
        path.join(staticContents, '**/*'),
        '!' + path.join(staticContents, '**/*.html'),
        '!' + path.join(staticContents, 'dist/**/*')])
        .pipe(gulp.dest(distOut));

    gulp.src('bower_components/**/*')
        .pipe(gulp.dest(path.join(distOut, 'bower_components')));
});

/*
 * タスク init : プロジェクトの初期化を行う
 */
gulp.task('init', ['bower:install', 'tsd:reinstall']);

/*
 * タスク build : 出荷用のコンテンツを作成する
 */
gulp.task('build', function (callback) {
    runSequence(
        'clean',
        'test',
        'usemin',
        'copy',
        callback
    );
});

/*
 * タスク stage : 出荷用のコンテンツを作成しその動作確認のためのサーバを起動する
 */
gulp.task('stage', function (callback) {
    runSequence(
        'build',
        'connect:prod',
        callback
    );
});

/*
 * デフォルト挙動は build
 */
gulp.task('default', ['build']);