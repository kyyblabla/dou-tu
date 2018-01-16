import { searchImages } from './http/douTu'
import { ipcMain, clipboard, nativeImage } from 'electron'
import { getBinary } from './http/httpUtil'

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
  clipboard.writeImage(nativeImage.createFromBuffer(await getBinary(src)))
  return {src, title}
})
