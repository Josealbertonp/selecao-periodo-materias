import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReactFlow, Background, Controls, ReactFlowProvider, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import materiasData from "./data/materias.json";

const PERIODOS = [
  { id: "1", label: "1º Período" },
  { id: "2", label: "2º Período" },
  { id: "3", label: "3º Período" },
  { id: "4", label: "4º Período" },
  { id: "5", label: "5º Período" },
  { id: "6", label: "6º Período" },
  { id: "7", label: "7º Período" },
  { id: "8", label: "8º Período" },
  { id: "9", label: "9º Período" },
];

// Função para obter cor da trilha
function getTrilhaColor(trilha) {
  const cores = {
    'Matemática e Física': 'bg-blue-100 text-blue-700 border-blue-300',
    'Computação': 'bg-orange-100 text-orange-700 border-orange-300',
    'Eletrônica': 'bg-green-100 text-green-700 border-green-300',
    'Industrial': 'bg-red-100 text-red-700 border-red-300',
    'Biomédica': 'bg-purple-100 text-purple-700 border-purple-300',
    'Interdisciplinar': 'bg-gray-100 text-gray-700 border-gray-300',
    'Trilha de Aprofundamento': 'bg-purple-100 text-purple-700 border-purple-300'
  };
  return cores[trilha] || 'bg-gray-100 text-gray-700 border-gray-300';
}

// Função para obter cor da borda lateral
function getTrilhaBorderColor(trilha) {
  const cores = {
    'Matemática e Física': 'border-l-blue-500',
    'Computação': 'border-l-orange-500',
    'Eletrônica': 'border-l-green-500',
    'Industrial': 'border-l-red-500',
    'Biomédica': 'border-l-purple-500',
    'Interdisciplinar': 'border-l-gray-500',
    'Trilha de Aprofundamento': 'border-l-purple-500'
  };
  return cores[trilha] || 'border-l-gray-300';
}

// Função para obter cor hexadecimal da trilha (para SVG)
function getTrilhaColorHex(trilha) {
  const cores = {
    'Matemática e Física': '#3b82f6',
    'Computação': '#f97316',
    'Eletrônica': '#22c55e',
    'Industrial': '#ef4444',
    'Biomédica': '#a855f7',
    'Interdisciplinar': '#6b7280',
    'Trilha de Aprofundamento': '#a855f7'
  };
  return cores[trilha] || '#6b7280';
}

// Converter dados do JSON para o formato esperado pelo app
function processarMaterias() {
  const materiasPorPeriodo = {};
  const todasMaterias = {}; // Mapa para buscar por nome
  const codigosUsados = new Set(); // Para garantir códigos únicos
  
  materiasData.forEach(materia => {
    const periodoKey = String(materia.periodo);
    if (!materiasPorPeriodo[periodoKey]) {
      materiasPorPeriodo[periodoKey] = [];
    }
    
    // Gerar código baseado no nome (primeiras letras)
    const palavras = materia.nome.split(' ').filter(p => p.length > 0);
    let codigoBase = palavras
      .slice(0, 3)
      .map(palavra => {
        // Pega primeira letra, lidando com acentos
        const primeiraLetra = palavra
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')[0]
          ?.toUpperCase() || '';
        return primeiraLetra;
      })
      .filter(l => l.match(/[A-Z]/))
      .join('');
    
    // Adicionar período
    let codigo = codigoBase + materia.periodo.toString().padStart(2, '0');
    
    // Se o código já existe, adicionar sufixo numérico
    let contador = 1;
    const codigoOriginal = codigo;
    while (codigosUsados.has(codigo)) {
      codigo = codigoOriginal + String.fromCharCode(64 + contador); // A, B, C...
      contador++;
      if (contador > 26) {
        // Se exceder Z, usar números
        codigo = codigoOriginal + contador;
      }
    }
    
    codigosUsados.add(codigo);
    
    const materiaProcessada = {
      codigo: codigo,
      nome: materia.nome,
      periodo: materia.periodo,
      descricao: materia.ementa ? materia.ementa.substring(0, 100) + '...' : `Disciplina do ${materia.periodo}º período.`,
      descricaoDetalhada: materia.ementa || `Esta disciplina faz parte do ${materia.periodo}º período do curso de Engenharia Eletrônica.`,
      carga: "—",
      prereq: materia.preRequisito ? [materia.preRequisito] : [],
      professor: "—",
      horario: "—",
      sala: "—",
      ementa: materia.ementa || null,
      preRequisito: materia.preRequisito || null,
      prepara: materia.prepara || [],
      requer: materia.requer || [],
      trilha: materia.trilha || null
    };
    
    materiasPorPeriodo[periodoKey].push(materiaProcessada);
    todasMaterias[materia.nome] = materiaProcessada;
  });
  
  // Atualizar prereq com códigos
  Object.values(materiasPorPeriodo).flat().forEach(m => {
    if (m.preRequisito) {
      const preReqMateria = todasMaterias[m.preRequisito];
      if (preReqMateria) {
        m.prereq = [preReqMateria.codigo];
      }
    }
  });
  
  return { materiasPorPeriodo, todasMaterias };
}

const { materiasPorPeriodo: MATERIAS_POR_PERIODO, todasMaterias: TODAS_MATERIAS } = processarMaterias();

export default function SelecaoPeriodoMaterias() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("1"); // inicia no 1º período
  const [materiasConcluidas, setMateriasConcluidas] = useState([]);
  const [possiveisMaterias, setPossiveisMaterias] = useState([]);
  const [query, setQuery] = useState("");
  const [materiaDetalhada, setMateriaDetalhada] = useState(null);
  const [mostrarFluxograma, setMostrarFluxograma] = useState(false);
  const [trilhaFiltroFluxograma, setTrilhaFiltroFluxograma] = useState(null);

  // mostrar apenas as matérias do período selecionado
  const materias = MATERIAS_POR_PERIODO[periodoSelecionado] || [];

  // Callback estável para abrir detalhes da matéria no fluxograma
  const handleMateriaClick = useCallback((materia) => {
    setMateriaDetalhada(materia);
  }, []);

  function toggleConcluida(codigo) {
    setMateriasConcluidas((prev) =>
      prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]
    );
  }

  function abrirDetalhes(materia) {
    setMateriaDetalhada(materia);
  }

  function fecharDetalhes() {
    setMateriaDetalhada(null);
  }

  function calcularPossiveisMaterias() {
    if (!periodoSelecionado) return;

    const idx = PERIODOS.findIndex((p) => p.id === periodoSelecionado);
    const periodosConsiderados = PERIODOS.slice(idx, idx + 3).map((p) => p.id);

    let candidatas = [];
    periodosConsiderados.forEach((pid) => {
      const list = MATERIAS_POR_PERIODO[pid] || [];
      const periodoInfo = PERIODOS.find((p) => p.id === pid);
      list.forEach((m) => {
        const ok = m.prereq.every((pre) => materiasConcluidas.includes(pre));
        if (ok && !materiasConcluidas.includes(m.codigo)) {
          candidatas.push({
            ...m,
            semestre: periodoInfo ? periodoInfo.label : pid
          });
        }
      });
    });

    setPossiveisMaterias(candidatas);
  }

  const materiasFiltradas = materias.filter((m) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      m.nome.toLowerCase().includes(q) ||
      m.codigo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-3 sm:p-4 lg:p-6">
        <header className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">Selecione o período</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Escolha o semestre para ver e marcar as matérias que você já fez.</p>
            </div>
            <button
              onClick={() => setMostrarFluxograma(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm shadow-lg transition-colors"
            >
              📊 Ver Fluxograma
            </button>
          </div>
        </header>

        <section className="mb-4 sm:mb-6">
          <div className="space-y-4">
            {/* Botões de período */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {PERIODOS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriodoSelecionado(p.id)}
                  className={`px-3 sm:px-4 py-2 rounded-full border transition-shadow font-medium text-xs sm:text-sm focus:outline-none
                    ${p.id === periodoSelecionado ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-gray-700 border-gray-200"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Barra de pesquisa */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Pesquisar matérias..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">Período selecionado: <span className="font-medium text-gray-700">{PERIODOSText(periodoSelecionado)}</span></p>
        </section>

        <main className="space-y-6 sm:space-y-8">
          {/* Legenda das Trilhas */}
          <section className="bg-gray-50 rounded-lg p-3 sm:p-4 border">
            <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Legenda das Trilhas</h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTrilhaColor('Matemática e Física')}`}>
                🔵 Matemática e Física
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTrilhaColor('Computação')}`}>
                🟠 Computação
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTrilhaColor('Eletrônica')}`}>
                🟢 Eletrônica
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTrilhaColor('Industrial')}`}>
                🔴 Industrial
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTrilhaColor('Biomédica')}`}>
                🟣 Biomédica
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTrilhaColor('Interdisciplinar')}`}>
                ⚪ Interdisciplinar
              </span>
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Matérias do período selecionado</h2>

            <AnimatePresence>
              {materiasFiltradas.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 sm:p-6 border border-dashed rounded-lg text-center text-gray-400"
                >
                  <p className="text-sm">Nenhuma matéria carregada.</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {materiasFiltradas.map((m) => (
                    <motion.article
                      key={m.codigo}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className={`bg-white border-l-4 rounded-xl p-3 sm:p-4 shadow-sm ${m.trilha ? getTrilhaBorderColor(m.trilha) : 'border-l-gray-300'} ${materiasConcluidas.includes(m.codigo) ? "ring-2 ring-green-400" : ""}`}
                    >
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-sm sm:text-base font-semibold flex-1">{m.nome}</h3>
                            {m.trilha && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${getTrilhaColor(m.trilha)}`}>
                                {m.trilha}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{m.codigo} • {m.carga}</div>
                          <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3">{m.descricao}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button 
                            onClick={() => abrirDetalhes(m)}
                            className="flex-1 px-3 py-2 text-xs sm:text-sm border rounded-md hover:bg-gray-50 text-center"
                          >
                            Ver detalhes
                          </button>
                          <button
                            onClick={() => toggleConcluida(m.codigo)}
                            className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-md ${materiasConcluidas.includes(m.codigo) ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}
                          >
                            {materiasConcluidas.includes(m.codigo) ? "Remover" : "Concluído"}
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </section>

          {/* Botão para calcular possíveis matérias */}
          <div className="flex justify-center">
            <button
              onClick={calcularPossiveisMaterias}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Calcular possíveis matérias
            </button>
          </div>

          <section>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Matérias possíveis (até dois semestres à frente)</h2>
            {possiveisMaterias.length === 0 ? (
              <div className="p-4 sm:p-6 border border-dashed rounded-lg text-center text-gray-400">
                <p className="text-sm">Nenhuma matéria calculada ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {possiveisMaterias.map((m) => (
                  <div key={m.codigo} className="bg-indigo-50 border rounded-xl p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-semibold flex-1">{m.nome}</h3>
                      <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                        {m.semestre}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{m.codigo} • {m.carga}</div>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2">{m.descricao}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer className="mt-4 sm:mt-6 text-center sm:text-right text-xs sm:text-sm text-gray-500">Sistema de cálculo de disciplinas possíveis — versão web</footer>
      </div>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {materiaDetalhada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={fecharDetalhes}
            style={{ zIndex: 9999 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
              style={{ zIndex: 10000 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-2">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{materiaDetalhada.nome}</h2>
                  <p className="text-sm sm:text-lg text-gray-600">{materiaDetalhada.codigo} • {materiaDetalhada.carga}</p>
                </div>
                <button
                  onClick={fecharDetalhes}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold flex-shrink-0"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Ementa */}
                {materiaDetalhada.ementa && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Ementa</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{materiaDetalhada.ementa}</p>
                  </div>
                )}

                {/* Trilha */}
                {materiaDetalhada.trilha && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Trilha Principal</h3>
                    <div className={`inline-block px-4 py-2 rounded-lg text-sm font-medium border ${getTrilhaColor(materiaDetalhada.trilha)}`}>
                      {materiaDetalhada.trilha}
                    </div>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600">
                      {materiaDetalhada.trilha === 'Matemática e Física' && 'Base matemática e física que sustenta todas as disciplinas técnicas.'}
                      {materiaDetalhada.trilha === 'Computação' && 'Desenvolvimento de lógica, algoritmos e programação aplicada ao hardware.'}
                      {materiaDetalhada.trilha === 'Eletrônica' && 'Base da engenharia eletrônica, desde circuitos básicos até sistemas avançados.'}
                      {materiaDetalhada.trilha === 'Industrial' && 'Foco em sistemas de controle, automação e eficiência energética.'}
                      {materiaDetalhada.trilha === 'Biomédica' && 'Aplicação da eletrônica na área da saúde e instrumentação médica.'}
                      {materiaDetalhada.trilha === 'Interdisciplinar' && 'Integração de conhecimentos técnicos e habilidades transversais.'}
                    </p>
                  </div>
                )}

                {/* Pré-requisitos */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Pré-requisitos</h3>
                  {materiaDetalhada.preRequisito ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{materiaDetalhada.preRequisito}</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Obrigatório</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Nenhum pré-requisito obrigatório</p>
                  )}
                </div>

                {/* Relacionamentos: Esta matéria prepara */}
                {materiaDetalhada.prepara && materiaDetalhada.prepara.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Esta disciplina prepara para</h3>
                    <div className="flex flex-wrap gap-2">
                      {materiaDetalhada.prepara.map((nome, idx) => {
                        const materiaRelacionada = Object.values(TODAS_MATERIAS).find(m => m.nome === nome);
                        return (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm"
                          >
                            {nome}
                            {materiaRelacionada && ` (${materiaRelacionada.periodo}º período)`}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Relacionamentos: Esta matéria requer (recomendado) */}
                {materiaDetalhada.requer && materiaDetalhada.requer.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Conhecimentos recomendados</h3>
                    <p className="text-xs text-gray-500 mb-2">Não são pré-requisitos obrigatórios, mas é recomendado ter cursado:</p>
                    <div className="flex flex-wrap gap-2">
                      {materiaDetalhada.requer.map((nome, idx) => {
                        const materiaRelacionada = Object.values(TODAS_MATERIAS).find(m => m.nome === nome);
                        return (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm"
                          >
                            {nome}
                            {materiaRelacionada && ` (${materiaRelacionada.periodo}º período)`}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 sm:mt-6 flex justify-end">
                <button
                  onClick={fecharDetalhes}
                  className="px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Fluxograma */}
      <AnimatePresence>
        {mostrarFluxograma && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-2 sm:p-4"
            onClick={() => setMostrarFluxograma(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-4 sm:p-6 max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Fluxograma */}
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Fluxograma do Curso</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {trilhaFiltroFluxograma 
                      ? `Filtrando por: ${trilhaFiltroFluxograma}` 
                      : 'Visualize todas as matérias e suas conexões'}
                  </p>
                </div>
                <button
                  onClick={() => setMostrarFluxograma(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Botões de Filtro de Trilhas */}
              <div className="mb-4 pb-4 border-b">
                <div className="flex gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => setTrilhaFiltroFluxograma(null)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      trilhaFiltroFluxograma === null
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Todas as Trilhas
                  </button>
                  {['Matemática e Física', 'Computação', 'Eletrônica', 'Industrial', 'Biomédica', 'Interdisciplinar'].map((trilha) => (
                    <button
                      key={trilha}
                      onClick={() => setTrilhaFiltroFluxograma(trilha)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap ${getTrilhaColor(trilha)} ${
                        trilhaFiltroFluxograma === trilha
                          ? 'ring-2 ring-offset-2 ring-indigo-500'
                          : ''
                      }`}
                    >
                      {trilha}
                    </button>
                  ))}
                </div>
              </div>

              {/* Área do Fluxograma */}
              <div 
                className="flex-1 overflow-hidden" 
                style={{ width: '100%', height: 'calc(95vh - 200px)', minHeight: '600px' }}
              >
                <FluxogramaView 
                  todasMaterias={TODAS_MATERIAS}
                  trilhaFiltro={trilhaFiltroFluxograma}
                  getTrilhaColor={getTrilhaColor}
                  getTrilhaBorderColor={getTrilhaBorderColor}
                  getTrilhaColorHex={getTrilhaColorHex}
                  onMateriaClick={handleMateriaClick}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente do Fluxograma com React Flow
function FluxogramaView({ todasMaterias, trilhaFiltro, getTrilhaColor, getTrilhaBorderColor, onMateriaClick, getTrilhaColorHex }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
  const [isReady, setIsReady] = useState(false);
  const [materiaSelecionada, setMateriaSelecionada] = useState(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width || 1200;
        const height = rect.height || 600;
        
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
          setIsReady(true);
        }
      }
    };

    // Usar setTimeout para garantir que o DOM está pronto
    const timer = setTimeout(updateDimensions, 0);
    
    // Usar ResizeObserver para detectar mudanças no tamanho
    let resizeObserver;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);
  // Filtrar matérias por trilha
  const materiasFiltradas = useMemo(() => {
    if (!todasMaterias || typeof todasMaterias !== 'object') {
      console.error('FluxogramaView: todasMaterias inválido', todasMaterias);
      return [];
    }
    const todas = Object.values(todasMaterias);
    if (todas.length === 0) {
      console.warn('FluxogramaView: Nenhuma matéria encontrada em todasMaterias');
      return [];
    }
    if (!trilhaFiltro) return todas;
    const filtradas = todas.filter(m => m && m.trilha === trilhaFiltro);
    return filtradas.length > 0 ? filtradas : todas; // Se não encontrar, mostra todas
  }, [todasMaterias, trilhaFiltro]);

  // Agrupar por período para posicionamento
  const materiasPorPeriodo = useMemo(() => {
    const grupos = {};
    materiasFiltradas.forEach(m => {
      if (!grupos[m.periodo]) grupos[m.periodo] = [];
      grupos[m.periodo].push(m);
    });
    return grupos;
  }, [materiasFiltradas]);

  // Encontrar matérias conectadas à selecionada
  const materiasConectadas = useMemo(() => {
    if (!materiaSelecionada) return new Set();
    
    const conectadas = new Set([materiaSelecionada]);
    const materiaSelecionadaObj = materiasFiltradas.find(m => m.codigo === materiaSelecionada);
    
    if (!materiaSelecionadaObj) return conectadas;
    
    // Adicionar matérias que esta prepara
    if (materiaSelecionadaObj.prepara) {
      materiaSelecionadaObj.prepara.forEach(nome => {
        const m = materiasFiltradas.find(mat => mat.nome === nome);
        if (m) conectadas.add(m.codigo);
      });
    }
    
    // Adicionar matérias que esta requer
    if (materiaSelecionadaObj.requer) {
      materiaSelecionadaObj.requer.forEach(nome => {
        const m = materiasFiltradas.find(mat => mat.nome === nome);
        if (m) conectadas.add(m.codigo);
      });
    }
    
    // Adicionar matérias que preparam esta
    materiasFiltradas.forEach(m => {
      if (m.prepara && m.prepara.includes(materiaSelecionadaObj.nome)) {
        conectadas.add(m.codigo);
      }
      if (m.requer && m.requer.includes(materiaSelecionadaObj.nome)) {
        conectadas.add(m.codigo);
      }
    });
    
    return conectadas;
  }, [materiaSelecionada, materiasFiltradas]);

  // Criar nós (nodes) para React Flow
  const nodes = useMemo(() => {
    const periodos = Object.keys(materiasPorPeriodo).map(Number).sort((a, b) => a - b);
    if (periodos.length === 0) {
      console.warn('FluxogramaView: Nenhum período encontrado');
      return [];
    }

    const nodesList = [];
    
    periodos.forEach((periodo, periodoIdx) => {
      const materias = materiasPorPeriodo[periodo];
      if (!materias || materias.length === 0) return;
      
      const xPos = periodoIdx * 350 + 100; // Espaçamento horizontal entre períodos (aumentado de 280 para 350)
      const yInicio = 100; // Posição inicial vertical (aumentada de 50 para 100)
      
      materias.forEach((materia, materiaIdx) => {
        if (!materia || !materia.codigo) {
          console.warn('FluxogramaView: Matéria inválida encontrada:', materia);
          return;
        }
        
        const yPos = yInicio + materiaIdx * 180; // Espaçamento vertical entre matérias (aumentado de 140 para 180)
        const trilhaBorderColor = materia.trilha ? getTrilhaBorderColor(materia.trilha) : 'border-l-gray-300';
        
        const isConectada = materiasConectadas.has(materia.codigo);
        nodesList.push({
          id: materia.codigo,
          type: 'custom',
          position: { x: xPos, y: yPos },
          data: {
            materia,
            trilhaBorderColor,
            getTrilhaColor,
            materiaSelecionada,
            isConectada,
            onSelecionar: (codigo) => setMateriaSelecionada(codigo === materiaSelecionada ? null : codigo),
            onAbrirDetalhes: (e) => {
              e.stopPropagation();
              onMateriaClick(materia);
            }
          }
        });
      });
    });
    
    return nodesList;
  }, [materiasPorPeriodo, getTrilhaColor, getTrilhaBorderColor, materiaSelecionada, materiasConectadas, onMateriaClick]);

  // Criar arestas (edges) - conexões entre matérias
  const edges = useMemo(() => {
    const edgesList = [];
    // Criar um mapa de códigos para verificar se os nós existem
    const codigosExistentes = new Set(nodes.map(n => n.id));
    
    // Destacar arestas conectadas à matéria selecionada
    const isConectadaSelecionada = (source, target) => {
      return materiaSelecionada && 
             (materiasConectadas.has(source) || materiasConectadas.has(target));
    };
    
    materiasFiltradas.forEach((materia) => {
      // Verificar se o nó de origem existe
      if (!codigosExistentes.has(materia.codigo)) {
        return; // Pula se o nó não existe
      }

      // Conexões "prepara"
      if (materia.prepara && materia.prepara.length > 0) {
        materia.prepara.forEach((nomePrepara) => {
          const materiaDestino = materiasFiltradas.find(m => m.nome === nomePrepara);
          if (materiaDestino && materiaDestino.periodo > materia.periodo && codigosExistentes.has(materiaDestino.codigo)) {
            const corSeta = getTrilhaColorHex(materia.trilha);
            const isConectada = isConectadaSelecionada(materia.codigo, materiaDestino.codigo);
            edgesList.push({
              id: `${materia.codigo}-${materiaDestino.codigo}`,
              source: materia.codigo,
              target: materiaDestino.codigo,
              type: 'smoothstep',
              animated: true,
              style: { 
                stroke: corSeta, 
                strokeWidth: isConectada ? 4 : 2,
                opacity: isConectada ? 1 : 0.6
              },
              markerEnd: { type: 'arrowclosed', color: corSeta }
            });
          }
        });
      }
      
      // Conexões "requer" (recomendado - tracejada)
      if (materia.requer && materia.requer.length > 0) {
        materia.requer.forEach((nomeRequer) => {
          const materiaRequerida = materiasFiltradas.find(m => m.nome === nomeRequer);
          if (materiaRequerida && materiaRequerida.periodo < materia.periodo && codigosExistentes.has(materiaRequerida.codigo)) {
            const isConectada = isConectadaSelecionada(materiaRequerida.codigo, materia.codigo);
            edgesList.push({
              id: `${materiaRequerida.codigo}-req-${materia.codigo}`,
              source: materiaRequerida.codigo,
              target: materia.codigo,
              type: 'smoothstep',
              animated: false,
              style: { 
                stroke: '#60a5fa', 
                strokeWidth: isConectada ? 3 : 1.5,
                strokeDasharray: '5,5',
                opacity: isConectada ? 1 : 0.6
              },
              markerEnd: { type: 'arrowclosed', color: '#60a5fa' }
            });
          }
        });
      }
    });
    
    return edgesList;
  }, [materiasFiltradas, getTrilhaColorHex, nodes, materiasConectadas, materiaSelecionada]);

  // Componente de nó customizado
  const nodeTypes = useMemo(() => {
    return {
      custom: CustomNode
    };
  }, []);


  if (!isReady) {
    return (
      <div 
        ref={containerRef} 
        style={{ 
       
          height: '100%', 
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="text-gray-500">Carregando fluxograma...</div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div 
        ref={containerRef}
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '600px'
        }}
      >
        {isReady && (
          <div
            style={{ 
              width: dimensions.width + 'px', 
              height: dimensions.height + 'px',
              minWidth: '800px',
              minHeight: '600px'
            }}
          >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3, minZoom: 0.15, maxZoom: 2.0 }}
        >
          <Background color="#e5e7eb" gap={16} />
          <Controls />
        </ReactFlow>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
}

// Componente de nó customizado para React Flow
const CustomNode = React.memo(({ data, selected }) => {
  if (!data || !data.materia) {
    console.error('CustomNode: data ou materia está undefined', data);
    return null;
  }

  const { materia, trilhaBorderColor, getTrilhaColor, materiaSelecionada, isConectada, onSelecionar, onAbrirDetalhes } = data;
  const isSelecionada = materiaSelecionada === materia.codigo;

  return (
    <div
      onClick={() => onSelecionar(materia.codigo)}
      className={`bg-white border-l-4 rounded-lg shadow-lg p-3 min-w-[200px] max-w-[220px] cursor-pointer hover:shadow-xl transition-all ${trilhaBorderColor} ${
        isSelecionada 
          ? 'ring-4 ring-indigo-500 ring-offset-2 shadow-2xl scale-105' 
          : isConectada 
            ? 'ring-2 ring-yellow-400 shadow-xl' 
            : ''
      } ${selected ? 'ring-2 ring-indigo-300' : ''}`}
      style={{ 
        borderLeftWidth: '4px',
        textDecoration: isSelecionada ? 'underline' : 'none',
        textDecorationColor: isSelecionada ? getTrilhaColor(materia.trilha || 'Interdisciplinar').match(/text-(\w+)-700/)?.[1] ? 
          getTrilhaColor(materia.trilha || 'Interdisciplinar').match(/text-(\w+)-700/)?.[1] === 'blue' ? '#3b82f6' :
          getTrilhaColor(materia.trilha || 'Interdisciplinar').match(/text-(\w+)-700/)?.[1] === 'orange' ? '#f97316' :
          getTrilhaColor(materia.trilha || 'Interdisciplinar').match(/text-(\w+)-700/)?.[1] === 'green' ? '#22c55e' :
          getTrilhaColor(materia.trilha || 'Interdisciplinar').match(/text-(\w+)-700/)?.[1] === 'red' ? '#ef4444' :
          getTrilhaColor(materia.trilha || 'Interdisciplinar').match(/text-(\w+)-700/)?.[1] === 'purple' ? '#a855f7' : '#6b7280'
          : '#6b7280' : 'none',
        textUnderlineOffset: '3px'
      }}
    >
      {/* Handle de entrada (topo) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="font-semibold text-xs mb-1 leading-tight">{materia.nome}</div>
          <div className="text-xs text-gray-500 mb-1">{materia.codigo}</div>
          <div className="text-xs text-gray-400 mb-2">{materia.periodo}º Período</div>
          {materia.trilha && (
            <div className={`mt-1 inline-block px-2 py-0.5 rounded text-xs border ${getTrilhaColor(materia.trilha)}`}>
              {materia.trilha.length > 18 ? materia.trilha.substring(0, 18) + '...' : materia.trilha}
            </div>
          )}
        </div>
        <button
          onClick={onAbrirDetalhes}
          className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded transition-colors whitespace-nowrap"
          title="Ver detalhes"
        >
          📖
        </button>
      </div>
      
      {/* Handle de saída (base) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

function PERIODOSText(id) {
  const p = PERIODOS.find((x) => x.id === id);
  return p ? p.label : "—";
}
