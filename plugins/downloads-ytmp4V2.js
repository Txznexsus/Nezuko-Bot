import fetch from "node-fetch";
import yts from "yt-search";
import axios from "axios";

const ddownr = {
  download: async (url, format) => {
    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
      headers: { "User-Agent": "Mozilla/5.0" }
    };

    const response = await axios.request(config);
    if (!response.data?.success) throw new Error("No se pudo generar la descarga.");

    return await ddownr.cekProgress(response.data.id);
  },

  cekProgress: async (id) => {
    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
      headers: { "User-Agent": "Mozilla/5.0" }
    };

    while (true) {
      const r = await axios.request(config);
      if (r.data?.success && r.data.progress === 1000) {
        return r.data.download_url;
      }
      await new Promise(res => setTimeout(res, 2500));
    }
  }
};

const handler = async (m, { conn, text }) => {
  try {

    if (!text?.trim()) return m.reply("✨ *Escribe el nombre del video que quieres descargar.*", m);

    await conn.sendMessage(m.chat, { react: { text: "🔎", key: m.key } });

    const results = await yts(text);
    if (!results.all?.length) return m.reply("❌ *No encontré nada con ese nombre.*", m);

    const video = results.all[0];
    const { title, url, image, timestamp: duration } = video;

    await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

    const downloadUrl = await ddownr.download(url, "mp4");

    const sizeBytes = await getSize(downloadUrl);
    const sizeText = sizeBytes ? await formatSize(sizeBytes) : "Desconocido";

    const cleanName = title.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_") + ".mp4";

    await conn.sendMessage(
      m.chat,
      {
        video: { url: downloadUrl },
        fileName: cleanName,
        caption:
`🎬 *VIDEO DESCARGADO EXITOSAMENTE*
─────────────────────
📌 *Título:* ${title}
⏳ *Duración:* ${duration}
📦 *Tamaño:* ${sizeText}
🌐 *Fuente:* YouTube
─────────────────────
✨ _${dev}_`,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: "YouTube → MP4 v2",
            mediaUrl: url,
            sourceUrl: url,
            thumbnailUrl: image,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (err) {
    console.error(err);
    m.reply("❌ Ocurrió un error: " + err.message);
  }
};

handler.command = ["ytmp42"];
handler.tags = ["descargas"];
export default handler;


async function getSize(url) {
  try {
    const r = await axios.head(url);
    const length = r.headers["content-length"];
    return length ? parseInt(length) : null;
  } catch {
    return null;
  }
}

async function formatSize(bytes) {
  if (!bytes) return "Desconocido";

  const units = ["B", "KB", "MB", "GB"];
  let i = 0;

  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }

  return `${bytes.toFixed(2)} ${units[i]}`;
}