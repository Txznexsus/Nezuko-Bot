import { search, download} from 'aptoide-scraper';

const channelRD = 'https://whatsapp.com/channel/0029Vb6BDQc0lwgsDN1GJ31i';
const itachiIcon = 'https://raw.githubusercontent.com/upcld/dat2/main/uploads/61aa85-1759035553502-file.bin';

let handler = async (m, { conn, usedPrefix, command, text}) => {
  const name = conn.getName(m.sender);

  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    externalAdReply: {
      title: botname,
      body: author,
      thumbnailUrl: itachiIcon,
      sourceUrl: channelRD,
      mediaType: 1,
      renderLargerThumbnail: true,
},
};

  if (!text) {
    return conn.reply(
      m.chat,
      `*[❗] Que apk quieres buscar*`,
      m,
      { contextInfo, quoted: m}
);
}

  try {
    await m.react('🔍');
    conn.reply(
      m.chat,
      `*Buscando aplicaciones espere 🔎*`,
      m,
      { contextInfo, quoted: m}
);

    let results = await search(text);
    if (!results?.length) {
      return conn.reply(
        m.chat,
        `*[❗] No se encontraron resultados intente de nuevo*`,
        m,
        { contextInfo, quoted: m}
);
}

    let data = await download(results[0].id);
    if (!data?.dllink) {
      return conn.reply(
        m.chat,
        `*❌❌❌ ERROR ❌❌❌*`,
        m,
        { contextInfo, quoted: m}
);
}

    const fileSizeMB = parseFloat(data.size.replace(' MB', ''));
    const isTooBig = data.size.includes('GB') || fileSizeMB> 999;

    let caption = `
*Se esta enviando espera*

Nombre: *${data.name}*
Paquete: *${data.package}*
Última actualización: *${data.lastup}*
Tamaño: *${data.size}*

✨ Resultados para ti..`.trim();

    await conn.sendFile(m.chat, data.icon, 'itachi-preview.jpg', caption, m, null, { contextInfo, quoted: m});

    if (isTooBig) {
      return conn.reply(
        m.chat,
        `*Erorr el archivo pesa*: ${data.size}`,
        m,
        { contextInfo, quoted: m}
);
}

    await conn.sendMessage(
      m.chat,
      {
        document: { url: data.dllink},
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${data.name}.apk`,
        caption: `*La descarga fue un éxito ✅*\n> ${data.name}`,
},
      { quoted: m}
);
    m.react('✅');

} catch (error) {
    console.error('Error en Aptoide:', error);
    conn.reply(
      m.chat,
      `*Error*\n> detalles del Error\n\n${error.message}`,
      m,
      { contextInfo, quoted: m}
);
    m.react('❌');
}
};

handler.tags = ['downloader'];
handler.help = ['apk2'];
handler.command = ['apk2', 'modapk', 'aptoide'];
handler.group = true;
handler.register = true;

export default handler;