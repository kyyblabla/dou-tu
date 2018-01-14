import { searchImages } from './http/douTu'
import { ipcMain } from 'electron'

ipcMain.on('IMAGES_SEARCH', (event, {keyWord = '', page = 1}) => {
  searchImages(keyWord, page).then((data) => {
    event.sender.send('IMAGES_SEARCH_RESULT', data)
  }).catch((e) => {
    console.log(e)
  })
})
