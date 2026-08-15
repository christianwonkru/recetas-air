# RECETAS AIR

Recetario personal y responsive para air fryer. Funciona completamente en el navegador, sin cuentas, servidores ni servicios de pago. Las recetas se guardan en el almacenamiento local del dispositivo.

También es una PWA instalable en iPhone y funciona sin conexión después de abrirla al menos una vez con internet.

## Arquitectura

- **React + TypeScript + Vite** para una interfaz rápida y una base tipada y mantenible.
- **Persistencia local** en `localStorage` (`src/storage.ts`).
- **Modelo y categorías** centralizados en `src/types.ts`.
- **Parser local** basado en secciones y patrones en `src/parser.ts`; no envía el texto fuera del navegador.
- **Copias automáticas** cada 20 minutos mientras la aplicación permanece abierta, con historial de 36 versiones, restauración y exportación/importación JSON.
- **Fotografías por receta**, tomadas con la cámara o elegidas de la fototeca y comprimidas automáticamente antes de guardarse.
- Componentes separados para listado, detalle, formulario e importación.

## Ejecutar

Necesitas Node.js 20 o posterior.

```bash
npm install
npm run dev
```

Abre la dirección que muestre Vite (normalmente `http://localhost:5173`).

## Comprobar y publicar

```bash
npm test
npm run build
npm run preview
```

La carpeta `dist/` resultante se puede publicar gratis en GitHub Pages, Netlify, Cloudflare Pages o cualquier alojamiento estático.

> Los datos pertenecen al navegador y dispositivo actuales. Borrar los datos del navegador elimina las recetas; para sincronización entre dispositivos haría falta añadir una capa de exportación/importación o un backend.
