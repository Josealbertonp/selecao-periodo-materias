import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PERIODOS = [
  { id: "1s", label: "1º Semestre" },
  { id: "2s", label: "2º Semestre" },
  { id: "3s", label: "3º Semestre" },
  { id: "4s", label: "4º Semestre" },
  { id: "5s", label: "5º Semestre" },
];

// Cada disciplina pode ter pré-requisitos
const MATERIAS_POR_PERIODO = {
  "1s": [
    { 
      codigo: "MAT101", 
      nome: "Cálculo I", 
      descricao: "Limites, derivadas e aplicações básicas.", 
      descricaoDetalhada: "Esta disciplina introduz os conceitos fundamentais do cálculo diferencial e integral. Os tópicos incluem: limites e continuidade, derivadas de funções de uma variável, regras de derivação, aplicações de derivadas (máximos e mínimos, esboço de gráficos), introdução à integração e teorema fundamental do cálculo. A disciplina é essencial para o desenvolvimento do raciocínio matemático e serve como base para disciplinas posteriores de física e engenharia.",
      carga: "64h", 
      prereq: [],
      professor: "Prof. Dr. João Silva",
      horario: "Segunda e Quarta, 14h-16h",
      sala: "A101"
    },
    { 
      codigo: "FIS101", 
      nome: "Física Geral I", 
      descricao: "Cinemática e leis de Newton.", 
      descricaoDetalhada: "Introdução aos conceitos fundamentais da mecânica clássica. Estuda o movimento dos corpos através da cinemática (posição, velocidade, aceleração), dinâmica (leis de Newton, forças, massa), trabalho e energia, momento linear e colisões. Inclui laboratórios práticos para demonstração dos princípios teóricos. A disciplina desenvolve o pensamento científico e a capacidade de resolver problemas físicos complexos.",
      carga: "60h", 
      prereq: [],
      professor: "Prof. Dra. Maria Santos",
      horario: "Terça e Quinta, 8h-10h",
      sala: "L201"
    },
    { 
      codigo: "PROG101", 
      nome: "Introdução à Programação", 
      descricao: "Algoritmos, estruturas de controle.", 
      descricaoDetalhada: "Fundamentos da programação de computadores usando linguagem C. Aborda conceitos de algoritmos, estruturas de dados básicas, estruturas de controle (condicionais e laços), funções, arrays e ponteiros. Desenvolve a lógica de programação através de exercícios práticos e projetos. A disciplina é fundamental para todas as áreas da computação e engenharia.",
      carga: "48h", 
      prereq: [],
      professor: "Prof. Dr. Carlos Oliveira",
      horario: "Sexta, 14h-18h",
      sala: "L301"
    },
  ],
  "2s": [
    { 
      codigo: "MAT102", 
      nome: "Cálculo II", 
      descricao: "Integrais e séries.", 
      descricaoDetalhada: "Continuação do Cálculo I, focando em técnicas de integração, aplicações de integrais (áreas, volumes, comprimento de arco), funções transcendentes, séries infinitas, convergência e divergência, séries de Taylor e Maclaurin. Introduz também equações diferenciais ordinárias de primeira ordem. A disciplina é crucial para o desenvolvimento de modelos matemáticos em engenharia.",
      carga: "64h", 
      prereq: ["MAT101"],
      professor: "Prof. Dr. Ana Costa",
      horario: "Segunda e Quarta, 16h-18h",
      sala: "A102"
    },
    { 
      codigo: "EDA201", 
      nome: "Estruturas de Dados", 
      descricao: "Listas, pilhas, árvores e algoritmos.", 
      descricaoDetalhada: "Estudo das principais estruturas de dados e algoritmos de manipulação. Inclui: listas ligadas, pilhas, filas, árvores binárias, árvores balanceadas (AVL), tabelas hash, grafos e suas representações. Algoritmos de ordenação e busca, análise de complexidade (notação Big O). A disciplina desenvolve habilidades essenciais para programação eficiente e é base para disciplinas avançadas de algoritmos.",
      carga: "60h", 
      prereq: ["PROG101"],
      professor: "Prof. Dr. Roberto Lima",
      horario: "Terça e Quinta, 10h-12h",
      sala: "L302"
    },
  ],
  "3s": [
    { 
      codigo: "FIS201", 
      nome: "Física Geral II", 
      descricao: "Eletromagnetismo e ondas.", 
      descricaoDetalhada: "Continuação da Física Geral I, abordando eletricidade, magnetismo e ondas. Tópicos incluem: campo elétrico e potencial elétrico, capacitores e dielétricos, corrente elétrica e circuitos, campo magnético, indução eletromagnética, equações de Maxwell, ondas eletromagnéticas e óptica. Inclui laboratórios práticos e demonstrações experimentais. A disciplina é fundamental para áreas de eletrônica e telecomunicações.",
      carga: "64h", 
      prereq: ["FIS101", "MAT102"],
      professor: "Prof. Dra. Patricia Alves",
      horario: "Segunda e Quarta, 8h-10h",
      sala: "L203"
    },
    { 
      codigo: "BD301", 
      nome: "Banco de Dados", 
      descricao: "Modelagem relacional e SQL.", 
      descricaoDetalhada: "Fundamentos de sistemas de gerenciamento de banco de dados. Aborda: modelo relacional, álgebra relacional, linguagem SQL (DDL, DML, DCL), normalização, integridade referencial, índices, transações e controle de concorrência. Projetos práticos de modelagem e implementação de bancos de dados. A disciplina é essencial para desenvolvimento de sistemas de informação e aplicações web.",
      carga: "60h", 
      prereq: ["EDA201"],
      professor: "Prof. Dr. Fernando Rocha",
      horario: "Terça e Quinta, 14h-16h",
      sala: "L303"
    },
  ],
  "4s": [
    { 
      codigo: "SO401", 
      nome: "Sistemas Operacionais", 
      descricao: "Gerenciamento de processos e memória.", 
      descricaoDetalhada: "Fundamentos de sistemas operacionais modernos. Aborda: gerenciamento de processos e threads, comunicação entre processos, gerenciamento de memória (paginação, segmentação), sistemas de arquivos, entrada e saída, deadlocks, segurança e proteção. Inclui laboratórios práticos com sistemas Linux/Unix. A disciplina é essencial para compreender o funcionamento interno dos computadores e desenvolver software de sistema.",
      carga: "64h", 
      prereq: ["EDA201"],
      professor: "Prof. Dr. Lucas Ferreira",
      horario: "Segunda e Quarta, 10h-12h",
      sala: "L401"
    },
    { 
      codigo: "RED401", 
      nome: "Redes de Computadores", 
      descricao: "Protocolos e arquitetura de redes.", 
      descricaoDetalhada: "Fundamentos de redes de computadores e internet. Estuda: modelo OSI e TCP/IP, protocolos de camada física, enlace, rede e transporte, roteamento, comutação, redes locais (LAN), redes sem fio, segurança em redes, programação de sockets. Inclui laboratórios práticos de configuração de redes e análise de tráfego. A disciplina é fundamental para áreas de telecomunicações e desenvolvimento web.",
      carga: "60h", 
      prereq: ["BD301"],
      professor: "Prof. Dra. Camila Rodrigues",
      horario: "Terça e Quinta, 16h-18h",
      sala: "L402"
    },
    { 
      codigo: "ENG401", 
      nome: "Engenharia de Software", 
      descricao: "Metodologias e processos de desenvolvimento.", 
      descricaoDetalhada: "Fundamentos da engenharia de software e metodologias de desenvolvimento. Aborda: ciclo de vida de software, modelos de processo (cascata, ágil, DevOps), análise e especificação de requisitos, projeto de software, padrões de projeto, testes de software, manutenção e evolução. Inclui projetos práticos de desenvolvimento em equipe. A disciplina desenvolve habilidades essenciais para desenvolvimento profissional de software.",
      carga: "64h", 
      prereq: ["BD301"],
      professor: "Prof. Dr. Rafael Mendes",
      horario: "Sexta, 8h-12h",
      sala: "L403"
    },
  ],
  "5s": [
    { 
      codigo: "IA501", 
      nome: "Inteligência Artificial", 
      descricao: "Algoritmos e técnicas de IA.", 
      descricaoDetalhada: "Introdução aos conceitos e técnicas de inteligência artificial. Aborda: agentes inteligentes, busca e otimização, algoritmos genéticos, redes neurais, aprendizado de máquina, processamento de linguagem natural, visão computacional, sistemas especialistas. Inclui projetos práticos de implementação de algoritmos de IA. A disciplina é fundamental para áreas emergentes de tecnologia e automação.",
      carga: "64h", 
      prereq: ["SO401"],
      professor: "Prof. Dr. André Santos",
      horario: "Segunda e Quarta, 14h-16h",
      sala: "L501"
    },
    { 
      codigo: "SEG501", 
      nome: "Segurança da Informação", 
      descricao: "Criptografia e proteção de dados.", 
      descricaoDetalhada: "Fundamentos de segurança da informação e cibersegurança. Estuda: criptografia simétrica e assimétrica, funções hash, certificados digitais, protocolos de segurança (SSL/TLS, IPSec), autenticação e autorização, vulnerabilidades e ataques, firewalls e IDS, análise forense. Inclui laboratórios práticos de implementação de soluções de segurança. A disciplina é essencial para proteção de sistemas e dados corporativos.",
      carga: "60h", 
      prereq: ["RED401"],
      professor: "Prof. Dra. Juliana Costa",
      horario: "Terça e Quinta, 8h-10h",
      sala: "L502"
    },
    { 
      codigo: "PROJ501", 
      nome: "Projeto Integrador", 
      descricao: "Projeto prático multidisciplinar.", 
      descricaoDetalhada: "Projeto integrador que aplica conhecimentos adquiridos ao longo do curso. Desenvolvimento de um sistema completo utilizando metodologias ágeis, desde a concepção até a implementação e deploy. Inclui: análise de requisitos, arquitetura de software, desenvolvimento full-stack, testes automatizados, documentação técnica e apresentação final. A disciplina consolida o aprendizado e prepara para o mercado de trabalho.",
      carga: "80h", 
      prereq: ["ENG401", "IA501"],
      professor: "Prof. Dr. Marcelo Silva",
      horario: "Sexta, 14h-18h",
      sala: "L503"
    },
  ],
};

export default function SelecaoPeriodoMaterias() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("1s"); // inicia no 1º semestre
  const [materiasConcluidas, setMateriasConcluidas] = useState([]);
  const [possiveisMaterias, setPossiveisMaterias] = useState([]);
  const [query, setQuery] = useState("");
  const [materiaDetalhada, setMateriaDetalhada] = useState(null);

  // mostrar apenas as matérias do período selecionado
  const materias = MATERIAS_POR_PERIODO[periodoSelecionado] || [];

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
      m.codigo.toLowerCase().includes(q) ||
      m.descricao.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-3 sm:p-4 lg:p-6">
        <header className="mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Selecione o período</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Escolha o semestre para ver e marcar as matérias que você já fez.</p>
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
                      className={`bg-white border rounded-xl p-3 sm:p-4 shadow-sm ${materiasConcluidas.includes(m.codigo) ? "ring-2 ring-green-400" : ""}`}
                    >
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold">{m.nome}</h3>
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
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
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
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Descrição</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{materiaDetalhada.descricaoDetalhada}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">Professor</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{materiaDetalhada.professor}</p>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">Horário</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{materiaDetalhada.horario}</p>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">Sala</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{materiaDetalhada.sala}</p>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">Pré-requisitos</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {materiaDetalhada.prereq.length > 0 
                        ? materiaDetalhada.prereq.join(", ") 
                        : "Nenhum pré-requisito"
                      }
                    </p>
                  </div>
                </div>
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
    </div>
  );
}

function PERIODOSText(id) {
  const p = PERIODOS.find((x) => x.id === id);
  return p ? p.label : "—";
}
