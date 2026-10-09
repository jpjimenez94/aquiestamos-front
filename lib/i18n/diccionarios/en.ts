import type { Diccionario } from './es'

/**
 * THE PUBLIC SITE, IN ENGLISH.
 *
 * Una traducción de `es.ts`, clave por clave. El tipo `Diccionario` obliga a
 * que estén todas: si en español se añade una frase, esto deja de compilar
 * hasta que se traduzca.
 *
 * Decisiones de traducción que conviene no deshacer sin pensarlo:
 *
 * · «Acompañamiento» es «support» casi siempre. «Accompaniment» existe en
 *   inglés, pero suena a música o a jerga de ONG; quien llega mal a esta
 *   página tiene que entender a la primera qué se le ofrece. El verbo
 *   «accompany» sí se usa, porque es la palabra de la red.
 *
 * · Lo colombiano se nombra y se explica una vez: «tarjeta profesional»,
 *   ReTHUS, REPS, la Ley 1581. Quien lee desde fuera no tiene por qué saber
 *   qué son, pero tampoco se le puede dar un nombre inventado que luego no
 *   encuentre en ningún documento.
 *
 * · Las líneas de emergencia son de Colombia y se dice. A quien lee en inglés
 *   desde otro país, «llama al 123» sin más le puede costar minutos.
 *
 * · Las casillas de autorización son la traducción de la versión 2026-09 del
 *   texto español, que es el que vale. Igual que allá: no se editan; si el
 *   texto cambia, cambia la versión.
 */
export const en: Diccionario = {
  sitio: {
    nombre: 'Aquí Estamos',
    lema: 'Psychological support and crisis care network',
    descripcion:
      'Aquí Estamos (“We Are Here”) is a network of volunteer mental health professionals who have come together to bring psychological support, guidance and resources to the people and communities who need them in the wake of the earthquake of August 10, 2026.',
    irAlInicio: '{nombre} — home',
  },

  idioma: {
    etiqueta: 'Language',
    sugerencia: 'This site is also available in English.',
    ver: 'View in English',
    cerrar: 'Dismiss this notice',
  },

  nav: {
    principal: 'Main navigation',
    movil: 'Mobile navigation',
    tituloMenu: 'Navigation menu',
    abrir: 'Open menu',
    cerrar: 'Close menu',
    enlaces: {
      serParte: {
        etiqueta: 'I want to offer psychological support',
        aclaracion: '(Graduates or students in their final semesters)',
      },
      apoyar: {
        etiqueta: 'I want to be a general volunteer',
        aclaracion: '(Lawyers, administrators, logistics, design, etc.)',
      },
      ayuda: {
        etiqueta: 'I need help',
        aclaracion: '(Request emotional support and psychological care)',
      },
      recursos: { etiqueta: 'Resources', aclaracion: '' },
    },
  },

  pie: {
    presentacion:
      'We are a collaborative network that works to make psychological care easier to reach and to promote emotional well-being through community, information and support.',
    enlaces: 'Footer links',
    preguntas: 'Frequently asked questions',
    politica: 'Data policy',
    consentimiento: 'Informed consent',
    cierre: 'Accompanying one another is a way of rebuilding our country.',
  },

  flotante: {
    grupo: 'Quick contact and help actions',
    preguntas: 'FAQ',
    preguntasAyuda: 'See frequently asked questions',
    whatsapp: 'WhatsApp',
    whatsappAyuda: 'Message our official WhatsApp',
  },

  migas: {
    inicio: 'Home',
    ruta: 'Breadcrumb',
  },

  noEncontrada: {
    titulo: 'We couldn’t find this page',
    texto:
      'The link may have changed. From the home page you can reach everything we have available.',
    inicio: 'Back to home',
    recursos: 'See the resources',
  },

  avisos: {
    traduccion:
      'This is a courtesy translation. The Spanish version is the official text and the one that applies.',
    verOriginal: 'Read the Spanish version',
    fueraDeColombia:
      'These lines work in Colombia. If you are in another country, call your local emergency number.',
    atencionEnEspanol:
      'Our volunteer professionals offer support in Spanish. If you need it in another language, tell us in the message at the end of this form and we will let you know what we can offer.',
    redEnEspanol:
      'Please note that the network works in Spanish: it is the language of the coordination team and of most of the people we accompany.',
  },

  inicio: {
    heroAlt: 'Illustration of the Aquí Estamos network',
    titulo: 'Psychological support and crisis care network',
    duracion:
      'It will provide support and care over the next **3 to 4 months**, helping to rebuild the social fabric.',
    etapa:
      'During this first stage, we are building a collaborative community of professionals committed to emotional care, prevention and support in crisis situations.',
    accesos: 'How can we help you?',
    tarjetas: {
      serParte: {
        titulo: 'I want to offer psychological support',
        texto:
          'For psychology graduates or students in their final semesters who want to accompany others.',
      },
      apoyar: {
        titulo: 'I want to be a general volunteer',
        texto:
          'Lawyers, administrators, logistics, design and more: join from what you know how to do.',
      },
      ayuda: {
        titulo: 'I need help',
        texto: 'Request emotional support and psychological care: we are here with you.',
      },
      recursos: {
        titulo: 'Resources for everyone',
        texto: 'Guides, books and tools for situations that call for support.',
      },
    },
    sobreAlt: 'Hands accompanying each other',
    sobreTitulo: 'About Aquí Estamos',
    sobreTexto:
      'We are a collaborative network that works to make psychological care easier to reach and to promote emotional well-being through community, information and support.',
    contacto: 'Contact us',
    noEstasSola: 'You are not alone.',
    estamosAqui: 'We are here to accompany you.',
    whatsappTitulo: 'Message us on WhatsApp',
    whatsappBoton: 'Send a WhatsApp message',
    instagramTitulo: 'Follow us on Instagram',
    instagramBoton: 'Follow us',
    cierreAlt: 'Illustration of community',
    cierre: 'Accompanying one another is a way of rebuilding our country',
  },

  emergencia: {
    nombre: 'Why the network exists',
    tituloInicio: 'When an emergency ends,',
    tituloFin: 'many things are only just beginning.',
    familias: {
      titulo: 'There are families trying to put their lives back together.',
      texto: 'There is fear, uncertainty, loss and many questions.',
    },
    espacio: {
      titulo:
        'At times like these, having a space to talk, to be heard and to find guidance can make a difference.',
      porEso: 'That is why we are creating a',
      red: '**Psychological Support** and **Crisis Care** Network.',
    },
    temporal: {
      texto:
        'A temporary network of professionals, students and allies who want to contribute to the psychological response to the emergency of **August 10, 2026 in Colombia.**',
      vigencia: 'The network will run for an **initial period of four months.**',
    },
    personas: {
      texto:
        'We are looking for people who want to put their knowledge, their time and their listening at the service of those who need it today.',
      paraTi:
        'If you are a psychologist or a psychology student, **this space is for you too.**',
    },
    cierre: 'Accompanying one another is a way of rebuilding our country.',
  },

  camino: {
    titulo: 'How can you become part of Aquí Estamos?',
    bajada:
      'If you are a mental health professional and want to join our network to accompany more people, this is the path.',
    misionTitulo: 'Our mission',
    mision:
      'To connect people with mental health professionals and bring trustworthy resources closer, for emotional care, prevention and crisis support.',
    pasosTitulo: 'Steps to join the network',
    pasos: [
      {
        titulo: 'Fill out the form',
        texto:
          'Complete the registration form with your professional information, areas of practice and contact details.',
      },
      {
        titulo: 'Information review',
        texto:
          'We review your profile to make sure your approach is aligned with the values and goals of the network.',
      },
      {
        titulo: 'Confirmation',
        texto:
          'We will write to you to confirm your participation and share the details of the next steps.',
      },
      {
        titulo: 'Welcome and onboarding',
        texto:
          'You will receive access to our communication channels, resources and materials.',
      },
      {
        titulo: 'We accompany together',
        texto:
          'You become part of a collaborative community that works for well-being and prevention.',
      },
    ],
    beneficiosTitulo: 'By being part of Aquí Estamos, you will be able to:',
    beneficios: [
      'Be part of an ethical, collaborative network of professionals.',
      'Access and share trustworthy resources for emotional care.',
      'Take part in spaces for outreach, learning and continuing education.',
      'Contribute to prevention and to the well-being of more people.',
    ],
    listaTitulo: 'Ready to join the network?',
    listaTexto: 'The form is on this same page. And if you have questions, write to us.',
    irAlFormulario: 'Go to the form',
    whatsapp: 'Message us on WhatsApp',
    instagram: 'Follow us on Instagram',
    cierre:
      'Aquí Estamos is a safe, humane space, sensitive to each person’s context. Thank you for contributing your knowledge, your time and your heart.',
  },

  preguntas: {
    ceja: 'Guidance and answers',
    titulo: 'Frequently asked questions',
    intro:
      'Answers to your questions about how to receive support, join as a volunteer professional, or help with the work of the foundation.',
    buscar: 'Search for a question (e.g. REPS, ReTHUS, cost, sessions, certificate...)',
    limpiar: 'Clear',
    resultadosPara: 'Search results for',
    coincidencia: 'match',
    coincidencias: 'matches',
    sinResultados: 'We couldn’t find any questions related to',
    verTodas: 'See all questions',
    dudaTitulo: 'Do you have another question about the model or the network?',
    dudaTexto: 'Our coordination team is available to guide you directly.',
    dudaBoton: 'Message us on WhatsApp',
    categorias: {
      psicologia: {
        etiqueta: 'Psychology professionals',
        aclaracion: 'ReTHUS, support model and ethical framework',
      },
      pacientes: {
        etiqueta: 'People and families',
        aclaracion: 'Requesting support, cost and sessions',
      },
      voluntarios: {
        etiqueta: 'General volunteers',
        aclaracion: 'Other disciplines and support work',
      },
      fundacion: {
        etiqueta: 'About the foundation',
        aclaracion: 'Mission, data and legal framework',
      },
    },
    items: {
      'psi-reps-rethus': {
        distintivo: 'ReTHUS legal framework',
        pregunta:
          'Do I need to be registered in REPS as an independent professional to be part of the network?',
        respuesta: [
          '**You do not need to be registered in REPS as an independent professional** to be part of the Aquí Estamos support model.',
          'Your **ReTHUS** registration (Colombia’s National Registry of Human Talent in Health) and your **valid professional license** (tarjeta profesional) are the official professional requirements we verify when you join.',
          'REPS (the Special Registry of Health Service Providers) applies to the institutional provider and, in our model, we are setting up the **Aquí Estamos Foundation** as the legal entity that organizes, manages and backs the support. While we consolidate the corresponding institutional authorization, your participation falls within the scope of Aquí Estamos’ own **psychological support, emotional first aid and crisis containment**, and not within the independent provision of consultations or stand-alone clinical treatment.',
        ],
      },
      'psi-registro-confidencialidad': {
        distintivo: '',
        pregunta: 'How are session records and confidentiality handled?',
        respuesta: [
          'The whole process is governed by strict principles of **professional secrecy** and by Colombia’s **Law 1581 of 2012 (Habeas Data)**.',
          'As a professional, you access the assigned case through a **secure, authenticated link** that shows only the data needed to provide support. At the end of each session, you record a brief log of how the process is going on the internal platform. We never share phone numbers or sensitive data on open channels.',
        ],
      },
      'psi-disponibilidad-horarios': {
        distintivo: '',
        pregunta: 'How much time do I need to commit and how is my availability coordinated?',
        respuesta: [
          'Volunteering is flexible and adapts to your schedule. When you apply through [I want to offer psychological support](/quiero-ser-parte), you decide how many hours a week you can contribute and on which days and times of day (mornings, afternoons or evenings).',
          'Our system only proposes people who match exactly the times you declared. Sessions last **45 minutes**, and the platform schedules automatic breaks between appointments to look after your well-being.',
        ],
      },
      'psi-alcance-casos': {
        distintivo: '',
        pregunta: 'What kind of cases does the Aquí Estamos network take on?',
        respuesta: [
          'We focus on **psychological first aid, emotional containment and brief psychosocial support** (cycles of 3 to 4 sessions).',
          'We do not handle psychiatric emergencies with imminent risk to life, or severe psychopathology that requires hospitalization. If a high risk is detected during screening or in a session, the **institutional referral pathway** to health centers and national emergency lines is activated immediately.',
        ],
      },
      'pac-gratuidad': {
        distintivo: '100% free',
        pregunta: 'Is there any cost for psychological care and support?',
        respuesta: [
          '**No, it is completely free.** The Aquí Estamos network is a non-profit solidarity initiative created so that anyone who needs emotional support can receive it without financial barriers.',
        ],
      },
      'pac-como-solicitar': {
        distintivo: '',
        pregunta: 'How do I request a psychological support session?',
        respuesta: [
          'Just go to [I need help](/atencion-psicologica) and fill out a short form with your contact details and the times you are available.',
          'A coordinator from our team will review your request and contact you by **WhatsApp or email** to confirm the date and time of your first session with a volunteer psychologist.',
        ],
      },
      'pac-cuantas-sesiones': {
        distintivo: '',
        pregunta: 'How many support sessions will I receive?',
        respuesta: [
          'The program consists of a cycle of **3 to 4 focused support sessions** with the same professional.',
          'At the end of this process, if you and the professional feel that you need continued or specialized long-term treatment, we will guide you toward health networks and complementary services.',
        ],
      },
      'pac-modalidad': {
        distintivo: '',
        pregunta: 'Is support provided online or in person?',
        respuesta: [
          'The great majority of sessions take place **online (by video call or phone call)**, which makes it possible to support people in any municipality of Colombia or abroad.',
          'If in-person community sessions or brigades are held at specific locations, we will announce them in good time on our official channels.',
        ],
      },
      'pac-emergencias-graves': {
        distintivo: 'Emergencies',
        pregunta: 'What should I do in a life-threatening emergency or an immediate crisis?',
        respuesta: [
          'If you or someone close to you is at imminent risk, with active suicidal thoughts or in danger of physical harm, **you should go immediately to the nearest health center or emergency room** or call a free emergency line. These are Colombia’s national lines; if you are in another country, call your local emergency number:',
          {
            lista: [
              '**National Emergency Line:** 123',
              '**Mental Health Guidance Line (Ministry of Health):** 106 / 192',
              '**Línea Púrpura (women in Bogotá):** 018000 112 137',
            ],
          },
        ],
      },
      'vol-quienes-pueden': {
        distintivo: '',
        pregunta: 'I’m not a psychologist — how can I join as a volunteer?',
        respuesta: [
          'Your talent is essential to the network! Through [I want to be a general volunteer](/quiero-apoyar) we welcome professionals and students in **law, medicine, nursing, social work, graphic design, communications, systems engineering, administration, logistics and community management**.',
          'We help with internal tasks such as verifying profiles, managing schedules, creating educational materials, making follow-up calls and providing organizational support.',
        ],
      },
      'vol-como-asignan-tareas': {
        distintivo: '',
        pregunta: 'How are support tasks or shifts assigned to me?',
        respuesta: [
          'When the coordination team creates a task that matches your availability and discipline, you will receive a personal invitation by email or WhatsApp with a unique link (`/turno/...`).',
          'When you open the link you will see the details of the task, the date, the time and the team’s notes, and you can confirm with a single click whether you accept.',
        ],
      },
      'vol-certificado': {
        distintivo: '',
        pregunta: 'Do you issue certificates of volunteer hours?',
        respuesta: [
          '**No.** The Aquí Estamos network is a solidarity-based community initiative that **does not issue volunteering certificates or records of hours** for academic or employment purposes. Every professional and collaborator takes part on a 100% voluntary basis, moved by social commitment and collective care.',
        ],
      },
      'fun-que-es': {
        distintivo: '',
        pregunta: 'What is the Aquí Estamos network and what is its mission?',
        respuesta: [
          'We are a non-profit collaborative network that works to make psychological care universally accessible and to promote emotional well-being through community, information and human accompaniment, contributing to the rebuilding of the social fabric.',
        ],
      },
      'fun-seguridad-datos': {
        distintivo: '',
        pregunta: 'How do you protect my personal data and my privacy?',
        respuesta: [
          'All the information we record is handled under strict information security standards and in full compliance with Colombia’s **Statutory Law 1581 of 2012** on Personal Data Protection (Habeas Data).',
          'You can read our full policy in the [Data policy](/politica-de-datos). Your data is never sold or shared with third parties.',
        ],
      },
    },
  },

  atencion: {
    meta: {
      titulo: 'I need help · Psychological support',
      descripcion:
        'Request free psychological support from volunteer professionals of the Aquí Estamos network.',
    },
    titulo: 'I need help',
    bajada: 'Psychological support and emotional care',
    aviso:
      '**We are with you.** This form takes less than 2 minutes and almost every question is answered with a single tap. Your answers are strictly confidential and allow us to connect you with a volunteer professional according to how urgent your situation is.',
    whatsapp: 'I’d rather write directly on WhatsApp {numero}',
  },

  serParte: {
    meta: {
      titulo: 'I want to offer psychological support',
      descripcion:
        'Join our network of professionals and help us create more possibilities for support.',
    },
    titulo: 'I want to offer psychological support',
    bajada: 'Join our network of professionals and help us create more possibilities for support.',
    aviso: [
      'We are forming a network of psychology professionals interested in providing psychological support and psychological first aid to families affected by emergency and crisis situations over the next four months.',
      'The information you register will be used to identify the profiles, experience and focus populations of the professionals available to take part in this initiative.',
      'Thank you for putting your knowledge and experience at the service of those who need support today.',
    ],
    whatsapp: 'Send a WhatsApp message',
    formulario: 'Fill out the form',
    obligatorios: 'Fields marked with {asterisco} are required.',
  },

  apoyar: {
    meta: {
      titulo: 'I want to be a general volunteer · Aquí Estamos network',
      descripcion:
        'Join the network’s volunteers from your own field: health, logistics, law, communication, technology, management and more.',
    },
    titulo: 'I want to be a general volunteer',
    bajada: 'An emergency is not met with psychology alone. Join from what you know how to do.',
    aviso:
      '**Multidisciplinary volunteer directory.** If you want to contribute from health and first aid, logistics, law, social work, communication, technology or project management, leave us your details. When a brigade or a specific need comes up, the coordination team will contact you. Signing up takes 2 minutes and does not commit you to anything.',
    whatsapp: 'Questions? Message us on WhatsApp {numero}',
  },

  recursos: {
    meta: {
      titulo: 'Resources for everyone',
      descripcion: 'Guides, books and tools for situations that call for support.',
    },
    titulo: 'Resources for everyone',
    bajada: 'Guides, books and tools for situations that call for support.',
    seccion: 'Children’s stories',
    noDisponible: 'The library is not available right now. Please try again in a few minutes.',
    profesionales: 'Materials for professionals',
    proximamente: 'Coming soon.',
    compartir: 'If you have another resource you would like to share, you can contact us.',
    noEncontrado: 'Resource not found',
    categoria: 'Category',
    archivos: 'Files and media',
    abrir: 'Open the material',
    volver: 'Back to the library',
    vistaPrevia: 'Preview of {titulo}',
    sinVisor: 'Your browser cannot display the PDF here.',
    abrirPestana: 'Open it in a new tab',
    soloEnEspanol: 'In Spanish',
    notaIdioma:
      'These books and guides were written in Spanish by their authors. We share them in their original language; the descriptions are ours.',
    categorias: {
      'acompanamiento-ante-emergencias': 'Support in emergencies',
      autorregulacion: 'Self-regulation',
      'contencion-emocional': 'Emotional containment',
      'sobre-el-duelo-y-la-muerte': 'On grief and death',
    },
    /**
     * Los títulos se quedan como en la portada de cada libro: es con ese
     * nombre con el que alguien lo va a buscar, y el archivo está en español.
     * Lo que se traduce es la descripción, que es nuestra.
     */
    libros: {
      'erase-una-vez-unos-valientes': {
        titulo: 'Érase una vez unos valientes',
        descripcion:
          'A story about courage and hope, to accompany children after a difficult experience.',
      },
      'el-monstruo-toti-y-el-baile-del-planeta': {
        titulo: 'El monstruo Toti y el baile del planeta',
        descripcion:
          'An illustrated story that explains earth tremors to children in a simple, friendly way.',
      },
      'ana-y-el-terremoto': {
        titulo: 'Ana y el terremoto',
        descripcion:
          'A story that helps children understand what happened and express their fear after an earthquake.',
      },
      respira: {
        titulo: 'Respira',
        descripcion:
          'A story-guide with simple breathing exercises to help children calm down and regulate their emotions.',
      },
      'mi-miedo-mi-guardian-personal': {
        titulo: 'Mi miedo, mi guardián personal',
        descripcion:
          'A book that helps children understand fear and recognize it as an emotion that can protect us in difficult situations.',
      },
      'plaza-sesamo-contencion-emocional': {
        titulo: 'Plaza Sésamo — Contención emocional',
        descripcion:
          'Material designed to accompany and emotionally contain children during difficult moments or after an emergency.',
      },
      vacio: {
        titulo: 'Vacío',
        descripcion:
          'A story about the feeling of emptiness that can follow a loss, and the process of finding new ways of living with it.',
      },
      'el-arbol-de-los-recuerdos': {
        titulo: 'El árbol de los recuerdos',
        descripcion:
          'A story that helps children work through loss and lovingly keep alive the memory of those who are no longer here.',
      },
    },
  },

  politica: {
    meta: {
      titulo: 'Data Processing Policy',
      descripcion:
        'How Red Aquí Estamos collects, uses, stores and deletes the personal data of people who request support and of volunteer professionals.',
    },
    version: 'Version {version}',
    titulo: 'Data Processing Policy',
    intro:
      'This policy explains what data we collect, what we use it for, who we share it with, how long we keep it and how you can ask us to change or delete it.',
    secciones: [
      {
        titulo: '1. Who is responsible for your data',
        bloques: [
          '**{responsable}** is responsible for processing the personal data we collect through this site.',
          'You can contact us via [{canal}]({canalHref}). That is also the channel for exercising any of the rights described below.',
        ],
      },
      {
        titulo: '2. What data we collect',
        bloques: [
          '**If you request support:** your name, your mobile number, your email if you choose to give it, the city you are writing from, the days and times you are available, whether you prefer in-person or online sessions, and anything you want to tell us in the free-text field. If the request is for someone else, also their name, your relationship to them and whether they are a minor.',
          '**If you apply as a professional:** your name, your mobile number, your email, your city, your profession and training, your years of experience, your professional license, the populations you work with, your availability and, if you can accompany in person, your yellow fever vaccination status.',
          {
            aviso:
              '**Sensitive data.** The fact of requesting psychological support and your vaccination status are health data, which the law treats as sensitive. You are not obliged to provide them. We only process them if you give us express, separate authorization by ticking the corresponding box on the form.',
          },
        ],
      },
      {
        titulo: '3. What we use it for',
        bloques: [
          {
            lista: [
              'To contact you and coordinate your support, or to assess your application.',
              'To assign a professional and schedule sessions.',
              'To keep the network’s internal records and operating statistics.',
              'To send you information about other activities, only if you authorized it separately.',
            ],
          },
          'We do not use your data for any other purpose, and we do not make automated decisions about you.',
        ],
      },
      {
        titulo: '4. Who we share it with',
        bloques: [
          'With the network professional who accompanies you and with the coordination team, and only to the extent necessary to provide the service. **We do not sell your data or hand it over to third parties** outside the network, unless a competent authority requires it by law.',
          'The information is stored on the servers of our technology infrastructure providers, who process it only on our instructions.',
        ],
      },
      {
        titulo: '5. How long we keep it',
        bloques: [
          'We keep your data for **{anos} years** from the end of your support process or the end of your participation in the network. After that period, it is deleted.',
        ],
      },
      {
        titulo: '6. Your rights',
        bloques: [
          'At any time you can:',
          {
            lista: [
              'Find out what data we hold about you and how we are using it.',
              'Have it updated or corrected if it is wrong or incomplete.',
              'Have it deleted, where there is no legal duty to keep it.',
              'Withdraw the authorization you gave us.',
              'File a complaint with Colombia’s Superintendence of Industry and Commerce (SIC).',
            ],
          },
          'To exercise any of these rights, write to us via [{canal}]({canalHref}). We will reply within the time limits set by law: up to ten business days for an inquiry and up to fifteen business days for a claim.',
          'Withdrawing your authorization means we will not be able to continue providing support, because the data is needed to coordinate it.',
        ],
      },
      {
        titulo: '7. Children and adolescents',
        bloques: [
          'When the support is for a person under 18, authorization must be given by their father, mother or legal representative, and the best interests of the child or adolescent always come first.',
        ],
      },
      {
        titulo: '8. Security',
        bloques: [
          'We apply reasonable technical and organizational measures to protect your data: access to the internal system is individual and password-protected, every access to health data is logged, and information travels encrypted.',
        ],
      },
      {
        titulo: '9. Changes to this policy',
        bloques: [
          'If we change this text, we publish a new version with its date. The authorizations you have already given remain linked to the version you accepted at the time, and a record of which one it was is kept.',
        ],
      },
    ],
    pendiente:
      '**Pending information.** The organization’s tax ID (NIT) is being processed, and there is not yet a physical office or a dedicated email address for data requests. As soon as they exist, they will be added here and a new version will be published.',
    volver: 'Back to home',
  },

  consentimiento: {
    meta: {
      titulo: 'Informed consent',
      descripcion:
        'What you agree to when you schedule a session with the Aquí Estamos network: what the support consists of, the limits of confidentiality and what we do with your data.',
    },
    version: 'Version {version}',
    titulo: 'Informed consent',
    intro:
      'This is what you agree to when you schedule a session with the network. You will see it again when you choose your time, and that is where you sign it by typing your name. If anything is unclear, ask us first: we would rather explain it.',
    puntos: [
      {
        titulo: 'What this is',
        texto:
          'Voluntary, free psychological support with a professional from the Aquí Estamos network. It does not replace medical or psychiatric treatment, and we are not an emergency service.',
      },
      {
        titulo: 'Confidentiality',
        texto:
          'What you talk about in the session is confidential and protected by professional secrecy. There are only two limits, both provided for by law: if there is a serious risk to your life or someone else’s, the professional may call for help; and if a competent authority formally requires it.',
      },
      {
        titulo: 'It is voluntary',
        texto:
          'You can pause or stop the support whenever you want, without giving explanations and without it changing how we treat you.',
      },
      {
        titulo: 'Your data',
        texto:
          'Your health data is sensitive under Colombian law and you are not obliged to authorize its use; if you agree, we use it only to coordinate your support, as our data policy says. You can ask to see, correct or delete it whenever you want. The network does not keep clinical records of your sessions.',
      },
      {
        titulo: 'Your signature',
        texto:
          'When you type your name and accept, a record is kept of which version of this text you accepted and when. If anything is unclear, ask us on WhatsApp before signing: we will gladly explain it.',
      },
    ],
    riesgoTitulo: 'If you are at risk right now',
    riesgoTexto:
      'This support is not an emergency service and cannot respond to a crisis as it happens. If you or someone else is in danger, call:',
    lineas: {
      '123': 'Emergency line',
      '106': 'Mental health line',
    },
    dudasTitulo: 'Questions about this text',
    dudasTexto:
      'Write to us via [{canal}]({canalHref}). For anything to do with your data — seeing it, correcting it, deleting it or withdrawing your authorization — see the [data processing policy](/politica-de-datos), which is the document that covers it in detail.',
  },

  formularios: {
    comun: {
      pasoDe: 'Step {paso} of 3',
      atras: 'Back',
      opcional: '(Optional)',
      errorConexion: 'We couldn’t connect to the server. Check your connection and try again.',
      errorCampo: 'Please check this field.',
      errorServidor:
        'We couldn’t save your details. Please check the form and try again, or message us on WhatsApp.',
      telefono: {
        pista:
          'With WhatsApp, if you have it: it is how we will contact you. Include your country code, for example +1 415 555 0132.',
        error:
          'Enter your number with its country code, for example +1 415 555 0132. Colombian mobile numbers can also be entered as 10 digits starting with 3.',
      },
      nombreSoloLetras: 'Tell us your full name (letters only)',
      municipio: {
        desplegar: 'Show the list of cities',
        coincidencias: 'Matches for "{busqueda}" (or type freely):',
        principales: 'Main cities and municipalities of Colombia:',
        noEsta: 'We couldn’t find “{busqueda}” in the list, but',
        seGuarda: 'it will be saved exactly as you typed it',
      },
      casillas: {
        atencion:
          'I authorize Red Aquí Estamos to process my data in order to accompany me, including data about my mental health, which is sensitive data that I am not obliged to provide.',
        datos:
          'I authorize Red Aquí Estamos to process my personal data for the purposes described above.',
        sensiblesProfesional:
          'I understand that my vaccination status is health data, that I am not obliged to provide it, and I authorize its processing for field visits.',
        representante:
          'I am the father, mother or legal representative of the minor who will receive the support, and I authorize their participation.',
        comunicaciones:
          'I would like to receive information about other activities and resources of the network.',
      },
      avisoTratamiento: {
        profesionales:
          'Red Aquí Estamos is responsible for the data you share with us. We use it to assess your application, coordinate the cases you take on and keep the network’s internal records. We do not sell it or hand it over to third parties.',
        apoyo:
          'Red Aquí Estamos is responsible for the data you share with us. We use it to keep a directory of the network’s volunteers and to be able to reach you when a need comes up that fits what you know how to do. We do not sell it or hand it over to third parties.',
      },
      avisoDerechos:
        'You can ask us at any time to see, update or correct your data, delete it, or withdraw this authorization.',
    },

    atencion: {
      pasos: [
        'Who are we accompanying, and how do we reach you?',
        'How are you feeling today? (Brief check)',
        'Format and confirmation',
      ],
      paraQuien: {
        etiqueta: 'The support is…',
        opciones: { PARA_MI: 'For me', PARA_OTRA_PERSONA: 'For someone else' },
      },
      esMenor: {
        etiqueta: 'Is that person a minor?',
        opciones: { NO: 'No, they are an adult', SI: 'Yes, they are under 18' },
      },
      tuNombre: {
        etiqueta: 'And what is your name?',
        pista: 'So we know who we are speaking with when we call.',
      },
      relacion: {
        etiqueta: 'What is your relationship to that person?',
        pista: 'Optional. For example: mother, son, partner, friend.',
      },
      nombre: 'What is your name?',
      nombreOtra: 'What is that person’s name?',
      celular: {
        etiqueta: 'Mobile / WhatsApp',
        pista:
          'A number where we can message or call you. If it is not a Colombian number, include the country code, for example +1 415 555 0132.',
      },
      correo: {
        etiqueta: 'Email',
        pista: 'Optional. A mobile number or WhatsApp is enough.',
      },
      canal: {
        etiqueta: 'How would you prefer us to contact you?',
        opciones: {
          WHATSAPP: 'WhatsApp',
          LLAMADA: 'Phone call',
          CORREO: 'Email',
        },
      },
      ciudad: {
        etiqueta: 'Which city or town are you writing from?',
        ejemplo: 'Search or type your city or town...',
        pista: 'Choose from the list (Colombia) or type it if it is not there.',
      },
      siguiente1: 'Next: How are you feeling today?',
      intro2:
        '**4 short, one-tap questions.** They help us understand your current situation and connect you with the most suitable professional, with the priority you need.',
      malestar: {
        etiqueta: '1. From 1 to 5, how difficult or overwhelming does today feel? *',
        niveles: [
          { etiqueta: '1 · Mild', detalle: 'I am coping' },
          { etiqueta: '2 · Manageable', detalle: 'With some difficulty' },
          { etiqueta: '3 · Difficult', detalle: 'It is quite hard' },
          { etiqueta: '4 · Very difficult', detalle: 'I can barely get through the day' },
          { etiqueta: '5 · Extreme', detalle: 'Overwhelmed / in crisis' },
        ],
      },
      dano: {
        etiqueta:
          '2. In recent days, have you had thoughts of harming yourself or of not wanting to go on? *',
        no: 'No',
        si: 'Yes, I have had those thoughts',
        contencionTitulo: 'Your life is very valuable. You are not alone.',
        contencionTexto:
          'If you feel you are in immediate danger or cannot contain the distress, in Colombia you can call **106** or **192** free of charge (24 hours). If you are in another country, call your local emergency number.',
      },
      urgencia: {
        etiqueta: '3. How soon do you feel you need to talk to a professional? *',
        opciones: {
          HOY: 'Today / Very urgent',
          ESTA_SEMANA: 'In the next few days / This week',
          PUEDO_ESPERAR: 'I can wait a little longer',
        },
      },
      seguro: {
        etiqueta: '4. Are you in a safe place, with the basics covered (sleep, food)? *',
        si: 'Yes, I am safe',
        no: 'I don’t feel safe or I lack the basics',
      },
      siguiente2: 'Next: Format and confirmation',
      modalidad: {
        etiqueta: 'How would you prefer to receive the support?',
        opciones: {
          VIRTUAL: 'Online (by video call or phone call)',
          PRESENCIAL: 'In person (at an office or an agreed place in your town)',
          INDIFERENTE: 'No preference (online or in person)',
        },
      },
      mensaje: {
        etiqueta: 'Would you like to leave us a message or any other detail?',
        pista: 'Optional. You can briefly tell us whatever you think is important.',
      },
      datosTitulo: 'Your data and your confidentiality',
      datosTexto:
        'Only the professional who accompanies you and the coordinating team can see it. We do not sell it or give it to anyone else. [How we handle your data and how you can delete it](/politica-de-datos).',
      enviar: 'Request psychological support',
      enviando: 'Sending request…',
      errores: {
        forWhom: 'Select who the support is for',
        isMinor: 'Tell us whether that person is under 18',
        contactName: 'Tell us your name so we know who we are speaking with',
        name: 'We need a contact name',
        phone: 'We need a phone / WhatsApp number',
        emailInvalido: 'That email doesn’t look valid',
        emailFalta: 'If you prefer email, we need your address',
        preferredContact: 'Select how you would like us to contact you',
        city: 'Select or type the city or town you are writing from',
        distress: 'Select from 1 to 5 how you feel today',
        selfHarmThoughts: 'Please answer this question',
        howSoon: 'Tell us how soon you need to talk to someone',
        safePlace: 'Please tell us whether you are in a safe place',
        preferredModality: 'Select how you would like to receive support',
        dataConsent: 'We need your authorization to be able to contact you',
        guardianConsent:
          'Because this is for a minor, we need the authorization of their legal representative',
        incompleto: 'Please complete the required fields before sending.',
        envio: 'We couldn’t send your details. Please try again.',
      },
      exito: {
        titulo: 'We received your request, {nombre}!',
        sinNombre: 'friend',
        texto:
          'We are here with you. Our coordination team has received your information, and a volunteer professional from the network will contact you by WhatsApp or phone at {telefono} to accompany you.',
        prioridadTitulo: 'Priority attention and 24/7 emergency lines',
        prioridadTexto:
          'If you feel you are in danger or need to speak with a specialist right away, in Colombia you can call **Line 106** or **Line 192** free of charge (24 hours). If you are in another country, call your local emergency number.',
        volver: 'Back to start',
      },
    },

    profesional: {
      pestanas: ['Your details', 'Profile', 'Availability'],
      paso1: {
        titulo: 'Step 1: Who are you and how do we reach you?',
        bajada: 'Basic information so we can get in touch and coordinate your participation.',
        nombre: { etiqueta: 'Full name', ejemplo: 'e.g. Laura Sofía Morales' },
        celular: { etiqueta: 'Mobile / WhatsApp', ejemplo: 'e.g. +1 415 555 0132' },
        correo: { etiqueta: 'Email', ejemplo: 'name@example.com' },
        ciudad: {
          etiqueta: 'Which city or town do you live in?',
          ejemplo: 'Search for your town in Colombia or type your city...',
        },
        continuar: 'Continue to professional profile',
      },
      paso2: {
        titulo: 'Step 2: Your professional profile and experience',
        bajada:
          'It lets us match you with people and communities that fit your training and approach.',
        profesion: {
          etiqueta: 'Profession',
          opciones: {
            Psicología: 'Psychology',
            Psiquiatría: 'Psychiatry',
            'Trabajo Social': 'Social work',
            Otra: 'Another profession',
          },
        },
        anos: {
          etiqueta: 'Years of experience',
          opciones: {
            MENOS_DE_1: 'Less than 1 year',
            ENTRE_1_Y_3: '1 to 3 years',
            ENTRE_3_Y_5: '3 to 5 years',
            MAS_DE_5: 'More than 5 years',
          },
        },
        otraProfesion: {
          etiqueta: 'Which other profession?',
          ejemplo: 'e.g. Education / Educational psychology',
        },
        tarjeta: {
          etiqueta: 'Do you hold a professional license (tarjeta profesional)?',
          opciones: { SI: 'Yes, I have it', EN_TRAMITE: 'In process', ESTUDIANTE: 'I am a student' },
        },
        poblaciones: {
          etiqueta: 'Which populations do you have experience with?',
          pista: 'Tap to select all the populations that apply.',
          opciones: {
            'Niños y niñas': 'Children',
            Adolescentes: 'Adolescents',
            Jóvenes: 'Young adults',
            Adultos: 'Adults',
            'Personas mayores': 'Older adults',
            Familias: 'Families',
            'Enfoque de género': 'Gender-focused work',
            'Población víctima de violencia': 'Survivors of violence',
            'Población desplazada/migrante': 'Displaced / migrant population',
            Otra: 'Other',
          },
        },
        otraPoblacion: 'Which other population do you work with?',
        crisis: {
          etiqueta: 'Do you have experience or training in crisis care / psychological first aid?',
          opciones: {
            SI: 'Yes, I have training and hands-on experience',
            FORMACION_POCA_PRACTICA: 'I have theoretical training, with little practice',
            SIN_FORMACION_DISPONIBLE_APRENDER: 'I have no prior training, but I want to learn',
            NO: 'I have no experience in crisis care',
          },
        },
        volver: 'Back',
        continuar: 'Continue to availability',
      },
      paso3: {
        titulo: 'Step 3: Availability and documents',
        bajada:
          'Tell us how you would like to take part and, if you wish, attach your documents.',
        modalidad: {
          etiqueta: 'In which format can you accompany?',
          opciones: {
            VIRTUAL: { nombre: 'Online', detalle: 'Support 100% online by video call' },
            PRESENCIAL: { nombre: 'In person', detalle: 'In the field or at community centers' },
            AMBAS: { nombre: 'Both', detalle: 'Available in person and online' },
          },
        },
        desplazamiento: {
          etiqueta: 'Which towns or areas could you travel to?',
          pista: 'Optional.',
          ejemplo: 'e.g. Neighboring towns / nearby rural areas',
        },
        fiebre: {
          etiqueta: 'Are you vaccinated against yellow fever?',
          pista: 'Required for access to certain emergency areas.',
          opciones: {
            SI: 'Yes, I already have my vaccination card',
            CITA_AGENDADA: 'Not yet, but I have an appointment scheduled',
            NO: 'I am not vaccinated',
          },
        },
        dias: {
          etiqueta: 'Which days are you available?',
          todos: 'Every day',
          ninguno: 'Clear all',
          opciones: {
            LUNES: { corto: 'Mon', nombre: 'Monday' },
            MARTES: { corto: 'Tue', nombre: 'Tuesday' },
            MIERCOLES: { corto: 'Wed', nombre: 'Wednesday' },
            JUEVES: { corto: 'Thu', nombre: 'Thursday' },
            VIERNES: { corto: 'Fri', nombre: 'Friday' },
            SABADO: { corto: 'Sat', nombre: 'Saturday' },
            DOMINGO: { corto: 'Sun', nombre: 'Sunday' },
          },
        },
        franjas: {
          etiqueta: 'At what times of day? (Colombia time)',
          opciones: {
            MANANA: { nombre: 'Morning', horario: '8 a.m. – 12 p.m.' },
            TARDE: { nombre: 'Afternoon', horario: '12 – 6 p.m.' },
            NOCHE: { nombre: 'Evening', horario: '6 – 9 p.m.' },
          },
        },
        horas: {
          etiqueta: 'How many hours a week could you give?',
          opciones: {
            ENTRE_1_Y_3: { nombre: '1 to 3 hours / week', detalle: '1 or 2 sessions' },
            ENTRE_4_Y_6: { nombre: '4 to 6 hours / week', detalle: '3 or 4 sessions' },
            MAS_DE_6: { nombre: 'More than 6 hours / week', detalle: '5 or more sessions' },
            VARIABLE: { nombre: 'It varies', detalle: 'Depends on the week' },
          },
        },
        documentos: {
          titulo: 'Attach verification documents (optional)',
          elegidos: '✓ Documents selected',
          despues: 'You can attach them now or send them later by WhatsApp',
          confidencialidad:
            '🔒 **Confidentiality:** For the exclusive use of the coordination team, to validate your identity and professional license in accordance with Colombia’s Law 1581 of 2012.',
          porWhatsappTitulo: 'Send your documents by WhatsApp',
          porWhatsappTexto:
            'Once you complete your registration, our team will contact you to request them. You can also send them directly to [{numero}]({enlace}), giving your name and professional license number.',
          verificando: 'Checking availability…',
          tarjeta: {
            etiqueta: 'Professional license or certificate',
            pista: 'Photo or PDF of your license, degree certificate or other credential.',
          },
          numeroTarjeta: {
            etiqueta: 'Professional license number',
            pista: 'Optional.',
            ejemplo: 'e.g. 123456',
          },
          cedulaFrente: {
            etiqueta: 'ID document (front)',
            pista: 'Photo or PDF of your identity document.',
          },
          cedulaRespaldo: {
            etiqueta: 'ID document (back)',
            pista: 'Optional if you uploaded both sides in the previous one.',
          },
          archivo: {
            subiendo: 'Uploading file…',
            listo: '✓ Ready: {nombre}',
            elegir: '📎 Choose a photo or PDF (max. 10 MB)',
            quitar: 'Remove file',
            errorSubida: 'The file could not be uploaded.',
            errorRed:
              'The upload failed. If the file is very large, try a lighter photo; otherwise, check your connection.',
          },
        },
        autorizaciones: {
          titulo: 'Authorizations and data processing',
          retencion: 'We keep your data for {anos} years.',
          politica: 'See the Data Processing Policy',
        },
        volver: 'Back to profile',
        enviar: 'Submit my registration',
        enviando: 'Sending registration…',
      },
      errores: {
        email: 'Enter a valid email address',
        city: 'Tell us which city or town you live in',
        profession: 'Select a profession',
        professionOther: 'Tell us what your profession is',
        yearsExperience: 'Select your years of experience',
        professionalCard: 'Select the status of your license',
        populations: 'Select at least one population',
        populationOther: 'Tell us which other population you work with',
        crisisExperience: 'Select an option about crisis care',
        modality: 'Select a format',
        availableDays: 'Select at least one day',
        availableSlots: 'Select at least one time of day',
        weeklyHours: 'Select how many hours you can give',
        yellowFeverVaccine: 'Select your vaccination status',
        dataConsent: 'We need your authorization to be able to contact you',
        sensitiveDataConsent: 'We need your express authorization to store your vaccination status',
        envio: 'We couldn’t save your registration. Please try again.',
      },
      exito: {
        titulo: 'Thank you for your support, {nombre}!',
        recibido:
          'We have received your registration. Your willingness to accompany those who need it most is part of something very big.',
        contacto:
          'In the coming days, someone from our team will contact you by WhatsApp to coordinate the next steps.',
        queSigue: 'What happens now?',
        pasos: [
          'We review your profile and match you with communities that fit.',
          'We contact you by WhatsApp to coordinate your onboarding.',
          'We start accompanying together!',
        ],
        whatsapp: '💬 Message us on WhatsApp',
        otra: 'Register another person',
      },
    },

    apoyo: {
      pasos: [
        'Your contact details',
        'In which area and trade can you help?',
        'Availability and authorizations',
      ],
      nombre: { etiqueta: 'Full name', ejemplo: 'Your first and last name' },
      celular: { etiqueta: 'Mobile / WhatsApp', ejemplo: 'e.g. +1 415 555 0132' },
      correo: { etiqueta: 'Email', ejemplo: 'name@example.com' },
      ciudad: {
        etiqueta: 'Which city or town are you joining from?',
        ejemplo: 'Search or type your city or town...',
        pista: 'Choose from the list (Colombia) or type it if it is not there.',
      },
      siguiente1: 'Next: What can you help with?',
      area: {
        etiqueta: 'Which area fits you best? *',
        opciones: {
          SALUD: 'Health and first aid',
          SOCIAL_LEGAL_EDUCATIVO: 'Social, legal and educational',
          OPERACION_LOGISTICA: 'Operations and logistics',
          COMUNICACION_TECNOLOGIA: 'Communication and technology',
          GESTION_PROYECTOS: 'Management and projects',
          OTRA: 'Another area or trade',
        },
      },
      disciplina: {
        etiqueta: 'What is your discipline or trade? *',
        opciones: {
          Medicina: 'Medicine',
          Enfermería: 'Nursing',
          Fisioterapia: 'Physiotherapy',
          'Terapia ocupacional': 'Occupational therapy',
          Fonoaudiología: 'Speech and language therapy',
          'Nutrición y dietética': 'Nutrition and dietetics',
          Odontología: 'Dentistry',
          'Primeros auxilios': 'First aid',
          'Trabajo social': 'Social work',
          Derecho: 'Law',
          Docencia: 'Teaching',
          Pedagogía: 'Education',
          'Primera infancia': 'Early childhood',
          'Gestión comunitaria': 'Community management',
          Logística: 'Logistics',
          'Transporte y conducción': 'Transport and driving',
          'Bodega e inventario': 'Warehouse and inventory',
          'Cocina y alimentación': 'Cooking and food',
          'Construcción y obra': 'Construction and building work',
          'Gestión del riesgo de desastres': 'Disaster risk management',
          'Comunicación social': 'Communications and journalism',
          Diseño: 'Design',
          'Sistemas y tecnología': 'IT and technology',
          'Análisis de datos': 'Data analysis',
          'Traducción e interpretación': 'Translation and interpreting',
          'Gerencia de proyectos': 'Project management',
          Administración: 'Administration',
          'Finanzas y contabilidad': 'Finance and accounting',
          'Talento humano': 'Human resources',
          Otra: 'Other',
        },
      },
      otraDisciplina: {
        siOtraArea: 'What is your trade or profession?',
        siOtraDisciplina: 'Which other discipline?',
        ejemplo: 'Type your profession or trade...',
      },
      anos: {
        etiqueta: 'How many years of experience do you have in it?',
        opciones: {
          MENOS_DE_1: 'Less than 1 year',
          ENTRE_1_Y_3: 'Between 1 and 3 years',
          ENTRE_3_Y_5: 'Between 3 and 5 years',
          MAS_DE_5: 'More than 5 years',
        },
      },
      tarjeta: {
        etiqueta: 'Do you have a professional license or registration?',
        pista:
          'Only if your profession requires one. If it does not apply to your trade, you can leave it blank.',
        opciones: {
          SI: 'Yes, I have it',
          EN_TRAMITE: 'It is in process',
          ESTUDIANTE: 'I am still a student',
        },
      },
      habilidades: {
        etiqueta: 'What can you do, or which skills of yours could be useful to us?',
        pista:
          'Optional: tools you use, languages, whether you drive, whether you have helped in the field or in emergencies.',
      },
      siguiente2: 'Next: Availability',
      modalidad: {
        etiqueta: 'How can you help?',
        opciones: {
          PRESENCIAL: 'In person',
          VIRTUAL: 'Remotely, from where I am',
          AMBAS: 'Both',
        },
      },
      desplazamiento: {
        etiqueta: 'Which towns or areas could you travel to if needed?',
        pista: 'Optional. For example: the whole department, nearby rural areas, etc.',
      },
      dias: {
        etiqueta: 'Which days of the week are you available? *',
        opciones: {
          LUNES: 'Monday',
          MARTES: 'Tuesday',
          MIERCOLES: 'Wednesday',
          JUEVES: 'Thursday',
          VIERNES: 'Friday',
          SABADO: 'Saturday',
          DOMINGO: 'Sunday',
        },
      },
      franjas: {
        etiqueta: 'At what times of day? (Colombia time) *',
        opciones: {
          MANANA: 'Morning (8 a.m. – 12 p.m.)',
          TARDE: 'Afternoon (12 – 6 p.m.)',
          NOCHE: 'Evening (6 – 9 p.m.)',
        },
      },
      horas: {
        etiqueta: 'How many hours a week could you give?',
        opciones: {
          ENTRE_1_Y_3: 'Between 1 and 3 hours',
          ENTRE_4_Y_6: 'Between 4 and 6 hours',
          MAS_DE_6: 'More than 6 hours',
          VARIABLE: 'It depends on the week',
        },
      },
      fiebre: {
        etiqueta: 'Are you vaccinated against yellow fever?',
        pista:
          'Some field areas require a vaccination card to enter. If you don’t have it, you can still help remotely.',
        opciones: { SI: 'Yes', NO: 'No', CITA_AGENDADA: 'I have an appointment scheduled' },
      },
      autorizaciones: {
        titulo: 'Authorizations and data processing',
        retencion: 'We keep your data for {anos} years after your participation ends.',
      },
      enviar: 'I want to help as a volunteer',
      enviando: 'Sending registration…',
      errores: {
        email: 'Enter a valid email address',
        city: 'Select or type the city or town you live in',
        area: 'Select the area you want to help in',
        discipline: 'Select your discipline or trade',
        disciplineOther: 'Tell us what your trade or profession is',
        modality: 'Select how you can help',
        availableDays: 'Select at least one day',
        availableSlots: 'Select at least one time of day',
        weeklyHours: 'Select how many hours you can give',
        yellowFeverVaccine: 'Select a vaccination option',
        dataConsent: 'We need your authorization to be able to contact you',
        sensitiveDataConsent: 'We need your authorization to store your vaccination status',
        incompleto: 'Check the highlighted fields before sending.',
        envio: 'We couldn’t save your registration. Please try again.',
      },
      exito: {
        titulo: 'Thank you for joining the network, {nombre}!',
        sinNombre: 'volunteer',
        texto:
          'Your details are now saved in the network’s volunteer directory. When a brigade or a need comes up that fits your discipline and availability, our coordination team will write to you on WhatsApp at {telefono}.',
        otro: 'Register another volunteer or go back to the start',
      },
    },
  },
}
