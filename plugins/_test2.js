import fetch from "node-fetch";

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) return m.reply("❗ Ingresa un enlace de TikTok.\n\nEjemplo:\n*tiktok https://vm.tiktok.com/xxxx/*");

    let url = encodeURIComponent(args[0]);
    let api = `https://api-shadowxyz.vercel.app/download/tiktok?url=${url}`;

    m.reply("⏳ Descargando el video, espera...");

    // Obtener info de la API
    let res = await fetch(api);
    let json = await res.json();

    if (!json.status) return m.reply("❌ No se pudo descargar el video.");

    // Primera URL de descarga
    let dl = json.data.urls[0];
    let title = json.data.metadata?.title || "tiktok_video";

    // Descargar el buffer del video
    let vid = await fetch(dl);
    let buffer = await vid.buffer();

    // Enviar el video como DOCUMENTO
    await conn.sendMessage(
      m.chat,
      {
        document: buffer,
        mimetype: "video/mp4",
        fileName: title.replace(/[^a-zA-Z0-9]/g, "_") + ".mp4"
      },
      { quoted: m }
    );

  } catch (err) {
    console.error(err);
    m.reply("❌ Error descargando el video.");
  }
};

handler.help = ["tiktok2 <url>"];
handler.tags = ["downloader"];
handler.command = /^(tt2)$/i;

export default handler;