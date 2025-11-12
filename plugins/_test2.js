import fetch from 'node-fetch';
import cheerio from 'cheerio';

let handler = async (m, { conn, text }) => {
  try {
    if (!text) return conn.reply(m.chat, 'Uso: /apkpure <texto o link>', m);
    m.react('🕒');

    // Si el usuario pega un link directo
    if (text.includes('https://apkpure.com/')) {
      const appUrl = text.trim();
      const info = await getAppInfoFromPage(appUrl);
      if (!info) return conn.reply(m.chat, 'No pude extraer info de la página.', m);

      const { title, packageName, size } = info;

      const cap = `◜ ApkPure - Info ◞

📱 Nombre: ${title}
📦 Package: ${packageName || 'N/A'}
⚖️ Tamaño: ${size || 'N/A'}
🔗 Link: ${appUrl}
`;
      await conn.reply(m.chat, cap, m);

      if (packageName) {
        const downloadUrl = `https://d.apkpure.com/b/APK/${packageName}?version=latest`;
        const infoDl = await probeHead(downloadUrl);
        if (infoDl && infoDl.sizeB && infoDl.sizeB > 500 * 1024 * 1024) {
          return conn.reply(m.chat, `❌ El APK supera 500MB (${infoDl.sizeMB}).`, m);
        }
        await conn.sendFile(m.chat, downloadUrl, `${title}.apk`, '', m, null, {
          asDocument: true,
          mimetype: 'application/vnd.android.package-archive'
        });
        m.react('☑️');
      }
      return;
    }

    // Si es texto: búsqueda interactiva
    m.react('⌚');
    const results = await searchApkpure(text);
    if (!results || !results.length) return conn.reply(m.chat, 'No encontré resultados en APKPure.', m);

    let cap = `◜ ApkPure - Search ◞\n\n`;
    cap += results.map((r, i) => `*${i+1}.* ${r.title}\n   Dev: ${r.developer}\n   Rating: ${r.rating || 'N/A'}`).join('\n\n');
    cap += `\n\nResponde con el número para descargar el APK.`;

    await conn.reply(m.chat, cap, m);

    const filter = (response) => {
      const num = parseInt(response.text);
      return !isNaN(num) && num >= 1 && num <= results.length;
    };

    const collector = conn.collect(m.chat, { filter, time: 30000 });
    collector.on('collect', async (resp) => {
      const index = parseInt(resp.text) - 1;
      const chosen = results[index];
      if (!chosen) return;

      const info = await getAppInfoFromPage(chosen.link);
      if (!info) return conn.reply(m.chat, 'No pude extraer info de la página.', m);

      const { title, packageName, size } = info;
      const downloadUrl = `https://d.apkpure.com/b/APK/${packageName}?version=latest`;
      const infoDl = await probeHead(downloadUrl);
      if (infoDl && infoDl.sizeB && infoDl.sizeB > 500 * 1024 * 1024) {
        return conn.reply(m.chat, `❌ El APK supera 500MB (${infoDl.sizeMB}).`, resp);
      }

      await conn.sendFile(resp.chat, downloadUrl, `${title}.apk`, '', resp, null, {
        asDocument: true,
        mimetype: 'application/vnd.android.package-archive'
      });
      m.react('☑️');
    });

  } catch (err) {
    return conn.reply(m.chat, 'Error interno: ' + (err.message || err), m);
  }
};

export default handler;

handler.help = ['apkpure'];
handler.command = ['apkpure','apkpuredl'];
handler.tags = ['download'];

// --- helpers ---

async function fetchHtml(url){
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://apkpure.com/',
      'Origin': 'https://apkpure.com'
    },
    redirect: 'follow'
  });

  if(!res.ok) throw new Error(`HTTP ${res.status} al acceder a ${url}`);
  return await res.text();
}

async function searchApkpure(query){
  const url = `https://apkpure.com/search?q=${encodeURIComponent(query)}`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const items = [];
  $('.search-dl .search-title a').each((i, el) => {
    const linkPart = $(el).attr('href');
    const title = $(el).text().trim();
    if (linkPart) {
      const link = 'https://apkpure.com' + linkPart;
      const dev = $(el).parent().next('.search-author').text().trim() || 'Desconocido';
      items.push({ title, developer: dev, link });
    }
  });
  return items.slice(0, 8);
}

async function getAppInfoFromPage(appUrl){
  const html = await fetchHtml(appUrl);
  const $ = cheerio.load(html);
  const title = $('div > h1').first().text().trim() || $('h1').text().trim();
  const packageName = (appUrl.split('/')[4]) || $('a[data-package]').attr('data-package') || null;
  const size = $('div.additional .size').text().trim() || $('span:contains("Size")').next().text().trim();
  return { title, packageName, size };
}

async function probeHead(url){
  try {
    const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
    const sizeB = parseInt(res.headers.get('content-length') || '0', 10);
    const sizeMB = (sizeB / (1024*1024)).toFixed(2) + ' MB';
    return { sizeB, sizeMB };
  } catch (e) { return null; }
}