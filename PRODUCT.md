# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Alumno / participante (usuario primario del campus).** Entra con DNI habilitado. Declara o le cargan sector, puesto y tarea. No elige cursos: recibe asignaciones de la matriz, completa material, rinde test y descarga certificado si aprueba. Necesita saber, sin preguntarle a nadie, qué le falta, qué se vence y qué sigue vigente.

**Capacitador / admin.** Crea capacitaciones con alcance obligatorio (sector, puesto, tarea, vigencia). Publica o agrega celdas a la matriz del año. Ve alumnos, DNIs y progreso.

**Gerente / seguimiento (solo lectura en progreso).** Ve asignadas, efectuadas, vencidas y por vencer, con corte por sede.

## Product Purpose

NOV Campus es una plataforma operativa de **capacitación corporativa obligatoria**, no un catálogo de inscripción voluntaria. Las asignaciones se derivan de la intersección **puesto × tarea × sector**. Cada asignación vence. El éxito es demostrar, por persona y por celda, qué está vigente, qué falta y qué está vencido.

## Positioning

La asignación no sale de un LMS abierto. Sale de una **matriz anual publicada**. El participante ve solo lo que le toca. El capacitador define alcance; el sistema materializa y caduca.

## Operating Context

- Industria y operación (HSE / WELLCHEK y sedes NOV EPS).
- Uso diurno en oficina de planta, sala de inducción o escritorio del capacitador.
- Maestros: Sector (sede), Puesto, Tarea.
- Estados de asignación que el alumno debe distinguir de inmediato: vencida, por vencer, asignada/pendiente, vigente/efectuada.
- Ingreso: clave de acceso del campus + DNI en lista habilitada.
- Evaluación con puntaje mínimo; certificado PDF al aprobar.

## Capabilities and Constraints

- Next.js App Router, Prisma, SQLite en desarrollo.
- Superficies de esta pasada: campus del alumno (login por clave, home, perfil, visor de capacitación, certificados, alertas, salas) y panel del capacitador (login, panel, salas, capacitaciones, matriz, progreso, alumnos/DNIs, alertas).
- Fuera de esta pasada: rutas que responden 404 (login de campus deprecado, claves inválidas, recursos inexistentes) y demos/marketing que no carguen.
- No alterar la lógica de matriz, asignaciones ni autorización.
- Copy en español rioplatense operativo.

## Brand Commitments

- Nombre de producto: NOV Campus. Marca visible NOV; pie DEVCEN.
- Identidad existente: logo NOV, rojo institucional ya en uso.
- Restricción voluntaria del pedido: el tono oscuro actual no es apto para un campus; el entorno debe sentirse profesional y diurno, no un LMS genérico, y debe resaltar con claridad vencido / por vencer / vigente.

## Evidence on Hand

- Matriz HSE 2026 WELLCHEK (Excel en `docs/`).
- Alumnos demo con terna y asignaciones materializadas.
- Logo y assets en `public/images/`.
- No fabricar clientes, métricas comerciales ni testimonios.

## Product Principles

- La persona no elige el catálogo; ve su celda.
- El estado de vigencia es la información primaria, no el marketing del curso.
- Un capacitador cambia alcance y eso impacta a los alumnos de esa celda.
- Claridad operativa por encima de ornamentación.
- Conservar marca y datos reales; no inventar claims.

## Accessibility & Inclusion

Uso en escritorio y móvil. Contraste legible en entorno de oficina. No hay estándar WCAG formal confirmado; no degradar teclado ni labels existentes.
