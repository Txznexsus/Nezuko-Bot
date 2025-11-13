import fetch from 'node-fetch'
import Jimp from 'jimp'

const handler = async (m, { args, conn, usedPrefix }) => {
try {
    if (!args[0]) return conn.reply(m.chat, `❀ Por favor, ingresa un enlace de Instagram/Facebook.`, m)

    let data = []
    let thumb = null

    try {
        await m.react('🕒')
        const api = `${global.APIs.vreden.url}/api/igdownload?url=${encodeURIComponent(args[0])}`
        const res = await fetch(api)
        const json = await res.json()
        if (json.resultado?.respuesta?.datos?.length) {
            data = json.resultado.respuesta.datos.map(v => ({ url: v.url, thumbnail: v.thumbnail || null }))
        }
    } catch {}

    if (!data.length) {
        try {
            const api = `${global.APIs.delirius.url}/download/instagram?url=${encodeURIComponent(args[0])}`
            const res = await fetch(api)
            const json = await res.json()
            if (json.status && json.data?.length) {
                data = json.data.map(v => ({ url: v.url, thumbnail: v.thumbnail || null }))
            }
        } catch {}
    }

    if (!data.length) return conn.reply(m.chat, `ꕥ No se pudo obtener el contenido.`, m)

    for (let media of data) {
        try {
            if (media.thumbnail) {
                try {
                    const img = await Jimp.read(media.thumbnail)
                    img.resize(300, Jimp.AUTO).quality(70)
                    thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
                } catch (err) {
                    console.log("⚠️ Error al procesar miniatura:", err.message)
                    thumb = Buffer.alloc(0)
                }
            }

       
            const fileRes = await fetch(media.url)
            const fileBuffer = await fileRes.arrayBuffer()
            const sizeMB = fileBuffer.byteLength / (1024 * 1024)

            if (sizeMB > 100) {
                
                await conn.sendMessage(m.chat, {
                    document: Buffer.from(fileBuffer),
                    fileName: 'video.mp4',
                    mimetype: 'video/mp4',
                    caption: `🍃 Aquí tienes ฅ^•ﻌ•^ฅ.`,
                    ...thumb ? { jpegThumbnail: thumb } : {}
                }, { quoted: m })
            } else {
               
                await conn.sendMessage(m.chat, {
                    video: Buffer.from(fileBuffer),
                    caption: `🍃 Aquí tienes ฅ^•ﻌ•^ฅ.`,
                    ...thumb ? { jpegThumbnail: thumb } : {}
                }, { quoted: m })
            }

            await m.react('✔️')
        } catch (err) {
            await m.react('✖️')
            await conn.reply(m.chat, `⚠︎ Error al enviar el vídeo.\n> Usa *${usedPrefix}report* para informarlo.\n\n${err.message}`, m)
        }
    }

} catch (error) {
    await m.react('✖️')
    await conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`, m, rch)
}}

handler.command = ['instagram', 'ig', 'facebook', 'fb']
handler.tags = ['download']
handler.help = ['instagram', 'ig', 'facebook', 'fb']
handler.group = true
handler.register = true

export default handler