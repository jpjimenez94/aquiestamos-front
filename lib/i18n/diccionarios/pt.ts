import type { Diccionario } from './es'

/**
 * O SITE PÚBLICO, EM PORTUGUÊS DO BRASIL.
 *
 * Una traducción de `es.ts`, clave por clave. El tipo `Diccionario` obliga a
 * que estén todas: si en español se añade una frase, esto deja de compilar
 * hasta que se traduzca.
 *
 * Decisiones de traducción que conviene no deshacer sin pensarlo:
 *
 * · Es portugués de Brasil: «você», «celular», «cadastro», «e-mail». No se
 *   mezcla con el de Portugal («telemóvel», «utilizador»).
 *
 * · El género se resuelve como se hace en Brasil: reformulando cuando se puede
 *   («Você não está só», que no tiene género) y con «(a)» cuando no
 *   («psicólogo(a)»). El español usa «sola/o»; aquí la barra se lee raro.
 *
 * · «Primeros auxilios psicológicos» es «primeiros cuidados psicológicos», que
 *   es como lo publica la OMS en portugués. «Atención en crisis» es
 *   «atendimento em crise».
 *
 * · Lo colombiano se nombra y se explica una vez: «tarjeta profesional»,
 *   ReTHUS, REPS, la Ley 1581, el NIT.
 *
 * · Las líneas de emergencia son de Colombia y se dice. Y como quien lee esto
 *   casi seguro está en Brasil, se le dan también las suyas: 188 (CVV) y 192
 *   (SAMU). Ojo con el 192: en Colombia es la línea de salud mental y en
 *   Brasil es la ambulancia; por eso nunca se nombra sin decir de qué país.
 *
 * · Las casillas de autorización son la traducción de la versión 2026-09 del
 *   texto español, que es el que vale. Igual que allá: no se editan; si el
 *   texto cambia, cambia la versión.
 */
export const pt: Diccionario = {
  sitio: {
    nombre: 'Aquí Estamos',
    lema: 'Rede de acompanhamento psicológico e atendimento em crise',
    descripcion:
      'Aquí Estamos é uma rede de profissionais voluntários de saúde mental que se uniram para levar acompanhamento psicológico, orientação e recursos às pessoas e comunidades que precisam, no contexto do terremoto de 10 de agosto de 2026.',
    irAlInicio: '{nombre} — início',
  },

  idioma: {
    etiqueta: 'Idioma',
    sugerencia: 'Este site também está disponível em português.',
    ver: 'Ver em português',
    cerrar: 'Fechar este aviso',
  },

  nav: {
    principal: 'Navegação principal',
    movil: 'Navegação móvel',
    tituloMenu: 'Menu de navegação',
    abrir: 'Abrir menu',
    cerrar: 'Fechar menu',
    enlaces: {
      serParte: {
        etiqueta: 'Quero oferecer apoio psicológico',
        aclaracion: '(Formados ou estudantes dos últimos semestres)',
      },
      apoyar: {
        etiqueta: 'Quero ser voluntário(a) geral',
        aclaracion: '(Advogados, administrativos, logística, design etc.)',
      },
      ayuda: {
        etiqueta: 'Preciso de ajuda',
        aclaracion: '(Solicitar apoio emocional e atendimento psicológico)',
      },
      recursos: { etiqueta: 'Recursos', aclaracion: '' },
    },
  },

  pie: {
    presentacion:
      'Somos uma rede colaborativa que busca facilitar o acesso ao atendimento psicológico e promover o bem-estar emocional por meio da comunidade, da informação e do acompanhamento.',
    enlaces: 'Links do rodapé',
    preguntas: 'Perguntas frequentes',
    politica: 'Política de dados',
    consentimiento: 'Consentimento informado',
    cierre: 'Acompanhar é uma forma de reconstruir o nosso país.',
  },

  flotante: {
    grupo: 'Ações rápidas de contato e ajuda',
    preguntas: 'Perguntas frequentes',
    preguntasAyuda: 'Ver perguntas frequentes',
    whatsapp: 'WhatsApp',
    whatsappAyuda: 'Escrever para o WhatsApp oficial',
  },

  migas: {
    inicio: 'Início',
    ruta: 'Trilha de navegação',
  },

  noEncontrada: {
    titulo: 'Não encontramos esta página',
    texto:
      'O link pode ter mudado. A partir do início você chega a tudo o que temos disponível.',
    inicio: 'Voltar ao início',
    recursos: 'Ver os recursos',
  },

  avisos: {
    traduccion:
      'Esta é uma tradução de cortesia. A versão em espanhol é o texto oficial e o que vale.',
    verOriginal: 'Ler a versão em espanhol',
    fueraDeColombia:
      'Estas linhas funcionam na Colômbia. No Brasil, ligue 188 (CVV, apoio emocional 24 horas) ou 192 (SAMU). Em outro país, ligue para o número de emergência local.',
    atencionEnEspanol:
      'Nossos profissionais voluntários atendem em espanhol. Se você precisar de apoio em outro idioma, conte para nós na mensagem ao final deste formulário e diremos o que podemos oferecer.',
    redEnEspanol:
      'Vale saber: a rede funciona em espanhol. É o idioma da equipe de coordenação e da maioria das pessoas que acompanhamos.',
  },

  inicio: {
    heroAlt: 'Ilustração da rede Aquí Estamos',
    titulo: 'Rede de acompanhamento psicológico e atendimento em crise',
    duracion:
      'Oferecerá acompanhamento e atendimento durante os próximos **3 a 4 meses**, contribuindo assim para a reconstrução do tecido social.',
    etapa:
      'Nesta primeira etapa, estamos construindo uma comunidade colaborativa de profissionais comprometidos com o cuidado emocional, a prevenção e o atendimento em situações de crise.',
    accesos: 'Como podemos ajudar você?',
    tarjetas: {
      serParte: {
        titulo: 'Quero oferecer apoio psicológico',
        texto:
          'Para formados ou estudantes dos últimos semestres de psicologia que queiram acompanhar.',
      },
      apoyar: {
        titulo: 'Quero ser voluntário(a) geral',
        texto:
          'Advogados, administrativos, logística, design e mais: participe a partir do que você sabe fazer.',
      },
      ayuda: {
        titulo: 'Preciso de ajuda',
        texto: 'Solicite apoio emocional e atendimento psicológico: estamos com você.',
      },
      recursos: {
        titulo: 'Recursos para todos',
        texto: 'Guias, livros e ferramentas para situações que pedem apoio.',
      },
    },
    sobreAlt: 'Mãos que se acompanham',
    sobreTitulo: 'Sobre a Aquí Estamos',
    sobreTexto:
      'Somos uma rede colaborativa que busca facilitar o acesso ao atendimento psicológico e promover o bem-estar emocional por meio da comunidade, da informação e do acompanhamento.',
    contacto: 'Fale conosco',
    noEstasSola: 'Você não está só.',
    estamosAqui: 'Estamos aqui para acompanhar você.',
    whatsappTitulo: 'Escreva para nós no WhatsApp',
    whatsappBoton: 'Enviar mensagem no WhatsApp',
    instagramTitulo: 'Siga-nos no Instagram',
    instagramBoton: 'Seguir',
    cierreAlt: 'Ilustração de comunidade',
    cierre: 'Acompanhar é uma forma de reconstruir o nosso país',
  },

  emergencia: {
    nombre: 'Por que a rede existe',
    tituloInicio: 'Quando uma emergência termina,',
    tituloFin: 'muitas coisas estão apenas começando.',
    familias: {
      titulo: 'Há famílias tentando reorganizar a vida.',
      texto: 'Há medo, incerteza, perdas e muitas perguntas.',
    },
    espacio: {
      titulo:
        'Nestes momentos, ter um espaço para falar, ser ouvido e encontrar orientação pode fazer a diferença.',
      porEso: 'Por isso estamos criando uma',
      red: 'Rede de **Acompanhamento Psicológico** e **Atendimento em Crise.**',
    },
    temporal: {
      texto:
        'Uma rede temporária de profissionais, estudantes e aliados que queiram contribuir para a resposta psicológica diante da emergência de **10 de agosto de 2026 na Colômbia.**',
      vigencia: 'A rede terá uma **vigência inicial de quatro meses.**',
    },
    personas: {
      texto:
        'Estamos procurando pessoas que queiram colocar seu conhecimento, seu tempo e sua escuta a serviço de quem hoje precisa.',
      paraTi:
        'Se você é psicólogo(a) ou estudante de Psicologia, **este espaço também é para você.**',
    },
    cierre: 'Acompanhar é uma forma de reconstruir o nosso país.',
  },

  camino: {
    titulo: 'Como você pode fazer parte da Aquí Estamos?',
    bajada:
      'Se você é profissional de saúde mental e quer se juntar à nossa rede para acompanhar mais pessoas, este é o caminho.',
    misionTitulo: 'Nossa missão',
    mision:
      'Conectar pessoas a profissionais de saúde mental e aproximar recursos confiáveis para o cuidado emocional, a prevenção e o atendimento em crise.',
    pasosTitulo: 'Passos para fazer parte da rede',
    pasos: [
      {
        titulo: 'Preencha o formulário',
        texto:
          'Complete o formulário de inscrição com suas informações profissionais, áreas de atuação e dados de contato.',
      },
      {
        titulo: 'Análise das informações',
        texto:
          'Analisamos seu perfil para garantir que sua abordagem esteja alinhada aos valores e objetivos da rede.',
      },
      {
        titulo: 'Confirmação',
        texto:
          'Escreveremos para confirmar sua participação e compartilhar os detalhes dos próximos passos.',
      },
      {
        titulo: 'Boas-vindas e integração',
        texto:
          'Você receberá acesso aos nossos canais de comunicação, recursos e materiais da rede.',
      },
      {
        titulo: 'Acompanhamos em conjunto',
        texto:
          'Você faz parte de uma comunidade colaborativa que busca gerar bem-estar e prevenção.',
      },
    ],
    beneficiosTitulo: 'Ao fazer parte da Aquí Estamos, você poderá:',
    beneficios: [
      'Fazer parte de uma rede ética e colaborativa de profissionais.',
      'Acessar e compartilhar recursos confiáveis para o cuidado emocional.',
      'Participar de espaços de divulgação, aprendizagem e atualização.',
      'Contribuir para a prevenção e o bem-estar de mais pessoas.',
    ],
    listaTitulo: 'Tudo pronto para fazer parte da rede?',
    listaTexto: 'O formulário está nesta mesma página. E, se tiver dúvidas, escreva para nós.',
    irAlFormulario: 'Ir para o formulário',
    whatsapp: 'Escreva para nós no WhatsApp',
    instagram: 'Siga-nos no Instagram',
    cierre:
      'A Aquí Estamos é um espaço seguro, humano e sensível ao contexto de cada pessoa. Agradecemos por somar seu conhecimento, seu tempo e seu coração.',
  },

  preguntas: {
    ceja: 'Central de orientação e respostas',
    titulo: 'Perguntas frequentes',
    intro:
      'Esclarecemos suas dúvidas sobre como receber atendimento, participar como profissional voluntário(a) ou apoiar nas atividades da fundação.',
    buscar: 'Buscar uma dúvida (ex.: REPS, ReTHUS, custo, sessões, certificado...)',
    limpiar: 'Limpar',
    resultadosPara: 'Resultados da busca por',
    coincidencia: 'resultado',
    coincidencias: 'resultados',
    sinResultados: 'Não encontramos perguntas relacionadas a',
    verTodas: 'Ver todas as perguntas',
    dudaTitulo: 'Tem mais alguma dúvida sobre o modelo ou a rede?',
    dudaTexto: 'Nossa equipe de coordenação está disponível para orientar você diretamente.',
    dudaBoton: 'Escrever no WhatsApp',
    categorias: {
      psicologia: {
        etiqueta: 'Profissionais de Psicologia',
        aclaracion: 'ReTHUS, acompanhamento e marco ético',
      },
      pacientes: {
        etiqueta: 'Pessoas e famílias',
        aclaracion: 'Pedido de apoio, gratuidade e sessões',
      },
      voluntarios: {
        etiqueta: 'Voluntariado geral',
        aclaracion: 'Outras áreas e atividades de apoio',
      },
      fundacion: {
        etiqueta: 'Sobre a fundação',
        aclaracion: 'Missão, dados e marco legal',
      },
    },
    items: {
      'psi-reps-rethus': {
        distintivo: 'Marco legal ReTHUS',
        pregunta: 'Preciso ter REPS como profissional independente para fazer parte da rede?',
        respuesta: [
          '**Você não precisa ter REPS como profissional independente** para fazer parte do modelo de acompanhamento da Aquí Estamos.',
          'Seu **ReTHUS** (o Registro Único Nacional do Talento Humano em Saúde, da Colômbia) e sua **tarjeta profesional vigente** (o registro profissional colombiano) são os requisitos profissionais oficiais que verificamos para o seu ingresso.',
          'O REPS (Registro Especial de Prestadores de Serviços de Saúde) corresponde ao prestador institucional e, no nosso modelo, estamos estruturando a **Fundação Aquí Estamos** como a pessoa jurídica que organiza, gerencia e respalda o acompanhamento. Enquanto consolidamos o modelo de habilitação institucional correspondente, sua participação se enquadra no escopo próprio do **acompanhamento psicológico, primeiros socorros emocionais e contenção em crise** da Aquí Estamos, e não na prestação independente de consultas ou tratamentos clínicos isolados.',
        ],
      },
      'psi-registro-confidencialidad': {
        distintivo: '',
        pregunta:
          'Como são tratados o registro das sessões e a confidencialidade das informações?',
        respuesta: [
          'Todo o processo segue princípios rigorosos de **sigilo profissional** e a **Lei 1581 de 2012 (Habeas Data)**, da Colômbia.',
          'Como profissional, você acessa o caso atribuído por meio de um **link seguro com autenticação**, em que aparecem apenas os dados necessários para o atendimento. Ao final de cada sessão, você registra na plataforma interna uma breve anotação sobre o andamento do processo. Nunca compartilhamos números de telefone nem dados sensíveis em canais abertos.',
        ],
      },
      'psi-disponibilidad-horarios': {
        distintivo: '',
        pregunta: 'Quanto tempo preciso dedicar e como minha disponibilidade é coordenada?',
        respuesta: [
          'O voluntariado é flexível e se adapta à sua agenda. Ao se candidatar em [Quero oferecer apoio psicológico](/quiero-ser-parte), você decide quantas horas semanais pode oferecer e em quais dias e períodos (manhãs, tardes ou noites).',
          'Nosso sistema só propõe pessoas que coincidam exatamente com os horários que você declarou. As sessões duram **45 minutos**, e a plataforma programa intervalos automáticos de descanso entre os atendimentos para cuidar do seu bem-estar.',
        ],
      },
      'psi-alcance-casos': {
        distintivo: '',
        pregunta: 'Que tipo de casos a Rede Aquí Estamos atende?',
        respuesta: [
          'Nosso foco são os **primeiros cuidados psicológicos, a contenção emocional e o acompanhamento psicossocial breve** (ciclos de 3 a 4 sessões).',
          'Não atendemos urgências psiquiátricas com risco de vida iminente nem psicopatologias graves que exijam internação. Caso seja identificado um risco alto durante a triagem ou a sessão, ativa-se imediatamente a **rota de encaminhamento institucional** para centros de saúde e linhas nacionais de emergência.',
        ],
      },
      'pac-gratuidad': {
        distintivo: '100% gratuito',
        pregunta: 'O serviço de atendimento e acompanhamento psicológico tem algum custo?',
        respuesta: [
          '**Não, é totalmente gratuito.** A Rede Aquí Estamos é uma iniciativa solidária sem fins lucrativos, criada para garantir que qualquer pessoa que precise de apoio emocional possa recebê-lo sem barreiras financeiras.',
        ],
      },
      'pac-como-solicitar': {
        distintivo: '',
        pregunta: 'Como solicito uma sessão de acompanhamento psicológico?',
        respuesta: [
          'Basta acessar [Preciso de ajuda](/atencion-psicologica) e preencher um formulário breve com seus dados de contato e seus horários disponíveis.',
          'Um coordenador da nossa equipe analisará seu pedido e entrará em contato por **WhatsApp ou e-mail** para confirmar a data e a hora da sua primeira sessão com um(a) psicólogo(a) voluntário(a).',
        ],
      },
      'pac-cuantas-sesiones': {
        distintivo: '',
        pregunta: 'Quantas sessões de apoio vou receber?',
        respuesta: [
          'O programa prevê um ciclo de **3 a 4 sessões de acompanhamento focalizado** com o mesmo profissional.',
          'Ao final desse processo, se você e o profissional considerarem que é necessário um tratamento contínuo ou especializado de longo prazo, oferecemos orientação sobre redes de saúde e serviços complementares.',
        ],
      },
      'pac-modalidad': {
        distintivo: '',
        pregunta: 'O atendimento é online ou presencial?',
        respuesta: [
          'A grande maioria dos atendimentos é realizada de forma **online (por videochamada ou ligação telefônica)**, o que permite apoiar pessoas em qualquer município da Colômbia ou no exterior.',
          'Caso sejam realizadas jornadas ou brigadas comunitárias presenciais em locais específicos, isso será informado com antecedência em nossos canais oficiais.',
        ],
      },
      'pac-emergencias-graves': {
        distintivo: 'Emergências',
        pregunta: 'O que devo fazer em caso de emergência com risco de vida ou crise imediata?',
        respuesta: [
          'Se você ou alguém próximo estiver em risco iminente, com ideação suicida ativa ou perigo para a integridade física, **procure imediatamente o centro de saúde ou pronto-socorro mais próximo** ou ligue para uma linha gratuita de emergência. No Brasil, ligue 188 (CVV) ou 192 (SAMU). Estas são as linhas nacionais da Colômbia:',
          {
            lista: [
              '**Linha Nacional de Emergências:** 123',
              '**Linha de Orientação em Saúde Mental (Ministério da Saúde):** 106 / 192',
              '**Línea Púrpura (mulheres em Bogotá):** 018000 112 137',
            ],
          },
        ],
      },
      'vol-quienes-pueden': {
        distintivo: '',
        pregunta: 'Não sou psicólogo(a). Como posso participar como voluntário(a)?',
        respuesta: [
          'Seu talento é fundamental para a rede! Em [Quero ser voluntário(a) geral](/quiero-apoyar) recebemos profissionais e estudantes de **direito, medicina, enfermagem, serviço social, design gráfico, comunicação, engenharia de sistemas, administração, logística e gestão comunitária**.',
          'Apoiamos em atividades internas de verificação de perfis, gestão de agendas, criação de materiais pedagógicos, ligações de acompanhamento e suporte organizacional.',
        ],
      },
      'vol-como-asignan-tareas': {
        distintivo: '',
        pregunta: 'Como as tarefas ou turnos de apoio são atribuídos a mim?',
        respuesta: [
          'Quando a equipe de coordenação cria uma tarefa que coincide com sua disponibilidade de horário e sua área, você recebe um convite personalizado por e-mail ou WhatsApp com um link único (`/turno/...`).',
          'Ao abrir o link, você verá os detalhes da tarefa, a data, o horário e as observações da equipe, e poderá confirmar com um único clique se aceita participar.',
        ],
      },
      'vol-certificado': {
        distintivo: '',
        pregunta: 'Vocês emitem certificado de horas de voluntariado?',
        respuesta: [
          '**Não.** A Rede Aquí Estamos é uma iniciativa de apoio solidário e comunitário que **não emite certificados de voluntariado nem declarações de horas** para fins acadêmicos ou profissionais. A participação de todos os profissionais e colaboradores é 100% voluntária, motivada pelo compromisso social e pelo cuidado coletivo.',
        ],
      },
      'fun-que-es': {
        distintivo: '',
        pregunta: 'O que é a Rede Aquí Estamos e qual é a sua missão?',
        respuesta: [
          'Somos uma rede colaborativa sem fins lucrativos que busca facilitar o acesso universal ao atendimento psicológico e promover o bem-estar emocional por meio da comunidade, da informação e do acompanhamento humano, contribuindo para a reconstrução do tecido social.',
        ],
      },
      'fun-seguridad-datos': {
        distintivo: '',
        pregunta: 'Como vocês protegem meus dados pessoais e minha privacidade?',
        respuesta: [
          'Todas as informações registradas são tratadas sob rigorosos padrões de segurança da informação e em total conformidade com a **Lei Estatutária 1581 de 2012**, de Proteção de Dados Pessoais (Habeas Data), da Colômbia.',
          'Você pode consultar nossa política completa em [Política de dados](/politica-de-datos). Seus dados nunca são comercializados nem compartilhados com terceiros.',
        ],
      },
    },
  },

  atencion: {
    meta: {
      titulo: 'Preciso de ajuda · Atendimento psicológico',
      descripcion:
        'Solicite acompanhamento psicológico gratuito com profissionais voluntários da Rede Aquí Estamos.',
    },
    titulo: 'Preciso de ajuda',
    bajada: 'Acompanhamento psicológico e apoio emocional',
    aviso:
      '**Estamos com você.** Este formulário leva menos de 2 minutos e quase todas as perguntas são respondidas com um único toque. Suas respostas são estritamente confidenciais e nos permitem conectar você a um profissional voluntário de acordo com a sua urgência.',
    whatsapp: 'Prefiro escrever diretamente pelo WhatsApp {numero}',
  },

  serParte: {
    meta: {
      titulo: 'Quero oferecer apoio psicológico',
      descripcion:
        'Faça parte da nossa rede de profissionais e vamos construir mais possibilidades de acompanhamento.',
    },
    titulo: 'Quero oferecer apoio psicológico',
    bajada:
      'Faça parte da nossa rede de profissionais e vamos construir mais possibilidades de acompanhamento.',
    aviso: [
      'Estamos formando uma rede de profissionais de psicologia interessados em oferecer acompanhamento psicológico e primeiros cuidados psicológicos a famílias afetadas por situações de emergência e crise durante os próximos quatro meses.',
      'As informações registradas serão usadas para identificar perfis, experiência e população de foco dos profissionais disponíveis para participar desta iniciativa.',
      'Agradecemos por colocar seu conhecimento e sua experiência a serviço de quem hoje precisa de acompanhamento.',
    ],
    whatsapp: 'Enviar mensagem no WhatsApp',
    formulario: 'Preencha o formulário',
    obligatorios: 'Os campos marcados com {asterisco} são obrigatórios.',
  },

  apoyar: {
    meta: {
      titulo: 'Quero ser voluntário(a) geral · Rede Aquí Estamos',
      descripcion:
        'Junte-se ao voluntariado da rede a partir da sua área: saúde, logística, direito, comunicação, tecnologia, gestão e mais.',
    },
    titulo: 'Quero ser voluntário(a) geral',
    bajada:
      'Uma emergência não se enfrenta só com a psicologia. Participe a partir do que você sabe fazer.',
    aviso:
      '**Diretório de Voluntariado Multidisciplinar.** Se você quer contribuir com saúde e primeiros socorros, logística, direito, serviço social, comunicação, tecnologia ou gestão de projetos, deixe seus dados. Quando surgir uma brigada ou necessidade concreta, a equipe de coordenação entrará em contato. O cadastro leva 2 minutos e não gera nenhum compromisso.',
    whatsapp: 'Tem dúvidas? Escreva para o nosso WhatsApp {numero}',
  },

  recursos: {
    meta: {
      titulo: 'Recursos para todos',
      descripcion: 'Guias, livros e ferramentas para situações que pedem apoio.',
    },
    titulo: 'Recursos para todos',
    bajada: 'Guias, livros e ferramentas para situações que pedem apoio.',
    seccion: 'Histórias infantis',
    noDisponible: 'A biblioteca não está disponível no momento. Tente novamente em alguns minutos.',
    profesionales: 'Material para profissionais',
    proximamente: 'Em breve.',
    compartir: 'Se você tiver outro recurso que queira compartilhar, entre em contato conosco.',
    noEncontrado: 'Recurso não encontrado',
    categoria: 'Categoria',
    archivos: 'Arquivos e mídia',
    abrir: 'Abrir o material',
    volver: 'Voltar à biblioteca',
    vistaPrevia: 'Pré-visualização de {titulo}',
    sinVisor: 'Seu navegador não consegue exibir o PDF aqui.',
    abrirPestana: 'Abra em uma nova aba',
    soloEnEspanol: 'Em espanhol',
    notaIdioma:
      'Estes livros e guias foram escritos em espanhol por seus autores. Nós os compartilhamos no idioma original; as descrições são nossas.',
    categorias: {
      'acompanamiento-ante-emergencias': 'Acompanhamento em emergências',
      autorregulacion: 'Autorregulação',
      'contencion-emocional': 'Contenção emocional',
      'sobre-el-duelo-y-la-muerte': 'Sobre o luto e a morte',
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
          'História sobre coragem e esperança para acompanhar crianças depois de uma experiência difícil.',
      },
      'el-monstruo-toti-y-el-baile-del-planeta': {
        titulo: 'El monstruo Toti y el baile del planeta',
        descripcion:
          'História ilustrada que explica os tremores de terra de um jeito simples e próximo das crianças.',
      },
      'ana-y-el-terremoto': {
        titulo: 'Ana y el terremoto',
        descripcion:
          'História que ajuda as crianças a entender o que aconteceu e a expressar o medo depois de um terremoto.',
      },
      respira: {
        titulo: 'Respira',
        descripcion:
          'História-guia com exercícios simples de respiração para ajudar as crianças a recuperar a calma e regular suas emoções.',
      },
      'mi-miedo-mi-guardian-personal': {
        titulo: 'Mi miedo, mi guardián personal',
        descripcion:
          'Leitura que ajuda a compreender o medo e a reconhecê-lo como uma emoção que pode nos proteger em situações difíceis.',
      },
      'plaza-sesamo-contencion-emocional': {
        titulo: 'Plaza Sésamo — Contención emocional',
        descripcion:
          'Material pensado para acompanhar e acolher emocionalmente as crianças em momentos difíceis ou depois de uma emergência.',
      },
      vacio: {
        titulo: 'Vacío',
        descripcion:
          'História sobre a sensação de vazio que pode surgir depois de uma perda e o processo de encontrar novas formas de conviver com ela.',
      },
      'el-arbol-de-los-recuerdos': {
        titulo: 'El árbol de los recuerdos',
        descripcion:
          'História que ajuda as crianças a elaborar a perda e a manter viva, com carinho, a lembrança de quem já não está.',
      },
    },
  },

  politica: {
    meta: {
      titulo: 'Política de Tratamento de Dados',
      descripcion:
        'Como a Red Aquí Estamos coleta, usa, guarda e elimina os dados pessoais de quem solicita acompanhamento e dos profissionais voluntários.',
    },
    version: 'Versão {version}',
    titulo: 'Política de Tratamento de Dados',
    intro:
      'Esta política explica quais dados coletamos, para que os usamos, com quem os compartilhamos, por quanto tempo os guardamos e como você pode nos pedir para alterá-los ou apagá-los.',
    secciones: [
      {
        titulo: '1. Quem responde pelos seus dados',
        bloques: [
          '**{responsable}** é responsável pelo tratamento dos dados pessoais que coletamos por meio deste site.',
          'Você pode entrar em contato pelo [{canal}]({canalHref}). Esse também é o canal para exercer qualquer um dos direitos descritos mais abaixo.',
        ],
      },
      {
        titulo: '2. Quais dados coletamos',
        bloques: [
          '**Se você solicita acompanhamento:** seu nome, seu celular, seu e-mail se decidir informá-lo, a cidade de onde nos escreve, os dias e os períodos em que pode, se prefere presencial ou online, e o que quiser nos contar no campo livre. Se o pedido for para outra pessoa, também o nome dela, sua relação com ela e se é menor de idade.',
          '**Se você se candidata como profissional:** seu nome, seu celular, seu e-mail, sua cidade, sua profissão e formação, seus anos de experiência, seu registro profissional, as populações com as quais trabalha, sua disponibilidade e, se puder acompanhar presencialmente, sua situação vacinal contra a febre amarela.',
          {
            aviso:
              '**Dados sensíveis.** O fato de solicitar acompanhamento psicológico e a situação vacinal são dados de saúde, que a lei considera sensíveis. Você não tem obrigação de fornecê-los. Só os tratamos se você nos der uma autorização expressa e separada, marcando a caixa correspondente no formulário.',
          },
        ],
      },
      {
        titulo: '3. Para que os usamos',
        bloques: [
          {
            lista: [
              'Entrar em contato e coordenar seu acompanhamento, ou avaliar sua candidatura.',
              'Designar um profissional e agendar as sessões.',
              'Manter o registro interno da rede e suas estatísticas de operação.',
              'Enviar informações sobre outras atividades, somente se você tiver autorizado à parte.',
            ],
          },
          'Não usamos seus dados para nenhuma outra finalidade e não tomamos decisões automatizadas sobre você.',
        ],
      },
      {
        titulo: '4. Com quem os compartilhamos',
        bloques: [
          'Com o profissional da rede que acompanhar você e com a equipe de coordenação, e somente na medida necessária para prestar o serviço. **Não vendemos seus dados nem os entregamos a terceiros** alheios à rede, salvo se uma autoridade competente o exigir por lei.',
          'As informações ficam guardadas em servidores dos nossos provedores de infraestrutura tecnológica, que as processam unicamente sob nossa instrução.',
        ],
      },
      {
        titulo: '5. Por quanto tempo os guardamos',
        bloques: [
          'Conservamos seus dados por **{anos} anos**, contados a partir do encerramento do seu acompanhamento ou do fim da sua participação na rede. Cumprido esse prazo, eles são eliminados.',
        ],
      },
      {
        titulo: '6. Seus direitos',
        bloques: [
          'A qualquer momento você pode:',
          {
            lista: [
              'Saber quais dados seus temos e como os estamos usando.',
              'Pedir que sejam atualizados ou corrigidos se estiverem errados ou incompletos.',
              'Pedir que sejam eliminados, quando não houver dever legal de conservá-los.',
              'Retirar a autorização que nos deu.',
              'Apresentar uma reclamação à Superintendência de Indústria e Comércio (SIC) da Colômbia.',
            ],
          },
          'Para exercer qualquer um desses direitos, escreva pelo [{canal}]({canalHref}). Responderemos nos prazos estabelecidos pela lei: até dez dias úteis para uma consulta e até quinze dias úteis para uma reclamação.',
          'Retirar a autorização significa que não poderemos continuar prestando o acompanhamento, porque os dados são necessários para coordená-lo.',
        ],
      },
      {
        titulo: '7. Crianças e adolescentes',
        bloques: [
          'Quando o acompanhamento é para uma pessoa menor de 18 anos, a autorização deve ser dada pelo pai, pela mãe ou pelo representante legal, e sempre se atende ao interesse superior da criança ou do adolescente.',
        ],
      },
      {
        titulo: '8. Segurança',
        bloques: [
          'Aplicamos medidas técnicas e organizacionais razoáveis para proteger seus dados: o acesso ao sistema interno é individual e com senha, cada consulta a dados de saúde fica registrada, e as informações trafegam criptografadas.',
        ],
      },
      {
        titulo: '9. Mudanças nesta política',
        bloques: [
          'Se alterarmos este texto, publicaremos uma nova versão com a respectiva data. As autorizações que você já nos deu permanecem associadas à versão que você aceitou na ocasião, e mantém-se o registro de qual foi.',
        ],
      },
    ],
    pendiente:
      '**Informação pendente.** O NIT da organização (o registro tributário colombiano) está em tramitação, e ainda não há sede física nem um e-mail exclusivo para solicitações de dados. Assim que existirem, serão incorporados aqui e uma nova versão será publicada.',
    volver: 'Voltar ao início',
  },

  consentimiento: {
    meta: {
      titulo: 'Consentimento informado',
      descripcion:
        'O que você aceita ao agendar uma sessão com a Rede Aquí Estamos: em que consiste o acompanhamento, até onde vai a confidencialidade e o que fazemos com seus dados.',
    },
    version: 'Versão {version}',
    titulo: 'Consentimento informado',
    intro:
      'Isto é o que você aceita ao agendar uma sessão com a rede. Você verá o texto de novo ao escolher seu horário, e é ali que o assina, escrevendo seu nome. Se algo não ficar claro, pergunte antes: preferimos explicar.',
    puntos: [
      {
        titulo: 'O que é isto',
        texto:
          'Um acompanhamento psicológico voluntário e gratuito, com um profissional da Rede Aquí Estamos. Não substitui tratamento médico nem psiquiátrico, e não somos um serviço de emergência.',
      },
      {
        titulo: 'Confidencialidade',
        texto:
          'O que você falar na sessão é confidencial e está protegido pelo sigilo profissional. Há apenas dois limites, ambos previstos em lei: se houver risco sério para a sua vida ou a de outra pessoa, o profissional pode acionar ajuda; e se uma autoridade competente o exigir formalmente.',
      },
      {
        titulo: 'É voluntário',
        texto:
          'Você pode pausar ou deixar o acompanhamento quando quiser, sem dar explicações e sem que isso mude a forma como tratamos você.',
      },
      {
        titulo: 'Seus dados',
        texto:
          'Seus dados de saúde são sensíveis segundo a lei colombiana, e você não tem obrigação de autorizar seu uso; se aceitar, nós os usamos apenas para coordenar seu acompanhamento, como diz nossa política de dados. Você pode pedir para vê-los, corrigi-los ou eliminá-los quando quiser. A rede não guarda prontuário clínico das suas sessões.',
      },
      {
        titulo: 'Sua assinatura',
        texto:
          'Ao escrever seu nome e aceitar, fica registrado qual versão deste texto você aceitou e quando. Se algo não ficar claro, pergunte pelo WhatsApp antes de assinar: explicamos com prazer.',
      },
    ],
    riesgoTitulo: 'Se você está em risco agora',
    riesgoTexto:
      'Este acompanhamento não é um serviço de emergência e não atende crises no momento em que acontecem. Se você ou outra pessoa estiver em perigo, ligue:',
    lineas: {
      '123': 'Linha de emergências',
      '106': 'Linha de saúde mental',
    },
    dudasTitulo: 'Dúvidas sobre este texto',
    dudasTexto:
      'Escreva pelo [{canal}]({canalHref}). Para o que diz respeito aos seus dados — vê-los, corrigi-los, apagá-los ou retirar sua autorização — existe a [política de tratamento de dados](/politica-de-datos), que é o documento que trata disso em detalhe.',
  },

  formularios: {
    comun: {
      pasoDe: 'Passo {paso} de 3',
      atras: 'Voltar',
      opcional: '(Opcional)',
      errorConexion:
        'Não conseguimos conectar ao servidor. Verifique sua conexão e tente novamente.',
      errorCampo: 'Revise este campo.',
      errorServidor:
        'Não conseguimos salvar seus dados. Revise o formulário e tente novamente, ou escreva para nós no WhatsApp.',
      telefono: {
        pista:
          'Com WhatsApp, se tiver: é por onde entraremos em contato. Inclua o código do país, por exemplo +55 11 91234-5678.',
        error:
          'Escreva seu número com o código do país, por exemplo +55 11 91234-5678. Celulares colombianos também podem ser escritos com 10 dígitos começando por 3.',
      },
      nombreSoloLetras: 'Informe seu nome completo (apenas letras)',
      municipio: {
        desplegar: 'Mostrar a lista de cidades',
        coincidencias: 'Resultados para "{busqueda}" (ou escreva livremente):',
        principales: 'Principais cidades e municípios da Colômbia:',
        noEsta: 'Não encontramos “{busqueda}” na lista, mas',
        seGuarda: 'será salvo exatamente como você escreveu',
      },
      casillas: {
        atencion:
          'Autorizo a Red Aquí Estamos a tratar meus dados para me acompanhar, inclusive o dado sobre minha saúde mental, que é um dado sensível e que não sou obrigado(a) a fornecer.',
        datos:
          'Autorizo a Red Aquí Estamos a tratar meus dados pessoais para as finalidades descritas acima.',
        sensiblesProfesional:
          'Entendo que o dado sobre minha vacinação é um dado de saúde, que não sou obrigado(a) a fornecê-lo, e autorizo seu tratamento para as saídas a campo.',
        representante:
          'Sou o pai, a mãe ou o representante legal da pessoa menor de idade que vai receber o acompanhamento, e autorizo sua participação.',
        comunicaciones: 'Quero receber informações sobre outras atividades e recursos da rede.',
      },
      avisoTratamiento: {
        profesionales:
          'A Red Aquí Estamos é responsável pelos dados que você compartilha conosco. Nós os usamos para avaliar sua candidatura, coordenar os acompanhamentos que você assumir e manter o registro interno da rede. Não os vendemos nem os entregamos a terceiros.',
        apoyo:
          'A Red Aquí Estamos é responsável pelos dados que você compartilha conosco. Nós os usamos para manter um diretório do voluntariado da rede e poder procurar você quando surgir uma necessidade que combine com o que você sabe fazer. Não os vendemos nem os entregamos a terceiros.',
      },
      avisoDerechos:
        'Você pode nos pedir a qualquer momento para conhecer, atualizar ou corrigir seus dados, eliminá-los ou retirar esta autorização.',
    },

    atencion: {
      pasos: [
        'Quem vamos acompanhar e como entrar em contato?',
        'Como você está se sentindo hoje? (Avaliação breve)',
        'Modalidade e confirmação',
      ],
      paraQuien: {
        etiqueta: 'O acompanhamento é…',
        opciones: { PARA_MI: 'Para mim', PARA_OTRA_PERSONA: 'Para outra pessoa' },
      },
      esMenor: {
        etiqueta: 'Essa pessoa é menor de idade?',
        opciones: { NO: 'Não, é maior de idade', SI: 'Sim, é menor de 18 anos' },
      },
      tuNombre: {
        etiqueta: 'E qual é o seu nome?',
        pista: 'Para sabermos com quem estamos falando quando ligarmos.',
      },
      relacion: {
        etiqueta: 'Qual é a sua relação com essa pessoa?',
        pista: 'Opcional. Por exemplo: mãe, filho, companheiro(a), amiga.',
      },
      nombre: 'Qual é o seu nome?',
      nombreOtra: 'Qual é o nome dessa pessoa?',
      celular: {
        etiqueta: 'Celular / WhatsApp',
        pista:
          'Um número para o qual possamos escrever ou ligar. Se não for um número colombiano, inclua o código do país, por exemplo +55 11 91234-5678.',
      },
      correo: {
        etiqueta: 'E-mail',
        pista: 'Opcional. O celular ou o WhatsApp é suficiente.',
      },
      canal: {
        etiqueta: 'Por onde você prefere que entremos em contato?',
        opciones: {
          WHATSAPP: 'WhatsApp',
          LLAMADA: 'Ligação telefônica',
          CORREO: 'E-mail',
        },
      },
      ciudad: {
        etiqueta: 'De qual cidade ou município você nos escreve?',
        ejemplo: 'Busque ou escreva sua cidade ou município...',
        pista: 'Selecione na lista (Colômbia) ou escreva se não aparecer.',
      },
      siguiente1: 'Próximo: Como você está se sentindo hoje?',
      intro2:
        '**4 perguntas rápidas, de um único toque.** Elas nos ajudam a entender sua situação atual e a conectar você ao profissional mais adequado, com a prioridade de que você precisa.',
      malestar: {
        etiqueta: '1. De 1 a 5, quão difícil ou pesado está o dia de hoje para você? *',
        niveles: [
          { etiqueta: '1 · Leve', detalle: 'Estou conseguindo lidar' },
          { etiqueta: '2 · Administrável', detalle: 'Com alguma dificuldade' },
          { etiqueta: '3 · Difícil', detalle: 'Está sendo bem difícil' },
          { etiqueta: '4 · Muito difícil', detalle: 'Quase não dou conta do dia' },
          { etiqueta: '5 · Extremo', detalle: 'No limite / em crise' },
        ],
      },
      dano: {
        etiqueta: '2. Nestes dias, você teve pensamentos de se machucar ou de não querer continuar? *',
        no: 'Não',
        si: 'Sim, tive esses pensamentos',
        contencionTitulo: 'Sua vida é muito valiosa. Você não está só.',
        contencionTexto:
          'Se você sentir que está em perigo imediato ou não conseguir conter a angústia, na Colômbia pode ligar gratuitamente para o **106** ou o **192** (24 horas). No Brasil, ligue **188** (CVV) ou **192** (SAMU). Em outro país, ligue para o número de emergência local.',
      },
      urgencia: {
        etiqueta: '3. Com que rapidez você sente que precisa falar com um profissional? *',
        opciones: {
          HOY: 'Hoje mesmo / Muito urgente',
          ESTA_SEMANA: 'Nos próximos dias / Esta semana',
          PUEDO_ESPERAR: 'Posso esperar um pouco mais',
        },
      },
      seguro: {
        etiqueta: '4. Você está em um lugar seguro e tem o básico (sono, alimentação)? *',
        si: 'Sim, estou em segurança',
        no: 'Não me sinto em segurança ou me falta o básico',
      },
      siguiente2: 'Próximo: Modalidade e confirmação',
      modalidad: {
        etiqueta: 'Como você prefere receber o acompanhamento?',
        opciones: {
          VIRTUAL: 'Online (por videochamada ou ligação telefônica)',
          PRESENCIAL: 'Presencial (em consultório ou espaço combinado no seu município)',
          INDIFERENTE: 'Tanto faz (posso online ou presencial)',
        },
      },
      mensaje: {
        etiqueta: 'Quer deixar alguma mensagem ou detalhe adicional?',
        pista: 'Opcional. Você pode nos contar brevemente o que considerar importante.',
      },
      datosTitulo: 'Seus dados e sua confidencialidade',
      datosTexto:
        'Só o profissional que acompanhar você e a equipe de coordenação os veem. Não os vendemos nem os damos a mais ninguém. [Como tratamos seus dados e como você pode apagá-los](/politica-de-datos).',
      enviar: 'Solicitar acompanhamento psicológico',
      enviando: 'Enviando pedido…',
      errores: {
        forWhom: 'Selecione para quem é o acompanhamento',
        isMinor: 'Conte para nós se essa pessoa é menor de 18 anos',
        contactName: 'Diga seu nome para sabermos com quem estamos falando',
        name: 'Precisamos de um nome de contato',
        phone: 'Precisamos de um número de telefone/WhatsApp',
        emailInvalido: 'Esse e-mail não parece válido',
        emailFalta: 'Se você prefere e-mail, precisamos do seu endereço',
        preferredContact: 'Selecione por onde prefere que entremos em contato',
        city: 'Selecione ou escreva de qual cidade ou município você nos escreve',
        distress: 'Selecione de 1 a 5 como você está se sentindo hoje',
        selfHarmThoughts: 'Por favor, responda a esta pergunta',
        howSoon: 'Diga com que rapidez você precisa falar com alguém',
        safePlace: 'Por favor, diga se você está em um lugar seguro',
        preferredModality: 'Selecione a modalidade de acompanhamento',
        dataConsent: 'Precisamos da sua autorização para poder entrar em contato',
        guardianConsent:
          'Como é para uma pessoa menor de idade, precisamos da autorização do representante legal',
        incompleto: 'Por favor, preencha os campos obrigatórios antes de enviar.',
        envio: 'Não conseguimos enviar seus dados. Tente novamente.',
      },
      exito: {
        titulo: 'Recebemos seu pedido, {nombre}!',
        sinNombre: 'amigo(a)',
        texto:
          'Estamos aqui com você. Suas informações já foram recebidas pela nossa equipe de coordenação, e um profissional voluntário da rede entrará em contato por WhatsApp ou ligação no número {telefono} para acompanhar você.',
        prioridadTitulo: 'Atendimento prioritário e linhas de emergência 24 horas',
        prioridadTexto:
          'Se você sentir que está em perigo ou precisar falar imediatamente com um especialista, na Colômbia pode ligar gratuitamente para a **Linha 106** ou a **Linha 192** (24 horas). No Brasil, ligue **188** (CVV) ou **192** (SAMU). Em outro país, ligue para o número de emergência local.',
        volver: 'Voltar ao início',
      },
    },

    profesional: {
      pestanas: ['Seus dados', 'Perfil', 'Disponibilidade'],
      paso1: {
        titulo: 'Passo 1: Quem é você e como entramos em contato?',
        bajada: 'Informações básicas para falarmos com você e coordenar sua participação.',
        nombre: { etiqueta: 'Nome completo', ejemplo: 'Ex.: Laura Sofia Morais' },
        celular: { etiqueta: 'Celular / WhatsApp', ejemplo: 'Ex.: +55 11 91234-5678' },
        correo: { etiqueta: 'E-mail', ejemplo: 'nome@exemplo.com' },
        ciudad: {
          etiqueta: 'Em qual cidade ou município você mora?',
          ejemplo: 'Busque seu município na Colômbia ou escreva sua cidade...',
        },
        continuar: 'Continuar para o perfil profissional',
      },
      paso2: {
        titulo: 'Passo 2: Seu perfil profissional e sua experiência',
        bajada:
          'Isso nos permite designar para você pessoas e comunidades afins à sua formação e abordagem.',
        profesion: {
          etiqueta: 'Profissão',
          opciones: {
            Psicología: 'Psicologia',
            Psiquiatría: 'Psiquiatria',
            'Trabajo Social': 'Serviço Social',
            Otra: 'Outra profissão',
          },
        },
        anos: {
          etiqueta: 'Anos de experiência',
          opciones: {
            MENOS_DE_1: 'Menos de 1 ano',
            ENTRE_1_Y_3: '1 a 3 anos',
            ENTRE_3_Y_5: '3 a 5 anos',
            MAS_DE_5: 'Mais de 5 anos',
          },
        },
        otraProfesion: {
          etiqueta: 'Qual outra profissão?',
          ejemplo: 'Ex.: Licenciatura em Pedagogia / Psicopedagogia',
        },
        tarjeta: {
          etiqueta: 'Você tem registro profissional (tarjeta profesional)?',
          opciones: { SI: 'Sim, tenho', EN_TRAMITE: 'Em andamento', ESTUDIANTE: 'Sou estudante' },
        },
        poblaciones: {
          etiqueta: 'Com quais populações você tem experiência?',
          pista: 'Toque para selecionar todas as populações que se aplicam.',
          opciones: {
            'Niños y niñas': 'Crianças',
            Adolescentes: 'Adolescentes',
            Jóvenes: 'Jovens',
            Adultos: 'Adultos',
            'Personas mayores': 'Pessoas idosas',
            Familias: 'Famílias',
            'Enfoque de género': 'Enfoque de gênero',
            'Población víctima de violencia': 'População vítima de violência',
            'Población desplazada/migrante': 'População deslocada/migrante',
            Otra: 'Outra',
          },
        },
        otraPoblacion: 'Com qual outra população você trabalha?',
        crisis: {
          etiqueta:
            'Você tem experiência ou formação em atendimento em crise / primeiros cuidados psicológicos?',
          opciones: {
            SI: 'Sim, tenho formação e experiência prática',
            FORMACION_POCA_PRACTICA: 'Tenho formação teórica, com pouca prática',
            SIN_FORMACION_DISPONIBLE_APRENDER: 'Não tenho formação prévia, mas quero aprender',
            NO: 'Não tenho experiência em crise',
          },
        },
        volver: 'Voltar',
        continuar: 'Continuar para a disponibilidade',
      },
      paso3: {
        titulo: 'Passo 3: Disponibilidade e documentos',
        bajada: 'Defina como você gostaria de participar e, se quiser, anexe seus documentos.',
        modalidad: {
          etiqueta: 'Em qual modalidade você pode acompanhar?',
          opciones: {
            VIRTUAL: { nombre: 'Online', detalle: 'Atendimento 100% online por videochamada' },
            PRESENCIAL: { nombre: 'Presencial', detalle: 'Em território ou centros comunitários' },
            AMBAS: { nombre: 'Ambas', detalle: 'Disponível presencial e online' },
          },
        },
        desplazamiento: {
          etiqueta: 'Para quais municípios ou regiões você poderia se deslocar?',
          pista: 'Opcional.',
          ejemplo: 'Ex.: Municípios vizinhos / zonas rurais próximas',
        },
        fiebre: {
          etiqueta: 'Você está vacinado(a) contra a febre amarela?',
          pista: 'Exigido para acesso a certas zonas de emergência.',
          opciones: {
            SI: 'Sim, já tenho o comprovante de vacinação',
            CITA_AGENDADA: 'Ainda não, mas tenho a vacina agendada',
            NO: 'Não estou vacinado(a)',
          },
        },
        dias: {
          etiqueta: 'Em quais dias você tem disponibilidade?',
          todos: 'Todos os dias',
          ninguno: 'Desmarcar todos',
          opciones: {
            LUNES: { corto: 'Seg', nombre: 'Segunda-feira' },
            MARTES: { corto: 'Ter', nombre: 'Terça-feira' },
            MIERCOLES: { corto: 'Qua', nombre: 'Quarta-feira' },
            JUEVES: { corto: 'Qui', nombre: 'Quinta-feira' },
            VIERNES: { corto: 'Sex', nombre: 'Sexta-feira' },
            SABADO: { corto: 'Sáb', nombre: 'Sábado' },
            DOMINGO: { corto: 'Dom', nombre: 'Domingo' },
          },
        },
        franjas: {
          etiqueta: 'Em quais períodos do dia? (horário da Colômbia)',
          opciones: {
            MANANA: { nombre: 'Manhã', horario: '8h – 12h' },
            TARDE: { nombre: 'Tarde', horario: '12h – 18h' },
            NOCHE: { nombre: 'Noite', horario: '18h – 21h' },
          },
        },
        horas: {
          etiqueta: 'Quantas horas por semana você poderia dedicar?',
          opciones: {
            ENTRE_1_Y_3: { nombre: '1 a 3 horas / semana', detalle: '1 ou 2 sessões' },
            ENTRE_4_Y_6: { nombre: '4 a 6 horas / semana', detalle: '3 ou 4 sessões' },
            MAS_DE_6: { nombre: 'Mais de 6 horas / semana', detalle: '5 ou mais sessões' },
            VARIABLE: { nombre: 'Variável', detalle: 'Depende da semana' },
          },
        },
        documentos: {
          titulo: 'Anexar documentos de verificação (opcional)',
          elegidos: '✓ Documentos selecionados',
          despues: 'Você pode anexá-los agora ou enviá-los depois pelo WhatsApp',
          confidencialidad:
            '🔒 **Confidencialidade:** Uso exclusivo da equipe de coordenação para validar sua identidade e seu registro profissional, conforme a Lei 1581 de 2012 da Colômbia.',
          porWhatsappTitulo: 'Envie seus documentos pelo WhatsApp',
          porWhatsappTexto:
            'Quando você concluir o cadastro, nossa equipe entrará em contato para solicitá-los. Você também pode enviá-los diretamente para [{numero}]({enlace}), informando seu nome e o número do seu registro profissional.',
          verificando: 'Verificando disponibilidade…',
          tarjeta: {
            etiqueta: 'Registro profissional ou certificado',
            pista: 'Foto ou PDF do registro, diploma ou certificado.',
          },
          numeroTarjeta: {
            etiqueta: 'Número do registro profissional',
            pista: 'Opcional.',
            ejemplo: 'Ex.: 123456',
          },
          cedulaFrente: {
            etiqueta: 'Documento de identidade (frente)',
            pista: 'Foto ou PDF do seu documento de identidade.',
          },
          cedulaRespaldo: {
            etiqueta: 'Documento de identidade (verso)',
            pista: 'Opcional se você enviou os dois lados no anterior.',
          },
          archivo: {
            subiendo: 'Enviando arquivo…',
            listo: '✓ Pronto: {nombre}',
            elegir: '📎 Escolher foto ou PDF (máx. 10 MB)',
            quitar: 'Remover arquivo',
            errorSubida: 'Não foi possível enviar o arquivo.',
            errorRed:
              'Não foi possível enviar. Se o arquivo for muito pesado, tente uma foto mais leve; caso contrário, verifique sua conexão.',
          },
        },
        autorizaciones: {
          titulo: 'Autorizações e tratamento de dados',
          retencion: 'Conservamos seus dados por {anos} anos.',
          politica: 'Ver a Política de Tratamento de Dados',
        },
        volver: 'Voltar ao perfil',
        enviar: 'Enviar meu cadastro',
        enviando: 'Enviando cadastro…',
      },
      errores: {
        email: 'Informe um e-mail válido',
        city: 'Diga em qual cidade ou município você mora',
        profession: 'Selecione uma profissão',
        professionOther: 'Conte qual é a sua profissão',
        yearsExperience: 'Selecione seus anos de experiência',
        professionalCard: 'Selecione a situação do seu registro',
        populations: 'Selecione pelo menos uma população',
        populationOther: 'Conte com qual outra população você trabalha',
        crisisExperience: 'Selecione uma opção sobre atendimento em crise',
        modality: 'Selecione uma modalidade',
        availableDays: 'Selecione pelo menos um dia',
        availableSlots: 'Selecione pelo menos um período',
        weeklyHours: 'Selecione quantas horas você pode dedicar',
        yellowFeverVaccine: 'Selecione a situação da vacinação',
        dataConsent: 'Precisamos da sua autorização para poder entrar em contato',
        sensitiveDataConsent:
          'Precisamos da sua autorização expressa para guardar o dado de vacinação',
        envio: 'Não conseguimos salvar seu cadastro. Tente novamente.',
      },
      exito: {
        titulo: 'Agradecemos o seu apoio, {nombre}!',
        recibido:
          'Recebemos seu cadastro com sucesso. Sua disposição para acompanhar quem mais precisa faz parte de algo muito grande.',
        contacto:
          'Nos próximos dias, alguém da nossa equipe entrará em contato pelo WhatsApp para coordenar os próximos passos.',
        queSigue: 'O que acontece agora?',
        pasos: [
          'Analisamos seu perfil e designamos você a comunidades afins.',
          'Entramos em contato pelo WhatsApp para coordenar sua integração.',
          'Começamos a acompanhar juntos!',
        ],
        whatsapp: '💬 Escrever para nós no WhatsApp',
        otra: 'Cadastrar outra pessoa',
      },
    },

    apoyo: {
      pasos: [
        'Seus dados de contato',
        'Em qual área e ofício você pode apoiar?',
        'Disponibilidade e autorizações',
      ],
      nombre: { etiqueta: 'Nome completo', ejemplo: 'Seu nome e sobrenome' },
      celular: { etiqueta: 'Celular / WhatsApp', ejemplo: 'Ex.: +55 11 91234-5678' },
      correo: { etiqueta: 'E-mail', ejemplo: 'nome@exemplo.com' },
      ciudad: {
        etiqueta: 'De qual cidade ou município você participa?',
        ejemplo: 'Busque ou escreva sua cidade ou município...',
        pista: 'Selecione na lista (Colômbia) ou escreva se não aparecer.',
      },
      siguiente1: 'Próximo: Em que você pode ajudar?',
      area: {
        etiqueta: 'Qual é a sua área? *',
        opciones: {
          SALUD: 'Saúde e primeiros socorros',
          SOCIAL_LEGAL_EDUCATIVO: 'Social, jurídico e educacional',
          OPERACION_LOGISTICA: 'Operação e logística',
          COMUNICACION_TECNOLOGIA: 'Comunicação e tecnologia',
          GESTION_PROYECTOS: 'Gestão e projetos',
          OTRA: 'Outra área ou ofício',
        },
      },
      disciplina: {
        etiqueta: 'Qual é a sua área de atuação ou ofício? *',
        opciones: {
          Medicina: 'Medicina',
          Enfermería: 'Enfermagem',
          Fisioterapia: 'Fisioterapia',
          'Terapia ocupacional': 'Terapia ocupacional',
          Fonoaudiología: 'Fonoaudiologia',
          'Nutrición y dietética': 'Nutrição e dietética',
          Odontología: 'Odontologia',
          'Primeros auxilios': 'Primeiros socorros',
          'Trabajo social': 'Serviço social',
          Derecho: 'Direito',
          Docencia: 'Docência',
          Pedagogía: 'Pedagogia',
          'Primera infancia': 'Primeira infância',
          'Gestión comunitaria': 'Gestão comunitária',
          Logística: 'Logística',
          'Transporte y conducción': 'Transporte e condução',
          'Bodega e inventario': 'Depósito e estoque',
          'Cocina y alimentación': 'Cozinha e alimentação',
          'Construcción y obra': 'Construção e obras',
          'Gestión del riesgo de desastres': 'Gestão de riscos de desastres',
          'Comunicación social': 'Comunicação social',
          Diseño: 'Design',
          'Sistemas y tecnología': 'Sistemas e tecnologia',
          'Análisis de datos': 'Análise de dados',
          'Traducción e interpretación': 'Tradução e interpretação',
          'Gerencia de proyectos': 'Gerência de projetos',
          Administración: 'Administração',
          'Finanzas y contabilidad': 'Finanças e contabilidade',
          'Talento humano': 'Recursos humanos',
          Otra: 'Outra',
        },
      },
      otraDisciplina: {
        siOtraArea: 'Qual é o seu ofício ou profissão?',
        siOtraDisciplina: 'Qual outra área?',
        ejemplo: 'Escreva sua profissão ou ofício...',
      },
      anos: {
        etiqueta: 'Há quantos anos você tem experiência nisso?',
        opciones: {
          MENOS_DE_1: 'Menos de 1 ano',
          ENTRE_1_Y_3: 'Entre 1 e 3 anos',
          ENTRE_3_Y_5: 'Entre 3 e 5 anos',
          MAS_DE_5: 'Mais de 5 anos',
        },
      },
      tarjeta: {
        etiqueta: 'Você tem registro profissional?',
        pista:
          'Somente se a sua profissão exigir. Se não se aplica ao seu ofício, pode deixar em branco.',
        opciones: {
          SI: 'Sim, tenho',
          EN_TRAMITE: 'Está em andamento',
          ESTUDIANTE: 'Ainda sou estudante',
        },
      },
      habilidades: {
        etiqueta: 'O que você sabe fazer ou quais habilidades suas podem nos ajudar?',
        pista:
          'Opcional: ferramentas que você domina, idiomas, se dirige, se já apoiou em campo ou em emergências.',
      },
      siguiente2: 'Próximo: Disponibilidade',
      modalidad: {
        etiqueta: 'Como você pode apoiar?',
        opciones: {
          PRESENCIAL: 'Presencial',
          VIRTUAL: 'Online, de onde estou',
          AMBAS: 'As duas',
        },
      },
      desplazamiento: {
        etiqueta: 'Para quais municípios ou regiões você poderia se deslocar, se necessário?',
        pista: 'Opcional. Por exemplo: todo o departamento, zonas rurais próximas etc.',
      },
      dias: {
        etiqueta: 'Em quais dias da semana você tem disponibilidade? *',
        opciones: {
          LUNES: 'Segunda-feira',
          MARTES: 'Terça-feira',
          MIERCOLES: 'Quarta-feira',
          JUEVES: 'Quinta-feira',
          VIERNES: 'Sexta-feira',
          SABADO: 'Sábado',
          DOMINGO: 'Domingo',
        },
      },
      franjas: {
        etiqueta: 'Em quais períodos do dia? (horário da Colômbia) *',
        opciones: {
          MANANA: 'Manhã (8h – 12h)',
          TARDE: 'Tarde (12h – 18h)',
          NOCHE: 'Noite (18h – 21h)',
        },
      },
      horas: {
        etiqueta: 'Quantas horas por semana você poderia dedicar?',
        opciones: {
          ENTRE_1_Y_3: 'Entre 1 e 3 horas',
          ENTRE_4_Y_6: 'Entre 4 e 6 horas',
          MAS_DE_6: 'Mais de 6 horas',
          VARIABLE: 'Depende da semana',
        },
      },
      fiebre: {
        etiqueta: 'Você está vacinado(a) contra a febre amarela?',
        pista:
          'Algumas áreas em campo exigem comprovante de vacinação para a entrada. Se você não tiver, ainda pode apoiar online.',
        opciones: { SI: 'Sim', NO: 'Não', CITA_AGENDADA: 'Tenho a vacina agendada' },
      },
      autorizaciones: {
        titulo: 'Autorizações e tratamento de dados',
        retencion: 'Conservamos seus dados por {anos} anos após o fim da sua participação.',
      },
      enviar: 'Quero apoiar como voluntário(a)',
      enviando: 'Enviando cadastro…',
      errores: {
        email: 'Informe um e-mail válido',
        city: 'Selecione ou escreva em qual cidade ou município você mora',
        area: 'Selecione a área em que deseja apoiar',
        discipline: 'Selecione sua área de atuação ou ofício',
        disciplineOther: 'Conte qual é o seu ofício ou profissão',
        modality: 'Selecione como você pode apoiar',
        availableDays: 'Selecione pelo menos um dia',
        availableSlots: 'Selecione pelo menos um período',
        weeklyHours: 'Selecione quantas horas você pode dedicar',
        yellowFeverVaccine: 'Selecione uma opção de vacinação',
        dataConsent: 'Precisamos da sua autorização para poder entrar em contato',
        sensitiveDataConsent: 'Precisamos da sua autorização para guardar o dado de vacinação',
        incompleto: 'Revise os campos destacados antes de enviar.',
        envio: 'Não conseguimos salvar seu cadastro. Tente novamente.',
      },
      exito: {
        titulo: 'Agradecemos por se juntar à rede, {nombre}!',
        sinNombre: 'voluntário(a)',
        texto:
          'Seus dados já estão guardados no diretório do voluntariado da rede. Quando surgir uma brigada ou necessidade que combine com sua área e disponibilidade, nossa equipe de coordenação escreverá para o seu WhatsApp {telefono}.',
        otro: 'Cadastrar outro voluntário ou voltar ao início',
      },
    },
  },
}
