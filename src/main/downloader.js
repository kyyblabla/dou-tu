import fs from 'fs'
import uuid from 'uuid'
import { getBinary } from './http/httpUtil'

const PATH = '/tmp/doutu'
const SUPPORT_FILE_SURFIX = /\.(png|gif|jpg|jpeg|bmp|svg)$/

let saveFile = (buff, fileName) => {
  if (!fileName || !fileName.match(SUPPORT_FILE_SURFIX)) {
    return null
  }
  if (!fs.existsSync(PATH)) {
    fs.mkdirSync(PATH)
  }
  let uuidFileName = uuid.v4() + fileName.substring(fileName.lastIndexOf('.'))
  let finalPathName = `${PATH}/${uuidFileName}`
  fs.writeFileSync(finalPathName, buff)
  return finalPathName
}

export async function download (url) {
  let bytes = await getBinary(url)
  let fileName = url.substring(url.lastIndexOf('/') + 1)
  let pathName = saveFile(bytes, fileName)
  return pathName
}
