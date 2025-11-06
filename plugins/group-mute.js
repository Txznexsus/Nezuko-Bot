import fetch from 'node-fetch';

const handler = async (m, { conn, command, text, isAdmin }) => {
  if (command === 'mute') {
    if (!isAdmin) throw '🌳 *Solo un administrador puede ejecutar este comando*';

    const ownerId = global.owner[0][0] + '@s.whatsapp.net';
    if (m.mentionedJid?.[0] === ownerId) throw '🍬 *El creador del bot no puede ser mutado*';

    let target = m.mentionedJid?.[0] || m.quoted?.sender || text;
    if (target === conn.user.jid) throw '🍭 *No puedes mutar el bot*';

    const groupMetadata = await conn.groupMetadata(m.chat);
    const groupOwnerId = groupMetadata?.participants?.[0]?.id || target;

    let userData = global.db.data.users[target];

    if (userData?.mute === true) throw '🍭 *Este usuario ya ha sido mutado*';

    const msg = {
      key: {
        participants: '0@s.whatsapp.net',
        fromMe: false,
        id: 'Halo'
      },
      message: {
        locationMessage: {
          name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 mutado',
          jpegThumbnail: await (await fetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')).buffer(),
          vcard: `BEGIN:VCARD
VERSION:3.0
N:;Unlimited;;;
FN:Unlimited
ORG:Unlimited
TITLE:
item1.TEL;waid=19709001746:+1 (970) 900-1746
item1.X-ABLabel:Unlimited
X-WA-BIZ-DESCRIPTION:ofc
X-WA-BIZ-NAME:Unlimited
END:VCARD`
        }
      },
      participant: '0@s.whatsapp.net'
    };

    conn.reply(m.chat, '*Tus mensajes serán eliminados*', msg, null, { mentions: [target] });
    global.db.data.users[target].mute = true;

  } else if (command === 'unmute') {
    if (!isAdmin) throw '🍬 *Solo un administrador puede ejecutar este comando*';

    let target = m.mentionedJid?.[0] || m.quoted?.sender || text;
    let userData = global.db.data.users[target];

    if (target === conn.user.jid) throw '🍭 *No puedes mutar el bot*';
    if (userData?.mute === false) throw '🍭 *Este usuario no ha sido mutado*';

    const msg = {
      key: {
        participants: '0@s.whatsapp.net',
        fromMe: false,
        id: 'Halo'
      },
      message: {
        locationMessage: {
          name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 demutado',
          jpegThumbnail: await (await fetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')).buffer(),
          vcard: `BEGIN:VCARD
VERSION:3.0
N:;Unlimited;;;
FN:Unlimited
ORG:Unlimited
TITLE:
item1.TEL;waid=19709001746:+1 (970) 900-1746
item1.X-ABLabel:Unlimited
X-WA-BIZ-DESCRIPTION:ofc
X-WA-BIZ-NAME:Unlimited
END:VCARD`
        }
      },
      participant: '0@s.whatsapp.net'
    };

    global.db.data.users[target].mute = false;
    conn.reply(m.chat, '*Tus mensajes no serán eliminados*', msg, null, { mentions: [target] });
  }
};

handler.command = ['mute', 'unmute'];
handler.rowner = false;
handler.admin = true;
handler.botAdmin = true;

export default handler;