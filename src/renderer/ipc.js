import { ipcRenderer as ipc } from 'electron'

export function renderPub (e, success, error) {
  let send = (arg) => {
    ipc.send(e, arg)
  }
  ipc.on(`${e}_success`, (e, d) => {
    if (success) {
      success(d)
    } else {
      console.log(d)
    }
  })
  ipc.on(`${e}_error`, (e, d) => {
    if (error) {
      error(d)
    } else {
      console.log(d)
    }
  })
  return {
    send
  }
}

export function renderSub (e, callback) {
  ipc.on(`${e}`, (e, d) => {
    callback(d)
  })
}
