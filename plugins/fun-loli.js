import fetch from 'node-fetch';

let handler = async(m, { conn, usedPrefix, command }) => {

m.react('🕑');
let img = 'https://delirius-apiofc.vercel.app/anime/loli';

m.react('✔️');
conn.sendMessage(m.chat, { 
        image: { url: img }, 
        caption: '> ' + textbot, 
    }, { quoted: fkontak });
}

handler.help = ['loli'];
handler.tags = ['anime', 'fun'];
handler.command = ['loli', 'lolis'];

export default handler;