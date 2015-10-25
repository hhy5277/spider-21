let fs = require('fs');
let superagent = require('superagent');
let cheerio = require('cheerio');
let request = require('request');
let mkdirp = require('mkdirp');
let async = require('async');


// 网页地址
// 豆瓣
// let url = 'http://www.dbmeinv.com/dbgroup/rank.htm?pager_offset=';
// wanimal
let url = 'http://wanimal1983.tumblr.com/page/';

// 网页图片选择器
let cl = '.post img';

// 图片计数
let count = 0;

// 创建目录
let dir = './download/';
mkdirp(dir, (err) => {
    if(err){
        console.log(err);
    }
});

// 获取图片
let getImgs = (html) => {
    let $ = cheerio.load(html);

    // 限制并发数量
    async.mapLimit($(cl), 5, (item) => {
        console.log(item.attribs.src)
        download(item)
    })
    // $(cl).each((index, item) => {
    //     download(item)
    // })
};

// 下载图片
let download = (img) => {
    let src = img.attribs.src;
    let d = (new Date).getTime();
    let name = d + src.match(/.(jpg|png)/)[0];

    console.log('img: ' + count);
    request(src).pipe(fs.createWriteStream('' + dir + count++ + name));
}

// 获取页面
let getHTML = (url) => {
    let promise = new Promise(function(resolve, reject){
        superagent.get(url)
          .end((err, res) => {
            if(!err) {
                resolve(res.text);
            } else {
                reject(err);
            }
          })
    })

    return promise;
};


// 页数
let pages = 113;

// 每次爬的页数限制，避免被封
let freq = 1;

let action = () => {
    let len = pages - freq;

    if(len < 0) {
        clearInterval(timeId);
        console.log('end');
        return;
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
}, 10 * 1000);
