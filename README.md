# Asistente 4Life (RAG)

Asistente web de una distribuidora independiente de 4Life en Chicago. Responde preguntas sobre productos, precios, ingredientes y estrategias de venta usando **RAG** (generación aumentada por recuperación): primero busca en una base de conocimiento propia y luego genera la respuesta citando los fragmentos usados.

Tienda en línea: [www.4life.com/8804287](https://www.4life.com/8804287)

> **Aviso importante:** los productos 4Life son suplementos alimenticios para apoyar el sistema inmune y el bienestar. **No son medicina, no curan ninguna enfermedad** y no sustituyen el consejo de un médico. Estas declaraciones no han sido evaluadas por la FDA. El asistente está programado para respetar esta regla siempre.

## Estructura

```
index.html                 Página principal
assets/styles.css          Estilos (modo claro y oscuro)
assets/app.js              Lógica del navegador
assets/search.js           Búsqueda BM25 (compartida navegador/servidor)
assets/contact.js          Botón y formulario de WhatsApp (312) 399-1218
assets/kb.js               Base de conocimiento (55 fragmentos) ← edita aquí
api/chat.js                Función serverless que llama a Claude de forma segura
data/base_conocimiento_4life.jsonl   La misma base en formato JSONL
tests/search.test.js       Pruebas de la búsqueda
vercel.json                Encabezados de seguridad
.env.example               Variables de entorno (sin valores)
```

## Opción A: sitio completo con respuestas (Vercel, recomendado)

1. Sube estos archivos al repositorio (ver "Subir a GitHub" abajo).
2. Entra a [vercel.com](https://vercel.com), inicia sesión con GitHub y elige **Add New → Project → Import** este repositorio. No cambies la configuración de build.
3. En **Settings → Environment Variables** agrega:
   - `ANTHROPIC_API_KEY`: tu clave de [console.anthropic.com](https://console.anthropic.com).
   - `ALLOWED_ORIGIN`: la dirección final de tu sitio, por ejemplo `https://asistente-4life.vercel.app`.
4. Pulsa **Redeploy**. Listo.

## Opción B: solo búsqueda, gratis (GitHub Pages)

En el repositorio: **Settings → Pages → Source: Deploy from a branch → main / (root)**. El sitio mostrará los fragmentos relevantes para cada pregunta, pero sin respuesta escrita (GitHub Pages no puede guardar la clave de forma segura).

## Subir a GitHub sin usar la terminal

En github.com/salgadomarisabel8-max/4-life → **Add file → Upload files** → arrastra todo el contenido de la carpeta (incluidos `.gitignore` y `.env.example`) → **Commit changes**.

Con terminal:

```bash
git clone https://github.com/salgadomarisabel8-max/4-life.git
cd 4-life
# copia aquí los archivos del proyecto
git add .
git commit -m "Asistente 4Life RAG"
git push origin main
```

## Actualizar la base de conocimiento

Edita `assets/kb.js` (cada fragmento tiene `id`, `cat`, `title`, `text` y `extra` con palabras clave) y ejecuta `npm test` para confirmar que la búsqueda sigue funcionando. Los precios se consultaron en 4life.com en septiembre de 2026; revísalos periódicamente.

## Seguridad

Ver [SECURITY.md](SECURITY.md).
