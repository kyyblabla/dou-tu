const axios = require('axios')

export async function get(url) {
  let response = await axios.get(encodeURI(url))
  return response.data
}

export async function getBinary(url) {
  let response = await axios.get(encodeURI(url), {
    responseType: 'arraybuffer'
  })
  return Buffer.from(response.data, 'binary')
}
