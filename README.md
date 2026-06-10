# TaskFlow DDS — Seguimiento de tareas de proyectos

Aplicación **full stack** para el seguimiento de tareas dentro de proyectos, desarrollada para el
**TP previo al Parcial 2 — DDS 2026, Curso 3K4**.

El sistema permite crear tareas dentro de proyectos, asignarlas a responsables válidos y controlar
prioridad y estado respetando reglas de negocio reales (no es un CRUD genérico): una tarea pertenece
obligatoriamente a un proyecto, tiene un responsable que **integra** ese proyecto y respeta
**transiciones de estado coherentes**.

- **Backend:** Node.js + Express (JWT, middlewares, manejo central de errores, persistencia en JSON, tests con Jest + Supertest).
- **Frontend:** React + Vite (React Router, Context de auth, capa de servicios Axios, validaciones y manejo de errores de API).

---

## 📁 Estructura del repositorio

```
TP_DDS/
├── backend/          # API Express
│   ├── src/
│   │   ├── config/        # configuración y constantes del dominio
│   │   ├── controllers/   # controladores finos (req/res)
│   │   ├── data/          # store JSON + semilla
│   │   ├── middlewares/   # auth, autorización, validación, errores
│   │   ├── routes/        # express.Router() por recurso
│   │   ├── services/      # reglas de negocio (fuente de verdad)
│   │   ├── utils/         # helpers (AppError, ids)
│   │   ├── app.js         # app Express (CORS, rutas, error handler)
│   │   └── server.js      # arranque
│   └── tests/         # Jest + Supertest
└── frontend/         # SPA React + Vite
    └── src/
        ├── api/          # capa de servicios Axios (1 archivo por recurso)
        ├── components/   # UI reutilizable (tabla, badges, acciones, toast…)
        ├── context/      # AuthContext (usuario + token + rol)
        ├── hooks/        # datos de referencia (proyectos/usuarios)
        ├── pages/        # pantallas (login, tareas, detalle, form, resumen, 404)
        └── styles/       # sistema de diseño (tokens CSS)
```

---

## 🚀 Cómo ejecutar

> Requisitos: **Node.js 18+** y npm. Probado con Node 24 / npm 11.

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env      # opcional (hay valores por defecto)
npm run seed              # genera la base con datos semilla (db.json)
npm start                 # http://localhost:4000  (API en /api)
```

- `npm run dev` levanta el backend con recarga automática (nodemon).
- `npm run seed` **(re)genera** la base semilla. Útil para volver a un estado limpio.

### 2) Frontend

En otra terminal:

```bash
cd frontend
npm install
cp .env.example .env      # opcional
npm run dev               # http://localhost:5173
```

El frontend habla con el backend vía `VITE_API_URL` (por defecto `http://localhost:4000/api`).
Vite también deja un **proxy** de `/api` al backend para desarrollo.

---

## 👤 Usuarios de prueba (semilla)

Todos los usuarios semilla usan la contraseña **`password123`**.

| Rol          | Email            | Puede…                                                                 |
|--------------|------------------|------------------------------------------------------------------------|
| **admin**    | `admin@dds.com`  | Todo: crear, reasignar, cambiar prioridad, finalizar/cancelar, resumen |
| **líder**    | `lider@dds.com`  | Igual que admin sobre las tareas del proyecto + resumen                |
| colaborador  | `mica@dds.com`   | Ver tareas, editar descripción y mover **sus** tareas a en_progreso/bloqueada |
| colaborador  | `juan@dds.com`   | Ídem colaborador                                                       |
| colaborador  | `ana@dds.com`    | Ídem colaborador                                                       |

> El **registro** desde el frontend crea siempre usuarios con rol **colaborador**.
> Los usuarios semilla son para probar rápido, **no reemplazan** el flujo real de registro/login.

---

## 🧠 Dominio: responsable válido, prioridad y estados

### Entidades (4)
- **usuarios** — colaboradores, líderes y administradores.
- **proyectos** — contenedor de trabajo; tiene `estado` (`activo`/`pausado`/`finalizado`) y `integrantes`.
- **tareas** — unidad de trabajo con `responsableId`, `prioridad`, `estado`, `fechaLimite`.
- **historial_tareas** — auditoría de cambios (creación, edición, reasignación, cambio de estado/prioridad, cancelación).

### Reglas centrales (validadas en el **servicio del backend**)
- **Responsable válido:** una tarea solo puede crearse/reasignarse a un usuario que **integra** el proyecto.
- **Proyecto inexistente → 404**; **proyecto finalizado → 400** (no se crean ni modifican tareas);
  **proyecto pausado → 400** al **crear** (sí se pueden consultar/editar las existentes).
- **Prioridad:** `baja`, `media`, `alta`, `critica` (cualquier otro valor → 400).
- **Estados de tarea:** `pendiente`, `en_progreso`, `bloqueada`, `finalizada`, `cancelada`.

### Transiciones de estado permitidas
```
pendiente    → en_progreso, cancelada
en_progreso  → bloqueada, finalizada, cancelada
bloqueada    → en_progreso, cancelada
finalizada   → (terminal, sin cambios)
cancelada    → (terminal, sin cambios)
```
- No se editan tareas `finalizada`/`cancelada` (salvo **observación administrativa** de un admin).
- Una transición inválida (p. ej. `finalizada → pendiente`) responde **400**.

### Tareas vencidas
Una tarea está **vencida** si su `fechaLimite` es anterior a la fecha actual y su estado **no** es
`finalizada` ni `cancelada`. El listado y el detalle exponen un flag calculado `vencida`.

### Paginación / orden / filtros
Se resuelven **en el backend**. El listado acepta:
`proyectoId`, `responsableId`, `estado`, `prioridad`, `page`, `limit`, `sortBy`, `order`, `vencidas`.

---

## 🔐 JWT, roles y permisos

- **Login** (`/api/auth/login`) devuelve un **JWT** firmado. El payload contiene solo `sub` (id),
  `rol` y `nombre` — **sin contraseñas ni datos sensibles**.
- Las contraseñas se guardan **hasheadas con bcrypt**; nunca se devuelven en las respuestas.
- El token viaja como `Authorization: Bearer <token>` (lo agrega un **interceptor** de Axios).
- **Middlewares:**
  - `authenticate` → **401** si falta el token o es inválido/expirado.
  - `authorizeRoles(...)` → **403** si el rol no está habilitado para la acción.
  - La **propiedad del recurso** (colaborador responsable de la tarea) se valida en el **servicio**.

| Acción                                   | colaborador            | admin / líder |
|------------------------------------------|------------------------|---------------|
| Listar / ver detalle / historial         | ✅                     | ✅            |
| Crear tarea                               | ❌ (403)               | ✅            |
| Editar título/prioridad/responsable/fecha | ❌ (403)               | ✅            |
| Editar **descripción** de su tarea        | ✅ (si es responsable) | ✅            |
| Iniciar / bloquear                        | ✅ (su tarea)          | ✅            |
| Finalizar / cancelar                      | ❌ (403)               | ✅            |
| Ver **resumen** administrativo            | ❌ (403)               | ✅            |

> En el frontend las rutas están protegidas (no se puede navegar sin sesión ni al resumen sin rol),
> pero **la protección real está en el backend**.

---

## 🌐 Endpoints principales (backend)

Base: `http://localhost:4000/api`

| Método | Ruta                          | Descripción                                   | Protección        |
|--------|-------------------------------|-----------------------------------------------|-------------------|
| POST   | `/auth/register`              | Registro (crea colaborador)                   | pública           |
| POST   | `/auth/login`                 | Login → `{ usuario, token }`                  | pública           |
| GET    | `/auth/me`                    | Perfil del usuario autenticado                | JWT               |
| GET    | `/proyectos`                  | Lista de proyectos                            | JWT               |
| GET    | `/usuarios`                   | Lista de usuarios (para selects)              | JWT               |
| GET    | `/tareas`                     | Listado con filtros/orden/paginación          | JWT               |
| GET    | `/tareas/resumen`             | Resumen administrativo (agregados)            | JWT + admin/líder |
| GET    | `/tareas/:id`                 | Detalle de una tarea                          | JWT               |
| GET    | `/tareas/:id/historial`       | Historial de auditoría de la tarea            | JWT               |
| POST   | `/tareas`                     | Crear tarea                                   | JWT + admin/líder |
| PUT    | `/tareas/:id`                 | Editar tarea (según permisos)                 | JWT               |
| PATCH  | `/tareas/:id/iniciar`         | → `en_progreso`                               | JWT (resp/gestor) |
| PATCH  | `/tareas/:id/bloquear`        | → `bloqueada`                                 | JWT (resp/gestor) |
| PATCH  | `/tareas/:id/cancelar`        | → `cancelada`                                 | JWT + admin/líder |
| PATCH  | `/tareas/:id/finalizar`       | → `finalizada`                                | JWT + admin/líder |

**Status HTTP usados:** `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`.
Los errores responden JSON claro, p. ej. `{ "error": "El responsable no pertenece al proyecto" }`.

---

## 🖥️ Rutas del frontend

| Ruta                  | Pantalla                                   | Protección        |
|-----------------------|--------------------------------------------|-------------------|
| `/login`              | Inicio de sesión                           | pública           |
| `/registro`           | Registro de colaborador                    | pública           |
| `/tareas`             | Listado con filtros, orden y paginación    | sesión            |
| `/tareas/nueva`       | Alta de tarea (transaccional)              | sesión + gestor   |
| `/tareas/:id`         | Detalle + acciones por rol + historial     | sesión            |
| `/tareas/:id/editar`  | Edición de tarea                           | sesión            |
| `/resumen`            | Panel resumen (KPIs y gráficos)            | sesión + gestor   |
| `*`                   | **404** (ruta comodín)                     | —                 |

Características de UX: estados de **carga / vacío / error / éxito**, validaciones visibles en
formularios, toasts de feedback, mostrar/ocultar contraseña, confirmación antes de cancelar, diseño
responsive (sidebar colapsable en mobile) y accesibilidad (focus visible, labels, `aria-live`).

---

## ✅ Testing

Backend con **Jest + Supertest** (29 pruebas). Cada test valida **status HTTP** y **cuerpo JSON**.

```bash
cd backend
npm test
```

Cubre, entre otros:
- Login correcto e inválido; registro y duplicados.
- Listado con y sin filtros; filtro inválido (400).
- Detalle existente (200) e inexistente (404).
- Creación válida (201) e inválidas: responsable fuera del proyecto, prioridad/estado no permitido,
  proyecto finalizado/pausado, proyecto inexistente.
- Acceso sin JWT (401) y con rol insuficiente (403): crear tarea y resumen.
- Permisos por propiedad (colaborador no responsable no puede iniciar).
- Transición de estado no permitida (`finalizada → pendiente` → 400).
- Registro de historial al cambiar de estado.

> Los tests usan un archivo de base separado (`db.test.json`) y **resetean** la semilla en cada
> caso (`beforeEach`), de modo que los datos son previsibles y aislados.

---

## 🗃️ Decisiones de diseño

- **Persistencia:** archivo **JSON** (`backend/src/data/db.json`) mediante un *store* propio que
  mantiene los datos en memoria y los escribe en disco en cada cambio. Sobrevive al reinicio del
  backend. Elegido por simplicidad y por respetar la separación lógica de las 4 entidades.
- **Reglas de negocio en servicios:** controladores finos; toda la lógica (responsable válido,
  estado del proyecto, transiciones, historial) vive en `services/tareas.service.js`.
- **Errores centralizados:** `AppError` + middleware `(err, req, res, next)` registrado al final.
- **División de responsabilidades del grupo (sugerida):** Backend dominio/servicios · Backend
  auth/seguridad + tests · Frontend auth/layout/estado · Frontend tareas (listado/detalle/form) ·
  Frontend resumen + integración. La estructura por capas facilitó el trabajo en paralelo y la
  posterior integración.

---

## ⚠️ Limitaciones conocidas

- La persistencia JSON no es concurrente: pensada para un único proceso (suficiente para el TP).
- El registro público solo crea **colaboradores**; los roles `admin`/`líder` se cargan por semilla.
- Las contraseñas semilla son compartidas (`password123`) **a propósito**, para probar rápido.
- No hay refresh tokens: el JWT expira según `JWT_EXPIRES_IN` (8 h por defecto) y se vuelve a loguear.
- Tests de frontend no incluidos (son opcionales en el enunciado); el backend sí está cubierto.
- La "observación administrativa" sobre tareas finalizadas/canceladas existe en el backend (solo
  admin, vía PUT con campo `observacion`); el frontend la muestra pero no la edita.

---

*DDS 2026 · Curso 3K4 — Trabajo práctico previo al Parcial 2.*
