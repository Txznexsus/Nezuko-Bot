// - 𝙲𝙾𝙳𝙸𝙶𝙾 𝙲𝚁𝙴𝙰𝙳𝙾 𝚇 𝚂𝙷𝙰𝙳𝙾𝚆-𝙽𝙴𝚇 𝚇𝙳 👑
// - https://github.com/Shadow-nex/
// - 𝙽𝙾 𝙴𝙳𝙸𝚃𝙰𝚁 𝙴𝙻 𝙲𝙾𝙳𝙸𝙶𝙾 

import fetch from 'node-fetch'
import Jimp from 'jimp'
import axios from 'axios'
import crypto from 'crypto'

const getFileSize = async (url) => {
  try {
    const head = await fetch(url, { method: "HEAD" });
    const size = head.headers.get("content-length");
    if (!size) return "Desconocido";

    let mb = (Number(size) / 1024 / 1024).toFixed(2);
    return `${mb} MB`;
  } catch {
    return "Desconocido";
  }
};

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
    hexToBuffer: (hexString) => {
      const matches = hexString.match(/.{1,2}/g);
      return Buffer.from(matches.join(''), 'hex');
    },
    decrypt: async (enc) => {
      const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
      const data = Buffer.from(enc, 'base64');
      const iv = data.slice(0, 16);
      const content = data.slice(16);
      const key = savetube.crypto.hexToBuffer(secretKey);

      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
      let decrypted = decipher.update(content);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return JSON.parse(decrypted.toString());
    }
  },

  isUrl: str => { try { new URL(str); return true } catch { return false } },

  youtube: url => {
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];
    for (let regex of patterns) if (regex.test(url)) return url.match(regex)[1];
    return null;
  },

  request: async (endpoint, data = {}, method = 'post') => {
    try {
      const { data: response } = await axios({
        method,
        url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
        data: method === 'post' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers: savetube.headers
      });
      return { status: true, code: 200, data: response };
    } catch (error) {
      return { status: false, code: error.response?.status || 500, error: error.message };
    }
  },

  getCDN: async () => {
    const response = await savetube.request(savetube.api.cdn, {}, 'get');
    if (!response.status) return response;
    return { status: true, code: 200, data: response.data.cdn };
  },

  download: async (link, quality = '480') => {

    if (!link) return { status: false, code: 400, error: "Falta el enlace de YouTube." };
    if (!savetube.isUrl(link)) return { status: false, code: 400, error: "URL inválida de YouTube." };

    const id = savetube.youtube(link);
    if (!id) return { status: false, code: 400, error: "No se pudo extraer el ID del video." };

    try {
      const cdnRes = await savetube.getCDN();
      if (!cdnRes.status) return cdnRes;

      const cdn = cdnRes.data;

      const infoRes = await savetube.request(`https://${cdn}${savetube.api.info}`, {
        url: `https://www.youtube.com/watch?v=${id}`
      });

      if (!infoRes.status) return infoRes;

      const decrypted = await savetube.crypto.decrypt(infoRes.data.data);

      const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
        id,
        downloadType: 'video',
        quality,
        key: decrypted.key
      });

      return {
        status: true,
        code: 200,
        result: {
          title: decrypted.title || "Desconocido",
          thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
          download: dl.data.data.downloadUrl,
          duration: decrypted.duration,
          quality,
          id
        }
      };

    } catch (error) {
      return { status: false, code: 500, error: error.message };
    }
  }
};

let handler = async (m, { conn, args }) => {

  const Shadow_url = await (await fetch("https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763384842220_234152.jpeg")).buffer()
  const fkontak = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast"
    },
    message: {
      productMessage: {
        product: {
          productImage: {
            mimetype: "image/jpeg",
            jpegThumbnail: Shadow_url
          },
          title: "🌳 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀 🌳",
          description: "",
          currencyCode: "USD",
          priceAmount1000: 100000,
          retailerId: "descarga-premium"
        },
        businessOwnerJid: "51919199620@s.whatsapp.net"
      }
    }
  }

  let q = args.join(" ").trim()
  if (!q)
    return conn.sendMessage(m.chat, { text: `*☃️ Ingresa el nombre del video a descargar.*` }, { quoted: m })

  await conn.sendMessage(m.chat, { text: `> ☕ \`𝗜𝗡𝗜𝗖𝗜𝗔𝗡𝗗𝗢 𝗣𝗥𝗢𝗖𝗘𝗦𝗢 𝗗𝗘 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔 :𝗗\`` }, { quoted: m })

  try {
    let res = await fetch(`https://api.delirius.store/search/ytsearch?q=${encodeURIComponent(q)}`)
    let json = await res.json()
    if (!json.status || !json.data.length)
      return conn.sendMessage(m.chat, { text: `No encontré resultados para *${q}*.` }, { quoted: m })

    let vid = json.data[0]

    let info = await savetube.download(vid.url, '480')
    if (!info.status)
      return conn.sendMessage(m.chat, { text: `⚠️ No se pudo obtener el video de *${vid.title}*.` }, { quoted: m })

    let { result } = info
    let size = await getFileSize(result.download)

    const vistas = formatViews(vid.views)

    let caption = `
┌── 「 🌲 YOUTUBE MP4 DOC 」──┐
│ 🌿 *Título:* ${result.title}
│ 🍂 *Duración:* ${vid.duration}
│ 🦦 *ID:* ${vid.videoId}
│ ❄️ *Vistas:* ${vistas}
│ 🎍 *Publicado:* ${vid.publishedAt}
│ 🍃 *Tamaño:* ${size}
│ 🪶 *Canal:* ${vid.author?.name || "Desconocido"}
│ 🌤️ *Calidad:* ${result.quality}P
│ 🌱 *Link:* ${vid.url}
└─────────────────────────┘

🪺💚 *Proceso completado.*
> 🪵 𝐊𝐚𝐧𝐞𝐤𝐢 𝐁𝐨𝐭 - 𝐕3 • 𝐝𝐯.𝐬𝐡𝐚𝐝𝐨𝐰.𝐱𝐲𝐳`.trim()

    let thumb = null
    try {
      const img = await Jimp.read(result.thumbnail)
      img.resize(500, Jimp.AUTO)
      thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch { }

    await conn.sendMessage(m.chat, {
      document: { url: result.download },
      mimetype: "video/mp4",
      fileName: `${result.title}.mp4`,
      caption,
      ...(thumb ? { jpegThumbnail: thumb } : {}),
      contextInfo: {
        externalAdReply: {
          title: result.title,
          body: "",
          mediaUrl: vid.url,
          sourceUrl: vid.url,
          thumbnailUrl: result.thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: fkontak })

  } catch (err) {
    conn.sendMessage(m.chat, { text: `💔 Error: ${err.message}` }, { quoted: m })
  }
}

handler.command = ['ytmp4doc', 'ytvdoc', 'ytdoc']
handler.help = ['ytmp4doc']
handler.tags = ['download']
export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
}