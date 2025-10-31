/*
 Lê um arquivo .txt exportado do PDF e converte em JSON de matérias.
 Espera títulos no formato: "Unidades curriculares do 1 período" (ou 2, 3, ...)
 e, nas linhas seguintes, os nomes das disciplinas até o próximo título.
*/

const fs = require('fs');
const path = require('path');

function normalize(str) {
  return (str || '')
    .replace(/\u00A0/g, ' ')
    .replace(/[\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function isIgnorable(line) {
  const l = line.toLowerCase();
  if (!l) return true;
  const headerTokens = [
    'código', 'codigo', 'unidade curricular', 'unidades curriculares',
    'componente curricular', 'componentes curriculares', 'carga horária', 'carga horaria',
    'ch', 'créditos', 'creditos', 'ementa', 'pré-requisito', 'pre-requisito', 'pré requisito', 'pre requisito',
    'total', 'teórica', 'prática', 'teorica', 'pratica', 'presencial', 'assíncrona', 'assincrona',
    'área do', 'area do', 'conhecimento', 'primeiro período', 'segundo período', 'terceiro período',
    'quarto período', 'quinto período', 'sexto período', 'sétimo período', 'oitavo período', 'nono período'
  ];
  if (headerTokens.some(t => l.includes(t))) return true;
  // Ignorar códigos de disciplinas (padrão: X.XX.XX.XX-X)
  if (/^\d\.\d{2}\.\d{2}\.\d{2}-\d+$/.test(line)) return true;
  if (/^[0-9\s\-–—\/()]+$/.test(line)) return true;
  if (line.length <= 2) return true;
  return false;
}

function parseTxt(content) {
  const lines = content.split(/\r?\n/).map(normalize);
  // Padrões de cabeçalho de período
  const headingRe = /(?:^|-)\s*unidades\s+curriculares\s+do\s+(\d+)[ºo]?\s*p[eé]r[ií]odo\.?/i;
  const quadroHeadingRe = /^quadro\s*\d+\s*-?\s*unidades\s+curriculares\s+do\s+(\d+)[ºo]?\s*p[eé]r[ií]odo\.?/i;
  const anyQuadroRe = /^quadro\s*\d+\s*-/i;
  const wordPeriodRe = /^(primeiro|segundo|terceiro|quarto|quinto|sexto|s[eé]timo|oitavo|nono|d[eé]cimo)\s+p[eé]r[ií]odo/i;
  const wordToNum = {
    'primeiro': 1,
    'segundo': 2,
    'terceiro': 3,
    'quarto': 4,
    'quinto': 5,
    'sexto': 6,
    'sétimo': 7,
    'setimo': 7,
    'oitavo': 8,
    'nono': 9,
    'décimo': 10,
    'decimo': 10
  };
  let currentPeriod = null;
  let capturing = false;
  const out = [];
  for (const line of lines) {
    if (!line) continue;
    let h = line.match(quadroHeadingRe) || line.match(headingRe);
    if (h) {
      const pnum = parseInt(h[1], 10);
      currentPeriod = (pnum >= 1 && pnum <= 9) ? pnum : null;
      capturing = true;
      continue;
    }
    const hw = line.match(wordPeriodRe);
    if (hw) {
      const key = hw[1].normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      // Só atualiza o período se já estamos capturando um quadro corrente
      if (capturing) {
        const pnum = wordToNum[key];
        if (pnum >= 1 && pnum <= 9) currentPeriod = pnum;
      }
      continue;
    }
    if (currentPeriod == null || !capturing) continue;
    if (isIgnorable(line)) {
      // even if ignorable, still check for hard stop conditions
      if (/^carga\s+hor[aá]ria\s+total\s+do\s+p[eé]r[ií]odo/i.test(line)) { capturing = false; }
      if (/^fonte[:]/i.test(line)) { capturing = false; }
      if (anyQuadroRe.test(line)) { capturing = false; currentPeriod = null; }
      continue;
    }
    // Extrair várias disciplinas na mesma linha
    // Estratégia: encontrar blocos de 4 números consecutivos e pegar o texto antes de cada bloco
    const fourNumPattern = /\s+\d{1,3}\s+\d{1,3}\s+\d{1,3}\s+\d{1,3}(?:\s+\d\.\d{2}\.\d{2}\.\d{2}-\d+)?/g;
    const matches = [...line.matchAll(fourNumPattern)];
    
    if (matches.length > 0) {
      let lastIndex = 0;
      const seenInLine = new Set();
      
      for (const match of matches) {
        const matchStart = match.index;
        const beforeMatch = line.substring(lastIndex, matchStart).trim();
        
        if (beforeMatch) {
          let candidate = normalize(beforeMatch);
          
          // Limpar números soltos no início (ex: "60 Álgebra Linear")
          candidate = candidate.replace(/^(\d{1,3}\s+)+/, '').trim();
          
          // Ignorar se muito curto ou for código
          if (candidate.length >= 3 && !isIgnorable(candidate) && !/^\d\.\d{2}\.\d{2}\.\d{2}-\d+$/.test(candidate)) {
            const key = `${currentPeriod}:${candidate}`;
            if (!seenInLine.has(key)) {
              seenInLine.add(key);
              out.push({ nome: candidate, periodo: currentPeriod });
            }
          }
        }
        
        lastIndex = match.index + match[0].length;
      }
      
      // After extracting, check stop boundaries
      if (/carga\s+hor[aá]ria\s+total\s+do\s+p[eé]r[ií]odo/i.test(line)) { capturing = false; }
      if (/^fonte[:]/i.test(line)) { capturing = false; }
      if (anyQuadroRe.test(line)) { capturing = false; currentPeriod = null; }
      continue;
    }
    if (matched) {
      // After extracting from this line, check if it's also a stop boundary
      if (/carga\s+hor[aá]ria\s+total\s+do\s+p[eé]r[ií]odo/i.test(line)) { capturing = false; }
      if (/^fonte[:]/i.test(line)) { capturing = false; }
      if (anyQuadroRe.test(line)) { capturing = false; currentPeriod = null; }
      continue;
    }
    // Fallback: tentar extrair o nome antes do primeiro número
    const name = normalize(line.split(/\s\d{1,3}(?:\s|$)/)[0]) || line;
    if (!name || isIgnorable(name)) continue;
    
    // Verificar se não é um código antes de adicionar
    if (/^\d\.\d{2}\.\d{2}\.\d{2}-\d+$/.test(name)) continue;
    
    const key = `${currentPeriod}:${name}`;
    if (!seenInLine.has(key)) {
      seenInLine.add(key);
      out.push({ nome: name, periodo: currentPeriod });
    }
    
    // stop checks after fallback extraction
    if (/carga\s+hor[aá]ria\s+total\s+do\s+p[eé]r[ií]odo/i.test(line)) { capturing = false; }
    if (/^fonte[:]/i.test(line)) { capturing = false; }
    if (anyQuadroRe.test(line)) { capturing = false; currentPeriod = null; }
  }
  
  // Remover duplicatas finais
  const uniqueMap = new Map();
  for (const item of out) {
    const key = `${item.periodo}:${item.nome}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }
  return Array.from(uniqueMap.values());
}

async function main() {
  const inputPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.resolve(process.cwd(), 'ppc_texto.txt');

  if (!fs.existsSync(inputPath)) {
    console.error(`Arquivo TXT não encontrado: ${inputPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(inputPath, 'utf8');
  const data = parseTxt(content);

  const outputDir = path.resolve(process.cwd(), 'src', 'data');
  const outputFile = path.join(outputDir, 'materias.json');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');

  const perCount = data.reduce((acc, r) => {
    acc[r.periodo] = (acc[r.periodo] || 0) + 1;
    return acc;
  }, {});
  console.log('Gerado src/data/materias.json');
  console.log('Resumo por período:', perCount, `total=${data.length}`);
}

main().catch(err => {
  console.error('Falha ao processar TXT:', err);
  process.exit(1);
});


