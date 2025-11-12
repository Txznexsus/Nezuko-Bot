import fetch from 'node-fetch';

let selectionTemp = {}; // Gu

let handler = async (m, { conn, text }) => {
  try {
    if (!text) return conn.reply(m.chat, '🌿 Uso: /apkpure <texto o link>', m, rcanal);

    if (text.includes('https://apkpure.com/')) {
      const apiUrl = `https://api.siputzx.my.id/api/apk/apkpure?search=${encodeURIComponent(text)}`;
      const infoRes = await fetch(apiUrl).then(res => res.json());
      if (!infoRes.status || !infoRes.data || !infoRes.data.length) 
        return conn.reply(m.chat, '🍃 No pude obtener info de la app.', m);

      const app = infoRes.data[0];
      const cap = `
🌱 Nombre: ${app.title}
🌿 Dev: ${app.developer}
🌸 Rating: ${app.rating?.score || 'N/A'}
🍁 Tamaño: ${app.fileSize || 'Desconocido'}
🍀 Link: ${app.link}
`;
      const sentMsg = await conn.reply(m.chat, cap, m);

      if (app.downloadLink) {
        await conn.sendFile(m.chat, app.downloadLink, `${app.title}.apk`, '', m, null, {
          asDocument: true,
          mimetype: 'application/vnd.android.package-archive'
        });
      }
      return;
    }

    const searchUrl = `https://api.siputzx.my.id/api/apk/apkpure?search=${encodeURIComponent(text)}`;
    const res = await fetch(searchUrl).then(r => r.json());
    if (!res.status || !res.data || !res.data.length) return conn.reply(m.chat, '🍃 No encontré resultados.', m);

    const results = res.data.slice(0, 8);
    let cap = '🌿 ApkPure - Search 🌿\n\n';
    cap += results.map((v, i) => `*${i+1}.* ${v.title}\n   🌱 Dev: ${v.developer}\n   🌸 Rating: ${v.rating?.score || 'N/A'}`).join('\n\n');
    cap += `\n\n🍃 Responde con el número (1-${results.length}) para descargar el APK.`;

    const sentMsg = await conn.reply(m.chat, cap, m);

    selectionTemp[m.chat] = {
      results,
      timestamp: Date.now()
    };

  } catch (err) {
    return conn.reply(m.chat, '🍂 Error interno: ' + (err.message || err), m);
  }
};


handler.listener = async (m, { conn }) => {
  try {
    const temp = selectionTemp[m.chat];
    if (!temp) return; // No hay búsqueda pendiente en este chat

    const num = parseInt(m.text);
    if (isNaN(num) || num < 1 || num > temp.results.length) return; // No es un número válido

    const app = temp.results[num - 1];
    if (!app) return;

    const detailRes = await fetch(`https://api.siputzx.my.id/api/apk/apkpure?search=${encodeURIComponent(app.link)}`).then(r => r.json());
    const appDetail = detailRes.data?.[0];
    if (!appDetail) return conn.reply(m.chat, '🍃 No pude obtener info de la app.', m);

    const cap = `
🌱 Nombre: ${appDetail.title}
🌿 Dev: ${appDetail.developer}
🌸 Rating: ${appDetail.rating?.score || 'N/A'}
🍁 Tamaño: ${appDetail.fileSize || 'Desconocido'}
🍀 Link: ${appDetail.link}
`;
    await conn.reply(m.chat, cap, m);

    if (appDetail.downloadLink) {
      await conn.sendFile(m.chat, appDetail.downloadLink, `${appDetail.title}.apk`, '', m, null, {
        asDocument: true,
        mimetype: 'application/vnd.android.package-archive'
      });
    }

    delete selectionTemp[m.chat];

  } catch (err) {
    return conn.reply(m.chat, '🍂 Error interno: ' + (err.message || err), m);
  }
};

handler.help = ['apkpure'];
handler.command = ['apkpure','apkpuredl'];
handler.tags = ['download'];

export default handler;