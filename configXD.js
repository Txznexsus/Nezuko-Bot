import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.botNumber = ""  //Ejemplo: 51919199620

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.owner = [
"51939260696",  //   ᚽᛘᛇ.ᚻᛊᚷᛇ𐌵ᛇ
"51971285104",
"51970874076",
"51919199620"
]

global.suittag = ["51939260696"] 
global.prems = ["51939260696"]

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.libreria = "Baileys Multi Device"
global.vs = "^1.8.2 • Latest"
global.nameqr = "ᥒᥱzᥙk᥆-ᑲ᥆𝗍 mძ"
global.sessions = "Sessions/Principal"
global.jadi = "Sessions/SubBot"
global.kanekiAIJadibts = true

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.botname = "ɴᴇᴢᴜᴋᴏ-ʙᴏᴛ ᴍᴅ 🍃"
global.textbot = "🧃 ɴᴇᴢᴜᴋᴏ-ʙᴏᴛ ✧ ᴍᴀᴅᴇ ʙʏ ɪᴛᴢ. ɴᴇxᴢᴜs"
global.dev = "© թօաҽɾҽժ ᑲᥡ і𝗍z.ᥒᥱ᥊zᥙs"
global.author = "© mᥲძᥱ ᥕі𝗍һ ᑲᥡ і𝗍z.ᥒᥱ᥊zᥙs"
global.etiqueta = "⊹ і𝗍z.ᥒᥱ᥊zᥙs"

global.currency = "¥enes"
global.banner = "https://files.catbox.moe/l4l40l.jpg"
global.icono2 = "https://files.catbox.moe/mpkduo.jpg"
global.logo = "https://files.catbox.moe/9yxzua.jpg"

global.catalogo = fs.readFileSync('./lib/catalogo.jpg')

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.group = "https://whatsapp.com/channel/0029Vb5l5w1CHDyjovjN8s2V"
global.community = "https://whatsapp.com/channel/0029Vb5l5w1CHDyjovjN8s2V"
global.channel = "https://whatsapp.com/channel/0029Vb5l5w1CHDyjovjN8s2V"
global.github = "https://github.com/"
global.gmail = "suport@gmail.com"
global.ch = {
ch1: "120363401983007420@newsletter"
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.APIs = {
xyro: { url: "https://xyro.site", key: null },
yupra: { url: "https://api.yupra.my.id", key: null },
vreden: { url: "https://api.vreden.web.id", key: null },
delirius: { url: "https://api.delirius.store", key: null },
zenzxz: { url: "https://api.zenzxz.my.id", key: null },
siputzx: { url: "https://api.siputzx.my.id", key: null },
adonix: { url: "https://api-adonix.ultraplus.click", key: 'the.shadow' }
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'configXD.js'"))
import(`${file}?update=${Date.now()}`)
})
