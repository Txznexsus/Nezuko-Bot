/*import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix }) => {
if (!text) return conn.reply(m.chat, '🍃 Por favor, ingresa un término de búsqueda o el enlace de TikTok.', m)
const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text)
try {
await m.react('🕒')
if (isUrl) {
const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}?hd=1`)
const data = res.data?.data;
if (!data?.play) return conn.reply(m.chat, 'ꕥ Enlace inválido o sin contenido descargable.', m)
const { title, duration, author, created_at, type, images, music, play } = data
const caption = createCaption(title, author, duration, created_at)
if (type === 'image' && Array.isArray(images)) {
const medias = images.map(url => ({ type: 'image', data: { url }, caption }));
await conn.sendSylphy(m.chat, medias, { quoted: m })
if (music) {
await conn.sendMessage(m.chat, { audio: { url: music }, mimetype: 'audio/mp4', fileName: 'tiktok_audio.mp4' }, { quoted: m })
}} else {
await conn.sendMessage(m.chat, { video: { url: play }, caption }, { quoted: m })
}} else {
const res = await axios({ method: 'POST', url: 'https://tikwm.com/api/feed/search', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Cookie': 'current_language=en', 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36' }, data: { keywords: text, count: 20, cursor: 0, HD: 1 }})
const results = res.data?.data?.videos?.filter(v => v.play) || []
if (results.length < 2) return conn.reply(m.chat, 'ꕥ Se requieren al menos 2 resultados válidos con contenido.', m)
const medias = results.slice(0, 10).map(v => ({ type: 'video', data: { url: v.play }, caption: createSearchCaption(v) }))
await conn.sendSylphy(m.chat, medias, { quoted: fkontak })
}
await m.react('✔️')
} catch (e) {
await m.react('✖️')
await conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`, m)
}}
function createCaption(title, author, duration, created_at = '') {
  return `🍃 *Título ›* \`${title || 'No disponible'}\`\n> ✨ Autor › *${author?.nickname || author?.unique_id || 'No disponible'}*\n> 🍟 Duración › *${duration || 'No disponible'}s*${created_at ? `\n> 🌾 Creado » ${created_at}` : ''}\n> 🍓 Música » [${author?.nickname || author?.unique_id || 'No disponible'}] original sound - ${author?.unique_id || 'unknown'}`
}
function createSearchCaption(data) {
  return `🍃 Título › ${data.title || 'No disponible'}\n\n✨ Autor › ${data.author?.nickname || 'Desconocido'} ${data.author?.unique_id ? `@${data.author.unique_id}` : ''}\n🍟 Duración › ${data.duration || 'No disponible'}\n🍓 Música › ${data.music?.title || `[${data.author?.nickname || 'No disponible'}] original sound - ${data.author?.unique_id || 'unknown'}`}`
}

handler.help = ['tiktok', 'tt']
handler.tags = ['download', 'search']
handler.command = ['tiktok', 'tt', 'tiktoks', 'tts']
handler.group = true

export default handler*/

import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix }) => {
if (!text) return conn.reply(m.chat, '🍃 Por favor, ingresa un término de búsqueda o el enlace de TikTok.', m)
const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text)
try {
await m.react('🕒')
if (isUrl) {
const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}?hd=1`)
const data = res.data?.data;
if (!data?.play) return conn.reply(m.chat, 'ꕥ Enlace inválido o sin contenido descargable.', m)
const { title, duration, author, created_at, type, images, music, play, size, play_count, digg_count, comment_count, share_count } = data
const caption = createCaption(title, author, duration, created_at, { size, play_count, digg_count, comment_count, share_count })
if (type === 'image' && Array.isArray(images)) {
const medias = images.map(url => ({ type: 'image', data: { url }, caption }));
await conn.sendSylphy(m.chat, medias, { quoted: m })
if (music) {
await conn.sendMessage(m.chat, { audio: { url: music }, mimetype: 'audio/mp4', fileName: 'tiktok_audio.mp4' }, { quoted: m })
}} else {
await conn.sendMessage(m.chat, { video: { url: play }, caption }, { quoted: m })
}} else {
const res = await axios({ method: 'POST', url: 'https://tikwm.com/api/feed/search', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Cookie': 'current_language=en', 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36' }, data: { keywords: text, count: 20, cursor: 0, HD: 1 }})
const results = res.data?.data?.videos?.filter(v => v.play) || []
if (results.length < 2) return conn.reply(m.chat, 'ꕥ Se requieren al menos 2 resultados válidos con contenido.', m)
const medias = results.slice(0, 10).map(v => ({ type: 'video', data: { url: v.play }, caption: createSearchCaption(v) }))
await conn.sendSylphy(m.chat, medias, { quoted: fkontak })
}
await m.react('✔️')
} catch (e) {
await m.react('✖️')
await conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`, m)
}}
function createCaption(title, author, duration, created_at = '', extra = {}) {
  const { size, play_count, digg_count, comment_count, share_count } = extra
  return `🎬 *Información del Video*\n\n🍃 *Título ›* \`${title || 'No disponible'}\`\n✨ *Autor ›* ${author?.nickname || author?.unique_id || 'No disponible'}\n🍟 *Duración ›* ${duration || 'No disponible'}s${created_at ? `\n🌾 *Creado ›* ${created_at}` : ''}\n🍓 *Música ›* [${author?.nickname || author?.unique_id || 'No disponible'}] original sound - ${author?.unique_id || 'unknown'}\n\n📊 *Estadísticas*\n> 👁️ *Vistas:* ${formatNumber(play_count)}\n> ❤️ *Likes:* ${formatNumber(digg_count)}\n> 💬 *Comentarios:* ${formatNumber(comment_count)}\n> 🔁 *Compartidos:* ${formatNumber(share_count)}\n> 💾 *Tamaño:* ${size ? formatSize(size) : 'Desconocido'}`
}

function createSearchCaption(data) {
  return `🎬 *Título ›* ${data.title || 'No disponible'}\n✨ *Autor ›* ${data.author?.nickname || 'Desconocido'} ${data.author?.unique_id ? `@${data.author.unique_id}` : ''}\n🍟 *Duración ›* ${data.duration || 'No disponible'}s\n🍓 *Música ›* ${data.music?.title || `[${data.author?.nickname || 'No disponible'}] original sound - ${data.author?.unique_id || 'unknown]'}\n\n📊 *Estadísticas*\n> 👁️ *Vistas:* ${formatNumber(data.play_count)}\n> ❤️ *Likes:* ${formatNumber(data.digg_count)}\n> 💬 *Comentarios:* ${formatNumber(data.comment_count)}\n> 🔁 *Compartidos:* ${formatNumber(data.share_count)}``
}

function formatNumber(num) {
  if (!num && num !== 0) return 'No disponible'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toString()
}

function formatSize(bytes) {
  if (!bytes) return '0 MB'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

handler.help = ['tiktok', 'tt']
handler.tags = ['download', 'search']
handler.command = ['tiktok', 'tt', 'tiktoks', 'tts']
handler.group = true

export default handler