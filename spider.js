'use strict'

let fs = require('fs'),
  xml2js = require('xml2js'),
  request = require('request'),
  mkdirp = require('mkdirp'),
  async = require('async')

let config = require('./config').config


// page url
let pageUrl = config.url

// 图片计数
let count = 0

// 创建目录
let dir = config.dir
mkdirp(dir, (err) => {
  if (err) {
    console.log(err)
  }
})

let _getUrl = (cb) => {
  let url = pageUrl
          + '/api/read?type=photo&num='
          + config.freq
          + '&start='
          + config.pages

  cb(null, url)
}

let _getPosts = (url, cb) => {
  request.get(url, (err, res, body) => {
    xml2js.parseString(body, {
        explicitArray: false
    }, (err, result) => {
      if (!result) return
      cb(err, result.tumblr.posts.post)
    })
  })
}

let _getImages = (posts, cb) => {
  if (posts) {
    let images = []
    posts.forEach((post) => {
      if (post['photoset']) {
        let photoset = post['photoset']['photo']
        photoset.forEach((photo) => {
          images.push(photo['photo-url'][0]._)
        })
      }
      if (post['photo-url']) {
        images.push(post['photo-url'][0]._)
      }

    })
    cb(null, images)
  } else {
    console.log('Done, total pages is', config.pages)
    process.exit()
  }
}

let _downImage = (url, cb) => {
  let name = url.match(/[^/]+$/)[0]

  console.log('download image: ' + count++)

  request
    .get(url)
    .on('close', () => {
      cb()
    })
    .on('error', (err) => {
      console.log('download error', err)
      cb(err)
    })
    .pipe(fs.createWriteStream('' + dir + name))
}

let _downImages = (images, cb) => {
  const limit = 10
  async.eachLimit(images, limit, _downImage, (err) => {
    cb(err)
  })
}

let start = () => {
  async.waterfall([
    _getUrl,
    _getPosts,
    _getImages,
    _downImages
  ], (err, result) => {
    console.log(err, result)
    if (err) {
      // 出错重新下载
      start()
    } else {
      config.pages += config.freq
      console.log(config.pages)
      start()
    }
  })
}

console.log('Start download...')

start()
