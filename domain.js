(function defineCodexDomain(root, factory) {
  const exportsObject = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = exportsObject;
  }

  root.CodexDomain = exportsObject;
})(typeof globalThis !== 'undefined' ? globalThis : window, function buildDomain() {
  const statusMeta = {
    ok: { label: 'Verde', icon: '✓', className: 'badge-ok', rank: 2 },
    warn: { label: 'Amarelo', icon: '▲', className: 'badge-warn', rank: 1 },
    alert: { label: 'Vermelho', icon: '●', className: 'badge-alert', rank: 0 },
    info: { label: 'Info', icon: 'ℹ', className: 'badge-info', rank: 3 },
  };

  const purchaseCycleLabels = {
    'atacado-mensal': 'Atacado mensal',
    'feira-semanal': 'Feira semanal',
    'contingencia-rural': 'Contingência rural',
  };

  const appProfile = {
    title: 'Estoque da Casa',
    subtitle: 'Controle de abastecimento local-first',
    restrictions: ['Sem Glúten', 'Zero Lactose'],
    autonomyWindow: '30–45 dias',
    purchaseStrategy: 'Atacado mensal + feira semanal',
    monthlyBudget: 'R$ 3.400–R$ 3.900',
    singleUserNote: 'Uso individual, local-first, sem sincronização ou backend.',
  };

  const sections = [
    {
      id: 'pantry',
      label: 'Despensa',
      icon: '◫',
      type: 'inventory',
      title: 'Despensa',
      subtitle: 'Base mensal SG/SL com autonomia de 30–45 dias.',
      alertBody: 'Reposição até o estoque ideal, mantendo unidade consistente por item.',
    },
    {
      id: 'proteins',
      label: 'Freezer',
      icon: '◆',
      type: 'inventory',
      title: 'Proteínas e freezer',
      subtitle: 'Meta mensal de 28–32 kg.',
      alertBody: 'Fracionar por uso, etiquetar com data e seguir PEPS.',
    },
    {
      id: 'feira',
      label: 'Feira',
      icon: '✿',
      type: 'inventory',
      title: 'Feira semanal',
      subtitle: 'Itens de giro curto e reabastecimento semanal.',
      alertBody: 'Estoque ideal menor — a lógica prioriza frescor.',
    },
    {
      id: 'care',
      label: 'Casa',
      icon: '⬡',
      type: 'inventory',
      title: 'Higiene, limpeza e contingência',
      subtitle: 'Uso recorrente e reserva de segurança.',
      alertBody: 'Recorrência por consumo, reserva por mínimo/ideal.',
    },
  ];

  const protocolCards = [
    {
      id: 'weekly-review',
      title: 'Rotina semanal',
      items: [
        { id: 'weekly-review-feira', text: 'Revisar itens da feira e separar o que já entrou em janela crítica.' },
        { id: 'weekly-review-water', text: 'Conferir água potável, filtro e garrafões disponíveis.' },
        { id: 'weekly-review-proteins', text: 'Checar freezer e puxar para frente os pacotes mais antigos.' },
        { id: 'weekly-review-shopping', text: 'Gerar lista de compras antes da ida à feira ou à cidade.' },
      ],
    },
    {
      id: 'monthly-reset',
      title: 'Reabastecimento mensal',
      items: [
        { id: 'monthly-reset-clean', text: 'Limpar potes com pano e álcool 70% antes de reabastecer.' },
        { id: 'monthly-reset-peps', text: 'Aplicar PEPS e colocar o lote novo atrás do lote antigo.' },
        { id: 'monthly-reset-stock', text: 'Atualizar todos os estoques logo após descarregar a compra.' },
        { id: 'monthly-reset-freezer', text: 'Porcionar proteínas antes de congelar e etiquetar tudo.' },
      ],
    },
    {
      id: 'rural-emergency',
      title: 'Isolamento rural',
      items: [
        { id: 'rural-emergency-water', text: 'Garantir reserva mínima de água potável para 72 horas.' },
        { id: 'rural-emergency-meds', text: 'Conferir farmacinha, termômetro e analgésicos essenciais.' },
        { id: 'rural-emergency-route', text: 'Confirmar rota de saída, combustível e contatos de suporte.' },
        { id: 'rural-emergency-obstetra', text: 'Manter o plano de emergência gestacional acessível.' },
      ],
    },
  ];

  const rawInventoryItems = [
    {
      id: 'arroz-branco',
      categoryId: 'pantry',
      group: 'Base seca SG/SL',
      label: 'Arroz branco',
      note: 'Base principal da despensa',
      unit: 'kg',
      monthlyUsage: 8,
      minimumStock: 4,
      idealStock: 8,
      shelfLife: '12–18 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 80,
      highlight: true,
    },
    {
      id: 'arroz-japones',
      categoryId: 'pantry',
      group: 'Base seca SG/SL',
      label: 'Arroz japonês',
      note: 'Uso específico e refeições de conforto',
      unit: 'kg',
      monthlyUsage: 2,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '12 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 40,
    },
    {
      id: 'feijao',
      categoryId: 'pantry',
      group: 'Base seca SG/SL',
      label: 'Feijão',
      note: 'Proteína vegetal e rotina de almoço',
      unit: 'kg',
      monthlyUsage: 5,
      minimumStock: 2.5,
      idealStock: 5,
      shelfLife: '12 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 78,
      highlight: true,
    },
    {
      id: 'flocao-cuscuz',
      categoryId: 'pantry',
      group: 'Base seca SG/SL',
      label: 'Flocão de cuscuz',
      note: 'Café da manhã e refeições simples',
      unit: 'kg',
      monthlyUsage: 4,
      minimumStock: 2,
      idealStock: 4,
      shelfLife: '8–10 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 75,
      highlight: true,
    },
    {
      id: 'macarrao-sg',
      categoryId: 'pantry',
      group: 'Base seca SG/SL',
      label: 'Macarrão penne/parafuso SG',
      note: 'Versátil para almoço e jantar SG',
      unit: 'kg',
      monthlyUsage: 5,
      minimumStock: 2.5,
      idealStock: 5,
      shelfLife: '10–12 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 74,
      highlight: true,
    },
    {
      id: 'macarrao-sopa-sg',
      categoryId: 'pantry',
      group: 'Base seca SG/SL',
      label: 'Macarrão para sopa SG',
      note: 'Reserva para refeições simples e rápidas',
      unit: 'kg',
      monthlyUsage: 1,
      minimumStock: 0.5,
      idealStock: 1,
      shelfLife: '10–12 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 32,
    },
    {
      id: 'tapioca',
      categoryId: 'pantry',
      group: 'Base seca SG/SL',
      label: 'Tapioca',
      note: 'Alternativa sem glúten para café e lanche',
      unit: 'kg',
      monthlyUsage: 2,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '6–8 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 54,
    },
    {
      id: 'aveia',
      categoryId: 'pantry',
      group: 'Base seca SG/SL',
      label: 'Aveia',
      note: 'Farinha/flocos para mingau, granola e lanche',
      unit: 'kg',
      monthlyUsage: 2,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '6 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 48,
    },
    {
      id: 'granola',
      categoryId: 'pantry',
      group: 'Base seca SG/SL',
      label: 'Granola',
      note: 'Complemento de café da manhã para SG/SL',
      unit: 'kg',
      monthlyUsage: 1.5,
      minimumStock: 0.5,
      idealStock: 1.5,
      shelfLife: '4–6 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 34,
    },
    {
      id: 'biscoito-sg',
      categoryId: 'pantry',
      group: 'Base seca SG/SL',
      label: 'Biscoitos de arroz e maizena SG',
      note: 'Lanche infantil com restrição controlada',
      unit: 'pacotes',
      monthlyUsage: 10,
      minimumStock: 4,
      idealStock: 10,
      shelfLife: '4–8 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 44,
    },
    {
      id: 'leite-zl',
      categoryId: 'pantry',
      group: 'Laticínios ZL e cozinha',
      label: 'Leite sem lactose',
      note: 'Base da rotina da casa, consumo não diário',
      unit: 'L',
      monthlyUsage: 18,
      minimumStock: 9,
      idealStock: 18,
      shelfLife: '4–6 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 82,
      highlight: true,
    },
    {
      id: 'requeijao-zl',
      categoryId: 'pantry',
      group: 'Laticínios ZL e cozinha',
      label: 'Requeijão ZL',
      note: 'Versátil para lanche e refeição rápida',
      unit: 'unid',
      monthlyUsage: 4,
      minimumStock: 2,
      idealStock: 4,
      shelfLife: '30–45 dias',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 36,
    },
    {
      id: 'creme-leite-zl',
      categoryId: 'pantry',
      group: 'Laticínios ZL e cozinha',
      label: 'Creme de leite ZL',
      note: 'Base de preparo para receitas sem lactose',
      unit: 'unid',
      monthlyUsage: 6,
      minimumStock: 3,
      idealStock: 6,
      shelfLife: '4–6 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 28,
    },
    {
      id: 'azeite',
      categoryId: 'pantry',
      group: 'Laticínios ZL e cozinha',
      label: 'Azeite',
      note: 'Cozinha diária e finalização',
      unit: 'garrafas',
      monthlyUsage: 2,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '12 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 26,
    },
    {
      id: 'extrato-tomate',
      categoryId: 'pantry',
      group: 'Laticínios ZL e cozinha',
      label: 'Extrato de tomate',
      note: 'Molhos rápidos e preparo base',
      unit: 'unid',
      monthlyUsage: 8,
      minimumStock: 4,
      idealStock: 8,
      shelfLife: '12 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 35,
    },
    {
      id: 'atum',
      categoryId: 'pantry',
      group: 'Proteína seca e emergência',
      label: 'Atum em lata',
      note: 'Reserva proteica e prato rápido',
      unit: 'latas',
      monthlyUsage: 8,
      minimumStock: 4,
      idealStock: 8,
      shelfLife: '3–5 anos',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 52,
      highlight: true,
    },
    {
      id: 'grao-de-bico',
      categoryId: 'pantry',
      group: 'Proteína seca e emergência',
      label: 'Grão-de-bico',
      note: 'Seco e enlatado como dupla de segurança',
      unit: 'kg',
      monthlyUsage: 2,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '12–18 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 38,
    },
    {
      id: 'milho-verde',
      categoryId: 'pantry',
      group: 'Proteína seca e emergência',
      label: 'Milho verde',
      note: 'Apoio para refeições rápidas e infantis',
      unit: 'latas',
      monthlyUsage: 8,
      minimumStock: 4,
      idealStock: 8,
      shelfLife: '24 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 24,
    },
    {
      id: 'amendoim',
      categoryId: 'pantry',
      group: 'Proteína seca e emergência',
      label: 'Amendoim',
      note: 'Lanche energético e ingrediente de cozinha',
      unit: 'kg',
      monthlyUsage: 1,
      minimumStock: 0.5,
      idealStock: 1,
      shelfLife: '6 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 22,
    },
    {
      id: 'shoyu',
      categoryId: 'pantry',
      group: 'Proteína seca e emergência',
      label: 'Shoyu / Tarê / óleo de gergelim',
      note: 'Kit pequeno de cozinha asiática e marinadas',
      unit: 'kits',
      monthlyUsage: 1,
      minimumStock: 0.5,
      idealStock: 1,
      shelfLife: '8–12 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 14,
    },
    {
      id: 'sal',
      categoryId: 'pantry',
      group: 'Temperos e condimentos',
      label: 'Sal',
      note: 'Base de tempero da cozinha',
      unit: 'kg',
      monthlyUsage: 1,
      minimumStock: 0.5,
      idealStock: 1,
      shelfLife: 'Indefinido',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 85,
      highlight: true,
    },
    {
      id: 'acucar',
      categoryId: 'pantry',
      group: 'Temperos e condimentos',
      label: 'Açúcar',
      note: 'Uso geral na cozinha',
      unit: 'kg',
      monthlyUsage: 2,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '24 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 45,
    },
    {
      id: 'cafe',
      categoryId: 'pantry',
      group: 'Temperos e condimentos',
      label: 'Café',
      note: 'Consumo diário dos adultos',
      unit: 'pacotes',
      monthlyUsage: 2,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '6–12 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 50,
    },
    {
      id: 'oleo-vegetal',
      categoryId: 'pantry',
      group: 'Temperos e condimentos',
      label: 'Óleo vegetal',
      note: 'Fritura e preparo do dia a dia',
      unit: 'L',
      monthlyUsage: 2,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '12 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 60,
    },
    {
      id: 'farinha-mandioca',
      categoryId: 'pantry',
      group: 'Temperos e condimentos',
      label: 'Farinha de mandioca',
      note: 'Complemento de refeição e farofa',
      unit: 'kg',
      monthlyUsage: 2,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '6 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 55,
    },
    {
      id: 'temperos-secos',
      categoryId: 'pantry',
      group: 'Temperos e condimentos',
      label: 'Temperos secos (cominho, colorau, pimenta)',
      note: 'Cominho, colorau/urucum e pimenta-do-reino',
      unit: 'potes',
      monthlyUsage: 1,
      minimumStock: 1,
      idealStock: 3,
      shelfLife: '12–24 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 40,
    },
    {
      id: 'leite-coco',
      categoryId: 'pantry',
      group: 'Laticínios ZL e cozinha',
      label: 'Leite de coco',
      note: 'Receitas, moquecas e sobremesas SL',
      unit: 'unid',
      monthlyUsage: 4,
      minimumStock: 2,
      idealStock: 4,
      shelfLife: '12 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 30,
    },
    {
      id: 'frango-file',
      categoryId: 'proteins',
      group: 'Proteínas principais',
      label: 'Filé de peito',
      note: 'Corte versátil e de giro alto',
      unit: 'kg',
      monthlyUsage: 6,
      minimumStock: 3,
      idealStock: 6,
      shelfLife: '6 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 76,
      highlight: true,
    },
    {
      id: 'sobrecoxa',
      categoryId: 'proteins',
      group: 'Proteínas principais',
      label: 'Sobrecoxa',
      note: 'Assados e refeições de bandeja',
      unit: 'kg',
      monthlyUsage: 4,
      minimumStock: 2,
      idealStock: 4,
      shelfLife: '6 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 58,
    },
    {
      id: 'coxinha-asa',
      categoryId: 'proteins',
      group: 'Proteínas principais',
      label: 'Coxinha da asa',
      note: 'Refeição prática e criança aprova',
      unit: 'kg',
      monthlyUsage: 2,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '6 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 30,
    },
    {
      id: 'bovino-moida',
      categoryId: 'proteins',
      group: 'Proteínas principais',
      label: 'Carne moída / músculo',
      note: 'Alta utilidade culinária',
      unit: 'kg',
      monthlyUsage: 6,
      minimumStock: 3,
      idealStock: 6,
      shelfLife: '4–6 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 74,
      highlight: true,
    },
    {
      id: 'carne-sol',
      categoryId: 'proteins',
      group: 'Proteínas principais',
      label: 'Carne de sol',
      note: 'Sabor local e cardápio de conforto',
      unit: 'kg',
      monthlyUsage: 2,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '2–3 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 26,
    },
    {
      id: 'acem-osso',
      categoryId: 'proteins',
      group: 'Proteínas principais',
      label: 'Acém com osso',
      note: 'Caldos, sopas e cozidos',
      unit: 'kg',
      monthlyUsage: 2,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '4 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 18,
    },
    {
      id: 'ovos',
      categoryId: 'proteins',
      group: 'Proteínas principais',
      label: 'Ovos',
      note: 'Consumo alto e versátil — média de 4 por dia',
      unit: 'unid',
      monthlyUsage: 120,
      minimumStock: 60,
      idealStock: 120,
      shelfLife: '3–4 semanas',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 70,
      highlight: true,
    },
    {
      id: 'peixe',
      categoryId: 'proteins',
      group: 'Proteínas principais',
      label: 'Tilápia / Merluza',
      note: 'Opção leve de proteína congelada',
      unit: 'kg',
      monthlyUsage: 4,
      minimumStock: 2,
      idealStock: 4,
      shelfLife: '4–6 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 56,
    },
    {
      id: 'maca-feira',
      categoryId: 'feira',
      group: 'Frutas',
      label: 'Maçã',
      note: 'Fruta de boa durabilidade para a semana',
      unit: 'kg',
      monthlyUsage: 3,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '2–3 semanas',
      purchaseCycle: 'feira-semanal',
      stockMode: 'recurring',
      priority: 34,
    },
    {
      id: 'pera-feira',
      categoryId: 'feira',
      group: 'Frutas',
      label: 'Pêra',
      note: 'Giro curto e boa aceitação infantil',
      unit: 'kg',
      monthlyUsage: 2,
      minimumStock: 0.5,
      idealStock: 1.5,
      shelfLife: '7–10 dias',
      purchaseCycle: 'feira-semanal',
      stockMode: 'recurring',
      priority: 28,
    },
    {
      id: 'uva-feira',
      categoryId: 'feira',
      group: 'Frutas',
      label: 'Uva',
      note: 'Fruta fresca para a semana, sem estocar demais',
      unit: 'kg',
      monthlyUsage: 2,
      minimumStock: 0.5,
      idealStock: 1,
      shelfLife: '5–7 dias',
      purchaseCycle: 'feira-semanal',
      stockMode: 'recurring',
      priority: 20,
    },
    {
      id: 'cenoura-feira',
      categoryId: 'feira',
      group: 'Legumes',
      label: 'Cenoura',
      note: 'Legume de boa janela e alto uso culinário',
      unit: 'kg',
      monthlyUsage: 3,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '2–3 semanas',
      purchaseCycle: 'feira-semanal',
      stockMode: 'recurring',
      priority: 32,
    },
    {
      id: 'batata-feira',
      categoryId: 'feira',
      group: 'Legumes',
      label: 'Batata',
      note: 'Base infantil e cardápio de conforto',
      unit: 'kg',
      monthlyUsage: 5,
      minimumStock: 2,
      idealStock: 3,
      shelfLife: '2–4 semanas',
      purchaseCycle: 'feira-semanal',
      stockMode: 'recurring',
      priority: 36,
    },
    {
      id: 'cebola-feira',
      categoryId: 'feira',
      group: 'Legumes',
      label: 'Cebola',
      note: 'Mais estável, mas entra na revisão semanal',
      unit: 'kg',
      monthlyUsage: 3,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '1–2 meses',
      purchaseCycle: 'feira-semanal',
      stockMode: 'recurring',
      priority: 38,
    },
    {
      id: 'tomate-feira',
      categoryId: 'feira',
      group: 'Legumes',
      label: 'Tomate',
      note: 'Item de feira com virada rápida',
      unit: 'kg',
      monthlyUsage: 4,
      minimumStock: 1.5,
      idealStock: 2.5,
      shelfLife: '5–10 dias',
      purchaseCycle: 'feira-semanal',
      stockMode: 'recurring',
      priority: 42,
    },
    {
      id: 'coentro-feira',
      categoryId: 'feira',
      group: 'Temperos verdes',
      label: 'Coentro',
      note: 'Cheiro verde de giro semanal',
      unit: 'maços',
      monthlyUsage: 4,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '3–5 dias',
      purchaseCycle: 'feira-semanal',
      stockMode: 'recurring',
      priority: 24,
    },
    {
      id: 'cebolinha-feira',
      categoryId: 'feira',
      group: 'Temperos verdes',
      label: 'Cebolinha',
      note: 'Reforça preparo rápido e congelamento em cubos',
      unit: 'maços',
      monthlyUsage: 4,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '3–5 dias',
      purchaseCycle: 'feira-semanal',
      stockMode: 'recurring',
      priority: 22,
    },
    {
      id: 'hortela-feira',
      categoryId: 'feira',
      group: 'Temperos verdes',
      label: 'Hortelã',
      note: 'Uso pontual, mas ajuda na variedade',
      unit: 'maços',
      monthlyUsage: 2,
      minimumStock: 0.5,
      idealStock: 1,
      shelfLife: '3–5 dias',
      purchaseCycle: 'feira-semanal',
      stockMode: 'recurring',
      priority: 10,
    },
    {
      id: 'folhosas-feira',
      categoryId: 'feira',
      group: 'Temperos verdes',
      label: 'Folhosas',
      note: 'Couve, espinafre e alface em giro curto',
      unit: 'maços',
      monthlyUsage: 16,
      minimumStock: 2,
      idealStock: 5,
      shelfLife: '3–5 dias',
      purchaseCycle: 'feira-semanal',
      stockMode: 'recurring',
      priority: 84,
      highlight: true,
    },
    {
      id: 'alho-feira',
      categoryId: 'feira',
      group: 'Temperos verdes',
      label: 'Alho',
      note: 'Base de tempero — uso diário na cozinha',
      unit: 'cabeças',
      monthlyUsage: 8,
      minimumStock: 2,
      idealStock: 4,
      shelfLife: '1–2 meses',
      purchaseCycle: 'feira-semanal',
      stockMode: 'recurring',
      priority: 70,
      highlight: true,
    },
    {
      id: 'banana-feira',
      categoryId: 'feira',
      group: 'Frutas',
      label: 'Banana',
      note: 'Fruta de alto consumo infantil e lanche rápido',
      unit: 'kg',
      monthlyUsage: 6,
      minimumStock: 2,
      idealStock: 4,
      shelfLife: '5–10 dias',
      purchaseCycle: 'feira-semanal',
      stockMode: 'recurring',
      priority: 48,
    },
    {
      id: 'limao-feira',
      categoryId: 'feira',
      group: 'Frutas',
      label: 'Limão',
      note: 'Tempero, drinks e uso com peixes',
      unit: 'kg',
      monthlyUsage: 1.5,
      minimumStock: 0.5,
      idealStock: 1,
      shelfLife: '1–2 semanas',
      purchaseCycle: 'feira-semanal',
      stockMode: 'recurring',
      priority: 35,
    },
    {
      id: 'papel-higienico',
      categoryId: 'care',
      group: 'Higiene e pessoal',
      label: 'Papel higiênico',
      note: 'Consumo alto, compra em volume',
      unit: 'rolos',
      monthlyUsage: 40,
      minimumStock: 20,
      idealStock: 40,
      shelfLife: 'Indefinido',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 72,
      highlight: true,
    },
    {
      id: 'papel-toalha',
      categoryId: 'care',
      group: 'Higiene e pessoal',
      label: 'Papel toalha',
      note: 'Cozinha e rotina com crianças',
      unit: 'rolos',
      monthlyUsage: 8,
      minimumStock: 4,
      idealStock: 8,
      shelfLife: 'Indefinido',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 20,
    },
    {
      id: 'guardanapo',
      categoryId: 'care',
      group: 'Higiene e pessoal',
      label: 'Guardanapos',
      note: 'Complemento de uso diário',
      unit: 'pacotes',
      monthlyUsage: 6,
      minimumStock: 3,
      idealStock: 6,
      shelfLife: 'Indefinido',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 12,
    },
    {
      id: 'sabonete',
      categoryId: 'care',
      group: 'Higiene e pessoal',
      label: 'Sabonetes',
      note: '6 de barra + 2 potes líquido para criança',
      unit: 'unid',
      monthlyUsage: 8,
      minimumStock: 4,
      idealStock: 8,
      shelfLife: '24 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 26,
    },
    {
      id: 'pasta-dente',
      categoryId: 'care',
      group: 'Higiene e pessoal',
      label: 'Pasta de dente',
      note: '2 adultos + 3-4 para as crianças',
      unit: 'tubos',
      monthlyUsage: 6,
      minimumStock: 3,
      idealStock: 6,
      shelfLife: '12 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 24,
    },
    {
      id: 'shampoo',
      categoryId: 'care',
      group: 'Higiene e pessoal',
      label: 'Shampoo',
      note: 'Adulto e infantil',
      unit: 'frascos',
      monthlyUsage: 4,
      minimumStock: 2,
      idealStock: 4,
      shelfLife: '12 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 18,
    },
    {
      id: 'condicionador',
      categoryId: 'care',
      group: 'Higiene e pessoal',
      label: 'Condicionador',
      note: 'Adulto e infantil',
      unit: 'frascos',
      monthlyUsage: 4,
      minimumStock: 2,
      idealStock: 4,
      shelfLife: '12 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 16,
    },
    {
      id: 'fio-dental',
      categoryId: 'care',
      group: 'Higiene e pessoal',
      label: 'Fio dental',
      note: 'Adulto e infantil',
      unit: 'unid',
      monthlyUsage: 2,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '24 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 30,
    },
    {
      id: 'desodorante',
      categoryId: 'care',
      group: 'Higiene e pessoal',
      label: 'Desodorante',
      note: 'Adultos',
      unit: 'unid',
      monthlyUsage: 2,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '24 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 35,
    },
    {
      id: 'sabao-liquido',
      categoryId: 'care',
      group: 'Limpeza e infraestrutura',
      label: 'Sabão líquido / pó',
      note: 'Lavanderia e limpeza geral',
      unit: 'kg',
      monthlyUsage: 8,
      minimumStock: 4,
      idealStock: 8,
      shelfLife: '12 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 40,
    },
    {
      id: 'agua-sanitaria',
      categoryId: 'care',
      group: 'Limpeza e infraestrutura',
      label: 'Água sanitária',
      note: 'Base de limpeza pesada',
      unit: 'L',
      monthlyUsage: 5,
      minimumStock: 2,
      idealStock: 5,
      shelfLife: '6 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 34,
    },
    {
      id: 'alcool-70',
      categoryId: 'care',
      group: 'Limpeza e infraestrutura',
      label: 'Álcool 70%',
      note: 'Limpeza e higienização',
      unit: 'L',
      monthlyUsage: 5,
      minimumStock: 2,
      idealStock: 5,
      shelfLife: '24 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 44,
    },
    {
      id: 'detergente',
      categoryId: 'care',
      group: 'Limpeza e infraestrutura',
      label: 'Detergente',
      note: 'Pia e limpeza de cozinha',
      unit: 'frascos',
      monthlyUsage: 6,
      minimumStock: 3,
      idealStock: 6,
      shelfLife: '24 meses',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 24,
    },
    {
      id: 'sacos-lixo',
      categoryId: 'care',
      group: 'Limpeza e infraestrutura',
      label: 'Sacos de lixo',
      note: 'Mix 100L, 60L e 15L',
      unit: 'rolos',
      monthlyUsage: 8,
      minimumStock: 4,
      idealStock: 8,
      shelfLife: 'Indefinido',
      purchaseCycle: 'atacado-mensal',
      stockMode: 'recurring',
      priority: 18,
    },
    {
      id: 'paracetamol',
      categoryId: 'care',
      group: 'Contingência rural',
      label: 'Paracetamol 750mg',
      note: 'Reserva de segurança',
      unit: 'caixas',
      monthlyUsage: 0,
      minimumStock: 1,
      idealStock: 2,
      shelfLife: '24 meses',
      purchaseCycle: 'contingencia-rural',
      stockMode: 'contingency',
      priority: 68,
      highlight: true,
    },
    {
      id: 'soro-fisiologico',
      categoryId: 'care',
      group: 'Contingência rural',
      label: 'Soro fisiológico 0,9%',
      note: 'Olhos, nariz e apoio de cuidado infantil',
      unit: 'frascos',
      monthlyUsage: 0,
      minimumStock: 2,
      idealStock: 4,
      shelfLife: '24 meses',
      purchaseCycle: 'contingencia-rural',
      stockMode: 'contingency',
      priority: 38,
    },
    {
      id: 'termometro',
      categoryId: 'care',
      group: 'Contingência rural',
      label: 'Termômetro digital',
      note: 'Infraestrutura mínima de monitoramento',
      unit: 'unid',
      monthlyUsage: 0,
      minimumStock: 1,
      idealStock: 1,
      shelfLife: 'Permanente',
      purchaseCycle: 'contingencia-rural',
      stockMode: 'contingency',
      priority: 46,
    },
  ];

  function deriveTags(item) {
    const tags = [];

    if (item.categoryId === 'pantry') {
      tags.push('SG/SL');
    }

    if (item.categoryId === 'proteins') {
      tags.push('Freezer');
    }

    if (item.categoryId === 'feira') {
      tags.push('Feira');
    }

    if (item.stockMode === 'contingency') {
      tags.push('Contingência');
    }

    if (item.highlight) {
      tags.push('Núcleo');
    }

    if (!tags.length) {
      tags.push('Casa');
    }

    return tags.slice(0, 3);
  }

  const inventoryItems = rawInventoryItems.map(item => ({
    ...item,
    tags: item.tags || deriveTags(item),
  }));

  function normalizeNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value.replace(',', '.'));
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  }

  function roundToStep(value, step) {
    if (!step || step <= 0) {
      return value;
    }

    return Math.ceil(value / step) * step;
  }

  function getInputStep(item) {
    if (typeof item.step === 'number') {
      return item.step;
    }

    if (['kg', 'L', 'maços'].includes(item.unit)) {
      return 0.5;
    }

    return 1;
  }

  function formatNumber(value) {
    if (Number.isInteger(value)) {
      return String(value);
    }

    return value.toFixed(1).replace('.', ',');
  }

  function formatQuantity(value, unit) {
    return formatNumber(value) + ' ' + unit;
  }

  function getItemById(itemId) {
    return inventoryItems.find(item => item.id === itemId);
  }

  function getItemsByCategory(categoryId) {
    return inventoryItems.filter(item => item.categoryId === categoryId);
  }

  function computeStatus(current, minimum, ideal) {
    if (current >= ideal) {
      return 'ok';
    }

    if (current >= minimum) {
      return 'warn';
    }

    return 'alert';
  }

  function computeStockSnapshot(item, rawCurrent) {
    const current = normalizeNumber(rawCurrent);
    const status = computeStatus(current, item.minimumStock, item.idealStock);
    const targetToBuy = roundToStep(Math.max(item.idealStock - current, 0), getInputStep(item));
    const meta = statusMeta[status];

    let days = null;
    let coverage = 'Reserva manual';

    if (item.stockMode === 'recurring' && item.monthlyUsage > 0) {
      days = Math.round((current / item.monthlyUsage) * 30);
      coverage = current > 0 ? `${days}d` : '0d';
    } else {
      coverage = `${formatQuantity(current, item.unit)} em casa`;
    }

    return {
      ...item,
      current,
      days,
      coverage,
      targetToBuy,
      status,
      statusLabel: `${meta.icon} ${meta.label}`,
      statusClassName: meta.className,
      statusRank: meta.rank,
      purchaseCycleLabel: purchaseCycleLabels[item.purchaseCycle] || item.purchaseCycle,
      stockTargetLabel: `${formatQuantity(item.minimumStock, item.unit)} min · ${formatQuantity(item.idealStock, item.unit)} ideal`,
      targetToBuyLabel: targetToBuy > 0 ? formatQuantity(targetToBuy, item.unit) : null,
    };
  }

  function buildShoppingList(stockById) {
    return inventoryItems
      .map(item => computeStockSnapshot(item, stockById[item.id] || 0))
      .filter(item => item.status !== 'ok' && item.targetToBuy > 0)
      .sort((left, right) => {
        if (left.statusRank !== right.statusRank) {
          return left.statusRank - right.statusRank;
        }

        if (left.priority !== right.priority) {
          return right.priority - left.priority;
        }

        return left.label.localeCompare(right.label, 'pt-BR');
      });
  }

  function groupShoppingList(stockById) {
    const cycleRank = {
      'feira-semanal': 0,
      'contingencia-rural': 1,
      'atacado-mensal': 2,
    };

    const groups = buildShoppingList(stockById).reduce((accumulator, item) => {
      if (!accumulator[item.purchaseCycle]) {
        accumulator[item.purchaseCycle] = {
          cycle: item.purchaseCycle,
          label: item.purchaseCycleLabel,
          items: [],
        };
      }

      accumulator[item.purchaseCycle].items.push(item);
      return accumulator;
    }, {});

    return Object.values(groups).sort((left, right) => {
      return (cycleRank[left.cycle] ?? 99) - (cycleRank[right.cycle] ?? 99);
    });
  }

  function summarizeCategory(categoryId, stockById) {
    const snapshots = getItemsByCategory(categoryId).map(item => computeStockSnapshot(item, stockById[item.id] || 0));

    return {
      total: snapshots.length,
      ok: snapshots.filter(item => item.status === 'ok').length,
      warn: snapshots.filter(item => item.status === 'warn').length,
      alert: snapshots.filter(item => item.status === 'alert').length,
      toBuy: snapshots.reduce((total, item) => total + item.targetToBuy, 0),
    };
  }

  return {
    appProfile,
    sections,
    protocolCards,
    inventoryItems,
    purchaseCycleLabels,
    statusMeta,
    formatQuantity,
    getInputStep,
    getItemById,
    getItemsByCategory,
    computeStockSnapshot,
    buildShoppingList,
    groupShoppingList,
    summarizeCategory,
  };
});
