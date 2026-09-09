const form = document.querySelector("#card-form");
const cardsList = document.querySelector("#cards");
const total = document.querySelector("#total");
const message = document.querySelector("#message");
const filter = document.querySelector("#filter");
const template = document.querySelector("#card-template");
const nameInput = form.elements.name;
const setNameInput = form.elements.setName;
const imageUrlInput = form.elements.imageUrl;
const suggestions = document.querySelector("#card-suggestions");
const editionSuggestions = document.querySelector("#edition-suggestions");
const languageValue = document.querySelector("#language-value");
const languageTrigger = document.querySelector("#language-trigger");
const languageOptions = document.querySelector("#language-options");
const backImageUrlInput = form.elements.backImageUrl;
const imageDialog = document.querySelector("#image-dialog");
const largeImage = document.querySelector("#large-image");
const imageDialogTitle = document.querySelector("#image-dialog-title");
const closeViewer = document.querySelector(".close-viewer");
const flipViewer = document.querySelector("#flip-viewer");
let cards = [];
let searchTimer;
let latestQuery = "";
let viewerImages = [];
let viewerIndex = 0;
const languages = [["English", "Inglés"], ["Spanish", "Español"], ["French", "Francés"], ["German", "Alemán"], ["Italian", "Italiano"], ["Portuguese", "Portugués"], ["Japanese", "Japonés"], ["Chinese Simplified", "Chino simplificado"], ["Chinese Traditional", "Chino tradicional"], ["Korean", "Coreano"], ["Russian", "Ruso"], ["Latin", "Latín"], ["Ancient Greek", "Griego antiguo"], ["Arabic", "Árabe"], ["Hebrew", "Hebreo"], ["Phyrexian", "Pirexiano"], ["Sanskrit", "Sánscrito"]];

function render() {
  const query = filter.value.trim().toLocaleLowerCase();
  const visible = cards.filter((card) => [card.name, card.setName, card.location].join(" ").toLocaleLowerCase().includes(query));
  cardsList.replaceChildren();
  for (const card of visible) {
    const item = template.content.cloneNode(true);
    item.querySelector(".name").textContent = `${card.quantity}× ${card.name}`;
    item.querySelector(".details").textContent = [card.setName, card.language, card.finish, card.condition, card.location].filter(Boolean).join(" · ");
    const image = item.querySelector(".image");
    const art = item.querySelector(".card-art");
    const artButton = item.querySelector(".art-button");
    const flipButton = item.querySelector(".flip");
    const images = [card.imageUrl, card.backImageUrl].filter(Boolean);
    artButton.disabled = !images.length;
    artButton.addEventListener("click", () => openViewer(card.name, images));
    flipButton.hidden = images.length < 2;
    flipButton.addEventListener("click", () => openViewer(card.name, images, 1));
    if (card.imageUrl) {
      image.src = card.imageUrl;
      image.alt = card.name;
      image.addEventListener("error", () => {
        image.remove();
        art.textContent = "🃏";
        artButton.disabled = true;
      }, { once: true });
    }
    else { image.remove(); art.textContent = "🃏"; }
    item.querySelector(".remove").addEventListener("click", async () => { await fetch(`/api/cards/${card.id}`, { method: "DELETE" }); await load(); });
    cardsList.append(item);
  }
  total.textContent = `${cards.reduce((sum, card) => sum + card.quantity, 0)} cartas · ${cards.length} registros`;
}

async function load() { const response = await fetch("/api/cards"); cards = (await response.json()).cards; render(); }

function updateViewer() {
  largeImage.src = viewerImages[viewerIndex];
  largeImage.alt = imageDialogTitle.textContent;
  flipViewer.hidden = viewerImages.length < 2;
  flipViewer.textContent = viewerIndex ? "Mostrar frente" : "Mostrar reverso";
}
function openViewer(name, images, index = 0) {
  if (!images.length) return;
  viewerImages = images;
  viewerIndex = index;
  imageDialogTitle.textContent = name;
  updateViewer();
  imageDialog.showModal();
}
function closeImageViewer() { imageDialog.close(); }
closeViewer.addEventListener("click", closeImageViewer);
flipViewer.addEventListener("click", () => { viewerIndex = viewerIndex ? 0 : 1; updateViewer(); });
imageDialog.addEventListener("click", (event) => { if (event.target === imageDialog) closeImageViewer(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && imageDialog.open) closeImageViewer(); });

form.addEventListener("submit", async (event) => {
  event.preventDefault(); message.textContent = "Guardando…";
  const body = Object.fromEntries(new FormData(form));
  if (!body.imageUrl && body.name.trim()) {
    try {
      const response = await fetch(`/api/card-details?name=${encodeURIComponent(body.name.trim())}`);
      if (response.ok) {
        const card = await response.json();
        body.imageUrl = card.imageUrl || "";
        body.backImageUrl = card.backImageUrl || "";
        if (!body.setName.trim()) body.setName = card.setName || "";
      }
    } catch { /* La carta se puede guardar aunque Scryfall no esté disponible. */ }
  }
  body.quantity = Number(body.quantity);
  const response = await fetch("/api/cards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) { message.textContent = result.error || "No se pudo guardar."; return; }
  form.reset(); form.elements.quantity.value = 1; imageUrlInput.value = ""; backImageUrlInput.value = ""; languageValue.value = "English"; languageTrigger.innerHTML = "Inglés <span>⌄</span>"; form.elements.condition.value = "Near Mint";
  message.textContent = "Carta guardada."; await load();
});

function hideSuggestions() { setTimeout(() => { suggestions.hidden = true; editionSuggestions.hidden = true; }, 180); }
function optionButton(label, callback) {
  const button = document.createElement("button");
  button.type = "button"; button.className = "suggestion-option"; button.textContent = label;
  button.addEventListener("mousedown", (event) => { event.preventDefault(); callback(); });
  return button;
}
async function showEditions(name) {
  editionSuggestions.replaceChildren();
  try {
    const response = await fetch(`/api/card-printings?name=${encodeURIComponent(name)}`);
    const result = await response.json();
    if (!response.ok || !result.editions?.length) return;
    editionSuggestions.append(...result.editions.map((edition) => optionButton(edition, () => {
      setNameInput.value = edition; editionSuggestions.hidden = true;
    })));
    editionSuggestions.hidden = false;
  } catch { /* La edición puede escribirse a mano si Scryfall no está disponible. */ }
}
async function chooseCard(name) {
  nameInput.value = name; imageUrlInput.value = ""; suggestions.hidden = true;
  try {
    const response = await fetch(`/api/card-details?name=${encodeURIComponent(name)}`);
    if (response.ok) {
      const card = await response.json(); nameInput.value = card.name; imageUrlInput.value = card.imageUrl || ""; backImageUrlInput.value = card.backImageUrl || "";
      if (!setNameInput.value.trim()) setNameInput.value = card.setName;
      await showEditions(card.name);
    }
  } catch { /* El registro manual sigue disponible. */ }
}

nameInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  const query = nameInput.value.trim();
  latestQuery = query;
  if (query.length < 2) { suggestions.replaceChildren(); return; }
  searchTimer = setTimeout(async () => {
    try {
      const response = await fetch(`/api/card-suggestions?q=${encodeURIComponent(query)}`);
      const result = await response.json();
      if (latestQuery !== query) return;
      suggestions.replaceChildren(...(result.suggestions || []).map((name) => optionButton(name, () => chooseCard(name))));
      suggestions.hidden = !result.suggestions?.length;
    } catch { /* La aplicación sigue funcionando aunque no haya conexión a Scryfall. */ }
  }, 300);
});

nameInput.addEventListener("blur", hideSuggestions);
setNameInput.addEventListener("focus", () => { if (editionSuggestions.childElementCount) editionSuggestions.hidden = false; });
setNameInput.addEventListener("blur", hideSuggestions);
languageOptions.append(...languages.map(([value, label]) => optionButton(label, () => {
  languageValue.value = value; languageTrigger.innerHTML = `${label} <span>⌄</span>`; languageOptions.hidden = true; languageTrigger.setAttribute("aria-expanded", "false");
})));
languageTrigger.addEventListener("click", () => { const show = languageOptions.hidden; languageOptions.hidden = !show; languageTrigger.setAttribute("aria-expanded", String(show)); });
document.addEventListener("click", (event) => { if (!event.target.closest("label")) { languageOptions.hidden = true; languageTrigger.setAttribute("aria-expanded", "false"); } });
filter.addEventListener("input", render);
load();
