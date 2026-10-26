# PROMPT DE ARRANQUE PARA EL DÍA DEL EXAMEN

**ATENCIÓN, IA (Antigravity):** Estás a punto de ayudarme a resolver una prueba de desempeño fullstack. No tienes memoria de nuestros chats anteriores, por lo que este archivo y los otros 3 archivos de la raíz son tu única fuente de verdad.

## 📁 TU CONTEXTO (Los 3 archivos base)
1. `SPEC.md`: Reglas de negocio de referencia y el esquema Prisma de un simulacro de subastas.
2. `ARSENAL_BACKEND.md`: Código fuente de Auth (JWT, cookies), Prisma y Proxy, ya compilado y probado.
3. `ARSENAL_UI.md`: Componentes reutilizables (Countdown anti-hidratación, tarjetas) y Seed.

## 🎯 TU MISIÓN
El profesor me acaba de dar un NUEVO enunciado (lo pegaré a continuación). Tu trabajo es construir la app para ESE nuevo enunciado, **pero reutilizando la arquitectura de los archivos base**. No quiero que inventes la rueda.

## 🛠️ REGLAS DE ADAPTACIÓN
*   **Copia y pega sin miedo:** Usa `lib/auth.ts`, las rutas de `/api/auth/*`, el `proxy.ts` y el componente `Countdown` EXACTAMENTE como están en el arsenal. Son universales.
*   **Adapta la Base de Datos:** Mira el `schema.prisma` del `SPEC.md` como referencia, pero cámbialo para que encaje con el nuevo enunciado (ej. si ahora son películas, crea modelos `Movie` y `Ticket`, en vez de `Auction` y `Bid`).
*   **Adapta la Lógica Transaccional:** Si el nuevo examen pide reservas o compras, usa el mismo patrón de `prisma.$transaction` y validación estricta del archivo `ARSENAL_BACKEND.md`.
*   **Adapta la UI:** Renombra `AuctionCard` por algo como `ItemCard` o `TicketCard` y ajústalo a los nuevos datos.

## 🚀 PLAN DE EJECUCIÓN (Hazlo paso a paso)
1. **Fase 1:** Lee el nuevo enunciado, hazme un resumen de las entidades y propón el nuevo `schema.prisma`.
2. **Fase 2:** Copia la carpeta `api/auth` y el `proxy.ts` del arsenal.
3. **Fase 3:** Crea los endpoints del nuevo negocio (usando transacciones si es necesario).
4. **Fase 4:** Crea los layouts y componentes visuales reutilizando el arsenal.
5. **Fase 5:** Crea el `seed.ts` para poblar la base de datos.

---
**EL NUEVO ENUNCIADO ES EL SIGUIENTE:**
[Aquí yo (el humano) pegaré el texto de mi examen]
