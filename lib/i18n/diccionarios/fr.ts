import type { Diccionario } from './es'

/**
 * LE SITE PUBLIC, EN FRANÇAIS.
 *
 * Una traducción de `es.ts`, clave por clave. El tipo `Diccionario` obliga a
 * que estén todas: si en español se añade una frase, esto deja de compilar
 * hasta que se traduzca.
 *
 * Decisiones de traducción que conviene no deshacer sin pensarlo:
 *
 * · Se trata de «vous», nunca de «tu». El español tutea; en francés, tutear a
 *   un desconocido —y más en un servicio de salud, a alguien que llega mal—
 *   es una confianza que nadie ha dado. «Vous» es lo normal y lo respetuoso
 *   en este tipo de servicios.
 *
 * · Es el francés de Francia, sin regionalismos, que se lee igual en Bélgica,
 *   Suiza, Quebec o África: «e-mail», «mobile», «commune».
 *
 * · «Acompañamiento» es «accompagnement»: en francés, a diferencia del
 *   inglés, sí es la palabra de la salud y del trabajo social. «Atención en
 *   crisis» es «soutien en situation de crise» cuando se le habla al público
 *   e «intervention de crise» cuando se le habla al profesional. «Primeros
 *   auxilios psicológicos» son «premiers secours psychologiques», como los
 *   publica la OMS en francés.
 *
 * · «Contención» NO es «contention»: en la psiquiatría francesa eso es sujetar
 *   físicamente al paciente. Es «contenance», la de la «fonction contenante».
 *
 * · «Voluntario» es «bénévole» (quien da su tiempo sin cobrar), no
 *   «volontaire» (quien se ofrece para algo). El voluntariado general es
 *   «bénévole» a secas; los psicólogos, «professionnels bénévoles».
 *
 * · El género se resuelve reformulando cuando se puede («Je suis en
 *   sécurité», «Avez-vous reçu le vaccin…», «Nous accompagnons ensemble», que
 *   no tienen género) y, cuando no, con «(e)» —«seul(e)», «obligé(e)»—, que
 *   es como lo escriben los formularios administrativos franceses. El punto
 *   medio («seul·e») se descartó: los lectores de pantalla lo leen mal.
 *
 * · El nombre se explica una vez, en la descripción: Aquí Estamos («Nous
 *   sommes là»). No se traduce en ningún otro sitio, y «Red Aquí Estamos» se
 *   queda tal cual donde el español lo usa como nombre propio.
 *
 * · Lo colombiano se nombra y se explica una vez: «tarjeta profesional»,
 *   ReTHUS, REPS, la Ley 1581, el NIT, la SIC.
 *
 * · Las líneas de emergencia son de Colombia y se dice, como en inglés: a
 *   quien lee en francés desde otro país se le remite a su número local.
 *
 * · En «Donar», «sostener» es «soutenir», nunca «financer»: una donación
 *   apoya el trabajo de la red, no lo paga entero, y el texto no puede
 *   prometer más de lo que hace.
 *
 * · Tipografía francesa: antes de ? ! : ; y por dentro de las comillas « »
 *   va un espacio duro (U+00A0), y también entre la cifra y su unidad (8 h,
 *   100 %, 10 Mo). En el editor no se distingue de un espacio normal: no hay
 *   que «limpiarlo». Nunca va dentro de una URL, de una {variable} ni de las
 *   marcas.
 *
 * · El teléfono de ejemplo, +33 6 39 98 12 34, es de la serie que la ARCEP
 *   reserva para la ficción: no es el número de nadie.
 *
 * · Las casillas de autorización son la traducción de la versión 2026-09 del
 *   texto español, que es el que vale. Igual que allá: no se editan; si el
 *   texto cambia, cambia la versión.
 */
export const fr: Diccionario = {
  sitio: {
    nombre: 'Aquí Estamos',
    lema: 'Réseau d’accompagnement psychologique et de soutien en situation de crise',
    descripcion:
      'Aquí Estamos (« Nous sommes là ») est un réseau collaboratif de professionnels et de bénévoles engagés pour le bien-être émotionnel, l’accompagnement psychosocial et le soutien en situation de crise.',
    irAlInicio: '{nombre} — accueil',
  },

  idioma: {
    etiqueta: 'Langue',
    sugerencia: 'Ce site existe aussi en français.',
    ver: 'Voir en français',
    cerrar: 'Fermer ce message',
  },

  nav: {
    principal: 'Navigation principale',
    movil: 'Navigation mobile',
    tituloMenu: 'Menu de navigation',
    abrir: 'Ouvrir le menu',
    cerrar: 'Fermer le menu',
    enlaces: {
      serParte: {
        etiqueta: 'Je veux offrir un soutien psychologique',
        aclaracion: '(Personnes diplômées ou en fin d’études)',
      },
      apoyar: {
        etiqueta: 'Je veux devenir bénévole',
        aclaracion: '(Avocats, personnel administratif, logistique, design, etc.)',
      },
      ayuda: {
        etiqueta: 'J’ai besoin d’aide',
        aclaracion: '(Demander un soutien émotionnel et une aide psychologique)',
      },
      recursos: { etiqueta: 'Ressources', aclaracion: '' },
      donar: {
        etiqueta: 'Faire un don',
        aclaracion: '(Soutenir le réseau par un don)',
      },
    },
  },

  pie: {
    presentacion:
      'Nous sommes un réseau collaboratif qui cherche à faciliter l’accès à l’aide psychologique et à promouvoir le bien-être émotionnel grâce à la communauté, à l’information et à l’accompagnement.',
    enlaces: 'Liens du pied de page',
    preguntas: 'Questions fréquentes',
    politica: 'Politique de données',
    consentimiento: 'Consentement éclairé',
    cierre: 'Accompagner, c’est une manière de reconstruire notre pays.',
  },

  flotante: {
    grupo: 'Actions rapides de contact et d’aide',
    preguntas: 'FAQ',
    preguntasAyuda: 'Voir les questions fréquentes',
    whatsapp: 'WhatsApp',
    whatsappAyuda: 'Écrire sur notre WhatsApp officiel',
    instagram: 'Instagram',
    instagramAyuda: 'Suivre le réseau sur Instagram',
  },

  migas: {
    inicio: 'Accueil',
    ruta: 'Fil d’Ariane',
  },

  noEncontrada: {
    titulo: 'Nous n’avons pas trouvé cette page',
    texto:
      'Le lien a peut-être changé. Depuis la page d’accueil, vous pouvez accéder à tout ce que nous proposons.',
    inicio: 'Retour à l’accueil',
    recursos: 'Voir les ressources',
  },

  avisos: {
    traduccion:
      'Ceci est une traduction de courtoisie. La version espagnole est le texte officiel, et c’est elle qui fait foi.',
    verOriginal: 'Lire la version espagnole',
    fueraDeColombia:
      'Ces lignes fonctionnent en Colombie. Si vous êtes dans un autre pays, appelez le numéro d’urgence local.',
    atencionEnEspanol:
      'Nos professionnels bénévoles accompagnent en espagnol. Si vous avez besoin d’un accompagnement dans une autre langue, dites-le-nous dans le message à la fin de ce formulaire et nous vous dirons ce que nous pouvons vous proposer.',
    redEnEspanol:
      'Bon à savoir : le réseau fonctionne en espagnol. C’est la langue de l’équipe de coordination et de la plupart des personnes que nous accompagnons.',
  },

  inicio: {
    heroAlt: 'Illustration du réseau Aquí Estamos',
    titulo: 'Un réseau qui relie les personnes, fait grandir l’espoir et transforme des vies',
    presentacion: [
      'Nous sommes un réseau collaboratif de professionnels et de bénévoles engagés pour le bien-être émotionnel, l’accompagnement psychosocial et le soutien en situation de crise.',
      'Nous relions des personnes, des communautés et des professionnels pour offrir écoute, orientation et soutien en temps utile, en renforçant le tissu humain et social grâce à des initiatives de terrain, à des alliances stratégiques et à la coopération internationale.',
    ],
    destacado: 'Parce qu’accompagner, c’est aussi reconstruire, et qu’être là peut faire la différence.',
    accesos: 'Comment pouvons-nous vous aider ?',
    tarjetas: {
      serParte: {
        titulo: 'Je veux offrir un soutien psychologique',
        texto:
          'Pour les personnes diplômées en psychologie, ou en fin d’études, qui souhaitent accompagner.',
      },
      apoyar: {
        titulo: 'Je veux devenir bénévole',
        texto:
          'Avocats, personnel administratif, logistique, design et plus encore : rejoignez-nous avec ce que vous savez faire.',
      },
      ayuda: {
        titulo: 'J’ai besoin d’aide',
        texto: 'Demandez un soutien émotionnel et une aide psychologique : nous vous accompagnons.',
      },
      recursos: {
        titulo: 'Ressources pour tous',
        texto: 'Guides, livres et outils pour les situations qui demandent du soutien.',
      },
    },
    sobreAlt: 'Des mains qui se soutiennent',
    sobreTitulo: 'À propos d’Aquí Estamos',
    sobreTexto:
      'Nous sommes un réseau collaboratif qui cherche à faciliter l’accès à l’aide psychologique et à promouvoir le bien-être émotionnel grâce à la communauté, à l’information et à l’accompagnement.',
    visionTitulo: 'Notre vision',
    vision: [
      'Nous voulons contribuer à construire une société plus humaine, solidaire et connectée, où demander de l’aide ne soit pas une source de honte et où en recevoir ne dépende pas uniquement des moyens financiers, des contacts ou des possibilités d’accès de chacun.',
      'Nous aspirons à renforcer un réseau de personnes et de professionnels capables de faire face aux difficultés avec savoir, humanité et responsabilité.',
      'Et que chaque intervention laisse plus qu’une aide ponctuelle : nous voulons qu’elle contribue à reconstruire des liens, à retrouver la confiance et à renforcer le tissu humain de nos communautés.',
    ],
    compromisoTitulo: 'Notre engagement',
    compromiso: [
      'Aquí Estamos ne prétend pas remplacer les systèmes formels de santé, de protection ou d’urgence. Notre raison d’être est de fédérer les compétences et de rendre le soutien plus proche : identifier les besoins, faciliter l’orientation et mettre les personnes en relation avec les ressources adaptées.',
      'C’est pourquoi ce réseau repose sur deux piliers qui doivent toujours avancer ensemble : l’humanité et la responsabilité.',
    ],
    pilares: [
      { titulo: 'Humanité', texto: 'L’humanité nous rappelle pourquoi nous faisons ce que nous faisons.' },
      { titulo: 'Responsabilité', texto: 'La responsabilité nous rappelle comment nous devons le faire.' },
    ],
    compromisoCierre: [
      'Parce que lorsqu’une personne en soutient une autre, lorsqu’un professionnel partage ses connaissances, lorsque quelqu’un écoute, oriente ou reste simplement présent dans un moment difficile, quelque chose se reconstruit, bien au-delà de cette situation particulière. C’est l’humanité qui se reconstruit.',
      'Parce que, lorsque tout semble se fragmenter, nous pouvons toujours commencer par nous retrouver.',
    ],
    proyeccionTitulo: 'Déploiement territorial et international',
    proyeccion:
      'Nous renforçons le tissu humain et social grâce à des initiatives de soutien psychosocial et à des alliances stratégiques internationales, comme notre collaboration avec la Psychologische Hochschule Berlin (PHB), et, en novembre 2026, nous commençons notre action sur le terrain en Tanzanie.',
    donarTitulo: 'Soutenez le réseau',
    donarTexto:
      'Votre don soutient un accompagnement psychologique gratuit pour des personnes et des familles en situation de crise.',
    donarBoton: 'Je veux faire un don',
    sociosTitulo: 'Partenaires stratégiques',
    sociosTexto:
      'Des organisations qui avancent à nos côtés pour apporter un soutien psychosocial à davantage de personnes.',
    sociosVisitar: 'Visiter le site de {nombre} (s’ouvre dans un nouvel onglet)',
    contacto: 'Contactez-nous',
    noEstasSola: 'Vous n’êtes pas seul(e).',
    estamosAqui: 'Nous sommes là pour vous accompagner.',
    whatsappTitulo: 'Accompagnement psychosocial et bénévolat',
    whatsappTexto:
      'Écrivez-nous pour demander un accompagnement ou pour rejoindre notre réseau comme bénévole.',
    whatsappBoton: 'Envoyer un message sur WhatsApp',
    instagramTitulo: 'Restez en lien avec notre réseau',
    instagramTexto: 'Suivez-nous sur Instagram et découvrez notre travail et notre impact social.',
    instagramBoton: 'Nous suivre',
    equipo: {
      titulo: 'Équipe de direction',
      direccion: { cargo: 'Fondatrice et directrice', boton: 'Écrire à Poli sur WhatsApp' },
      subdireccion: { cargo: 'Directrice adjointe', boton: 'Écrire à Alejandra sur WhatsApp' },
      relaciones: {
        cargo: 'Directeur de la communication · Relations publiques',
        boton: 'Écrire à Daniel sur WhatsApp',
      },
    },
    cierreAlt: 'Illustration d’une communauté',
    cierre: 'Accompagner, c’est une manière de reconstruire notre pays',
  },

  emergencia: {
    nombre: 'Pourquoi le réseau existe',
    tituloInicio: 'Quand l’urgence se termine,',
    tituloFin: 'beaucoup de choses ne font que commencer.',
    familias: {
      titulo: 'Des familles tentent de réorganiser leur vie.',
      texto: 'Il y a de la peur, de l’incertitude, des pertes et beaucoup de questions.',
    },
    espacio: {
      titulo:
        'Dans ces moments-là, avoir un espace où parler, où l’on vous écoute et où trouver des repères peut faire la différence.',
      porEso: 'C’est pourquoi nous créons un',
      red: 'Réseau d’**accompagnement psychologique** et de **soutien en situation de crise.**',
    },
    temporal: {
      texto:
        'Un réseau de professionnels, d’étudiants et d’alliés qui souhaitent contribuer à la réponse psychologique face à l’urgence du **10 août 2026 en Colombie.**',
    },
    personas: {
      texto:
        'Nous cherchons des personnes prêtes à mettre leurs connaissances, leur temps et leur écoute au service de celles et ceux qui en ont besoin aujourd’hui.',
      paraTi:
        'Si vous êtes psychologue ou si vous étudiez la psychologie, **cet espace est aussi pour vous.**',
    },
    cierre: 'Accompagner, c’est une manière de reconstruire notre pays.',
  },

  camino: {
    titulo: 'Comment faire partie d’Aquí Estamos ?',
    bajada:
      'Si vous travaillez dans la santé mentale et souhaitez rejoindre notre réseau pour accompagner davantage de personnes, voici la marche à suivre.',
    misionTitulo: 'Notre mission',
    mision:
      'Mettre les personnes en relation avec des professionnels de la santé mentale et rendre accessibles des ressources fiables, pour le soutien émotionnel, la prévention et l’accompagnement en situation de crise.',
    pasosTitulo: 'Les étapes pour rejoindre le réseau',
    pasos: [
      {
        titulo: 'Remplissez le formulaire',
        texto:
          'Complétez le formulaire d’inscription avec vos informations professionnelles, vos domaines d’intervention et vos coordonnées.',
      },
      {
        titulo: 'Vérification des informations',
        texto:
          'Nous examinons votre profil pour nous assurer que votre approche correspond aux valeurs et aux objectifs du réseau.',
      },
      {
        titulo: 'Confirmation',
        texto:
          'Nous vous écrirons pour confirmer votre participation et vous communiquer les détails des prochaines étapes.',
      },
      {
        titulo: 'Accueil et intégration',
        texto:
          'Vous recevrez un accès à nos canaux de communication, à nos ressources et aux supports du réseau.',
      },
      {
        titulo: 'Nous accompagnons ensemble',
        texto:
          'Vous faites partie d’une communauté collaborative qui œuvre pour le bien-être et la prévention.',
      },
    ],
    beneficiosTitulo: 'En rejoignant Aquí Estamos, vous pourrez :',
    beneficios: [
      'Faire partie d’un réseau de professionnels éthique et collaboratif.',
      'Accéder à des ressources fiables pour le soutien émotionnel, et en partager.',
      'Participer à des espaces de diffusion, d’apprentissage et de mise à jour des connaissances.',
      'Contribuer à la prévention et au bien-être d’un plus grand nombre de personnes.',
    ],
    listaTitulo: 'Vous souhaitez rejoindre le réseau ?',
    listaTexto:
      'Le formulaire se trouve sur cette même page. Et si vous avez des questions, écrivez-nous.',
    irAlFormulario: 'Aller au formulaire',
    whatsapp: 'Écrivez-nous sur WhatsApp',
    instagram: 'Suivez-nous sur Instagram',
    cierre:
      'Aquí Estamos est un espace sûr, humain et attentif au contexte de chaque personne. Merci d’apporter vos connaissances, votre temps et votre cœur.',
  },

  preguntas: {
    ceja: 'Orientation et réponses',
    titulo: 'Questions fréquentes',
    intro:
      'Nous répondons à vos questions sur la façon de recevoir un accompagnement, de rejoindre le réseau comme professionnel(le) bénévole ou de soutenir les activités de la fondation.',
    buscar: 'Rechercher une question (ex. : REPS, ReTHUS, coût, séances, certificat...)',
    limpiar: 'Effacer',
    resultadosPara: 'Résultats de recherche pour',
    coincidencia: 'résultat',
    coincidencias: 'résultats',
    sinResultados: 'Nous n’avons trouvé aucune question liée à',
    verTodas: 'Voir toutes les questions',
    dudaTitulo: 'Vous avez une autre question sur le modèle ou sur le réseau ?',
    dudaTexto: 'Notre équipe de coordination est disponible pour vous orienter directement.',
    dudaBoton: 'Écrire sur WhatsApp',
    categorias: {
      psicologia: {
        etiqueta: 'Professionnels de la psychologie',
        aclaracion: 'ReTHUS, accompagnement et cadre éthique',
      },
      pacientes: {
        etiqueta: 'Personnes et familles',
        aclaracion: 'Demande de soutien, gratuité et séances',
      },
      voluntarios: {
        etiqueta: 'Bénévolat',
        aclaracion: 'Autres disciplines et tâches de soutien',
      },
      fundacion: {
        etiqueta: 'À propos de la fondation',
        aclaracion: 'Mission, données et cadre légal',
      },
    },
    items: {
      'psi-reps-rethus': {
        distintivo: 'Cadre légal ReTHUS',
        pregunta:
          'Une inscription au REPS en tant que professionnel indépendant est-elle nécessaire pour faire partie du réseau ?',
        respuesta: [
          '**Aucune inscription au REPS en tant que professionnel indépendant n’est nécessaire** pour faire partie du modèle d’accompagnement d’Aquí Estamos.',
          'Votre inscription au **ReTHUS** (le registre national unique des professionnels de santé de Colombie) et votre **carte professionnelle en cours de validité** (la tarjeta profesional colombienne) sont les exigences professionnelles officielles que nous vérifions lors de votre intégration.',
          'Le REPS (Registre spécial des prestataires de services de santé) concerne le prestataire institutionnel et, dans notre modèle, nous structurons la **Fondation Aquí Estamos** comme la personne morale qui organise, gère et encadre l’accompagnement. Pendant que nous consolidons le modèle d’habilitation institutionnelle correspondant, votre participation s’inscrit dans le champ propre de l’**accompagnement psychologique, des premiers secours émotionnels et de la contenance en situation de crise** d’Aquí Estamos, et non dans l’exercice indépendant de consultations ou de traitements cliniques isolés.',
        ],
      },
      'psi-registro-confidencialidad': {
        distintivo: '',
        pregunta:
          'Comment sont gérés les comptes rendus des séances et la confidentialité des informations ?',
        respuesta: [
          'L’ensemble du processus est régi par des principes stricts de **secret professionnel** et par la **loi colombienne 1581 de 2012 (Habeas Data)**.',
          'En tant que professionnel, vous accédez au cas qui vous est attribué au moyen d’un **lien sécurisé avec authentification**, où ne s’affichent que les données nécessaires à l’accompagnement. À la fin de chaque séance, vous consignez un bref compte rendu de l’avancement du processus sur la plateforme interne. Nous ne partageons jamais de numéros de téléphone ni de données sensibles sur des canaux ouverts.',
        ],
      },
      'psi-disponibilidad-horarios': {
        distintivo: '',
        pregunta:
          'Combien de temps dois-je y consacrer, et comment ma disponibilité est-elle coordonnée ?',
        respuesta: [
          'Le bénévolat est flexible et s’adapte à votre emploi du temps. En postulant via [Je veux offrir un soutien psychologique](/quiero-ser-parte), vous décidez combien d’heures par semaine vous pouvez consacrer, et quels jours et à quels moments de la journée (matin, après-midi ou soir).',
          'Notre système ne vous propose que des personnes dont les disponibilités correspondent exactement aux créneaux que vous avez indiqués. Les séances durent **45 minutes** et la plateforme prévoit automatiquement des pauses entre les rendez-vous pour préserver votre bien-être.',
        ],
      },
      'psi-alcance-casos': {
        distintivo: '',
        pregunta: 'Quels types de cas le réseau Aquí Estamos prend-il en charge ?',
        respuesta: [
          'Nous nous concentrons sur les **premiers secours psychologiques, la contenance émotionnelle et l’accompagnement psychosocial bref** (cycles de 3 à 4 séances).',
          'Nous ne prenons pas en charge les urgences psychiatriques avec risque vital imminent, ni les psychopathologies sévères qui nécessitent une hospitalisation. Si un risque élevé est détecté lors de l’évaluation initiale ou pendant une séance, le **circuit d’orientation institutionnel** vers les centres de santé et les lignes d’urgence nationales est activé immédiatement.',
        ],
      },
      'pac-gratuidad': {
        distintivo: '100 % gratuit',
        pregunta: 'Le service d’aide et d’accompagnement psychologique est-il payant ?',
        respuesta: [
          '**Non, il est entièrement gratuit.** Le réseau Aquí Estamos est une initiative solidaire à but non lucratif, créée pour que toute personne ayant besoin d’un soutien émotionnel puisse le recevoir sans obstacle financier.',
        ],
      },
      'pac-como-solicitar': {
        distintivo: '',
        pregunta: 'Comment demander une séance d’accompagnement psychologique ?',
        respuesta: [
          'Il vous suffit d’aller sur [J’ai besoin d’aide](/atencion-psicologica) et de remplir un court formulaire avec vos coordonnées et vos disponibilités.',
          'Un coordinateur de notre équipe examinera votre demande et vous contactera par **WhatsApp ou par e-mail** pour confirmer la date et l’heure de votre première séance avec un ou une psychologue bénévole.',
        ],
      },
      'pac-cuantas-sesiones': {
        distintivo: '',
        pregunta: 'Combien de séances de soutien vais-je recevoir ?',
        respuesta: [
          'Le programme prévoit un cycle de **3 à 4 séances d’accompagnement ciblé** avec le même professionnel.',
          'À la fin de ce processus, si vous et le professionnel estimez qu’un suivi continu ou spécialisé à long terme est nécessaire, nous vous orientons vers des réseaux de santé et des services complémentaires.',
        ],
      },
      'pac-modalidad': {
        distintivo: '',
        pregunta: 'L’accompagnement se fait-il à distance ou en présentiel ?',
        respuesta: [
          'La grande majorité des accompagnements se font **à distance (par appel vidéo ou par téléphone)**, ce qui permet de soutenir des personnes dans n’importe quelle commune de Colombie ou à l’étranger.',
          'Si des journées ou des missions communautaires en présentiel sont organisées dans des lieux précis, nous l’annoncerons en temps utile sur nos canaux officiels.',
        ],
      },
      'pac-emergencias-graves': {
        distintivo: 'Urgences',
        pregunta: 'Que faire en cas d’urgence vitale ou de crise immédiate ?',
        respuesta: [
          'En cas de risque imminent pour vous ou pour l’un de vos proches (idées suicidaires actives, danger pour l’intégrité physique), **rendez-vous immédiatement au centre de santé ou au service des urgences le plus proche**, ou appelez une ligne d’urgence gratuite. Voici les lignes nationales de Colombie ; si vous êtes dans un autre pays, appelez le numéro d’urgence local :',
          {
            lista: [
              '**Ligne nationale d’urgence :** 123',
              '**Ligne d’orientation en santé mentale (ministère de la Santé) :** 106 / 192',
              '**Línea Púrpura (femmes à Bogotá) :** 018000 112 137',
            ],
          },
        ],
      },
      'vol-quienes-pueden': {
        distintivo: '',
        pregunta: 'Je ne suis pas psychologue : comment puis-je m’engager comme bénévole ?',
        respuesta: [
          'Votre talent est essentiel pour le réseau ! Dans notre programme [Je veux devenir bénévole](/quiero-apoyar), nous accueillons des professionnels et des étudiants en **droit, médecine, soins infirmiers, travail social, graphisme, communication, informatique, administration, logistique et action communautaire**.',
          'Les bénévoles apportent leur aide pour des tâches internes : vérification des profils, gestion des agendas, création de supports pédagogiques, appels de suivi et soutien organisationnel.',
        ],
      },
      'vol-como-asignan-tareas': {
        distintivo: '',
        pregunta: 'Comment les tâches ou les créneaux de soutien me sont-ils attribués ?',
        respuesta: [
          'Lorsque l’équipe de coordination crée une tâche qui correspond à vos disponibilités et à votre discipline, vous recevez une invitation personnalisée par e-mail ou par WhatsApp, avec un lien unique (`/turno/...`).',
          'En ouvrant le lien, vous verrez le détail de la tâche, la date, l’horaire et les notes de l’équipe, et vous pourrez confirmer en un seul clic si vous acceptez d’y participer.',
        ],
      },
      'vol-certificado': {
        distintivo: '',
        pregunta: 'Délivrez-vous un certificat d’heures de bénévolat ?',
        respuesta: [
          '**Non.** Le réseau Aquí Estamos est une initiative de soutien solidaire et communautaire qui **ne délivre ni certificats de bénévolat ni attestations d’heures** à des fins académiques ou professionnelles. La participation de tous les professionnels et collaborateurs est 100 % bénévole, portée par l’engagement social et le soin collectif.',
        ],
      },
      'fun-que-es': {
        distintivo: '',
        pregunta: 'Qu’est-ce que le réseau Aquí Estamos, et quelle est sa mission ?',
        respuesta: [
          'Nous sommes un réseau collaboratif à but non lucratif qui cherche à faciliter l’accès universel à l’aide psychologique et à promouvoir le bien-être émotionnel grâce à la communauté, à l’information et à un accompagnement humain, en contribuant à la reconstruction du tissu social.',
        ],
      },
      'fun-seguridad-datos': {
        distintivo: '',
        pregunta: 'Comment protégez-vous mes données personnelles et ma vie privée ?',
        respuesta: [
          'Toutes les informations enregistrées sont traitées selon des normes strictes de sécurité informatique et dans le plein respect de la **loi statutaire colombienne 1581 de 2012** relative à la protection des données personnelles (Habeas Data).',
          'Vous pouvez consulter l’intégralité de notre politique sur la page [Politique de données](/politica-de-datos). Vos données ne sont jamais vendues ni partagées avec des tiers.',
        ],
      },
    },
  },

  atencion: {
    meta: {
      titulo: 'J’ai besoin d’aide · Soutien psychologique',
      descripcion:
        'Demandez un accompagnement psychologique gratuit auprès des professionnels bénévoles du réseau Aquí Estamos.',
    },
    titulo: 'J’ai besoin d’aide',
    bajada: 'Accompagnement psychologique et soutien émotionnel',
    aviso:
      '**Nous sommes avec vous.** Ce formulaire prend moins de 2 minutes, et vous répondez à presque toutes les questions en un seul clic. Vos réponses sont strictement confidentielles et nous permettent de vous mettre en relation avec un professionnel bénévole selon le degré d’urgence de votre situation.',
    whatsapp: 'Je préfère écrire directement sur WhatsApp au {numero}',
  },

  serParte: {
    meta: {
      titulo: 'Je veux offrir un soutien psychologique',
      descripcion:
        'Rejoignez notre réseau de professionnels et construisons ensemble davantage de possibilités d’accompagnement.',
    },
    titulo: 'Je veux offrir un soutien psychologique',
    bajada:
      'Rejoignez notre réseau de professionnels et construisons ensemble davantage de possibilités d’accompagnement.',
    aviso: [
      'Chez Red Aquí Estamos, nous réunissons un réseau de professionnels de la psychologie engagés à offrir un accompagnement psychologique et des premiers secours psychologiques aux personnes et aux familles qui traversent des situations d’urgence et de crise.',
      'Si cette mission trouve un écho en vous, nous vous invitons à apporter vos connaissances et votre expérience pour contribuer au bien-être émotionnel et à la reconstruction du tissu humain et social.',
      'Les informations que vous nous transmettrez nous permettront de connaître votre profil professionnel et d’explorer les possibilités de participation au réseau.',
      '**Votre expérience peut faire la différence.** Merci de vouloir nous rejoindre !',
    ],
    whatsapp: 'Envoyer un message sur WhatsApp',
    formulario: 'Remplissez le formulaire',
    obligatorios: 'Les champs marqués d’un {asterisco} sont obligatoires.',
  },

  apoyar: {
    meta: {
      titulo: 'Je veux devenir bénévole · Red Aquí Estamos',
      descripcion:
        'Rejoignez les bénévoles du réseau avec votre discipline : santé, logistique, droit, communication, technologie, gestion et plus encore.',
    },
    titulo: 'Je veux devenir bénévole',
    bajada:
      'Face à une urgence, la psychologie ne suffit pas. Rejoignez-nous avec ce que vous savez faire.',
    aviso: [
      'Chez Red Aquí Estamos, nous disposons d’un réseau pluridisciplinaire de bénévoles qui rassemble des personnes prêtes à apporter leurs connaissances, leurs compétences et leur expérience face aux situations d’urgence et de crise.',
      'Si vous souhaitez contribuer à partir de votre formation, de votre profession ou de votre métier, nous vous invitons à nous rejoindre et à mettre vos compétences au service des personnes et des familles qui ont besoin de soutien.',
      'Les informations que vous nous communiquerez nous permettront de connaître votre profil et vos disponibilités, afin d’identifier des possibilités de participation et de collaboration aux actions du réseau.',
      '**Chaque contribution compte.** Votre disponibilité peut faire la différence.',
    ],
    whatsapp: 'Des questions ? Écrivez-nous sur WhatsApp au {numero}',
  },

  donar: {
    meta: {
      titulo: 'Faire un don',
      descripcion:
        'Faites un don à Red Aquí Estamos : votre contribution soutient un accompagnement psychologique gratuit pour des personnes et des familles en situation d’urgence et de crise.',
    },
    titulo: 'Soutenez le réseau',
    bajada:
      'Votre don soutient un accompagnement psychologique gratuit pour des personnes et des familles en situation de crise.',
    intro:
      'Aquí Estamos est un réseau de professionnels et de bénévoles qui accompagne gratuitement des personnes et des familles en situation d’urgence et de crise. Grâce à votre don, nous pouvons poursuivre ce travail et accompagner davantage de personnes.',
    boton: 'Faire un don maintenant',
    botonNota: 'Le bouton ouvre WhyDonate, la plateforme sur laquelle nous recevons les dons en ligne.',
    titular:
      'La campagne y apparaît au nom de María Ramírez : c’est Poli, fondatrice et directrice du réseau.',
    cifrasTitulo: 'Le réseau aujourd’hui',
    cifras: {
      profesionales: 'professionnels bénévoles actifs',
      personasAcompanadas: 'personnes accompagnées',
      sesiones: 'séances d’accompagnement',
      voluntariosDeApoyo: 'personnes engagées dans le bénévolat de soutien',
    },
    cifrasNota: 'Chiffres du réseau au {fecha}.',
    impactoTitulo: 'Ce que votre don soutient',
    impacto: [
      {
        titulo: 'Un accompagnement gratuit',
        texto:
          'Des séances avec des professionnels de la psychologie pour des personnes et des familles qui traversent une situation d’urgence ou une crise, sans aucun frais pour elles.',
        alt: 'Illustration d’une personne accompagnée',
      },
      {
        titulo: 'Une présence sur le terrain',
        texto:
          'Des initiatives de soutien psychosocial menées avec les communautés, main dans la main avec nos partenaires.',
        alt: 'Des mains qui se soutiennent',
      },
      {
        titulo: 'Un réseau qui prend soin des siens',
        texto:
          'La formation, la coordination et le soin des professionnels et des bénévoles qui rendent possible chaque accompagnement.',
        alt: 'Illustration d’une communauté',
      },
    ],
    qrTitulo: 'Faites un don avec le code QR',
    qrTexto: 'Scannez-le avec l’appareil photo de votre téléphone.',
    qrAlt: 'Code QR pour faire un don à Red Aquí Estamos',
    bancoTitulo: 'Virement bancaire (Colombie)',
    banco: {
      entidad: 'Banque',
      titular: 'Titulaire',
      tipo: 'Type de compte',
      numero: 'Numéro de compte',
      documento: 'NIT (identifiant fiscal)',
    },
    copiar: 'Copier le numéro',
    copiado: 'Copié !',
    dudas: 'Vous avez une question sur votre don ?',
    dudasBoton: 'Écrivez-nous sur WhatsApp',
    dudasMensaje: 'Bonjour, j’ai une question au sujet d’un don à Red Aquí Estamos.',
  },

  recursos: {
    meta: {
      titulo: 'Ressources pour tous',
      descripcion: 'Guides, livres et outils pour les situations qui demandent du soutien.',
    },
    titulo: 'Ressources pour tous',
    bajada: 'Guides, livres et outils pour les situations qui demandent du soutien.',
    seccion: 'Histoires pour enfants',
    noDisponible:
      'La bibliothèque n’est pas disponible pour le moment. Veuillez réessayer dans quelques minutes.',
    profesionales: 'Documentation pour les professionnels',
    proximamente: 'Bientôt disponible.',
    compartir: 'Si vous avez une autre ressource à partager, vous pouvez nous contacter.',
    compartirBoton: 'Partager une ressource',
    compartirMensaje: 'Bonjour, je voudrais partager une ressource avec le réseau Aquí Estamos : ',
    noEncontrado: 'Ressource introuvable',
    categoria: 'Catégorie',
    archivos: 'Fichiers et contenus multimédias',
    abrir: 'Ouvrir le document',
    volver: 'Retour à la bibliothèque',
    vistaPrevia: 'Aperçu de {titulo}',
    sinVisor: 'Votre navigateur ne peut pas afficher le PDF ici.',
    abrirPestana: 'Ouvrez-le dans un nouvel onglet',
    soloEnEspanol: 'En espagnol',
    notaIdioma:
      'Ces livres et ces guides ont été écrits en espagnol par leurs auteurs. Nous les partageons dans leur langue d’origine ; les descriptions ont été rédigées par nos soins.',
    categorias: {
      'acompanamiento-ante-emergencias': 'Accompagnement en situation d’urgence',
      autorregulacion: 'Autorégulation',
      'contencion-emocional': 'Contenance émotionnelle',
      'sobre-el-duelo-y-la-muerte': 'Sur le deuil et la mort',
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
          'Une histoire de courage et d’espoir pour accompagner les enfants après une expérience difficile.',
      },
      'el-monstruo-toti-y-el-baile-del-planeta': {
        titulo: 'El monstruo Toti y el baile del planeta',
        descripcion:
          'Une histoire illustrée qui explique les tremblements de terre aux enfants, avec des mots simples et proches d’eux.',
      },
      'ana-y-el-terremoto': {
        titulo: 'Ana y el terremoto',
        descripcion:
          'Une histoire qui aide les enfants à comprendre ce qui s’est passé et à exprimer leur peur après un tremblement de terre.',
      },
      respira: {
        titulo: 'Respira',
        descripcion:
          'Une histoire-guide avec des exercices de respiration simples, pour aider les enfants à retrouver leur calme et à réguler leurs émotions.',
      },
      'mi-miedo-mi-guardian-personal': {
        titulo: 'Mi miedo, mi guardián personal',
        descripcion:
          'Un livre qui aide les enfants à comprendre la peur et à la reconnaître comme une émotion qui peut nous protéger dans les situations difficiles.',
      },
      'plaza-sesamo-contencion-emocional': {
        titulo: 'Plaza Sésamo — Contención emocional',
        descripcion:
          'Un support conçu pour accompagner les enfants et leur offrir un cadre émotionnel rassurant dans les moments difficiles ou après une situation d’urgence.',
      },
      vacio: {
        titulo: 'Vacío',
        descripcion:
          'Une histoire sur le sentiment de vide qui peut suivre une perte, et sur le chemin qui permet d’apprendre à vivre avec.',
      },
      'el-arbol-de-los-recuerdos': {
        titulo: 'El árbol de los recuerdos',
        descripcion:
          'Une histoire qui aide les enfants à traverser la perte et à garder vivant, avec tendresse, le souvenir de ceux qui ne sont plus là.',
      },
    },
  },

  politica: {
    meta: {
      titulo: 'Politique de traitement des données',
      descripcion:
        'Comment Red Aquí Estamos collecte, utilise, conserve et supprime les données personnelles des personnes qui demandent un accompagnement et des professionnels bénévoles.',
    },
    version: 'Version {version}',
    titulo: 'Politique de traitement des données',
    intro:
      'Cette politique explique quelles données nous collectons, à quoi nous les utilisons, avec qui nous les partageons, combien de temps nous les conservons et comment vous pouvez nous demander de les modifier ou de les supprimer.',
    secciones: [
      {
        titulo: '1. Qui est responsable de vos données',
        bloques: [
          '**{responsable}** est responsable du traitement des données personnelles que nous collectons sur ce site.',
          'Vous pouvez nous contacter via [{canal}]({canalHref}). C’est aussi le canal à utiliser pour exercer l’un des droits décrits plus bas.',
        ],
      },
      {
        titulo: '2. Quelles données nous collectons',
        bloques: [
          '**Si vous demandez un accompagnement :** votre nom, votre numéro de mobile, votre e-mail si vous choisissez de nous le donner, la ville d’où vous nous écrivez, les jours et les créneaux où vous êtes disponible, si vous préférez un accompagnement en présentiel ou à distance, et ce que vous souhaitez nous confier dans le champ libre. Si la demande concerne une autre personne, nous recueillons aussi son nom, votre lien avec elle et le fait qu’elle soit mineure ou non.',
          '**Si vous postulez en tant que professionnel :** votre nom, votre numéro de mobile, votre e-mail, votre ville, votre profession et votre formation, vos années d’expérience, votre carte professionnelle, les publics avec lesquels vous travaillez, vos disponibilités et, si vous pouvez accompagner en présentiel, votre statut vaccinal contre la fièvre jaune.',
          {
            aviso:
              '**Données sensibles.** Le fait de demander un accompagnement psychologique et le statut vaccinal sont des données de santé, que la loi considère comme sensibles. Vous n’êtes pas obligé(e) de les fournir. Nous ne les traitons que si vous nous donnez une autorisation expresse et distincte, en cochant la case correspondante dans le formulaire.',
          },
        ],
      },
      {
        titulo: '3. À quoi nous les utilisons',
        bloques: [
          {
            lista: [
              'Vous contacter et coordonner votre accompagnement, ou évaluer votre candidature.',
              'Attribuer un professionnel et planifier les séances.',
              'Tenir le registre interne du réseau et ses statistiques de fonctionnement.',
              'Vous envoyer des informations sur d’autres activités, uniquement si vous l’avez autorisé séparément.',
            ],
          },
          'Nous n’utilisons vos données pour aucune autre finalité, et nous ne prenons aucune décision automatisée vous concernant.',
        ],
      },
      {
        titulo: '4. Avec qui nous les partageons',
        bloques: [
          'Avec le professionnel du réseau qui vous accompagne et avec l’équipe de coordination, et uniquement dans la mesure nécessaire à la prestation du service. **Nous ne vendons pas vos données et ne les transmettons pas à des tiers** extérieurs au réseau, sauf si une autorité compétente l’exige en vertu de la loi.',
          'Les informations sont stockées sur les serveurs de nos fournisseurs d’infrastructure technologique, qui ne les traitent que sur nos instructions.',
        ],
      },
      {
        titulo: '5. Combien de temps nous les conservons',
        bloques: [
          'Nous conservons vos données pendant **{anos} ans** à compter de la fin de votre accompagnement ou de la fin de votre participation au réseau. Passé ce délai, elles sont supprimées.',
        ],
      },
      {
        titulo: '6. Vos droits',
        bloques: [
          'À tout moment, vous pouvez :',
          {
            lista: [
              'Savoir quelles données vous concernant nous détenons et comment nous les utilisons.',
              'Demander leur mise à jour ou leur correction si elles sont erronées ou incomplètes.',
              'Demander leur suppression, lorsqu’aucune obligation légale n’impose de les conserver.',
              'Retirer l’autorisation que vous nous avez donnée.',
              'Déposer une plainte auprès de la Superintendance de l’industrie et du commerce (SIC) de Colombie.',
            ],
          },
          'Pour exercer l’un de ces droits, écrivez-nous via [{canal}]({canalHref}). Nous vous répondrons dans les délais fixés par la loi : jusqu’à dix jours ouvrables pour une demande de consultation et jusqu’à quinze jours ouvrables pour une réclamation.',
          'Retirer votre autorisation signifie que nous ne pourrons plus vous accompagner, car ces données sont nécessaires pour coordonner l’accompagnement.',
        ],
      },
      {
        titulo: '7. Enfants et adolescents',
        bloques: [
          'Lorsque l’accompagnement concerne une personne de moins de 18 ans, l’autorisation doit être donnée par son père, sa mère ou son représentant légal, et l’intérêt supérieur de l’enfant ou de l’adolescent prime toujours.',
        ],
      },
      {
        titulo: '8. Sécurité',
        bloques: [
          'Nous appliquons des mesures techniques et organisationnelles raisonnables pour protéger vos données : l’accès au système interne est nominatif et protégé par un mot de passe, chaque consultation de données de santé est enregistrée, et les informations circulent de manière chiffrée.',
        ],
      },
      {
        titulo: '9. Modifications de cette politique',
        bloques: [
          'Si nous modifions ce texte, nous publions une nouvelle version, datée. Les autorisations que vous nous avez déjà données restent associées à la version que vous aviez acceptée à ce moment-là, et nous conservons la trace de cette version.',
        ],
      },
    ],
    pendiente:
      '**Informations en attente.** Le NIT de l’organisation (son numéro d’identification fiscale en Colombie) est en cours d’obtention, et il n’existe pas encore de locaux ni d’adresse e-mail dédiée aux demandes relatives aux données. Dès qu’ils existeront, ils seront ajoutés ici et une nouvelle version sera publiée.',
    volver: 'Retour à l’accueil',
  },

  consentimiento: {
    meta: {
      titulo: 'Consentement éclairé',
      descripcion:
        'Ce que vous acceptez lorsque vous réservez une séance avec le réseau Aquí Estamos : en quoi consiste l’accompagnement, jusqu’où va la confidentialité et ce que nous faisons de vos données.',
    },
    version: 'Version {version}',
    titulo: 'Consentement éclairé',
    intro:
      'Voici ce que vous acceptez lorsque vous réservez une séance avec le réseau. Vous le reverrez au moment de choisir votre horaire, et c’est là que vous le signerez en écrivant votre nom. Si quelque chose n’est pas clair, posez-nous la question avant : nous préférons vous l’expliquer.',
    puntos: [
      {
        titulo: 'Ce dont il s’agit',
        texto:
          'Un accompagnement psychologique bénévole et gratuit, avec un professionnel du réseau Aquí Estamos. Il ne remplace pas un traitement médical ou psychiatrique, et nous ne sommes pas un service d’urgence.',
      },
      {
        titulo: 'Confidentialité',
        texto:
          'Ce que vous dites pendant la séance est confidentiel et protégé par le secret professionnel. Il n’existe que deux limites, toutes deux prévues par la loi : en cas de risque grave pour votre vie ou celle d’une autre personne, le professionnel peut mobiliser de l’aide ; et si une autorité compétente l’exige formellement.',
      },
      {
        titulo: 'C’est volontaire',
        texto:
          'Vous pouvez suspendre ou arrêter l’accompagnement quand vous le souhaitez, sans avoir à vous justifier et sans que cela change la façon dont nous vous traitons.',
      },
      {
        titulo: 'Vos données',
        texto:
          'Vos données de santé sont sensibles au regard de la loi colombienne et vous n’êtes pas obligé(e) d’en autoriser l’utilisation ; si vous l’acceptez, nous les utilisons uniquement pour coordonner votre accompagnement, comme l’indique notre politique de données. Vous pouvez demander à les consulter, à les corriger ou à les supprimer quand vous le souhaitez.',
      },
      {
        titulo: 'Ce que nous enregistrons',
        texto:
          'Le réseau ne tient pas de dossier clinique de vos séances. Il tient en revanche un registre administratif interne : vos coordonnées, ce que vous avez répondu en demandant de l’aide, vos rendez-vous et les notes qui nous servent à coordonner votre accompagnement. Ce registre n’est pas public : seuls votre professionnel et l’équipe de coordination du réseau y ont accès.',
      },
      {
        titulo: 'Votre signature',
        texto:
          'Lorsque vous écrivez votre nom et acceptez, nous enregistrons quelle version de ce texte vous avez acceptée, et à quel moment. Si quelque chose n’est pas clair, posez-nous la question sur WhatsApp avant de signer : nous vous l’expliquerons avec plaisir.',
      },
    ],
    riesgoTitulo: 'Si vous êtes en danger en ce moment',
    riesgoTexto:
      'Cet accompagnement n’est pas un service d’urgence et ne peut pas intervenir sur une crise au moment où elle se produit. Si vous ou une autre personne êtes en danger, appelez :',
    lineas: {
      '123': 'Ligne d’urgence',
      '106': 'Ligne de santé mentale',
    },
    dudasTitulo: 'Questions sur ce texte',
    dudasTexto:
      'Écrivez-nous via [{canal}]({canalHref}). Pour tout ce qui concerne vos données — les consulter, les corriger, les supprimer ou retirer votre autorisation —, reportez-vous à la [politique de traitement des données](/politica-de-datos), le document qui traite ce sujet en détail.',
  },

  formularios: {
    comun: {
      pasoDe: 'Étape {paso} sur 3',
      atras: 'Retour',
      opcional: '(Facultatif)',
      errorConexion:
        'Nous n’avons pas pu nous connecter au serveur. Vérifiez votre connexion et réessayez.',
      errorCampo: 'Veuillez vérifier ce champ.',
      errorServidor:
        'Nous n’avons pas pu enregistrer vos informations. Vérifiez le formulaire et réessayez, ou écrivez-nous sur WhatsApp.',
      telefono: {
        pista:
          'Avec WhatsApp, si vous l’avez : c’est par là que nous vous contacterons. Indiquez l’indicatif de votre pays, par exemple +33 6 39 98 12 34.',
        error:
          'Saisissez votre numéro avec l’indicatif du pays, par exemple +33 6 39 98 12 34. Les numéros de mobile colombiens peuvent aussi s’écrire avec 10 chiffres commençant par 3.',
      },
      nombreSoloLetras: 'Indiquez votre nom complet (lettres uniquement)',
      municipio: {
        desplegar: 'Afficher la liste des villes',
        coincidencias: 'Résultats pour « {busqueda} » (ou saisissez librement) :',
        principales: 'Principales villes et communes de Colombie :',
        noEsta: 'Nous n’avons pas trouvé « {busqueda} » dans la liste, mais',
        seGuarda: 'il sera enregistré tel que vous l’avez écrit',
      },
      pais: {
        etiqueta: 'Dans quel pays êtes-vous ?',
        ciudadFuera: { etiqueta: 'Dans quelle ville ?', ejemplo: 'Ex. : Paris' },
        avisoAtencion:
          'Comme vous nous écrivez depuis l’extérieur de la Colombie, l’accompagnement se fera à distance (par appel vidéo ou par téléphone) et les horaires seront convenus à l’heure de Colombie. Si vous êtes en danger, appelez le numéro d’urgence du pays où vous vous trouvez.',
        avisoVoluntariado:
          'Hors de Colombie, vous pouvez nous rejoindre à distance. Les horaires du réseau sont à l’heure de Colombie.',
        soloVirtual: 'Hors de Colombie, ce n’est possible qu’à distance.',
      },
      casillas: {
        atencion:
          'J’autorise Red Aquí Estamos à traiter mes données pour m’accompagner, y compris celles qui concernent ma santé mentale, qui sont des données sensibles que je ne suis pas obligé(e) de fournir.',
        datos:
          'J’autorise Red Aquí Estamos à traiter mes données personnelles aux fins décrites ci-dessus.',
        sensiblesProfesional:
          'Je comprends que l’information sur ma vaccination est une donnée de santé, que je ne suis pas obligé(e) de la fournir, et j’autorise son traitement pour les déplacements sur le terrain.',
        representante:
          'Je suis le père, la mère ou le représentant légal de la personne mineure qui va recevoir l’accompagnement, et j’autorise sa participation.',
        comunicaciones:
          'Je souhaite recevoir des informations sur d’autres activités et ressources du réseau.',
      },
      avisoTratamiento: {
        profesionales:
          'Red Aquí Estamos est responsable des données que vous nous communiquez. Nous les utilisons pour évaluer votre candidature, coordonner les accompagnements que vous prendrez en charge et tenir le registre interne du réseau. Nous ne les vendons pas et ne les transmettons pas à des tiers.',
        apoyo:
          'Red Aquí Estamos est responsable des données que vous nous communiquez. Nous les utilisons pour tenir un annuaire des bénévoles du réseau et pouvoir vous solliciter lorsqu’un besoin correspondant à ce que vous savez faire se présente. Nous ne les vendons pas et ne les transmettons pas à des tiers.',
      },
      avisoDerechos:
        'Vous pouvez à tout moment nous demander l’accès à vos données, leur mise à jour, leur correction ou leur suppression, ou retirer cette autorisation.',
    },

    atencion: {
      pasos: [
        'Qui accompagnons-nous, et comment vous joindre ?',
        'Comment vous sentez-vous aujourd’hui ? (Évaluation rapide)',
        'Modalité et confirmation',
      ],
      paraQuien: {
        etiqueta: 'L’accompagnement est…',
        opciones: { PARA_MI: 'Pour moi', PARA_OTRA_PERSONA: 'Pour une autre personne' },
      },
      esMenor: {
        etiqueta: 'Cette personne est-elle mineure ?',
        opciones: { NO: 'Non, elle est majeure', SI: 'Oui, elle a moins de 18 ans' },
      },
      tuNombre: {
        etiqueta: 'Et vous, comment vous appelez-vous ?',
        pista: 'Pour savoir à qui nous parlons lorsque nous appellerons.',
      },
      relacion: {
        etiqueta: 'Quel est votre lien avec cette personne ?',
        pista: 'Facultatif. Par exemple : mère, fils, partenaire, amie.',
      },
      nombre: 'Comment vous appelez-vous ?',
      nombreOtra: 'Comment s’appelle cette personne ?',
      celular: {
        etiqueta: 'Mobile / WhatsApp',
        pista:
          'Un numéro où nous pouvons vous écrire ou vous appeler. S’il ne s’agit pas d’un numéro colombien, indiquez l’indicatif du pays, par exemple +33 6 39 98 12 34.',
      },
      correo: {
        etiqueta: 'Adresse e-mail',
        pista: 'Facultatif. Le numéro de mobile ou WhatsApp suffit.',
      },
      canal: {
        etiqueta: 'Comment préférez-vous que nous vous contactions ?',
        opciones: {
          WHATSAPP: 'WhatsApp',
          LLAMADA: 'Appel téléphonique',
          CORREO: 'E-mail',
        },
      },
      ciudad: {
        etiqueta: 'De quelle ville ou commune nous écrivez-vous ?',
        ejemplo: 'Recherchez ou saisissez votre ville ou commune...',
        pista: 'Choisissez dans la liste (Colombie) ou saisissez-la si elle n’y figure pas.',
      },
      siguiente1: 'Suivant : Comment vous sentez-vous aujourd’hui ?',
      intro2:
        '**4 questions courtes, une réponse en un clic.** Elles nous aident à comprendre votre situation actuelle et à vous mettre en relation avec le professionnel le plus adapté, avec la priorité dont vous avez besoin.',
      malestar: {
        etiqueta:
          '1. De 1 à 5, à quel point la journée d’aujourd’hui vous paraît-elle difficile ou accablante ? *',
        niveles: [
          { etiqueta: '1 · Léger', detalle: 'Je fais face' },
          { etiqueta: '2 · Gérable', detalle: 'Avec quelques difficultés' },
          { etiqueta: '3 · Difficile', detalle: 'C’est assez dur pour moi' },
          { etiqueta: '4 · Très difficile', detalle: 'J’arrive à peine à tenir la journée' },
          { etiqueta: '5 · Extrême', detalle: 'À bout / En crise' },
        ],
      },
      dano: {
        etiqueta:
          '2. Ces derniers jours, avez-vous eu des pensées de vous faire du mal ou de ne plus vouloir continuer ? *',
        no: 'Non',
        si: 'Oui, j’ai eu ces pensées',
        contencionTitulo: 'Votre vie a beaucoup de valeur. Vous n’êtes pas seul(e).',
        contencionTexto:
          'Si vous sentez que vous êtes en danger immédiat ou que vous n’arrivez pas à contenir l’angoisse, en Colombie vous pouvez appeler gratuitement le **106** ou le **192** (24 h/24). Si vous êtes dans un autre pays, appelez le numéro d’urgence local.',
      },
      urgencia: {
        etiqueta: '3. Dans quel délai ressentez-vous le besoin de parler à un professionnel ? *',
        opciones: {
          HOY: 'Aujourd’hui même / Très urgent',
          ESTA_SEMANA: 'Dans les prochains jours / Cette semaine',
          PUEDO_ESPERAR: 'Je peux attendre un peu',
        },
      },
      seguro: {
        etiqueta:
          '4. Êtes-vous dans un lieu sûr, et avez-vous l’essentiel (sommeil, nourriture) ? *',
        si: 'Oui, je suis en sécurité',
        no: 'Je ne me sens pas en sécurité ou il me manque l’essentiel',
      },
      siguiente2: 'Suivant : Modalité et confirmation',
      modalidad: {
        etiqueta: 'Sous quelle forme préférez-vous recevoir l’accompagnement ?',
        opciones: {
          VIRTUAL: 'À distance (par appel vidéo ou par téléphone)',
          PRESENCIAL: 'En présentiel (dans un cabinet ou un lieu convenu dans votre commune)',
          INDIFERENTE: 'Peu importe (à distance ou en présentiel)',
        },
      },
      mensaje: {
        etiqueta: 'Souhaitez-vous nous laisser un message ou une précision ?',
        pista: 'Facultatif. Vous pouvez nous dire brièvement ce qui vous semble important.',
      },
      datosTitulo: 'Vos données et votre confidentialité',
      datosTexto:
        'Seuls le professionnel qui vous accompagne et l’équipe de coordination y ont accès. Nous ne les vendons pas et ne les donnons à personne d’autre. [Comment nous traitons vos données et comment les supprimer](/politica-de-datos).',
      enviar: 'Demander un accompagnement psychologique',
      enviando: 'Envoi de la demande…',
      errores: {
        forWhom: 'Indiquez pour qui est l’accompagnement',
        isMinor: 'Dites-nous si cette personne a moins de 18 ans',
        contactName: 'Indiquez votre nom pour que nous sachions à qui nous parlons',
        name: 'Nous avons besoin d’un nom de contact',
        phone: 'Nous avons besoin d’un numéro de téléphone ou WhatsApp',
        emailInvalido: 'Cette adresse e-mail ne semble pas valide',
        emailFalta: 'Si vous préférez l’e-mail, nous avons besoin de votre adresse',
        preferredContact: 'Indiquez par quel moyen vous préférez que nous vous contactions',
        city: 'Choisissez ou saisissez la ville ou la commune d’où vous nous écrivez',
        distress: 'Indiquez de 1 à 5 comment vous vous sentez aujourd’hui',
        selfHarmThoughts: 'Merci de répondre à cette question',
        howSoon: 'Dites-nous dans quel délai vous avez besoin de parler à quelqu’un',
        safePlace: 'Merci de nous dire si vous êtes dans un lieu sûr',
        preferredModality: 'Choisissez la modalité d’accompagnement',
        dataConsent: 'Nous avons besoin de votre autorisation pour pouvoir vous contacter',
        guardianConsent:
          'Comme il s’agit d’une personne mineure, nous avons besoin de l’autorisation de son représentant légal',
        incompleto: 'Veuillez remplir les champs obligatoires avant d’envoyer.',
        envio: 'Nous n’avons pas pu envoyer vos informations. Veuillez réessayer.',
      },
      exito: {
        titulo: 'Nous avons bien reçu votre demande, {nombre} !',
        sinNombre: 'ami(e)',
        texto:
          'Nous sommes là, avec vous. Notre équipe de coordination a bien reçu vos informations, et un professionnel bénévole du réseau vous contactera par WhatsApp ou par téléphone au {telefono} pour vous accompagner.',
        prioridadTitulo: 'Prise en charge prioritaire et lignes d’urgence 24 h/24 et 7 j/7',
        prioridadTexto:
          'Si vous sentez que vous êtes en danger ou si vous avez besoin de parler immédiatement à un spécialiste, en Colombie vous pouvez appeler gratuitement la **ligne 106** ou la **ligne 192** (24 h/24). Si vous êtes dans un autre pays, appelez le numéro d’urgence local.',
        volver: 'Retour à l’accueil',
      },
    },

    profesional: {
      pestanas: ['Vos coordonnées', 'Profil', 'Disponibilités'],
      paso1: {
        titulo: 'Étape 1 : Qui êtes-vous et comment vous joindre ?',
        bajada:
          'Les informations de base pour communiquer avec vous et coordonner votre participation.',
        nombre: { etiqueta: 'Nom complet', ejemplo: 'Ex. : Laura Sofía Morales' },
        celular: { etiqueta: 'Mobile / WhatsApp', ejemplo: 'Ex. : +33 6 39 98 12 34' },
        correo: { etiqueta: 'Adresse e-mail', ejemplo: 'nom@exemple.com' },
        ciudad: {
          etiqueta: 'Dans quelle ville ou commune vivez-vous ?',
          ejemplo: 'Recherchez votre commune en Colombie ou saisissez votre ville...',
        },
        continuar: 'Continuer vers le profil professionnel',
      },
      paso2: {
        titulo: 'Étape 2 : Votre profil professionnel et votre expérience',
        bajada:
          'Cela nous permet de vous orienter vers des personnes et des communautés en accord avec votre formation et votre approche.',
        profesion: {
          etiqueta: 'Profession',
          opciones: {
            Psicología: 'Psychologie',
            Psiquiatría: 'Psychiatrie',
            'Trabajo Social': 'Travail social',
            Otra: 'Autre profession',
          },
        },
        anos: {
          etiqueta: 'Années d’expérience',
          opciones: {
            MENOS_DE_1: 'Moins d’un an',
            ENTRE_1_Y_3: '1 à 3 ans',
            ENTRE_3_Y_5: '3 à 5 ans',
            MAS_DE_5: 'Plus de 5 ans',
          },
        },
        otraProfesion: {
          etiqueta: 'Quelle autre profession ?',
          ejemplo: 'Ex. : Sciences de l’éducation / Psychopédagogie',
        },
        tarjeta: {
          etiqueta: 'Avez-vous une carte professionnelle (tarjeta profesional) ?',
          opciones: {
            SI: 'Oui, je l’ai',
            EN_TRAMITE: 'Demande en cours',
            ESTUDIANTE: 'Je suis étudiant(e)',
          },
        },
        poblaciones: {
          etiqueta: 'Auprès de quels publics avez-vous de l’expérience ?',
          pista: 'Sélectionnez tous les publics concernés.',
          opciones: {
            'Niños y niñas': 'Enfants',
            Adolescentes: 'Adolescents',
            Jóvenes: 'Jeunes',
            Adultos: 'Adultes',
            'Personas mayores': 'Personnes âgées',
            Familias: 'Familles',
            'Enfoque de género': 'Approche de genre',
            'Población víctima de violencia': 'Personnes victimes de violences',
            'Población desplazada/migrante': 'Personnes déplacées / migrantes',
            Otra: 'Autre',
          },
        },
        otraPoblacion: 'Avec quel autre public travaillez-vous ?',
        crisis: {
          etiqueta:
            'Avez-vous de l’expérience ou une formation en intervention de crise / premiers secours psychologiques ?',
          opciones: {
            SI: 'Oui, j’ai une formation et une expérience pratique',
            FORMACION_POCA_PRACTICA: 'J’ai une formation théorique, mais peu de pratique',
            SIN_FORMACION_DISPONIBLE_APRENDER:
              'Je n’ai pas de formation préalable, mais je souhaite apprendre',
            NO: 'Je n’ai pas d’expérience en intervention de crise',
          },
        },
        volver: 'Retour',
        continuar: 'Continuer vers les disponibilités',
      },
      paso3: {
        titulo: 'Étape 3 : Disponibilités et documents',
        bajada:
          'Indiquez comment vous aimeriez participer et, si vous le souhaitez, joignez vos documents.',
        modalidad: {
          etiqueta: 'Sous quelle modalité pouvez-vous accompagner ?',
          opciones: {
            VIRTUAL: { nombre: 'À distance', detalle: 'Accompagnement 100 % en ligne, par appel vidéo' },
            PRESENCIAL: {
              nombre: 'En présentiel',
              detalle: 'Sur le terrain ou dans des centres communautaires',
            },
            AMBAS: { nombre: 'Les deux', detalle: 'Disponible en présentiel et à distance' },
          },
        },
        desplazamiento: {
          etiqueta: 'Dans quelles communes ou zones pourriez-vous vous déplacer ?',
          pista: 'Facultatif.',
          ejemplo: 'Ex. : communes voisines / zones rurales proches',
        },
        fiebre: {
          etiqueta: 'Avez-vous reçu le vaccin contre la fièvre jaune ?',
          pista: 'Exigé pour accéder à certaines zones sinistrées.',
          opciones: {
            SI: 'Oui, j’ai déjà mon carnet de vaccination',
            CITA_AGENDADA: 'Pas encore, mais j’ai un rendez-vous pour le vaccin',
            NO: 'Je n’ai pas reçu ce vaccin',
          },
        },
        dias: {
          etiqueta: 'Quels jours êtes-vous disponible ?',
          todos: 'Tous les jours',
          ninguno: 'Tout désélectionner',
          opciones: {
            LUNES: { corto: 'Lun', nombre: 'Lundi' },
            MARTES: { corto: 'Mar', nombre: 'Mardi' },
            MIERCOLES: { corto: 'Mer', nombre: 'Mercredi' },
            JUEVES: { corto: 'Jeu', nombre: 'Jeudi' },
            VIERNES: { corto: 'Ven', nombre: 'Vendredi' },
            SABADO: { corto: 'Sam', nombre: 'Samedi' },
            DOMINGO: { corto: 'Dim', nombre: 'Dimanche' },
          },
        },
        franjas: {
          etiqueta: 'À quels moments de la journée ? (heure de Colombie)',
          opciones: {
            MANANA: { nombre: 'Matin', horario: '8 h – 12 h' },
            TARDE: { nombre: 'Après-midi', horario: '12 h – 18 h' },
            NOCHE: { nombre: 'Soir', horario: '18 h – 21 h' },
          },
        },
        horas: {
          etiqueta: 'Combien d’heures par semaine pourriez-vous consacrer ?',
          opciones: {
            ENTRE_1_Y_3: { nombre: '1 à 3 heures / semaine', detalle: '1 ou 2 séances' },
            ENTRE_4_Y_6: { nombre: '4 à 6 heures / semaine', detalle: '3 ou 4 séances' },
            MAS_DE_6: { nombre: 'Plus de 6 heures / semaine', detalle: '5 séances ou plus' },
            VARIABLE: { nombre: 'Variable', detalle: 'Selon la semaine' },
          },
        },
        documentos: {
          titulo: 'Joindre des documents de vérification (facultatif)',
          elegidos: '✓ Documents sélectionnés',
          despues: 'Vous pouvez les joindre maintenant ou les envoyer plus tard par WhatsApp',
          confidencialidad:
            '🔒 **Confidentialité :** usage exclusivement réservé à l’équipe de coordination, pour vérifier votre identité et votre carte professionnelle conformément à la loi colombienne 1581 de 2012.',
          porWhatsappTitulo: 'Envoyez vos documents par WhatsApp',
          porWhatsappTexto:
            'Une fois votre inscription terminée, notre équipe vous contactera pour vous les demander. Vous pouvez aussi les envoyer directement au [{numero}]({enlace}) en indiquant votre nom et votre numéro de carte professionnelle.',
          verificando: 'Vérification de la disponibilité…',
          tarjeta: {
            etiqueta: 'Carte professionnelle ou certificat',
            pista: 'Photo ou PDF de votre carte, de votre attestation de diplôme ou d’un certificat.',
          },
          numeroTarjeta: {
            etiqueta: 'Numéro de carte professionnelle',
            pista: 'Facultatif.',
            ejemplo: 'Ex. : 123456',
          },
          cedulaFrente: {
            etiqueta: 'Pièce d’identité (recto)',
            pista: 'Photo ou PDF de votre pièce d’identité.',
          },
          cedulaRespaldo: {
            etiqueta: 'Pièce d’identité (verso)',
            pista: 'Facultatif si vous avez envoyé les deux faces dans le champ précédent.',
          },
          archivo: {
            subiendo: 'Envoi du fichier…',
            listo: '✓ Prêt : {nombre}',
            elegir: '📎 Choisir une photo ou un PDF (10 Mo max.)',
            quitar: 'Retirer le fichier',
            errorSubida: 'Le fichier n’a pas pu être envoyé.',
            errorRed:
              'L’envoi a échoué. Si le fichier est très lourd, essayez avec une photo plus légère ; sinon, vérifiez votre connexion.',
          },
        },
        autorizaciones: {
          titulo: 'Autorisations et traitement des données',
          retencion: 'Nous conservons vos données pendant {anos} ans.',
          politica: 'Voir la politique de traitement des données',
        },
        volver: 'Retour au profil',
        enviar: 'Envoyer mon inscription',
        enviando: 'Envoi de l’inscription…',
      },
      errores: {
        email: 'Saisissez une adresse e-mail valide',
        city: 'Indiquez dans quelle ville ou commune vous vivez',
        profession: 'Choisissez une profession',
        professionOther: 'Dites-nous quelle est votre profession',
        yearsExperience: 'Choisissez vos années d’expérience',
        professionalCard: 'Indiquez où en est votre carte professionnelle',
        populations: 'Choisissez au moins un public',
        populationOther: 'Dites-nous avec quel autre public vous travaillez',
        crisisExperience: 'Choisissez une option concernant l’intervention de crise',
        modality: 'Choisissez une modalité',
        availableDays: 'Choisissez au moins un jour',
        availableSlots: 'Choisissez au moins un créneau',
        weeklyHours: 'Indiquez combien d’heures vous pouvez consacrer',
        yellowFeverVaccine: 'Indiquez votre statut vaccinal',
        dataConsent: 'Nous avons besoin de votre autorisation pour pouvoir vous contacter',
        sensitiveDataConsent:
          'Nous avons besoin de votre autorisation expresse pour enregistrer votre statut vaccinal',
        envio: 'Nous n’avons pas pu enregistrer votre inscription. Veuillez réessayer.',
      },
      exito: {
        titulo: 'Merci pour votre soutien, {nombre} !',
        recibido:
          'Nous avons bien reçu votre inscription. Votre volonté d’accompagner celles et ceux qui en ont le plus besoin fait partie de quelque chose de très grand.',
        contacto:
          'Dans les prochains jours, une personne de notre équipe vous contactera par WhatsApp pour coordonner les prochaines étapes.',
        queSigue: 'Et maintenant ?',
        pasos: [
          'Nous examinons votre profil et vous orientons vers des communautés qui vous correspondent.',
          'Nous vous contactons par WhatsApp pour coordonner votre intégration.',
          'Nous commençons à accompagner ensemble !',
        ],
        whatsapp: '💬 Nous écrire sur WhatsApp',
        otra: 'Inscrire une autre personne',
      },
    },

    apoyo: {
      pasos: [
        'Vos coordonnées',
        'Dans quel domaine et quel métier pouvez-vous aider ?',
        'Disponibilités et autorisations',
      ],
      nombre: { etiqueta: 'Nom complet', ejemplo: 'Votre prénom et votre nom' },
      celular: { etiqueta: 'Mobile / WhatsApp', ejemplo: 'Ex. : +33 6 39 98 12 34' },
      correo: { etiqueta: 'Adresse e-mail', ejemplo: 'nom@exemple.com' },
      ciudad: {
        etiqueta: 'Depuis quelle ville ou commune nous rejoignez-vous ?',
        ejemplo: 'Recherchez ou saisissez votre ville ou commune...',
        pista: 'Choisissez dans la liste (Colombie) ou saisissez-la si elle n’y figure pas.',
      },
      siguiente1: 'Suivant : En quoi pouvez-vous aider ?',
      area: {
        etiqueta: 'Quel domaine vous correspond le mieux ? *',
        opciones: {
          SALUD: 'Santé et premiers secours',
          SOCIAL_LEGAL_EDUCATIVO: 'Social, juridique et éducatif',
          OPERACION_LOGISTICA: 'Opérations et logistique',
          COMUNICACION_TECNOLOGIA: 'Communication et technologie',
          GESTION_PROYECTOS: 'Gestion et projets',
          OTRA: 'Autre domaine ou métier',
        },
      },
      disciplina: {
        etiqueta: 'Quelle est votre discipline ou votre métier ? *',
        opciones: {
          Medicina: 'Médecine',
          Enfermería: 'Soins infirmiers',
          Fisioterapia: 'Kinésithérapie / physiothérapie',
          'Terapia ocupacional': 'Ergothérapie',
          Fonoaudiología: 'Orthophonie',
          'Nutrición y dietética': 'Nutrition et diététique',
          Odontología: 'Odontologie',
          'Primeros auxilios': 'Premiers secours',
          'Trabajo social': 'Travail social',
          Derecho: 'Droit',
          Docencia: 'Enseignement',
          Pedagogía: 'Pédagogie',
          'Primera infancia': 'Petite enfance',
          'Gestión comunitaria': 'Action communautaire',
          Logística: 'Logistique',
          'Transporte y conducción': 'Transport et conduite',
          'Bodega e inventario': 'Entrepôt et stocks',
          'Cocina y alimentación': 'Cuisine et alimentation',
          'Construcción y obra': 'Construction et travaux',
          'Gestión del riesgo de desastres': 'Gestion des risques de catastrophe',
          'Comunicación social': 'Communication et journalisme',
          Diseño: 'Design',
          'Sistemas y tecnología': 'Informatique et technologie',
          'Análisis de datos': 'Analyse de données',
          'Traducción e interpretación': 'Traduction et interprétation',
          'Gerencia de proyectos': 'Gestion de projets',
          Administración: 'Administration',
          'Finanzas y contabilidad': 'Finance et comptabilité',
          'Talento humano': 'Ressources humaines',
          Otra: 'Autre',
        },
      },
      otraDisciplina: {
        siOtraArea: 'Quel est votre métier ou votre profession ?',
        siOtraDisciplina: 'Quelle autre discipline ?',
        ejemplo: 'Saisissez votre profession ou votre métier...',
      },
      anos: {
        etiqueta: 'Combien d’années d’expérience avez-vous dans ce domaine ?',
        opciones: {
          MENOS_DE_1: 'Moins d’un an',
          ENTRE_1_Y_3: 'Entre 1 et 3 ans',
          ENTRE_3_Y_5: 'Entre 3 et 5 ans',
          MAS_DE_5: 'Plus de 5 ans',
        },
      },
      tarjeta: {
        etiqueta: 'Avez-vous une carte ou un enregistrement professionnel ?',
        pista:
          'Seulement si votre profession l’exige. Si cela ne s’applique pas à votre métier, vous pouvez laisser ce champ vide.',
        opciones: {
          SI: 'Oui, je l’ai',
          EN_TRAMITE: 'Ma demande est en cours',
          ESTUDIANTE: 'Je fais encore mes études',
        },
      },
      habilidades: {
        etiqueta: 'Que savez-vous faire, ou quelles compétences pourraient nous être utiles ?',
        pista:
          'Facultatif : outils que vous maîtrisez, langues, si vous conduisez, si vous avez déjà aidé sur le terrain ou lors de situations d’urgence.',
      },
      siguiente2: 'Suivant : Disponibilités',
      modalidad: {
        etiqueta: 'Comment pouvez-vous aider ?',
        opciones: {
          PRESENCIAL: 'En présentiel',
          VIRTUAL: 'À distance, de là où je suis',
          AMBAS: 'Les deux',
        },
      },
      desplazamiento: {
        etiqueta: 'Dans quelles communes ou zones pourriez-vous vous déplacer si nécessaire ?',
        pista: 'Facultatif. Par exemple : tout le département, les zones rurales proches, etc.',
      },
      dias: {
        etiqueta: 'Quels jours de la semaine êtes-vous disponible ? *',
        opciones: {
          LUNES: 'Lundi',
          MARTES: 'Mardi',
          MIERCOLES: 'Mercredi',
          JUEVES: 'Jeudi',
          VIERNES: 'Vendredi',
          SABADO: 'Samedi',
          DOMINGO: 'Dimanche',
        },
      },
      franjas: {
        etiqueta: 'À quels moments de la journée ? (heure de Colombie) *',
        opciones: {
          MANANA: 'Matin (8 h – 12 h)',
          TARDE: 'Après-midi (12 h – 18 h)',
          NOCHE: 'Soir (18 h – 21 h)',
        },
      },
      horas: {
        etiqueta: 'Combien d’heures par semaine pourriez-vous consacrer ?',
        opciones: {
          ENTRE_1_Y_3: 'Entre 1 et 3 heures',
          ENTRE_4_Y_6: 'Entre 4 et 6 heures',
          MAS_DE_6: 'Plus de 6 heures',
          VARIABLE: 'Cela dépend de la semaine',
        },
      },
      fiebre: {
        etiqueta: 'Avez-vous reçu le vaccin contre la fièvre jaune ?',
        pista:
          'Certaines zones de terrain exigent un carnet de vaccination pour y entrer. Si vous n’avez pas ce vaccin, vous pouvez tout de même aider à distance.',
        opciones: { SI: 'Oui', NO: 'Non', CITA_AGENDADA: 'J’ai un rendez-vous pour le vaccin' },
      },
      autorizaciones: {
        titulo: 'Autorisations et traitement des données',
        retencion:
          'Nous conservons vos données pendant {anos} ans à compter de la fin de votre participation.',
      },
      enviar: 'Je veux aider comme bénévole',
      enviando: 'Envoi de l’inscription…',
      errores: {
        email: 'Saisissez une adresse e-mail valide',
        city: 'Choisissez ou saisissez la ville ou la commune où vous vivez',
        area: 'Choisissez le domaine dans lequel vous souhaitez aider',
        discipline: 'Choisissez votre discipline ou votre métier',
        disciplineOther: 'Dites-nous quel est votre métier ou votre profession',
        modality: 'Indiquez comment vous pouvez aider',
        availableDays: 'Choisissez au moins un jour',
        availableSlots: 'Choisissez au moins un créneau',
        weeklyHours: 'Indiquez combien d’heures vous pouvez consacrer',
        yellowFeverVaccine: 'Choisissez une option concernant la vaccination',
        dataConsent: 'Nous avons besoin de votre autorisation pour pouvoir vous contacter',
        sensitiveDataConsent: 'Nous avons besoin de votre autorisation pour enregistrer votre statut vaccinal',
        incompleto: 'Vérifiez les champs signalés avant d’envoyer.',
        envio: 'Nous n’avons pas pu enregistrer votre inscription. Veuillez réessayer.',
      },
      exito: {
        titulo: 'Merci d’avoir rejoint le réseau, {nombre} !',
        sinNombre: 'bénévole',
        texto:
          'Vos informations sont désormais enregistrées dans l’annuaire des bénévoles du réseau. Lorsqu’une mission de terrain ou un besoin correspondant à votre discipline et à vos disponibilités se présentera, notre équipe de coordination vous écrira sur WhatsApp au {telefono}.',
        otro: 'Inscrire un autre bénévole ou revenir à l’accueil',
      },
    },
  },
}
