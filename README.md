# NOV — Campus de Capacitación

Plataforma de capacitación corporativa para **NOV**.

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

## Identidad visual

Paleta tomada del logo NOV (`public/images/logo.jpeg`):

| Token | Hex | Uso |
|---|---|---|
| Rojo NOV | `#ED3229` | Botones, acentos, estados activos |
| Gris NOV | `#61666E` | Textos, módulo de capacitadores |
| Carbón | `#1E2126` | Fondos de portal y nav |
| Blanco | `#FFFFFF` | Superficies y logo |

El logo se muestra completo (horizontal) en header, home, logins y certificados PDF.

---

## Fases del proyecto

### Fase 1 — Núcleo del campus
- Acceso privado de participantes por DNI.
- Panel de administración (Capacitadores).
- Salas, capacitaciones, materiales y evaluaciones.
- Certificados PDF al aprobar.

### Fase 2 — Base de datos NOV
- Misma estructura de campos que el campus original.
- SQLite propio: `prisma/NOV-db.db` (`DATABASE_URL="file:./NOV-db.db"`).
- El archivo `.db` no se versiona: cada entorno lo genera con migraciones + seed.

### Fase 3 — Identidad NOV
- Marca visual rojo / gris / carbón.
- Logo NOV en portal, navegación, logins y certificados.
- Home con fondo corporativo (sin piezas de la marca anterior).

### Fase 4 — Operación
- Alta de DNIs (individual o importación).
- Seguimiento de progreso de participantes.
- Gestión de salas y contenido didáctico.

---

## Setup local

### 1. Clonar e instalar

```bash
git clone https://github.com/nicoconti1901/NOV-Campus.git
cd NOV-Campus
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Editá `.env`:

```env
DATABASE_URL="file:./NOV-db.db"
SESSION_SECRET="un-secreto-largo-de-al-menos-32-caracteres"
CAMPUS_ACCESS_KEY="tu-clave-privada"
ADMIN_EMAIL="admin@nov.com"
ADMIN_PASSWORD="tu-password-seguro"
COMPANY_EMAIL="empresa@nov.com"
COMPANY_PASSWORD="tu-password-empresa"
```

> Prisma resuelve rutas SQLite relativas desde la carpeta `prisma/`.  
> Con `file:./NOV-db.db` el archivo queda en `prisma/NOV-db.db`.

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
| Capacitadores | `/capacitacion/admin/login` | `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| Representante (solo progreso) | `/capacitacion/admin/progreso/login` | `COMPANY_EMAIL` / `COMPANY_PASSWORD` |

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

### Representante de la empresa
1. Entra por el módulo **Progreso** del portal.
2. Ve únicamente el tablero de cumplimiento (sedes, asignaciones y exportación CSV).
3. No accede a salas, matriz, alumnos ni al resto del panel de capacitadores.

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
| `npx tsx scripts/generar-propuesta-pdf.ts` | Genera el PDF de la propuesta comercial |

---

## Estructura relevante

```text
src/app/capacitacion/          # Portal, campus alumno y admin
src/components/capacitacion/   # UI del campus (logo, nav, footer, backdrop…)
src/lib/capacitacion/          # Auth, salas, certificados, uploads
prisma/                        # Schema, migraciones, SQLite (NOV-db.db)
public/images/                 # Logo NOV y recursos visuales
docs/                          # Propuesta comercial (PDF)
scripts/                       # Generador de la propuesta en PDF
```

---

## Propuesta comercial

La oferta de la plataforma está en:

- `PROPUESTA-PLATAFORMA-CORPORATIVA-CAPACITACION.md`
- `docs/Propuesta-Plataforma-Corporativa-Capacitacion-ARS.pdf`

---

## Notas

- No subas `.env` ni archivos `.db` (están en `.gitignore`).
- Los uploads de materiales viven en `/uploads` (ignorado por git).
- Repositorio: [github.com/nicoconti1901/NOV-Campus](https://github.com/nicoconti1901/NOV-Campus).
