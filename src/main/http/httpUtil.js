const axios = require('axios')

export async function get (url) {
  let data = await axios.get(encodeURI(url))
  return data.data
}
