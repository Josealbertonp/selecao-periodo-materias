const fs = require('fs');
const path = require('path');

function extrairInformacoesDetalhadas() {
  const txtPath = path.resolve(process.cwd(), 'pdf_em_txt.txt');
  const materiasPath = path.resolve(process.cwd(), 'src/data/materias.json');
  
  const content = fs.readFileSync(txtPath, 'utf8');
  const materias = JSON.parse(fs.readFileSync(materiasPath, 'utf8'));
  
  const linhas = content.split(/\r?\n/);
  
  // Mapear trilhas
  const trilhas = {
    'Engenharia de Computação': [
      'Sistemas Embarcados 1',
      'Sistemas Reconfiguráveis',
      'Processamento Digital de Sinais 2',
      'Sistemas Embarcados 2'
    ],
    'Engenharia Industrial': [
      'Instrumentação Industrial',
      'Fontes Chaveadas e Inversores',
      'Smart Grids',
      'Sistemas Supervisórios'
    ],
    'Engenharia Biomédica': [
      'Engenharia Clínica',
      'Instrumentação Médica',
      'Imagens Médicas',
      'Tecnologias Assistivas'
    ]
  };
  
  // Encontrar trilha para cada matéria
  function encontrarTrilha(nome) {
    for (const [trilha, disciplinas] of Object.entries(trilhas)) {
      if (disciplinas.includes(nome)) {
        return trilha;
      }
    }
    return null;
  }
  
  // Mapear relacionamentos entre disciplinas
  const relacionamentos = {
    // Sequências de cálculo
    'Pré-Cálculo': { prepara: ['Cálculo Diferencial e Integral 1'] },
    'Cálculo Diferencial e Integral 1': { prepara: ['Cálculo Diferencial e Integral 2'] },
    'Cálculo Diferencial e Integral 2': { prepara: ['Cálculo Diferencial e Integral 3'] },
    
    // Sequências de física
    'Física 1': { prepara: ['Física 2'] },
    'Física 2': { prepara: ['Física 3'] },
    
    // Sequências de circuitos
    'Circuitos Digitais Combinacionais': { prepara: ['Circuitos Digitais Sequenciais'] },
    'Análise de Circuitos Elétricos 1': { prepara: ['Análise de Circuitos Elétricos 2'] },
    'Microcontroladores 1': { prepara: ['Microcontroladores 2'] },
    
    // Circuitos que precisam de cálculo
    'Análise de Circuitos Elétricos 1': { requer: ['Cálculo Diferencial e Integral 1'] },
    'Análise de Circuitos Elétricos 2': { requer: ['Cálculo Diferencial e Integral 2'] },
    'Circuitos Eletrônicos': { requer: ['Cálculo Diferencial e Integral 2'] },
    'Amplificadores': { requer: ['Cálculo Diferencial e Integral 2'] },
    'Filtragem Analógica': { requer: ['Cálculo Diferencial e Integral 2'] },
    'Eletromagnetismo': { requer: ['Cálculo Diferencial e Integral 3'] },
    
    // Física necessária para circuitos
    'Análise de Circuitos Elétricos 1': { requer: ['Física 2'] },
    'Análise de Circuitos Elétricos 2': { requer: ['Física 3'] },
    
    // Programação
    'Introdução a Algoritmos e Programação': { prepara: ['Programação Estruturada'] },
    'Programação Estruturada': { prepara: ['Estrutura de Dados', 'Programação Orientada a Objetos'] },
    'Estrutura de Dados': { prepara: ['Programação Orientada a Objetos'] },
    
    // Dispositivos e circuitos
    'Dispositivos Eletrônicos': { prepara: ['Dispositivos Eletrônicos de Potência', 'Circuitos Eletrônicos'] },
    'Circuitos Eletrônicos': { prepara: ['Amplificadores', 'Filtragem Analógica'] },
    
    // Controle
    'Fundamentos de Controle Clássico': { prepara: ['Técnicas de Controle Digital', 'Controle Inteligente'] },
    
    // Projetos
    'Introdução a Projetos': { prepara: ['Projetos Eletrônicos 1'] },
    'Projetos Eletrônicos 1': { prepara: ['Projetos Eletrônicos 2'] },
    'Projetos Eletrônicos 2': { prepara: ['Projetos Eletrônicos 3'] },
    
    // Processamento de sinais
    'Processamento Digital de Sinais 1': { requer: ['Cálculo Diferencial e Integral 2'] },
  };
  
  // Extrair ementa e informações dos quadros
  function extrairEmenta(nomeDisciplina, linhas) {
    // Buscar padrão mais flexível
    const padrao1 = new RegExp(`Quadro \\d+ - Dados da Disciplina ${nomeDisciplina.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    const padrao2 = new RegExp(`Disciplina:.*${nomeDisciplina.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    
    let indice = linhas.findIndex(linha => padrao1.test(linha));
    if (indice === -1) {
      indice = linhas.findIndex(linha => padrao2.test(linha));
    }
    
    if (indice === -1) return null;
    
    let ementa = '';
    let preRequisito = null;
    let competencia = '';
    
    // Procurar por "Ementa:" nos próximos 100 linhas
    for (let i = indice; i < Math.min(indice + 100, linhas.length); i++) {
      const linha = linhas[i];
      
      // Extrair pré-requisito
      if (/Pré-requisito:/i.test(linha)) {
        const match = linha.match(/Pré-requisito:\s*(.+?)(?:\s*Carga|$)/i);
        if (match) {
          preRequisito = match[1].trim();
          if (/não há|não|^$/i.test(preRequisito)) preRequisito = null;
        }
      }
      
      // Extrair ementa
      if (/^Ementa:/i.test(linha) || linha.includes('Ementa:')) {
        // Pegar tudo até "DADOS PEDAGÓGICOS"
        for (let j = i; j < Math.min(i + 20, linhas.length); j++) {
          if (/^DADOS PEDAGÓGICOS/i.test(linhas[j])) break;
          const linhaEmenta = linhas[j].replace(/^Ementa:\s*/i, '').trim();
          if (linhaEmenta && !linhaEmenta.match(/^[A-Z\s\d\.]+$/) && linhaEmenta.length > 10) {
            ementa += (ementa ? ' ' : '') + linhaEmenta;
          }
        }
        break; // Parar após encontrar a ementa
      }
      
      // Extrair competência
      if (/^Competência:/i.test(linha)) {
        competencia = linha.replace(/^Competência:\s*/i, '').trim();
      }
    }
    
    return {
      ementa: ementa.trim() || null,
      preRequisito: preRequisito,
      competencia: competencia || null
    };
  }
  
  // Processar cada matéria
  const materiasCompletas = materias.map(materia => {
    const info = extrairEmenta(materia.nome, linhas);
    const trilha = encontrarTrilha(materia.nome);
    const rel = relacionamentos[materia.nome] || {};
    
    // Encontrar matérias que esta prepara
    const prepara = rel.prepara || [];
    const requer = rel.requer || [];
    
    // Encontrar matérias que requerem esta
    const requeridaPor = Object.entries(relacionamentos)
      .filter(([nome, rel]) => rel.prepara?.includes(materia.nome) || rel.requer?.includes(materia.nome))
      .map(([nome]) => nome);
    
    return {
      ...materia,
      ementa: info?.ementa || null,
      preRequisito: info?.preRequisito || null,
      competencia: info?.competencia || null,
      trilha: trilha,
      prepara: prepara,
      requer: requer,
      requeridaPor: requeridaPor,
      temasEstudo: info?.temasEstudo || []
    };
  });
  
  // Salvar resultado
  const outputPath = path.resolve(process.cwd(), 'src/data/materias_detalhadas.json');
  fs.writeFileSync(outputPath, JSON.stringify(materiasCompletas, null, 2), 'utf8');
  
  console.log(`✓ Extraídas informações de ${materiasCompletas.length} matérias`);
  console.log(`✓ ${materiasCompletas.filter(m => m.ementa).length} matérias com ementa`);
  console.log(`✓ ${materiasCompletas.filter(m => m.trilha).length} matérias em trilhas`);
  console.log(`✓ Arquivo salvo em: ${outputPath}`);
}

extrairInformacoesDetalhadas();

