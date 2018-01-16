import { searchImages } from './http/douTu'
import { ipcMain, clipboard, nativeImage } from 'electron'
import { getBinary } from './http/httpUtil'

let mainSub = (e, doSomething) => {
  ipcMain.on(e, async (event, para) => {
    try {
      let rs = await doSomething(para)
      event.sender.send(`${e}_success`, rs)
    } catch (e) {
      console.log(e)
      event.sender.send(`${e}_error`, e)
    }
  })
}

mainSub('IMAGES_SEARCH', searchImages)
mainSub('IMAGE_COPY', async ({url, title}) => {
  console.log(url)
  clipboard.writeImage(nativeImage.createFromBuffer(await getBinary(url)))
  return {url, title}
})
