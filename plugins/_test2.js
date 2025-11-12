import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    if (!text) return conn.reply(m.chat, 'Uso: /apkpure <texto o link>', m);
    m.react('🕒');

    // Si el usuario pega un link directo
    if (text.includes('https://apkpure.com/')) {
      const apiUrl = `https://api.siputzx.my.id/api/apk/apkpure?search=${encodeURIComponent(text)}`;
      const infoRes = await fetch(apiUrl).then(res => res.json());
      if (!infoRes.status || !infoRes.data || !infoRes.data.length) return conn.reply(m.chat, 'No pude obtener info de la app.', m);

      const app = infoRes.data[0];
      const cap = `
📱 Nombre: ${app.title}
👨‍💻 Dev: ${app.developer}
⭐ Rating: ${app.rating?.score || 'N/A'}
⚖️ Tamaño: ${app.fileSize || 'Desconocido'}
📲 Link: ${app.link}
`;
      await conn.reply(m.chat, cap, m);

      if (app.downloadLink) {
        await conn.sendFile(m.chat, app.downloadLink, `${app.title}.apk`, '', m, null, {
          asDocument: true,
          mimetype: 'application/vnd.android.package-archive'
        });
        m.react('☑️');
      }
      return;
    }

    // Si es texto: búsqueda interactiva
    m.react('⌚');
    const searchUrl = `https://api.siputzx.my.id/api/apk/apkpure?search=${encodeURIComponent(text)}`;
    const res = await fetch(searchUrl).then(r => r.json());
    if (!res.status || !res.data || !res.data.length) return conn.reply(m.chat, 'No encontré resultados.', m);

    const results = res.data.slice(0, 8);
    let cap = '◜ ApkPure - Search ◞\n\n';
    cap += results.map((v, i) => `*${i+1}.* ${v.title}\n   Dev: ${v.developer}\n   ⭐ ${v.rating?.score || 'N/A'}`).join('\n\n');
    cap += `\n\nResponde con el número para descargar el APK.`;
    await conn.reply(m.chat, cap, m);

    const filter = (resp) => {
      const num = parseInt(resp.text);
      return !isNaN(num) && num >= 1 && num <= results.length;
    };

    const collector = conn.collect(m.chat, { filter, time: 30000 });
    collector.on('collect', async (resp) => {
      const index = parseInt(resp.text) - 1;
      const app = results[index];
      if (!app) return;

      const appDetailRes = await fetch(`https://api.siputzx.my.id/api/apk/apkpure?search=${encodeURIComponent(app.link)}`).then(r => r.json());
      const appDetail = appDetailRes.data?.[0];
      if (!appDetail) return conn.reply(m.chat, 'No pude obtener info de la app.', resp);

      const cap2 = `
📱 Nombre: ${appDetail.title}
👨‍💻 Dev: ${appDetail.developer}
⭐ Rating: ${appDetail.rating?.score || 'N/A'}
⚖️ Tamaño: ${appDetail.fileSize || 'Desconocido'}
📲 Link: ${appDetail.link}
`;
      await conn.reply(resp.chat, cap2, resp);

      if (appDetail.downloadLink) {
        await conn.sendFile(resp.chat, appDetail.downloadLink, `${appDetail.title}.apk`, '', resp, null, {
          asDocument: true,
          mimetype: 'application/vnd.android.package-archive'
        });
        m.react('☑️');
      }
    });

  } catch (err) {
    return conn.reply(m.chat, 'Error interno: ' + (err.message || err), m);
  }
};

export default handler;

handler.help = ['apkpure'];
handler.command = ['apkpure','apkpuredl'];
handler.tags = ['download'];