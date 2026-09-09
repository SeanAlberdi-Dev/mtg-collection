# 🃏 MTG Collection

Una aplicación local y privada para organizar, digitalizar y consultar mi colección de **Magic: The Gathering**.

Diseñada para usarla cómodamente desde el PC o el móvil, sin depender de servicios de inventario externos.

---

## ✨ Qué permitirá hacer

- 🔎 Buscar cartas por nombre y elegir la edición exacta.
- 🖼️ Consultar artes, texto, tipo, colores, rareza y otros datos mediante [Scryfall](https://scryfall.com/).
- 📦 Registrar cuántas copias tengo de cada carta.
- 🌍 Guardar idioma, acabado (`foil` / normal), estado y ubicación física.
- 🗂️ Organizar cartas por carpeta, caja, mazo o cualquier otra ubicación.
- 📱 Consultar la colección desde PC y móvil.
- 🏠 Editar la colección desde casa.
- 🔒 Consultar la colección fuera de casa en modo solo lectura mediante una conexión privada.

---

## 🔐 Privacidad

La colección se guarda en una base de datos local dentro de mi ordenador.

No habrá cuentas de usuario, publicidad ni sincronización pública. Scryfall se utilizará únicamente para obtener información e imágenes de las cartas.

> Si el ordenador está apagado, la colección no estará disponible de forma remota.

---

## 🛠️ Tecnologías previstas

| Área | Tecnología |
| --- | --- |
| Interfaz | React + TypeScript |
| Servidor local | Node.js |
| Base de datos | SQLite |
| Datos de cartas | Scryfall API |
| Acceso remoto privado | Tailscale |
| Control de versiones | Git + GitHub |

---

## 🗺️ Hoja de ruta

- [ ] Crear la interfaz inicial de la colección.
- [ ] Añadir búsqueda de cartas con Scryfall.
- [ ] Registrar cartas y cantidades.
- [ ] Añadir ubicaciones físicas, idiomas, estado y foil.
- [ ] Crear filtros y búsqueda dentro del inventario.
- [ ] Adaptar la interfaz para móvil.
- [ ] Preparar acceso remoto privado de solo lectura.
- [ ] Añadir copias de seguridad y exportación CSV.

---

## 📌 Estado

🚧 En desarrollo inicial.
