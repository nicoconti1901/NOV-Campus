# PROPUESTA COMERCIAL  
## Plataforma Corporativa de Capacitaciones

**Documento confidencial**  
**Fecha:** Agosto 2026  
**Vigencia de la oferta:** 30 días  
**Moneda:** Dólares estadounidenses (USD)

---

### Destinatario

A la atención de la Dirección / Área de Capacitación  
**Asunto:** Propuesta de implementación de plataforma corporativa de formación interna

---

### Presentación

Por medio de la presente se somete a su consideración la propuesta para el diseño, implementación y operación de una **plataforma corporativa de capacitaciones**, orientada a organizaciones que requieren gestionar de forma controlada la formación de un volumen elevado de colaboradores, con múltiples administradores y trazabilidad formal de avances y certificaciones.

La solución propuesta no constituye un sitio web informativo con acceso a cursos, sino una **plataforma operativa integral**: portal institucional, campus de alumnos, panel de administración, evaluación, seguimiento de progreso y emisión de certificados digitales.

---

## 1. Objetivo de la solución

Disponer de un entorno digital propio (o gestionado) que permita:

- Administrar capacitaciones por áreas o salas temáticas.
- Controlar el acceso de alumnos mediante mecanismos de autorización (lista de DNI / identificadores habilitados).
- Publicar materiales didácticos (video, PDF y documentos).
- Evaluar el aprendizaje mediante cuestionarios.
- Registrar el progreso de cada participante.
- Emitir **certificados PDF** con la identidad visual de la organización.
- Operar con **varios administradores** de forma simultánea.

---

## 2. Alcance funcional

### 2.1 Portal corporativo

- Presentación institucional con la marca, tipografía y colores de su organización.
- Acceso diferenciado para administradores y alumnos.
- Dominio propio (por ejemplo, `capacitacion.suempresa.com`).

### 2.2 Campus del alumno

- Ingreso controlado (clave de acceso + documento habilitado).
- Completado de perfil (nombre, correo, teléfono, empresa / área).
- Navegación por salas temáticas y capacitaciones publicadas.
- Visualización de materiales (video con reproducción continua, PDF y archivos).
- Evaluación tipo opción múltiple, con puntaje mínimo de aprobación configurable.
- Historial de certificados y descarga en PDF.

### 2.3 Panel de administración

- Gestión de salas / áreas temáticas.
- Alta, edición y publicación de capacitaciones.
- Carga de materiales (video, PDF, imágenes, documentos Office), con soporte de archivos de gran tamaño.
- Configuración de evaluaciones y puntaje de aprobación.
- Alta individual o masiva (CSV) de documentos habilitados.
- Consulta de alumnos, perfiles y estado de avance.
- Exportación de reportes de progreso en CSV.

### 2.4 Certificación

- Generación automática de certificados PDF al aprobar una capacitación.
- Inclusión de logo, sello institucional, datos del participante, puntaje y fecha.
- Personalización según lineamientos de marca de la organización.

### 2.5 Roles previstos

| Rol | Acceso | Capacidades principales |
|---|---|---|
| Administrador (múltiples usuarios) | Panel de gestión | Salas, cursos, materiales, evaluaciones, alumnos, reportes |
| Alumno | Campus | Cursos publicados, materiales, evaluación, certificados |
| Visitante | Portal | Contenido institucional autorizado (opcional) |

---

## 3. Alcance técnico

| Componente | Especificación |
|---|---|
| Arquitectura | Aplicación web full-stack, instancia dedicada (single-tenant) |
| Frontend | Interfaz moderna, responsive (escritorio y móvil) |
| Backend | API propia con autenticación por sesión segura |
| Base de datos | Motor relacional (PostgreSQL recomendado para volúmenes altos) |
| Almacenamiento de materiales | Disco del servidor y/o object storage (videos y archivos pesados) |
| Seguridad | Acceso cerrado, sesiones firmadas, HTTPS (SSL) |
| Hosting | Servidor cloud (DigitalOcean o equivalente) + respaldos |
| Certificados | Generación PDF en servidor |

**Importante:** la plataforma se entrega como instancia exclusiva para su organización. Los datos de alumnos, cursos y materiales son de su propiedad.

---

## 4. Adaptaciones incluidas para organizaciones de mayor escala

Dado el volumen esperado de administradores y alumnos, la implementación contempla:

1. **Gestión multi-administrador**, con cuentas independientes y roles (por ejemplo, superadministrador y editor).
2. **Base de datos escalable** (PostgreSQL).
3. **Almacenamiento externo de videos** para no saturar el servidor principal.
4. **Servidor dimensionado** (CPU/RAM/disco) acorde a concurrencia y peso de materiales.
5. **Backups automáticos** diarios.
6. **Capacitación inicial** al equipo administrador (1 a 2 horas).

---

## 5. Modalidades comerciales

Se ofrecen **dos modalidades**. Puede elegirse una de ellas según prefiera inversión inicial (activo propio) u operación mensual (alquiler gestionado).

---

### MODALIDAD A — Adquisición de la plataforma + soporte mensual

El cliente obtiene la plataforma desplegada a su nombre, con personalización completa. El mantenimiento, soporte y evolución se contratan mediante un abono mensual.

#### A.1 Inversión inicial (pago único)

| Ítem | Descripción | Importe (USD) |
|---|---|---|
| Plataforma corporativa de capacitaciones | Implementación de portal, campus, panel admin, evaluaciones y certificados | 2.800 |
| Personalización de marca | Logo, colores, textos, certificados PDF, dominio | 650 |
| Multi-administrador y roles | Cuentas de administración múltiples y permisos | 550 |
| Escalado técnico | Base de datos, almacenamiento de medios, hardening y backups | 700 |
| Puesta en marcha y capacitación | Deploy en servidor, configuración SSL, entrenamiento del equipo | 400 |
| **Total inversión inicial** | | **5.100** |

#### A.2 Abono mensual de soporte

| Plan | Importe mensual | Incluye |
|---|---|---|
| Básico | **USD 180** | Soporte en horario hábil, corrección de fallas, monitoreo básico (hasta ~4 h/mes). Infraestructura facturada aparte. |
| Recomendado | **USD 320** | Todo lo del Básico + mejoras menores, ajustes de uso y pequeñas nuevas funciones (hasta ~8 h/mes). Infraestructura incluida hasta ~USD 50/mes. |
| Premium | **USD 520** | Todo lo del Recomendado + prioridad de respuesta y mayor cupo de evolución (hasta ~14 h/mes). Infraestructura incluida hasta ~USD 70/mes. |

**Ejemplo Año 1 (plan Recomendado):**  
USD 5.100 + (12 × USD 320) = **USD 8.940**

#### A.3 Qué incluye / no incluye el soporte

**Incluye**

- Atención a incidentes (caídas, errores, renovación SSL, backups).
- Asistencia a administradores para operación diaria.
- Ajustes de contenidos de marca (logos, textos, certificados).
- Mejoras menores dentro del cupo de horas del plan.

**No incluye** (se cotizan por separado)

- Rediseño integral o aplicación móvil nativa.
- Integraciones complejas (SSO corporativo, ERP, SAP, etc.).
- Videoconferencia en vivo o estándares SCORM.
- Horas de desarrollo fuera del cupo mensual.

---

### MODALIDAD B — Alquiler de la plataforma (servicio gestionado)

El cliente utiliza la plataforma bajo licencia de uso mensual. La infraestructura, el mantenimiento y el soporte están incluidos en el abono. El software permanece a cargo del prestador; los contenidos y datos del cliente le pertenecen.

#### B.1 Puesta en marcha (pago único)

| Concepto | Importe (USD) |
|---|---|
| Onboarding, branding, configuración inicial y capacitación | **900 – 1.400** |

#### B.2 Planes mensuales de alquiler

| Plan | Alumnos activos / mes | Administradores | Importe mensual (USD) | Incluye |
|---|---|---|---|---|
| Starter | Hasta 150 | Hasta 3 | **290** | Hosting, SSL, backups, soporte básico, branding inicial |
| Business *(recomendado)* | Hasta 500 | Hasta 8 | **480** | Todo Starter + almacenamiento de videos + mejoras menores + reportes |
| Enterprise | Hasta 2.000 | Según necesidad operativa | **780** | Todo Business + prioridad + cupo de evolución (~10 h/mes) |

Excesos de alumnos: se cotizan a **USD 0,40 – 0,80** por alumno activo adicional / mes, o se propone el salto de plan.

**Ejemplo Año 1 (plan Business + setup USD 1.200):**  
USD 1.200 + (12 × USD 480) = **USD 6.960**

#### B.3 Condiciones del alquiler

- Contrato mínimo sugerido: **6 o 12 meses**.
- Facturación mensual o trimestral adelantada.
- En caso de baja: exportación de datos (CSV) y materiales del cliente.
- Opción de compra posterior: se podrá descontar entre **30 % y 50 %** de lo abonado en alquiler sobre el valor de la Modalidad A.

---

## 6. Comparación de modalidades

| Criterio | Modalidad A — Adquisición | Modalidad B — Alquiler |
|---|---|---|
| Inversión inicial | Alta (USD 5.100) | Baja (USD 900 – 1.400) |
| Costo estimado Año 1 | ~ USD 8.940 (plan Recomendado) | ~ USD 6.960 (plan Business) |
| Costo Año 2 en adelante | Principalmente el abono de soporte | Abono de alquiler completo |
| Propiedad del software | A favor del cliente (uso / cesión acordada) | A cargo del prestador |
| Infraestructura | A cargo del cliente o incluida en el plan | Incluida |
| Ideal cuando… | Se busca un activo propio a mediano plazo | Se prioriza bajo ingreso y cero operación técnica |

**Orientación:**  
En horizontes de **24 a 36 meses**, la Modalidad A suele resultar más conveniente económicamente. La Modalidad B reduce la barrera de entrada y elimina la gestión técnica del lado del cliente.

---

## 7. Infraestructura y operación

| Concepto | Estimación mensual |
|---|---|
| Servidor cloud dimensionado (2 vCPU / 4 GB RAM / disco ampliado) | USD 18 – 36 |
| Backups / snapshots | USD 4 – 8 |
| Almacenamiento de videos y archivos | USD 5 – 15 |
| Correo transaccional (opcional: avisos y notificaciones) | USD 0 – 20 |
| **Total infraestructura estimada** | **USD 30 – 70 / mes** |

En la Modalidad A (plan Básico) este costo puede facturarse por separado.  
En la Modalidad A (planes Recomendado/Premium) y en toda la Modalidad B, se contempla dentro de los importes indicados según el tope de cada plan.

---

## 8. Entregables

1. Plataforma en producción con HTTPS y dominio configurado.  
2. Identidad visual aplicada (portal y certificados).  
3. Cuentas de administración iniciales.  
4. Guía de uso / capacitación al equipo.  
5. Política de respaldos activa.  
6. Capacidad de exportación de alumnos y avances (CSV).

---

## 9. Plazos y forma de pago

| Etapa | Plazo orientativo |
|---|---|
| Kick-off y relevamiento de marca / contenidos | 2 – 3 días hábiles |
| Implementación y personalización | 2 – 3 semanas |
| Pruebas con el equipo del cliente | 3 – 5 días hábiles |
| Go-live | **3 a 5 semanas** desde la conformidad del alcance |

**Forma de pago sugerida**

- **Modalidad A:** 50 % al firmar / 50 % al go-live.  
- **Modalidad B:** 100 % del setup + primer mes al firmar; luego según plan.  
- Horas adicionales fuera de plan: **USD 35 – 45 / hora**.  
- Garantía de corrección de fallas críticas: **30 días** posteriores al go-live.

---

## 10. Fuera de alcance (salvo cotización adicional)

- Integración con directorio activo / SSO / SAML.  
- Pasarela de pagos o venta pública de cursos.  
- Aplicaciones nativas iOS / Android.  
- Aulas en vivo (Zoom/Meet integrados).  
- Migración masiva desde otro LMS (se evalúa caso por caso).

---

## 11. Resumen ejecutivo

| Modalidad | Inicio | Mensual | Año 1 (ejemplo) |
|---|---|---|---|
| **A — Adquisición + soporte Recomendado** | USD 5.100 | USD 320 | **USD 8.940** |
| **B — Alquiler Business** | USD 900 – 1.400 | USD 480 | **~ USD 6.960** |

Ambas modalidades incluyen una plataforma corporativa completa, preparada para **múltiples administradores** y un **volumen elevado de alumnos**, con control de acceso, trazabilidad y certificación formal.

---

## 12. Próximos pasos

1. Confirmación de la modalidad preferida (A o B) y del plan mensual.  
2. Envío de identidad visual (logo, colores, textos institucionales) y dominio.  
3. Definición de salas temáticas y primeras capacitaciones a cargar.  
4. Firma de conformidad / orden de compra y calendario de implementación.

Quedo a disposición para ampliar cualquier punto técnico o comercial, y para ajustar el alcance a la realidad operativa de su organización.

---

**Atentamente,**  

_______________________________  
*[Nombre / Razón social]*  
*[Cargo]*  
*[Teléfono / WhatsApp]*  
*[Correo electrónico]*  

---

*Documento de carácter comercial. Los importes no incluyen impuestos aplicables según jurisdicción, salvo indicación en contrario. Cualquier modificación de alcance se documentará por escrito antes de su ejecución.*
