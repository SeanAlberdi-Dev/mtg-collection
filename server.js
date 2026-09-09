"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const dbDirectory = path.join(ROOT, "data");
fs.mkdirSync(dbDirectory, { recursive: true });

const db = new DatabaseSync(path.join(dbDirectory, "collection.sqlite"));
db.exec(`
  CREATE TABLE IF NOT EXISTS collection_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    set_name TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT 'English',
    finish TEXT NOT NULL DEFAULT 'normal',
    condition TEXT NOT NULL DEFAULT 'Near Mint',
    location TEXT NOT NULL DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);
const existingColumns = db.prepare("PRAGMA table_info(collection_cards)").all().map((column) => column.name);
if (!existingColumns.includes("image_url")) db.exec("ALTER TABLE collection_cards ADD COLUMN image_url TEXT NOT NULL DEFAULT ''");
if (!existingColumns.includes("back_image_url")) db.exec("ALTER TABLE collection_cards ADD COLUMN back_image_url TEXT NOT NULL DEFAULT ''");

const listCards = db.prepare(`
  SELECT id, name, set_name AS setName, language, finish, condition, location, quantity, image_url AS imageUrl, back_image_url AS backImageUrl
  FROM collection_cards
  ORDER BY name COLLATE NOCASE, id DESC
`);
const addCard = db.prepare(`
  INSERT INTO collection_cards (name, set_name, language, finish, condition, location, quantity, image_url, back_image_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const updateCardImages = db.prepare("UPDATE collection_cards SET image_url = ?, back_image_url = ? WHERE id = ?");
const deleteCard = db.prepare("DELETE FROM collection_cards WHERE id = ?");

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let data = "";
    request.on("data", (chunk) => {
      data += chunk;
      if (data.length > 50_000) request.destroy();
    });
    request.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("El cuerpo de la petición no es JSON válido."));
      }
    });
    request.on("error", reject);
  });
}

function text(value, maxLength = 120) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isLocalNetwork(address) {
  const ip = (address || "").replace("::ffff:", "");
  return ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") ||
    ip.startsWith("10.") || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip);
}

function sendFile(response, fileName, contentType) {
  fs.readFile(path.join(ROOT, "public", fileName), (error, file) => {
    if (error) return sendJson(response, 500, { error: "No se pudo cargar la interfaz." });
    response.writeHead(200, { "Content-Type": contentType });
    response.end(file);
  });
}

async function scryfallJson(endpoint) {
  try {
    const response = await fetch(`https://api.scryfall.com${endpoint}`, {
      signal: AbortSignal.timeout(5_000),
      headers: {
        "Accept": "application/json;q=0.9,*/*;q=0.8",
        "User-Agent": "MTG-Collection-local/0.1 (personal collection manager)",
      },
    });
    if (!response.ok) throw new Error("Scryfall no ha podido encontrar esa carta ahora mismo.");
    return response.json();
  } catch (error) {
    if (error.name === "TimeoutError") throw new Error("Scryfall ha tardado demasiado en responder. Inténtalo de nuevo.");
    throw error;
  }
}

async function fillMissingImages(cards) {
  for (const card of cards) {
    if (card.imageUrl && (card.backImageUrl || card.backImageUrl === "")) continue;
    try {
      const result = await scryfallJson(`/cards/named?exact=${encodeURIComponent(card.name)}`);
      const imageUrl = result.image_uris?.normal || result.card_faces?.[0]?.image_uris?.normal || "";
      const backImageUrl = result.card_faces?.[1]?.image_uris?.normal || "";
      if (imageUrl || backImageUrl) {
        updateCardImages.run(imageUrl, backImageUrl, card.id);
        card.imageUrl = imageUrl;
        card.backImageUrl = backImageUrl;
      }
    } catch {
      // Las cartas no encontradas se mantienen visibles sin imagen.
    }
  }
  return cards;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  console.log(`${new Date().toISOString()} ${request.socket.remoteAddress} ${request.method} ${url.pathname}`);

  if (request.method === "GET" && url.pathname === "/api/health") {
    return sendJson(response, 200, { ok: true, writable: isLocalNetwork(request.socket.remoteAddress) });
  }
  if (request.method === "GET" && url.pathname === "/api/cards") {
    return sendJson(response, 200, { cards: await fillMissingImages(listCards.all()) });
  }
  if (request.method === "GET" && url.pathname === "/api/card-suggestions") {
    const query = text(url.searchParams.get("q"), 80);
    if (query.length < 2) return sendJson(response, 200, { suggestions: [] });
    try {
      const result = await scryfallJson(`/cards/autocomplete?q=${encodeURIComponent(query)}`);
      return sendJson(response, 200, { suggestions: (result.data || []).slice(0, 12) });
    } catch (error) {
      return sendJson(response, 502, { error: error.message, suggestions: [] });
    }
  }
  if (request.method === "GET" && url.pathname === "/api/card-details") {
    const name = text(url.searchParams.get("name"), 120);
    if (!name) return sendJson(response, 400, { error: "Falta el nombre de la carta." });
    try {
      const card = await scryfallJson(`/cards/named?exact=${encodeURIComponent(name)}`);
      const imageUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || "";
      const backImageUrl = card.card_faces?.[1]?.image_uris?.normal || "";
      return sendJson(response, 200, { name: card.name, setName: card.set_name || "", imageUrl, backImageUrl });
    } catch (error) {
      return sendJson(response, 404, { error: error.message });
    }
  }
  if (request.method === "GET" && url.pathname === "/api/card-printings") {
    const name = text(url.searchParams.get("name"), 120);
    if (!name) return sendJson(response, 400, { error: "Falta el nombre de la carta." });
    try {
      const query = `!\"${name.replaceAll("\"", "")}\"`;
      const result = await scryfallJson(`/cards/search?unique=prints&order=released&dir=desc&q=${encodeURIComponent(query)}`);
      const editions = [...new Set((result.data || []).map((card) => card.set_name).filter(Boolean))].slice(0, 30);
      return sendJson(response, 200, { editions });
    } catch (error) {
      return sendJson(response, 404, { error: error.message, editions: [] });
    }
  }
  if (request.method === "POST" && url.pathname === "/api/cards") {
    if (!isLocalNetwork(request.socket.remoteAddress)) return sendJson(response, 403, { error: "Solo se puede editar desde la red local." });
    try {
      const input = await readJson(request);
      const card = {
        name: text(input.name),
        setName: text(input.setName),
        language: text(input.language, 40) || "English",
        finish: input.finish === "foil" ? "foil" : "normal",
        condition: text(input.condition, 40) || "Near Mint",
        location: text(input.location),
        quantity: Number(input.quantity),
        imageUrl: text(input.imageUrl, 500),
        backImageUrl: text(input.backImageUrl, 500),
      };
      if (!card.name) return sendJson(response, 400, { error: "El nombre es obligatorio." });
      if (!Number.isInteger(card.quantity) || card.quantity < 1 || card.quantity > 9999) {
        return sendJson(response, 400, { error: "La cantidad debe ser un número entre 1 y 9999." });
      }
      const result = addCard.run(card.name, card.setName, card.language, card.finish, card.condition, card.location, card.quantity, card.imageUrl, card.backImageUrl);
      return sendJson(response, 201, { id: Number(result.lastInsertRowid) });
    } catch (error) {
      return sendJson(response, 400, { error: error.message || "No se pudo guardar la carta." });
    }
  }
  if (request.method === "DELETE" && /^\/api\/cards\/\d+$/.test(url.pathname)) {
    if (!isLocalNetwork(request.socket.remoteAddress)) return sendJson(response, 403, { error: "Solo se puede editar desde la red local." });
    const id = Number(url.pathname.split("/").pop());
    deleteCard.run(id);
    return sendJson(response, 204, {});
  }
  if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    return sendFile(response, "index.html", "text/html; charset=utf-8");
  }
  if (request.method === "GET" && url.pathname === "/app.js") return sendFile(response, "app.js", "text/javascript; charset=utf-8");
  if (request.method === "GET" && url.pathname === "/styles.css") return sendFile(response, "styles.css", "text/css; charset=utf-8");
  return sendJson(response, 404, { error: "No encontrado." });
});

server.listen(PORT, HOST, () => {
  console.log(`MTG Collection disponible en http://localhost:${PORT}`);
  console.log("Para abrirla en el móvil, usa la IP local de este ordenador y el mismo puerto.");
});
