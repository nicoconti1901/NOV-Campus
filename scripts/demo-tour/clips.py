# -*- coding: utf-8 -*-
CLIPS = [
    {
        "id": "intro",
        "text": "Bienvenidos al campus de capacitaci\u00f3n. El objetivo de la plataforma es el cumplimiento de la matriz de competencias: cada persona cursa lo asignado a su sector, puesto y tarea, y se controla la vigencia.",
    },
    {
        "id": "portal.participants",
        "text": "Participantes: el personal entra con su DNI habilitado y cursa \u00fanicamente lo asignado a su celda.",
    },
    {
        "id": "portal.trainers",
        "text": "Capacitadores: publican salas, cursos y la matriz de competencias, y controlan la vigencia.",
    },
    {
        "id": "portal.progress",
        "text": "Progreso: el tablero ejecutivo de cumplimiento, por sede y por persona.",
    },
    {
        "id": "campus.login",
        "text": "El participante ingresa con el documento habilitado.",
    },
    {
        "id": "campus.terna",
        "text": "El campus saluda por nombre y muestra sector, puesto y tarea. De ah\u00ed salen las asignaciones.",
    },
    {
        "id": "campus.estados",
        "text": "Los estados son vencida, por vencer, asignada y vigente. Ante un posible vencimiento se notifica a las partes por correo electr\u00f3nico.",
    },
    {
        "id": "campus.asignadas",
        "text": "En Asignadas est\u00e1n los cursos obligatorios todav\u00eda dentro de vigencia. Cada tarjeta abre el material y la evaluaci\u00f3n.",
    },
    {
        "id": "campus.vigentes",
        "text": "En Vigentes est\u00e1n los cursos ya aprobados, con certificado v\u00e1lido.",
    },
    {
        "id": "campus.cert",
        "text": "Al aprobar, el certificado se descarga en PDF, con puntaje y vigencia.",
    },
    {
        "id": "campus.historial",
        "text": "El historial re\u00fane todos los certificados emitidos.",
    },
    {
        "id": "campus.salida",
        "text": "Ahora el m\u00f3dulo de capacitadores.",
    },
    {
        "id": "admin.login",
        "text": "El capacitador ingresa con correo y contrase\u00f1a.",
    },
    {
        "id": "admin.panel",
        "text": "Este es el panel de capacitadores. Arriba est\u00e1 el men\u00fa de gesti\u00f3n.",
    },
    {
        "id": "admin.stats",
        "text": "El resumen muestra capacitaciones, personal con perfil, DNIs habilitados y salas activas.",
    },
    {
        "id": "admin.rooms.home",
        "text": "M\u00e1s abajo, las salas tem\u00e1ticas agrupan los cursos por \u00e1rea.",
    },
    {
        "id": "salas.intro",
        "text": "En Salas se crean las \u00e1reas tem\u00e1ticas. Cada sala agrupa capacitaciones.",
    },
    {
        "id": "salas.form",
        "text": "Para crear una: el nombre visible y, si hace falta, un identificador. Si el slug queda vac\u00edo, se genera solo.",
    },
    {
        "id": "salas.list",
        "text": "Las salas existentes aparecen aqu\u00ed, con la cantidad de cursos de cada una.",
    },
    {
        "id": "cursos.list",
        "text": "Aqu\u00ed est\u00e1n los cursos publicados, organizados por sala. El bot\u00f3n rojo abre el alta.",
    },
    {
        "id": "cursos.nueva",
        "text": "Formulario de alta: t\u00edtulo, descripci\u00f3n e imagen opcional para el alumno y el certificado.",
    },
    {
        "id": "cursos.reglas",
        "text": "Se elige la sala, el puntaje m\u00ednimo de aprobaci\u00f3n y los d\u00edas de vigencia del certificado.",
    },
    {
        "id": "cursos.alcance",
        "text": "El alcance es obligatorio: sector, puesto y tarea. El curso solo llega a esa celda.",
    },
    {
        "id": "cursos.publicar",
        "text": "Publicar hace visible el curso para los alumnos asignados. Sin marcar, queda en borrador.",
    },
    {
        "id": "cursos.material",
        "text": "Aqu\u00ed se sube el material: video, PDF o documentos de Office.",
    },
    {
        "id": "cursos.quiz",
        "text": "La evaluaci\u00f3n es de opci\u00f3n m\u00faltiple. Se marcan las respuestas correctas y se pueden agregar preguntas.",
    },
    {
        "id": "cursos.guardar",
        "text": "Cuando est\u00e1 listo, Crear capacitaci\u00f3n lo publica.",
    },
    {
        "id": "matriz.intro",
        "text": "La matriz no es una inscripci\u00f3n libre. Cada tema vive en una celda: puesto, tarea y sede.",
    },
    {
        "id": "matriz.form",
        "text": "Para asignar un tema se elige la capacitaci\u00f3n y la intersecci\u00f3n. El cambio llega a los alumnos de esa celda.",
    },
    {
        "id": "matriz.celdas",
        "text": "M\u00e1s abajo est\u00e1 el mapa de celdas publicadas, con los temas de cada una.",
    },
    {
        "id": "alumnos.alta",
        "text": "Nadie entra al campus sin un DNI habilitado. Se carga uno, o se importa un listado CSV.",
    },
    {
        "id": "alumnos.csv",
        "text": "Importar CSV habilita documentos en lote. Exportar progreso descarga el seguimiento en planilla.",
    },
    {
        "id": "alertas.intro",
        "text": "Las alertas las ve todo el personal en el campus.",
    },
    {
        "id": "alertas.form",
        "text": "Nueva alerta: t\u00edtulo, mensaje, tipo informativa, advertencia o peligro, y una fecha de vencimiento opcional.",
    },
    {
        "id": "progreso.entrada",
        "text": "Por \u00faltimo, el m\u00f3dulo de Progreso.",
    },
    {
        "id": "progreso.kpis",
        "text": "El tablero muestra el cumplimiento: vigente, por vencer, pendiente y vencida. Ante un posible vencimiento se notifica a las partes por correo electr\u00f3nico.",
    },
    {
        "id": "progreso.filtros",
        "text": "Se filtra por alumno, DNI, sede, puesto, estado o curso, y se exporta el reporte en CSV.",
    },
    {
        "id": "cierre",
        "text": "El capacitador publica la matriz y controla la vigencia; el personal cursa lo asignado y se certifica. El objetivo es el cumplimiento.",
    },
]
