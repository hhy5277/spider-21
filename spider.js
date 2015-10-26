let fs = require('fs');
let superagent = require('superagent');
let cheerio = require('cheerio');
let request = require('request');
let mkdirp = require('mkdirp');
// let async = require('async');
// let retry = require('retry');

let config = require('./config').config;



// page url
let url = config.url;

// 网页图片选择器
let cl = config.selector;

// 图片计数
let count = 0;

// 创建目录
let dir = config.dir;
mkdirp(dir, (err) => {
    if (err) {
        console.log(err);
    }
});

// 获取图片
let getImgs = (html) => {
    let $ = cheerio.load(html);

    // 限制并发数量
    // async.mapLimit($(cl), 10, (item) => {
    //     console.log(item.attribs.src)
    //     download(item)
    // })
    $(cl).each((index, item) => {
        download(item)
    })
};

// 下载图片
let download = (img) => {
    let src = img.attribs.src;
    let d = (new Date).getTime();
    let name = d + src.match(/.(jpg|png)/)[0];
    console.log('img: ' + count);

    // let operation = retry.operation({
    //     retries: 5,
    //     factor: 3,
    //     minTimeout: 1 * 1000,
    //     maxTimeout: 60 * 1000,
    //     randomize: true,
    // });


    // 请求失败重试
    // operation.attempt(function() {
        request
            .get(src)
            .on('error', function(err) {
                // operation.retry(err)
                console.log(err);
                // return;
            })
            .pipe(fs.createWriteStream('' + dir + count+++name));
    // });
}

// 获取页面
let getHTML = (url) => {
    let promise = new Promise((resolve, reject) => {
        superagent
            .get(url)
            .end((err, res) => {
                if (!err) {
                    resolve(res.text);
                } else {
                    reject(err);
                }
            })
    })

    return promise;
};


// 页数
let pages = config.pages;

// 每次爬的页数限制，避免被封
let freq = config.freq;

let action = () => {
    let len = pages - freq;
    len = Math.max(0, len);

    if (len === 0) {
        clearInterval(timeId);
        console.log('end');
    }

    for (let i = pages; i > len; i--) {
        let u = url;
        u = u + i;
        getHTML(u).then(getImgs);
    }
}

console.log('start...');

let timeId = setInterval(() => {
    console.log('page: ' + pages);
    action();
    pages -= freq;
}, config.delay);