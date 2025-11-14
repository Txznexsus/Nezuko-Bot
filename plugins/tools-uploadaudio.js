import fetch from 'node-fetch'
import { writeFile, unlink, readFile } from 'fs/promises'
import { join } from 'path'
import { fileTypeFromBuffer } from 'file-type'
import baileys from '@whiskeysockets/baileys'

const { generateWAMessageFromContent, generateWAMessageContent, proto } = baileys

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { text: '⛅ *Subiendo archivo... espera uwu*', quoted: m })
    await m.react('🌫️')

    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    if (!mime) return m.reply('🌧️ *Responde a un archivo o media para subirlo.*')

    const media = await q.download()
    if (!media) return m.reply('⛈️ *Error al descargar el archivo.*')

    const uploads = []

    // Servidores.  👻
    const up1 = await uploaderCloudStack(media).catch(() => null)
    if (up1) uploads.push({ name: '☁️ CloudStack', url: up1 })

    const up2 = await uploaderCloudGuru(media).catch(() => null)
    if (up2) uploads.push({ name: '🌀 CloudGuru', url: up2 })

    const up3 = await uploaderCloudCom(media).catch(() => null)
    if (up3) uploads.push({ name: '🌐 CloudImages', url: up3 })

    const catbox = await uploadCatbox(media).catch(() => null)
    if (catbox) uploads.push({ name: '📦 Catbox', url: catbox })

    const zeroSt = await upload0x0(media).catch(() => null)
    if (zeroSt) uploads.push({ name: '⚡ 0x0.st', url: zeroSt })

    const fileio = await uploadFileIO(media).catch(() => null)
    if (fileio) uploads.push({ name: '📁 File.io', url: fileio })

    const tmpfiles = await uploadTmpFiles(media).catch(() => null)
    if (tmpfiles) uploads.push({ name: '🕓 TmpFiles', url: tmpfiles })

    const imgbb = await uploadImgBB(media).catch(() => null)
    if (imgbb) uploads.push({ name: '🖼️ ImgBB', url: imgbb })

    if (uploads.length === 0)
      return m.reply('⛈️ *No se pudo subir a ningún servidor.*')

    let info = `☁️ *Resultado de Subida*\n━━━━━━━━━━━━━━━━━━━\n\n`
    uploads.forEach(s => {
      info += `*${s.name}*\n🔗 ${s.url}\n\n`
    })

    const thumb = uploads[0].url

    const { imageMessage } = await generateWAMessageContent(
      { image: { url: thumb } },
      { upload: conn.waUploadToServer }
    )

    const buttons = [
      {
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({
          display_text: "📋 Copiar URL Principal",
          copy_code: uploads[0].url
        })
      }
    ]

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            header: proto.Message.InteractiveMessage.Header.fromObject({
              hasMediaAttachment: true,
              imageMessage
            }),
            body: proto.Message.InteractiveMessage.Body.fromObject({
              text: info
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons
            })
          })
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: '⛈️ *Ocurrió un error inesperado.*',
      quoted: m
    })
  }
}

handler.help = ['url']
handler.tags = ['tools']
handler.command = ['url']
handler.limit = true
handler.register = true

export default handler


async function uploadTo(url, buffer) {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || {}
  if (!ext || !mime) throw new Error('Formato no reconocido.')

  const tempPath = join('./tmp', `upload.${ext}`)
  await writeFile(tempPath, buffer)
  const fileData = await readFile(tempPath)

  const form = new FormData()
  form.append('file', new File([fileData], `upload.${ext}`, { type: mime }))

  try {
    const res = await fetch(url, { method: 'POST', body: form })
    const json = await res.json()
    await unlink(tempPath).catch(() => null)

    if (!json?.data?.url) throw new Error()
    return json.data.url

  } catch {
    await unlink(tempPath).catch(() => null)
    return null
  }
}

const uploaderCloudStack = b => uploadTo('https://phpstack-1487948-5667813.cloudwaysapps.com/upload.php', b)
const uploaderCloudGuru = b => uploadTo('https://cloudkuimages.guru/upload.php', b)
const uploaderCloudCom = b => uploadTo('https://cloudkuimages.com/upload.php', b)


async function uploadCatbox(buffer) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', new Blob([buffer]))

  const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form })
  const url = await res.text()
  return url.startsWith('http') ? url : null
}

async function upload0x0(buffer) {
  const form = new FormData()
  form.append('file', new Blob([buffer]))
  const r = await fetch('https://0x0.st', { method: 'POST', body: form })
  const tx = await r.text()
  return tx.includes('http') ? tx.trim() : null
}

async function uploadFileIO(buffer) {
  const form = new FormData()
  form.append('file', new Blob([buffer]))
  const r = await fetch('https://file.io', { method: 'POST', body: form })
  const j = await r.json()
  return j?.link || null
}

async function uploadTmpFiles(buffer) {
  const form = new FormData()
  form.append('file', new Blob([buffer]))
  const r = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: form })
  const j = await r.json()
  return j?.data?.url || null
}

/
const imgbbKey = 'YOUR_KEY'
async function uploadImgBB(buffer) {
  if (!imgbbKey) return null

  const base64 = buffer.toString('base64')
  const form = new FormData()
  form.append('key', imgbbKey)
  form.append('image', base64)

  const r = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form })
  const j = await r.json()

  return j?.data?.url || null
}