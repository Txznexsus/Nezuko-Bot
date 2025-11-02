// - 𝚈𝚃𝙳𝙻 👻


import axios from 'axios'
import crypto from 'crypto'

const savetube = {
  api: {
    base: "https://media.savetube.me/api",
    cdn: "/random-cdn",
    info: "/v2/info",
    download: "/download"
  },
  headers: {
    'accept': '*/*',
    'content-type': 'application/json',
    'origin': 'https://yt.savetube.me',
    'referer': 'https://yt.savetube.me/',
    'user-agent': 'Postify/1.0.0'
  },
  crypto: {
    hexToBuffer(hexString) {
      const bytes = hexString.match(/.{1,2}/g)
      return Buffer.from(bytes.join(''), 'hex')
    },
    async decrypt(enc) {
      const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
      const data = Buffer.from(enc, 'base64')
      const iv = data.slice(0, 16)
      const content = data.slice(16)
      const key = this.hexToBuffer(secretKey)

      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
      let decrypted = decipher.update(content)
      decrypted = Buffer.concat([decrypted, decipher.final()])

      return JSON.parse(decrypted.toString())
    }
  },
  async getCDN() {
    const { data } = await axios.get(`${this.api.base}${this.api.cdn}`, { headers: this.headers })
    return data.cdn
  },
  extractId(url) {
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /shorts\/([a-zA-Z0-9_-]{11})/
    ]
    for (const r of patterns) {
      const match = url.match(r)
      if (match) return match[1]
    }
    return null
  },
  async info(url) {
    const cdn = await this.getCDN()
    const { data } = await axios.post(`https://${cdn}${this.api.info}`, { url }, { headers: this.headers })
    return await this.crypto.decrypt(data.data)
  },
  async download(url, type = 'video', quality = '720') {
    try {
      const id = this.extractId(url)
      if (!id) throw new Error('No se pudo extraer el ID del video.')

      const cdn = await this.getCDN()
      const info = await this.info(`https://www.youtube.com/watch?v=${id}`)

      const { data: res } = await axios.post(`https://${cdn}${this.api.download}`, {
        id,
        downloadType: type,
        quality,
        key: info.key
      }, { headers: this.headers })

      return {
        status: true,
        title: info.title,
        thumbnail: info.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        duration: info.duration,
        author: info.channel || 'Desconocido',
        quality,
        type,
        url: res.data.downloadUrl
      }
    } catch (e) {
      return { status: false, error: e.message }
    }
  }
}

export default savetube