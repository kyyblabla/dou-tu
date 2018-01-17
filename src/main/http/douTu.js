const httpUtil = require('./httpUtil')
const util = require('util')
const cheerio = require('cheerio')

const URL = 'http://www.doutula.com/search?type=photo&more=1&keyword=%s&page=%s'
export async function searchImages ({keyWord, pageNo}) {
  let url = util.format(URL, keyWord, pageNo)
  console.log(`search url:${url}`)
  let html = await httpUtil.get(url)
  let $ = cheerio.load(html)
  let data = $('.random_picture a')
    .map(function (i, e) {
      return {
        title: $(this)
          .find('p')
          .text(),
        src: $(this)
          .find('img.img-responsive')
          .attr('data-original')
      }
    })
    .get()
  let liList = $('ul.pagination li')
  let lastPageLi = liList.eq(liList.length - 2)
  let lastPageNo = lastPageLi ? parseInt(lastPageLi.text() || '1') : 1
  return {
    data,
    pagination: {
      pageNo,
      pageCount: lastPageNo,
      lastPage: lastPageNo === pageNo,
      firstPage: pageNo === 1
    }
  }
}
