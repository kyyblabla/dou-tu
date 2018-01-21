import { searchImages } from './http/douTu'
import { ipcMain, clipboard, nativeImage } from 'electron'
import { download } from './downloader'

let mainSub = (eventName, doSomething) => {
  ipcMain.on(eventName, async (event, para) => {
    try {
      let result = await doSomething(para)
      event.sender.send(`${eventName}_success`, result)
    } catch (error) {
      console.error(error)
      event.sender.send(`${eventName}_error`, error)
    }
  })
}

mainSub('IMAGES_SEARCH', searchImages)
mainSub('IMAGE_COPY', async ({src, title}) => {
  console.log(src)
  let pathName = await download(src)
  console.log(`create file:${pathName}`)
  clipboard.writeImage(nativeImage.createFromDataURL(pathName))
  return {src, title}
})
