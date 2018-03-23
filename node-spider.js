const request = require('superagent')
//用于发送http请求
const cheerio = require('cheerio')
//类jquery，用于获取页面元素
const fs = require('fs-extra')
//用于文件操作
const path = require('path')
//用于路径操作

//安装方法为当前文件夹下 npm install 模块名
//应该是要全局安装的。可以先试一下，如果不能装就全局。mac为 sudo npm install 模块名  windows为npm install 模块名 -g
//应该是这样。。。再有问题百度。。。安装的东西在node_modules里

let url = 'http://www.meizitu.com/tag/';
async function getUrl() {
  let linkArr = [];
  //循环为获取所有的页面
  for (let i = 1; i <= 3; i++) {
    let trueUrl = url + `nvshen_460_${i}.html`;
    const res = await request.get(trueUrl)
    const $ = cheerio.load(res.text)
    $('.pic').each(function (i, item) {
      let src = $(this).find('a').attr('href')
      linkArr.push(src)
      //遍历，将页面所有的地址加入数组
    })
  }
  return linkArr
}
//getUrl函数作用为获取网站上所有的进入图集页面的地址

let count = 0;

async function getPic(url) {
  const res = await request.get(url)
  const $ = cheerio.load(res.text)
  const dir = ++count;
  console.log(`创建${dir}文件夹`)
  await fs.mkdir(path.join(__dirname + '/meizi' + count))
  //创建文件夹
  let imageCount = $('#picture p').find('img').length
  for (let i = 0; i < imageCount; i++) {
    let image = $('#picture p').find('img')[i].attribs.src
    //遍历数组，获取当前页面下所有图片的链接
    download(dir, image)
    //下载图片至指定文件夹
  }
}
//getPic函数作用为获取图片并下载

async function download(dir, imageUrl) {
  console.log(`正在下载${imageUrl}`)
  const filename = imageUrl.split('/').pop()  
  const req = request.get(imageUrl).set({ 'Referer': 'http://www.meizitu.com' })
  console.log(path.join(__dirname + '/meizi' + dir + '/' + filename))
  req.pipe(fs.createWriteStream(path.join(__dirname + '/meizi' + dir + '/' + filename)))
}
//download函数作用为下载文件。

async function init() {
  let urls = await getUrl()
  for (let url of urls) {
    await getPic(url)
  }
}

init()

//init函数执行