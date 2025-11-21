import fetch from "node-fetch";
import axios from "axios";

let handler = async (m, { conn, text, args }) => {
  try {
    if (!text) return conn.reply(m.chat, `🌷 *Ingresa la URL del video de YouTube.*`, m);

    await conn.sendMessage(m.chat, { text: `🍃 *Descargando tu video...*` }, { quoted: m });

    if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be/.test(args[0])) {
      return conn.reply(m.chat, `❌ *Enlace inválido.*`, m);
    }

    await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });
    const videoData = await ytdl(args[0]);

    const { title, duration, url } = videoData;
    const size = await getSize(url);
    const sizeStr = size ? await formatSize(size) : 'Desconocido';
    const cleanTitle = title.replace(/[^\w\s]/gi, '').trim().replace(/\s+/g, '_');
    const fileName = `${cleanTitle}.mp4`;
    const caption = `
🎁 *Youtube MP4 V2* ✨
────────────────
☃️ *Título:* ${title}
🦌 *Duración:* ${duration}
🛷 *Tamaño:* ${sizeStr}
────────────────`;

    let head = await fetch(url, { method: "HEAD" });
    let fileSize = head.headers.get("content-length") || 0;
    let fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    if (fileSizeMB >= 100) {
      await conn.sendMessage(m.chat, {
        document: { url },
        mimetype: 'video/mp4',
        fileName,
        caption: `${caption}\n📦 *Enviado como documento (archivo grande)*`
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, {
        video: { url },
        mimetype: 'video/mp4',
        caption
      }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });

  } catch (e) {
    console.error(e);
    m.reply(`❌ *Error:* ${e.message}`);
  }
};

handler.help = ['ytmp4v3 <url>'];
handler.tags = ['download'];
handler.command = ['ytmp4v3','playmp4'];
handler.group = true;

export default handler;


async function ytdl(url) {
  const headers = {
    "accept": "*/*",
    "accept-language": "es-PE,es;q=0.9",
    "sec-fetch-mode": "cors",
    "Referer": "https://id.ytmp3.mobi/"
  };

  const initRes = await fetch(`https://d.ymcdn.org/api/v1/init?p=y&_=${Math.random()}`, { headers });
  const init = await initRes.json();

  const videoId = extractVideoId(url);
  const convertURL = init.convertURL + `&v=${videoId}&f=mp4&_=${Math.random()}`;

  const convertRes = await fetch(convertURL, { headers });
  const convert = await convertRes.json();

  let info = {};
  for (let i = 0; i < 3; i++) {
    const progressRes = await fetch(convert.progressURL, { headers });
    info = await progressRes.json();
    if (info.progress === 3) break;
  }

  return {
    url: convert.downloadURL,
    title: info.title || 'video',
    duration: info.duration || 'Desconocido'
  };
}

function extractVideoId(url) {
  return url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?/]+)/)?.[1];
}

async function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  if (!bytes || isNaN(bytes)) return 'Desconocido';
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

async function getSize(url) {
  try {
    const res = await axios.head(url);
    const length = res.headers['content-length'];
    return length ? parseInt(length, 10) : null;
  } catch {
    return null;
  }
}