// archivo: sendProductMessage.js
// Requisitos: @whiskeysockets/baileys v4+, node-fetch o axios si vas a descargar miniaturas remotas.
// Uso: .articulo <texto opcional>  -> envía el producto como "pedido enviado por catálogo"

import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import fetch from 'node-fetch' // o axios
import fs from 'fs'

/**
 * handler(m, { conn, args, usedPrefix })
 * - m: mensaje entrante
 * - conn: instancia de baileys
 */
let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    // ejemplo: datos del producto (cámbialos)
    const titulo = 'Camiseta Anime 01'
    const descripcion = 'Camiseta edición limitada - talla M'
    const precio = '0.00' // solo para mostrar; WhatsApp muestra precio en campo, pero puedes dejar 0
    const currencyCode = 'GTQ' // moneda que quieras mostrar
    const productId = 'articulo-001' // id único para tu producto
    const retailerId = 'mi_tienda_01' // id de tienda (arbitrario)
    const externalUrl = 'https://tutienda.com/p/001' // opcional
    const imageUrl = 'https://i.imgur.com/tuMiniatura.jpg' // miniatura pública o ruta local

    // obtener thumbnail (jpeg) — WhatsApp necesita thumbnail pequeña (ej. 300x300)
    let imageBuffer
    if (imageUrl.startsWith('http')) {
      const res = await fetch(imageUrl)
      imageBuffer = await res.arrayBuffer()
      imageBuffer = Buffer.from(imageBuffer)
    } else {
      imageBuffer = fs.readFileSync(imageUrl) // ruta local
    }

    // preparar media para la product image (necesitamos jpegThumbnail dentro del product object)
    // prepareWAMessageMedia retorna objeto util, lo usamos para el messageContent más abajo
    const waMessageMedia = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer })

    // construir el objeto 'product' según esquema esperado por WhatsApp/Baileys
    const product = {
      productImage: {
        // si tienes media ya subido, pon la url; si no, al usar generateWAMessageFromContent con waMessageMedia,
        // Whatsapp usará la thumbnail que pasamos en jpegThumbnail.
        mimetype: 'image/jpeg',
        jpegThumbnail: imageBuffer
      },
      title: titulo,
      description: descripcion,
      retailerId: retailerId,
      // priceAmount1000 es un entero que representa precio * 1000 en algunas implementaciones; si no lo usas acepta strings.
      // para evitar inconsistencias mostraremos currencyCode y un texto en description con el precio.
      currencyCode: currencyCode,
      // un id único por producto (puede ser cualquier string).
      productId: productId,
      url: externalUrl
    }

    // ahora construimos el mensaje productMessage
    const productMessage = {
      productMessage: {
        product: product,
        businessOwnerJid: conn.user && conn.user.id ? conn.user.id : undefined // opcional: el JID del negocio (bot)
      }
    }

    // Podemos envolverlo con un caption o texto adicional en un mensaje separado si quieres.
    // Generar el mensaje final usando generateWAMessageFromContent (más compatible)
    const waMessage = generateWAMessageFromContent(m.chat, {
      ...productMessage
    }, { quoted: m }) // quoted: m para que aparezca como respuesta al mensaje original

    // enviar
    await conn.relayMessage(m.chat, waMessage.message, { messageId: waMessage.key.id })

    // enviar también un texto con botón/explicación (opcional)
    await conn.sendMessage(m.chat, {
      text: `Pedido enviado por catálogo\n\n${titulo}\n${descripcion}\nPrecio: ${currencyCode} ${precio}\n\nPulsa en la tarjeta para ver solicitud.`,
    }, { quoted: waMessage })

  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, { text: `Error al enviar el artículo: ${err.message}` }, { quoted: m })
  }
}

handler.help = ['articulo']
handler.tags = ['shop']
handler.command = /^(articulo|catalogo|producto|pedido)$/i

export default handler