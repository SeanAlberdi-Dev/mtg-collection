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

