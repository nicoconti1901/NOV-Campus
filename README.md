# Casino Club — Campus de Capacitación

Plataforma de capacitación corporativa para **Casino Club**.

Portal privado para participantes (acceso por DNI) y panel de administración para salas, cursos, evaluaciones y certificados.

---

## Stack

| Tecnología | Uso |
|---|---|
| Next.js 15 (App Router) | Frontend + API |
| React 19 + TypeScript | UI tipada |
| Tailwind CSS 4 | Estilos |
| Prisma + SQLite | Persistencia |
| iron-session | Sesiones admin/alumno |
| jsPDF + Sharp | Certificados PDF |

---

## Fases del proyecto

### Fase 1 — Núcleo del campus
- Acceso privado de participantes por DNI.
- Panel de administración.
- Salas, capacitaciones, materiales y evaluaciones.
- Certificados PDF al aprobar.

### Fase 2 — Identidad Casino Club
- Marca visual: negro / navy `#11111d` / acento naranja `#FF8C00`.
- Logo Casino Club.
- Portal de acceso, nav y footer corporativo (+18).

### Fase 3 — Experiencia del home
- Fondo con rotación de imágenes de casino.
- Overlay oscuro para mantener legibilidad.
- Cards y hero sobre capas semitransparentes.

### Fase 4 — Operación
- Alta de DNIs (individual o importación).
- Seguimiento de progreso de participantes.
- Gestión de salas y contenido didáctico.

---

## Setup local

### 1. Clonar e instalar

```bash
git clone https://github.com/nicoconti1901/casinoclub-campus.git
cd casinoclub-campus
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Editá `.env`:

```env
DATABASE_URL="file:./casino-club.db"
SESSION_SECRET="un-secreto-largo-de-al-menos-32-caracteres"
CAMPUS_ACCESS_KEY="tu-clave-privada"
ADMIN_EMAIL="admin@casinoclub.com"
ADMIN_PASSWORD="tu-password-seguro"
```

> Prisma resuelve rutas SQLite relativas desde la carpeta `prisma/`.  
> Con `file:./casino-club.db` el archivo queda en `prisma/casino-club.db`.

### 3. Base de datos

```bash
npm run db:setup
```

Aplica migraciones y crea el admin + salas iniciales.

### 4. Desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) → redirige a `/capacitacion`.

---

## Accesos

| Rol | URL | Credenciales |
|---|---|---|
| Portal | `/capacitacion` | — |
| Participantes | `/capacitacion/<CAMPUS_ACCESS_KEY>` | DNI habilitado por admin |
| Administración | `/capacitacion/admin/login` | `ADMIN_EMAIL` / `ADMIN_PASSWORD` |

---

## Flujos

### Alumno
1. Admin habilita el DNI en **Alumnos y DNIs**.
2. El alumno entra con su enlace privado y DNI.
3. Completa el perfil (una sola vez).
4. Elige sala → capacitación → revisa material → rinde evaluación.
5. Si aprueba, descarga el certificado PDF.

### Administrador
1. Gestiona salas temáticas.
2. Crea/edita capacitaciones y sube materiales (video/archivo).
3. Configura evaluación y puntaje mínimo.
4. Habilita DNIs (alta individual o importación).
5. Consulta progreso de participantes.

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Migraciones + servidor |
| `npm run db:setup` | Migrar + seed (primera vez) |
| `npm run db:migrate` | Nueva migración en desarrollo |
| `npm run db:seed` | Solo seed |

---

## Estructura relevante

```text
src/app/capacitacion/          # Portal, campus alumno y admin
src/components/capacitacion/   # UI del campus (logo, nav, footer, backdrop…)
src/lib/capacitacion/          # Auth, salas, certificados, uploads
prisma/                        # Schema, migraciones, SQLite
public/images/                 # Logo e imágenes del home
```

---

## Notas

- No subas `.env` ni archivos `.db` (están en `.gitignore`).
- Los uploads de materiales viven en `/uploads` (ignorado por git).
