// archivo: articulo.js
// Envia un mensaje tipo "pedido enviado por catálogo" (con imagen y detalles)
// Compatible con Baileys (MD o MultiDevice)

import fetch from 'node-fetch'
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // =============================
    // 🔧 CONFIGURA TU PRODUCTO AQUÍ
    // =============================

    const titulo = 'Nagi Seishiro ⚽' // título del artículo
    const descripcion = 'Figura edición especial - Blue Lock' // descripción
    const precio = '0.00' // solo decorativo
    const moneda = 'GTQ'
    const productId = 'nagi-001'
    const retailerId = 'nagi_store'
    const imageUrl = 'https://files.catbox.moe/fft2hr.jpg' // tu imagen
    const externalUrl = 'https://example.com/nagi' // opcional (link al producto)

    // Descarga la imagen
    const res = await fetch(imageUrl)
    const imageBuffer = Buffer.from(await res.arrayBuffer())

    // Prepara la miniatura (thumbnail)
    const waMedia = await prepareWAMessageMedia(
      { image: imageBuffer },
      { upload: conn.waUploadToServer }
    )

    // Construye el objeto del producto
    const product = {
      productImage: {
        mimetype: 'image/jpeg',
        jpegThumbnail: imageBuffer
      },
      title: titulo,
      description: descripcion,
      currencyCode: moneda,
      priceAmount1000: '0',
      retailerId,
      productId,
      url: externalUrl
    }

    // Crea el mensaje tipo "product"
    const message = generateWAMessageFromContent(m.chat, {
      productMessage: {
        product,
        businessOwnerJid: conn.user.id
      }
    }, { quoted: m })

    // Envía el mensaje de producto
    await conn.relayMessage(m.chat, message.message, { messageId: message.key.id })

    // Texto opcional adicional (como en el ejemplo)
    await conn.sendMessage(m.chat, {
      text: `🛍️ *Pedido enviado por catálogo*\n\n${titulo}\n${descripcion}\n💰 ${moneda} ${precio}\n\nToca la tarjeta para ver solicitud.`,
    }, { quoted: message })

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '⚠️ Error al enviar el artículo: ' + e.message, m)
  }
}

handler.help = ['articulo']
handler.tags = ['shop']
handler.command = /^(articulo|producto|catalogo)$/i

export default handler