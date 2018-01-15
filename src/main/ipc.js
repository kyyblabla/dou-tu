import { searchImages } from './http/douTu'
import { ipcMain, clipboard, nativeImage } from 'electron'
import { getBinary } from './http/httpUtil'

ipcMain.on('IMAGES_SEARCH', (event, {keyWord = '', page = 1}) => {
  searchImages(keyWord, page).then((data) => {
    event.sender.send('IMAGES_SEARCH_RESULT', data)
  }).catch((e) => {
    console.log(e)
    event.sender.send('IMAGES_SEARCH_ERROR', e)
  })
})

ipcMain.on('IMAGE_COPY', async (event, {url, title}) => {
  clipboard.writeImage(nativeImage.createFromBuffer(await getBinary(url)))
  event.sender.send('IMAGE_COPIED', {url, title})
})
