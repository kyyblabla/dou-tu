const httpUtil = require('./httpUtil')
const util = require('util')
const cheerio = require('cheerio')

const URL = 'http://www.doutula.com/search?type=photo&more=1&keyword=%s&page=%s'
export async function searchImages (keyWord = '', page = 1) {
  let url = util.format(URL, keyWord, page)
  console.log(url)
  let html = await httpUtil.get(url)
  let $ = cheerio.load(html)
  let data = $('.random_picture a').map(function (i, e) {
    return {
      title: $(this).find('p').text(),
      src: $(this).find('img.img-responsive').attr('data-original')
    }
  }).get()
  let lis = $('ul.pagination li')
  let lastPage = data.length === 0 || lis.length === 0 || lis.eq(lis.length - 2).text() === `${page}`
  return {
    data,
    page,
    lastPage
  }
}
