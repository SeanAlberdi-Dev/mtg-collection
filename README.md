# MTG Collection

Aplicación local para registrar y consultar una colección de Magic: The Gathering.

## Primer arranque

1. Abre PowerShell dentro de esta carpeta.
2. Ejecuta `node server.js`.
3. Abre `http://localhost:3000` en el ordenador.

La base de datos se crea automáticamente en `data/collection.sqlite`. Es privada y está ignorada por Git.

## Qué incluye esta primera versión

- Una base de datos SQLite local.
- Registro de cartas por nombre, edición, idioma, acabado, estado, ubicación y cantidad.
- Vista y eliminación de registros.
- Servidor accesible desde la red doméstica para el siguiente paso: uso desde el móvil.

## Siguiente fase

Con el núcleo comprobado, añadiremos búsqueda con Scryfall, diseño móvil, PWA offline y la sincronización de solo lectura para cuando el móvil esté fuera de casa.

# 🃏 MTG Collection

Una aplicación local, privada y preparada para móvil para organizar, digitalizar y consultar una colección de **Magic: The Gathering**.

El código del proyecto es público para recibir ideas y contribuciones; los datos reales de la colección permanecen siempre privados.

---

## ✨ Funciones previstas

- 🔎 Buscar cartas por nombre y elegir su impresión exacta.
- 🖼️ Ver arte, reglas, tipo, colores, rareza, edición y otros datos mediante [Scryfall](https://scryfall.com/).
- 📦 Registrar cuántas copias hay de cada carta.
- 🌍 Guardar idioma, acabado (`foil` / normal), estado y ubicación física.
- 🗂️ Organizar cartas por carpeta, caja, mazo o cualquier otra ubicación.
- 💻 Consultar y gestionar la colección desde el PC.
- 📱 Usar la aplicación cómodamente desde el móvil.
- 📴 Consultar la última copia sincronizada en el móvil incluso sin internet o con el PC apagado.

---

## 📱 Uso en móvil

La aplicación estará diseñada primero para móvil y podrá añadirse a la pantalla de inicio como una app.

Cuando el móvil esté conectado a la red de casa, podrá sincronizar una copia local de la colección. Después será posible revisarla fuera de casa sin necesitar que el PC esté encendido.

> La consulta offline mostrará la última versión sincronizada. Para ver cambios nuevos, habrá que volver a sincronizar en casa.

---

## 🔐 Privacidad

La colección principal se guardará únicamente en una base de datos local dentro del ordenador.

- No habrá cuentas de usuario ni inventarios alojados en la nube.
- Scryfall se utilizará únicamente para consultar datos e imágenes de las cartas.
- La base de datos personal, las copias de seguridad y cualquier configuración privada nunca se subirán a GitHub.
- El repositorio público contiene solamente el código y la documentación del proyecto.

---

## 🛠️ Tecnologías previstas

| Área | Tecnología |
| --- | --- |
| Interfaz | React + TypeScript |
| Aplicación móvil | PWA |
| Servidor local | Node.js |
| Base de datos principal | SQLite |
| Copia offline del móvil | IndexedDB |
| Datos e imágenes de cartas | Scryfall API |
| Control de versiones | Git + GitHub |

---

## 🗺️ Hoja de ruta

- [ ] Crear la interfaz inicial de la colección.
- [ ] Diseñar la base de datos local.
- [ ] Añadir búsqueda e información de cartas con Scryfall.
- [ ] Registrar cartas, cantidades y ediciones.
- [ ] Añadir idioma, estado, foil y ubicación física.
- [ ] Crear filtros y búsqueda dentro del inventario.
- [ ] Adaptar por completo la interfaz a móvil.
- [ ] Permitir instalar la aplicación como PWA.
- [ ] Añadir sincronización local PC → móvil.
- [ ] Permitir consulta offline de la colección en móvil.
- [ ] Añadir exportación CSV y copias de seguridad.

---

## 🤝 Contribuir

Las ideas y sugerencias son bienvenidas.

- Abre un **Issue** para proponer una función o informar de un error.
- Usa **Discussions** para preguntas e ideas generales.
- Puedes crear un **Pull Request** si quieres proponer cambios en el código.

Todas las contribuciones se revisarán antes de incorporarse al proyecto.

---

## 📌 Estado

🚧 Proyecto en fase inicial de planificación.
