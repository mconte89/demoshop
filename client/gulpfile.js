var gulp = require("gulp");
var sass = require("gulp-sass");
var express = require("express");
const path = require("path");
const fsExtra = require("fs-extra");
const sourcemaps = require("gulp-sourcemaps");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const browserify = require("browserify");
const watchify = require("watchify");
const babelify = require("babelify");
const vfs = require("vinyl-fs");
const _ = require("underscore");

function timestamp() {
    let date = new Date();

    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
    let millis = date.getMilliseconds();

    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    ///let str = hour + ":" + min + ":" + sec + "." + millis;
    let str = hour + ":" + min + ":" + sec;

    return str;
}

function compile(production, watch = false, done) {
    let scriptsDir = "./src/";
    let entryPoint = scriptsDir + "entrypoint.js";

    let bundler = browserify(entryPoint, { debug: !production, cache: {}, packageCache: {}, extensions: [".js", ".jsx"] })
        .transform(babelify, {presets: [require.resolve("@babel/preset-env"), require.resolve("@babel/preset-react")]})

    if (watch) {
        bundler.plugin(watchify);

        console.log("[" + timestamp() + "] " + "Looking for changes...");                        
    }

    function rebundle() {
        console.log("[" + timestamp() + "] " + "Bundling " + entryPoint + "...");

        const pipeline = bundler.bundle()    
            .on("error", function (err) {
                console.error(err);
            })
            .on("end", function () {
            })
            .pipe(source(entryPoint))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write("./source_maps", {sourceMappingURL: function(file) { return "app.js.map"; }}))
            .pipe(vfs.dest("./build/"))
            .on("finish", function() {
                const sourceFile = "./build/src/entrypoint.js";
                const sourceMapFile = "./build/source_maps/src/entrypoint.js.map";
                const destDir = "html/resources/js";
                const destFile = path.posix.join(destDir, "app.js");
                const destMapFile = path.posix.join(destDir, "app.js.map");
                try {                        
                    fsExtra.copySync(sourceFile, destFile);
                    console.log("[" + timestamp() + "] " + "Copied: " + sourceFile + " == " + destFile);                        

                    fsExtra.copySync(sourceMapFile, destMapFile);
                    console.log("[" + timestamp() + "] " + "Copied: " + sourceMapFile + " == " + destMapFile);   
                } catch (error) {
                    console.log(error.message);
                    console.log(error.stack);
                    process.exit(1);
                }

                if (_.isFunction(done)) { done() };
            })
            
    }

    if (watch) {
        bundler.on("update", function() {
            rebundle();
        });
    }

    rebundle();
}

gulp.task("compile", function(done) {
    compile(false, _.any(process.argv, "--production"), done);
});

gulp.task("styles", function() {
    gulp.src("html/resources/sass/**/*.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest("html/resources/css/"))
    ;
});


gulp.task("server", function () {
    var app = express();

    app.use(express.static("html"));

    var server = app.listen(8000, function () {
        var host = server.address().address;
        var port = server.address().port;

        console.log("[" + timestamp() + "] " + "Applica web server listening at http://%s:%s", host, port)

    })
});


gulp.task("watch", ["styles"], function() {
	compile(false, true, null);
    
	gulp.watch("html/resources/sass/**/*.scss", ["styles"]);
});


gulp.task("run", ["watch", "server"])
gulp.task("build", ["compile", "styles"]);