# Seguridad

## La clave de API
- La clave de Anthropic se guarda **solo** como variable de entorno en Vercel (`ANTHROPIC_API_KEY`). Nunca se escribe en el código, en `index.html` ni en archivos del repositorio.
- `.gitignore` bloquea los archivos `.env`. Antes de cada commit revisa que no estés subiendo claves.
- Si una clave se publica por error: revócala de inmediato en console.anthropic.com, crea otra y actualízala en Vercel. Borrar el commit no basta.
- Configura un **límite de gasto mensual** en console.anthropic.com.

## La clave de Stripe
- `STRIPE_SECRET_KEY` se guarda solo como variable de entorno (en Vercel, o en `.env` para pruebas locales). Nunca en el código ni en un chat o correo.
- El servidor calcula el total con sus propios precios: el navegador solo envía qué productos y cuántos.
- Si la clave se expone, genera una nueva en dashboard.stripe.com → Developers → API keys (Roll key).

## Protecciones incluidas
- **El servidor hace su propia búsqueda**: el navegador solo envía la pregunta, así nadie puede usar tu clave para otros fines inyectando contexto falso.
- Instrucciones fijas en el servidor: solo temas de 4Life, sin afirmaciones médicas ni promesas de ganancias, y se ignoran intentos de cambiar las reglas.
- Límites: preguntas de hasta 500 caracteres, máximo 3 turnos de historial, 700 tokens por respuesta y 10 preguntas por minuto por visitante (configurable con `RATE_LIMIT_PER_MIN`). Para tráfico alto, activa también el firewall de Vercel.
- `ALLOWED_ORIGIN` rechaza solicitudes desde otros sitios.
- Encabezados de seguridad (CSP estricta, sin iframes, HSTS, nosniff) en `vercel.json`.
- La página nunca inserta texto recibido como HTML (evita XSS) y no usa cookies ni guarda datos personales.

## Contenido
Los productos 4Life son suplementos para apoyar el sistema inmune. No son medicina y no curan ninguna enfermedad. Cualquier cambio en `assets/kb.js` debe respetar esta regla y las Políticas y Procedimientos de 4Life.

## Reportar un problema
Escribe a la dueña del repositorio por GitHub. No publiques detalles de una vulnerabilidad en un issue público.
