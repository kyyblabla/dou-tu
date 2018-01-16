import { ipcRenderer as ipc } from 'electron'

export function renderPub (eventName, success, error) {
  let send = (arg) => {
    ipc.send(eventName, arg)
  }
  ipc.on(`${eventName}_success`, (e, d) => {
    console.log(d)
    if (success) {
      success(d)
    } else {
      console.log(d)
    }
  })
  ipc.on(`${eventName}_error`, (e, info) => {
    console.log('xxxxx')
    if (error) {
      error(info)
    } else {
      console.error(info)
    }
  })
  return {
    send
  }
}

export function renderSub (eventName, callback) {
  ipc.on(`${eventName}`, (e, d) => {
    callback(d)
  })
}
