# ProyectaLia Hub – Backend

Este es el backend de **ProyectaLia Hub**, una plataforma para conectar estudiantes y fomentar la colaboración en proyectos innovadores.

## 🚀 Tecnologías principales

- **Node.js 20+** – Entorno de ejecución
- **Express** – Framework web
- **TypeScript** – Tipado estático y seguridad
- **Prisma ORM** – Acceso y migración de base de datos
- **SQLite** – Base de datos por defecto (puedes cambiar el provider en `prisma/schema.prisma`)
- **JWT** – Autenticación segura
- **bcryptjs** – Hash de contraseñas
- **dotenv** – Variables de entorno

## 📁 Estructura principal

```
backend/
  src/
    controllers/   # Lógica de negocio y endpoints
    routes/        # Definición de rutas Express
    middlewares/   # Middlewares (auth, errores, etc.)
    lib/           # Prisma y utilidades
    models/        # (Opcional) Modelos adicionales
    prisma/        # Configuración y seed de base de datos
    ...
  prisma/
    migrations/    # Migraciones de base de datos
    schema.prisma  # Esquema principal
  .env             # Variables de entorno
```

## 🛠️ Scripts útiles

- `npm run dev` – Inicia el servidor en modo desarrollo (hot reload)
- `npm run build` – Compila el código TypeScript
- `npm start` – Ejecuta el servidor compilado
- `npm run prisma:migrate` – Ejecuta migraciones de base de datos
- `npm run prisma:studio` – Abre Prisma Studio (GUI para la base de datos)
- `npm run prisma:seed` – Ejecuta el seed de datos de prueba

> **Requisitos:** Node.js 20+, npm o pnpm, `.env` con configuración de base de datos y JWT

## ⚙️ Configuración

1. Copia `.env.example` a `.env` y ajusta las variables:
   - `DATABASE_URL` (por defecto SQLite, puedes usar PostgreSQL, MySQL, etc.)
   - `JWT_SECRET` (clave secreta para JWT)
2. Instala dependencias: `npm install` o `pnpm install`
3. Ejecuta migraciones: `npm run prisma:migrate`
4. (Opcional) Ejecuta el seed: `npm run prisma:seed`
5. Inicia el servidor: `npm run dev`

## 🌟 Buenas prácticas

- **Tipado estricto:** Usa TypeScript en todos los controladores y rutas.
- **Validación:** Valida datos de entrada en endpoints críticos.
- **Autenticación:** Usa JWT y el middleware de autenticación para rutas protegidas.
- **Prisma:** Prefiere consultas tipadas y relaciones explícitas.
- **Logs:** Usa logs claros para errores y eventos importantes.
- **Modularidad:** Mantén controladores y rutas organizados por dominio.

## 🧩 Integración frontend

- El backend expone una API REST en `/api` para ser consumida por el frontend (ver carpeta `frontend/`).
- Endpoints principales: `/api/users`, `/api/projects`, `/api/requests`

## 🤝 Contribuir

1. Haz fork y crea una rama descriptiva.
2. Sigue la guía de estilos y buenas prácticas del repo.
3. Haz PRs pequeños y enfocados.

---

¿Dudas o sugerencias? ¡Abre un issue o contacta al equipo! 