/*codigo desarrollo por Deylin 
https://github.com/deylin-eliac
no quites créditos y no modifiques el código*/


import fetch from 'node-fetch';
import cheerio from 'cheerio';

let handler = async (m, { conn, text, command }) => {
  if (!text || !/^https?:\/\/\S+/.test(text)) {
    throw `🚫 Enlace inválido. Usa el comando así:\n\n*${command} <enlace del video xxx>*`;
  }

  await m.reply('🔞 Buscando el video...');

  try {
    const url = text.trim();
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);

    let videoUrl = null;


    videoUrl = $('video source').attr('src') || $('video').attr('src');


    if (!videoUrl) {
      const ldJson = $('script[type="application/ld+json"]').html();
      if (ldJson) {
        const json = JSON.parse(ldJson);
        if (json.contentUrl) videoUrl = json.contentUrl;
        if (json.embedUrl && !videoUrl) videoUrl = json.embedUrl;
      }
    }


    if (!videoUrl) {
      const match = html.match(/https?:\/\/[^"' ]+\.mp4/g);
      if (match && match.length > 0) videoUrl = match[0];
    }

    if (!videoUrl) throw '❌ No se encontró el video. El sitio puede estar protegido o haber cambiado.';

    await conn.sendFile(m.chat, videoUrl, 'video.mp4', `✅ Video descargado desde:\n${url}`, m);
  } catch (e) {
    console.error(e);
    m.reply(`⚠️ No se pudo descargar el video:\n${e.message || e}`);
  }
};

handler.command = ['nsfw1'];
handler.tags = ['nsfw'];
handler.help = ['nsfw1'];
handler.register = true
export default handler;