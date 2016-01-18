exports.config = {
    url: 'http://wanimal1983.tumblr.com/api/read?type=photo&num=1&start=0', // 网页地址
    pages: 113, // 页数
    selector: '.post img', // 图片选择器
    dir: './download/', // 下载目录
    freq: 1, // 一次请求页数
    delay: 50 * 1000 // 间隔时间
}
