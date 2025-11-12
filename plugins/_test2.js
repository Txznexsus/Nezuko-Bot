// file: pelicula_dl.js
import fetch from "node-fetch";

/**
 * Requisitos (instalar):
 * npm i node-fetch
 *
 * Exporta un handler compatible con tu framework de comandos (Baileys).
 *
 * ENV:
 * process.env.TMDB_KEY -> tu API Key v3 de TMDb
 *
 * Flujo:
 * - .peli <titulo>  -> busca en TMDb y lista resultados
 * - Responder al mensaje listado con el número (ej: "1") -> muestra detalles
 * - Si existe copia legal en Internet Archive, lista archivos descargables
 * - Responder con número de archivo -> descarga y envía como documento
 */

// Util helpers
const tmdbSearch = async (query) => {
  const key = process.env.TMDB_KEY;
  if (!key) throw new Error("Falta TMDB_KEY en variables de entorno");
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  return await res.json();
};

const tmdbDetail = async (id) => {
  const key = process.env.TMDB_KEY;
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${key}`;
  const res = await fetch(url);
  return await res.json();
};

// Busca en Internet Archive por título, devuelve items relevantes
const iaSearch = async (title) => {
  // busqueda simple por title; flteamos por media type "movies" o "movies" en collection
  const q = encodeURIComponent(`title:("${title}") AND (format:(MPEG4) OR format:(Ogg) OR mediatype:movies)`);
  const url = `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier, title, creator, mediatype, format, publicdate, rights&rows=10&page=1&output=json`;
  const res = await fetch(url);
  const j = await res.json();
  return j.response?.docs || [];
};

// Obtener archivos de un item de IA
const iaFiles = async (identifier) => {
  const url = `https://archive.org/metadata/${identifier}`;
  const res = await fetch(url);
  const j = await res.json();
  return j.files || [];
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(
    `🔥 Usa: ${usedPrefix + command} <título de película>\nEjemplo: ${usedPrefix + command} Metropolis`
  );

  try {
    // Paso 1: buscar en TMDb
    await m.react("🔎");
    const results = await tmdbSearch(text);
    const items = results.results || [];
    if (!items.length) return m.reply("❌ No encontré esa película en TMDb.");

    // Limitar a primeros 10
    const list = items.slice(0, 10).map((it, i) => {
      return `\`${i+1}\` • ${it.title} (${it.release_date ? it.release_date.slice(0,4) : "N/A"}) — id:${it.id}`;
    }).join("\n");

    const caption = `乂 *PELICULAS - SEARCH*\n\n${list}\n\nResponde a este mensaje con el número de la película que quieres (ej: 1).`;
    const sent = await conn.sendMessage(m.chat, { text: caption }, { quoted: m });

    // Guardar sesión
    conn.peliSessions = conn.peliSessions || {};
    conn.peliSessions[m.sender] = {
      stage: "CHOOSING_MOVIE",
      choices: items.slice(0, 10),
      key: sent.key,
      timeout: setTimeout(() => delete conn.peliSessions[m.sender], 600_000) // 10 min
    };

    await m.react("🎬");
  } catch (err) {
    console.error("Error peli handler:", err);
    m.reply("⚠️ Error buscando la película: " + err.message);
  }
};

handler.before = async (m, { conn }) => {
  conn.peliSessions = conn.peliSessions || {};
  const session = conn.peliSessions[m.sender];
  if (!session || !m.quoted || m.quoted.id !== session.key.id) return;

  // Si estamos esperando selección de película
  if (session.stage === "CHOOSING_MOVIE") {
    const sel = parseInt(m.text.trim());
    if (isNaN(sel) || sel < 1 || sel > session.choices.length) {
      return m.reply("❌ Respuesta inválida. Envía el número de la película de la lista.");
    }

    const movie = session.choices[sel - 1];
    // obtener detalle TMDb y buscar en Internet Archive
    await m.react("⌛");
    const details = await tmdbDetail(movie.id);
    const title = details.title || movie.title;
    const overview = details.overview || "Sin sinopsis.";

    // buscar en Internet Archive
    const iaItems = await iaSearch(title);

    let caption = `🎬 *${title}*\n\n${overview}\n\n`;
    if (iaItems.length === 0) {
      caption += `❌ No se encontraron copias legales en Internet Archive para "${title}".\n` +
                 `Puedes abrir el enlace en TMDb para ver plataformas oficiales.`;
      await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
      clearTimeout(session.timeout);
      delete conn.peliSessions[m.sender];
      return;
    }

    // Filtrar por derechos (solo Public Domain / Creative Commons)
    const legalItems = iaItems.filter(it => {
      const r = (it.rights || "").toLowerCase();
      return r.includes("public domain") || r.includes("creative commons");
    });

    if (!legalItems.length) {
      caption += `⚠️ Se encontraron items en archive.org pero no indican "Public Domain" ni "Creative Commons".\n` +
                 `No puedo continuar por legalidad.`;
      await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
      clearTimeout(session.timeout);
      delete conn.peliSessions[m.sender];
      return;
    }

    // Mostrar lista de items para descargar
    caption += `✅ Copias legales encontradas en Internet Archive:\n\n`;
    legalItems.forEach((it, idx) => {
      caption += `\`${idx+1}\` • ${it.title} — id:${it.identifier || it.identifier}\n    rights: ${it.rights || "N/A"}\n`;
    });
    caption += `\nResponde a este mensaje con el número del item para listar archivos y descargar.`;

    const sent = await conn.sendMessage(m.chat, { text: caption }, { quoted: m });

    // Actualizar sesión
    session.stage = "CHOOSING_IA_ITEM";
    session.movie = { info: details, title };
    session.legalItems = legalItems;
    session.key = sent.key;

    return;
  }

  // Si estamos esperando selección de item de IA
  if (session.stage === "CHOOSING_IA_ITEM") {
    const sel = parseInt(m.text.trim());
    if (isNaN(sel) || sel < 1 || sel > session.legalItems.length) {
      return m.reply("❌ Respuesta inválida. Envía el número del item de la lista.");
    }

    const item = session.legalItems[sel - 1];
    await m.react("⌛");
    const files = await iaFiles(item.identifier || item.id || item.identifier);
    // filtrar formatos video mp4, ogv, webm, mpeg
    const vids = (files || []).filter(f => {
      const name = (f.name || "").toLowerCase();
      return name.endsWith(".mp4") || name.endsWith(".ogv") || name.endsWith(".webm") || name.endsWith(".mpeg") || (f.format && f.format.toLowerCase().includes("mpeg4"));
    });

    if (!vids.length) {
      await conn.sendMessage(m.chat, { text: "❌ No hay archivos de video listados para ese item." }, { quoted: m });
      clearTimeout(session.timeout);
      delete conn.peliSessions[m.sender];
      return;
    }

    let cap = `📦 Archivos disponibles para: ${item.title}\n\n`;
    vids.forEach((v, i) => {
      cap += `\`${i+1}\` • ${v.name} — ${v.size ? (v.size/1024/1024).toFixed(2)+" MB" : "tamaño N/A"}\n`;
    });
    cap += `\nResponde con el número del archivo para descargarlo (ej: 1).`;

    const sent = await conn.sendMessage(m.chat, { text: cap }, { quoted: m });

    session.stage = "CHOOSING_FILE";
    session.selectedItem = item;
    session.files = vids;
    session.key = sent.key;
    return;
  }

  // Si estamos esperando selección de archivo para descargar
  if (session.stage === "CHOOSING_FILE") {
    const sel = parseInt(m.text.trim());
    if (isNaN(sel) || sel < 1 || sel > session.files.length) {
      return m.reply("❌ Respuesta inválida. Envía el número del archivo.");
    }

    const file = session.files[sel - 1];
    const identifier = session.selectedItem.identifier || session.selectedItem.id || session.selectedItem.identifier;
    // URL pública directa: https://archive.org/download/{identifier}/{filename}
    const url = `https://archive.org/download/${identifier}/${encodeURIComponent(file.name)}`;

    await m.reply(`📥 Descargando "${file.name}" desde Internet Archive (legal). Esto puede demorar dependiendo del tamaño.`);
    await m.react("📥");

    session.downloading = true;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error al descargar archivo: ${res.status}`);
      const buffer = await res.arrayBuffer();
      // enviar como documento
      await conn.sendMessage(
        m.chat,
        { document: Buffer.from(buffer), fileName: file.name, mimetype: "video/mp4" },
        { quoted: m }
      );
      await m.react("✅");
    } catch (err) {
      console.error("Error descargar IA file:", err);
      await m.reply("⚠️ Error al descargar el archivo: " + err.message);
    }

    clearTimeout(session.timeout);
    delete conn.peliSessions[m.sender];
    return;
  }
};

handler.command = ["peli", "pelicula", "pelidownload"];
handler.tags = ["download"];
handler.help = ["peli <titulo>"];

export default handler;