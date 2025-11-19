/*
        * Create By Brayan330
        * Follow https://github.com/El-brayan502 
        * Whatsapp : https://whatsapp.com/channel/0029Vb6BDQc0lwgsDN1GJ31i
*/

import axios from 'axios'
import cheerio from 'cheerio'
import qs from 'qs'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

async function instagramDownloader(url) {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  const data = qs.stringify({
    url: url,
    lang: 'en'
  })

  try {
    const res = await axios.post('https://api.instasave.website/media', data, { headers })
    const html = (res.data.match(/innerHTML\s*=\s*"(.+?)";/s)?.[1] || '').replace(/\\"/g, '"')
    const $ = cheerio.load(html)
    const result = []

    $('.download-items').each((_, el) => {
      const downloadUrl = $(el).find('a[title="Download"]').attr('href')
      const type = $(el).find('.format-icon i').attr('class')?.includes('ivideo') ? 'video' : 'image'
      if (downloadUrl) result.push({ type, url: downloadUrl })
    })

    if (!result.length) throw new Error('No se encontró contenido')
    return result
  } catch (e) {
    throw new Error(e.response?.data || e.message)
  }
}

async function sendCustomPedido(m, conn, texto, imgUrl) {
  try {
    let imgBuffer = null
    try {
      const res = await axios.get(imgUrl, { responseType: 'arraybuffer' })
      imgBuffer = Buffer.from(res.data)
    } catch (e) { console.error(e) }

    const orderMessage = {
      orderId: 'FAKE-' + Date.now(),
      thumbnail: imgBuffer,
      itemCount: 1,
      status: 1,
      surface: 1,
      message: texto,
      orderTitle: 'Canal Oficial',
      token: null,
      sellerJid: null,
      totalAmount1000: '5',
      totalCurrencyCode: 'GTQ',
      contextInfo: {
        externalAdReply: {
          title: botname,
          body: '',
          thumbnailUrl: imgUrl,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }

    const msg = generateWAMessageFromContent(m.chat, { orderMessage }, { quoted: m })
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch (err) {
    console.error(err)
    m.reply('⚠️ Error enviando el pedido.', m)
  }
}

let handler = async (m, { conn, args }) => {
  try {
    const q = m.quoted || m

    if (!args[0]) return sendCustomPedido(m, conn, '*ⓘ* Debes ingresar un enlace de Instagram', 'https://raw.githubusercontent.com/El-brayan502/dat2/main/uploads/f2e604-1763533203774.jpg')

    const url = args[0]
    if (!url.includes('instagram.com')) return sendCustomPedido(m, conn, '*🚫 El enlace no es válido*', 'https://raw.githubusercontent.com/El-brayan502/dat3/main/uploads/40ff49-1763533344428.jpg')

    await sendCustomPedido(m, conn, '*⏳ Descargando contenido de Instagram...*', 'https://raw.githubusercontent.com/El-brayan502/dat3/main/uploads/c18acf-1763533197840.jpg')

    const result = await instagramDownloader(url)

    for (let media of result) {
      if (media.type === 'video') {
        await conn.sendMessage(m.chat, { video: { url: media.url }, caption: '🎥 Video descargado correctamente' }, { quoted: q })
      } else if (media.type === 'image') {
        await conn.sendMessage(m.chat, { image: { url: media.url }, caption: '🖼️ Imagen descargada correctamente' }, { quoted: q })
      }
    }

  } catch (e) {
    await sendCustomPedido(m, conn, `❌ *Error:* ${e.message}`, 'https://raw.githubusercontent.com/El-brayan502/dat3/main/uploads/40ff49-1763533344428.jpg')
  }
}

handler.help = ['igdl', 'instagram']
handler.command = ['igdl', 'ig', 'instagram']
handler.tags = ['downloader']

export default handler