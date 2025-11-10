import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
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
  const todasMaterias = {};
  const codigosUsados = new Set();
  
  materiasData.forEach(materia => {
    const periodoKey = String(materia.periodo);
    if (!materiasPorPeriodo[periodoKey]) {
      materiasPorPeriodo[periodoKey] = [];
    }
    
    const palavras = materia.nome.split(' ').filter(p => p.length > 0);
    let codigoBase = palavras
      .slice(0, 3)
      .map(palavra => {
        const primeiraLetra = palavra
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')[0]
          ?.toUpperCase() || '';
        return primeiraLetra;
      })
      .filter(l => l.match(/[A-Z]/))
      .join('');
    
    let codigo = codigoBase + materia.periodo.toString().padStart(2, '0');
    
    let contador = 1;
    const codigoOriginal = codigo;
    while (codigosUsados.has(codigo)) {
      codigo = codigoOriginal + String.fromCharCode(64 + contador);
      contador++;
      if (contador > 26) {
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
      carga: materia.carga ? `${materia.carga}h` : "—",
      horasSemanais: materia.horasSemanais || null,
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

// Componente de Tela Inicial
function TelaInicial() {
  const navigate = useNavigate();
  const [ledStates, setLedStates] = useState({});
  const [oscilloscopeValue, setOscilloscopeValue] = useState(0);
  const [multimeterValue, setMultimeterValue] = useState(0);
  const [mostrarModalInstagram, setMostrarModalInstagram] = useState(false);

  const totalMaterias = Object.values(MATERIAS_POR_PERIODO).flat().length;
  const totalPeriodos = PERIODOS.length;
  const trilhas = [...new Set(Object.values(MATERIAS_POR_PERIODO).flat().map(m => m.trilha).filter(Boolean))];

  useEffect(() => {
    const interval = setInterval(() => {
      setLedStates(prev => ({
        led1: Math.random() > 0.5,
        led2: Math.random() > 0.3,
        led3: Math.random() > 0.4,
        led4: Math.random() > 0.6,
        led5: Math.random() > 0.5,
        led6: Math.random() > 0.7,
      }));
    }, 500);

    const oscInterval = setInterval(() => {
      setOscilloscopeValue(prev => (prev + 0.1) % (Math.PI * 2));
    }, 50);

    const multInterval = setInterval(() => {
      setMultimeterValue(prev => (prev + 0.5) % 100);
    }, 200);

    return () => {
      clearInterval(interval);
      clearInterval(oscInterval);
      clearInterval(multInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 overflow-y-auto relative">
      {/* Background com gradiente animado */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(34, 197, 94, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 20%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Background animado - Circuitos */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1200 800">
          {/* Circuitos PCB */}
          <motion.path
            d="M 100 100 L 300 100 L 300 200 L 500 200 L 500 300 L 700 300"
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.path
            d="M 200 400 L 400 400 L 400 500 L 600 500 L 600 600 L 800 600"
            stroke="#22c55e"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          />
          <motion.path
            d="M 300 200 L 300 400 L 500 400 L 500 600"
            stroke="#f97316"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          />
          {/* Mais circuitos para criar mais profundidade */}
          <motion.path
            d="M 800 100 L 1000 100 L 1000 200 L 1100 200"
            stroke="#a855f7"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1.5 }}
          />
          <motion.path
            d="M 900 300 L 900 500 L 1100 500"
            stroke="#ec4899"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", delay: 2 }}
          />
          {/* Nós de circuito (pontos de conexão) */}
          {[
            { x: 300, y: 200, delay: 0 },
            { x: 500, y: 300, delay: 0.5 },
            { x: 600, y: 500, delay: 1 },
            { x: 900, y: 300, delay: 1.5 },
            { x: 1000, y: 200, delay: 2 },
          ].map((node, i) => (
            <motion.circle
              key={i}
              cx={node.x}
              cy={node.y}
              r="4"
              fill="#fbbf24"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: node.delay,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 py-8 sm:py-12" style={{ pointerEvents: 'auto' }}>
        {/* Container com layout flexível - Arduino ao lado em telas grandes */}
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Título principal com animação */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center lg:text-left lg:flex-1"
          >
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
              <motion.span 
                className="bg-gradient-to-r from-blue-400 via-green-400 to-orange-400 bg-clip-text text-transparent"
                animate={{
                  filter: [
                    'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))',
                    'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))',
                    'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Engenharia
              </motion.span>
              <br />
              <motion.span 
                className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
                animate={{
                  filter: [
                    'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))',
                    'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
                    'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                Eletrônica
              </motion.span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mt-2 sm:mt-4">
              Sistema de Seleção de Matérias
            </p>
          </motion.div>

          {/* Placa Arduino animada - Réplica Realista (Horizontal) - Interativa - Menor */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative flex-shrink-0"
            style={{ perspective: '1000px', perspectiveOrigin: 'center center' }}
          >
          {/* Dica de interatividade */}
          <motion.div
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-gray-400 text-[10px] sm:text-xs pointer-events-none"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: [0.5, 1, 0.5], y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="flex items-center gap-1">
              <span>👆</span>
              <span className="hidden lg:inline">Arraste</span>
            </span>
          </motion.div>
          <motion.div
            drag
            dragConstraints={{ left: -150, right: 150, top: -80, bottom: 80 }}
            dragElastic={0.3}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
            whileHover={{
              rotateY: 20,
              rotateX: -15,
              scale: 1.08,
              z: 50,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            whileDrag={{
              cursor: 'grabbing',
              scale: 1.1,
              rotateZ: 5,
            }}
            whileTap={{ scale: 0.95 }}
            animate={{
              rotateY: [0, 3, 0],
              rotateX: [0, 2, 0],
            }}
            transition={{
              rotateY: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              rotateX: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
            }}
            style={{
              transformStyle: 'preserve-3d',
              cursor: 'grab',
            }}
            className="relative"
          >
            <motion.div
              className="relative bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-2 sm:p-3 shadow-2xl border-2 border-green-700"
              style={{
                maxWidth: '380px',
                width: '100%',
                margin: '0 auto',
                minHeight: '180px',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
              whileHover={{
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(34, 197, 94, 0.3)',
              }}
            >
            {/* Traçados de PCB - Linhas de cobre */}
            <svg className="absolute inset-0 w-full h-full opacity-20" style={{ pointerEvents: 'none' }}>
              <motion.path
                d="M 40 20 L 140 20 L 140 60 L 240 60"
                stroke="#fbbf24"
                strokeWidth="1.5"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              />
              <motion.path
                d="M 300 40 L 400 40 L 400 80 L 500 80"
                stroke="#fbbf24"
                strokeWidth="1.5"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.3 }}
              />
              <motion.path
                d="M 150 120 L 250 120 L 250 80 L 350 80"
                stroke="#fbbf24"
                strokeWidth="1.5"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.2, repeat: Infinity, repeatType: "reverse", delay: 0.6 }}
              />
            </svg>

            {/* Header - Título e Logo */}
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-green-600">
              <h3 className="text-white font-bold text-xs sm:text-sm tracking-wider">ARDUINO</h3>
              <div className="text-white text-[10px] sm:text-xs font-semibold">UNO R3</div>
            </div>

            {/* Área principal da placa - Layout Horizontal */}
            <div className="relative flex items-center justify-between" style={{ minHeight: '140px' }}>
              {/* Lado Esquerdo - Conectores */}
              <div className="flex flex-col items-center gap-2.5 sm:gap-3">
                {/* Conector USB */}
                <div className="flex flex-col items-center">
                  <div className="w-6 h-4 sm:w-7 sm:h-5 bg-gray-800 rounded border-2 border-gray-600 mb-0.5"></div>
                  <div className="text-gray-300 text-[5px] sm:text-[7px]">USB</div>
                </div>

                {/* Conector de Alimentação */}
                <div className="flex flex-col items-center">
                  <div className="w-5 h-4 sm:w-6 sm:h-5 bg-gray-800 rounded border-2 border-gray-600 mb-0.5"></div>
                  <div className="text-gray-300 text-[5px] sm:text-[7px]">VIN</div>
                </div>
              </div>

              {/* Centro - Microcontrolador e LEDs */}
              <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4">
                {/* Microcontrolador ATmega328P */}
                <motion.div
                  className="bg-gray-800 rounded-lg p-1 sm:p-1.5 shadow-xl border-2 border-gray-700 mb-2"
                  animate={{ boxShadow: ['0 0 0px rgba(59, 130, 246, 0.5)', '0 0 15px rgba(59, 130, 246, 0.8)', '0 0 0px rgba(59, 130, 246, 0.5)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="text-center">
                    <div className="text-white text-[4px] sm:text-[6px] font-bold mb-0.5">ATmega328P</div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-900 rounded border border-gray-600 flex items-center justify-center">
                      <div className="w-5 h-5 sm:w-7 sm:h-7 bg-gray-700 rounded border-2 border-gray-500 grid grid-cols-4 gap-0.5 p-0.5">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className="bg-gray-600 rounded-sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* LEDs de Status em linha */}
                <div className="flex gap-1.5 sm:gap-2 mb-1.5">
                  {/* LED ON (Power) */}
                  <motion.div className="flex flex-col items-center">
                    <motion.div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 shadow-lg shadow-red-500"
                      animate={{
                        opacity: [0.8, 1, 0.8],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <div className="text-gray-300 text-[5px] sm:text-[6px] mt-0.5">ON</div>
                  </motion.div>

                  {/* LED TX */}
                  <motion.div className="flex flex-col items-center">
                    <motion.div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400"
                      animate={{
                        opacity: ledStates.led2 ? [0.5, 1, 0.5] : 0.3,
                        scale: ledStates.led2 ? [1, 1.3, 1] : 1,
                      }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                    <div className="text-gray-300 text-[5px] sm:text-[6px] mt-0.5">TX</div>
                  </motion.div>

                  {/* LED RX */}
                  <motion.div className="flex flex-col items-center">
                    <motion.div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400"
                      animate={{
                        opacity: ledStates.led3 ? [0.5, 1, 0.5] : 0.3,
                        scale: ledStates.led3 ? [1, 1.3, 1] : 1,
                      }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <div className="text-gray-300 text-[5px] sm:text-[6px] mt-0.5">RX</div>
                  </motion.div>

                  {/* LED L (Built-in) */}
                  <motion.div className="flex flex-col items-center">
                    <motion.div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 shadow-lg shadow-green-400"
                      animate={{
                        opacity: ledStates.led1 ? [0.5, 1, 0.5] : 0.3,
                        scale: ledStates.led1 ? [1, 1.3, 1] : 1,
                      }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    <div className="text-gray-300 text-[5px] sm:text-[6px] mt-0.5">L</div>
                  </motion.div>
                </div>

                {/* Botão Reset */}
                <motion.button
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 rounded-full border-2 border-red-700 shadow-lg"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    boxShadow: [
                      '0 0 0px rgba(239, 68, 68, 0.5)',
                      '0 0 10px rgba(239, 68, 68, 0.8)',
                      '0 0 0px rgba(239, 68, 68, 0.5)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Componentes passivos */}
                <div className="flex gap-1.5 sm:gap-2 mt-2">
                  {/* Resistores */}
                  {[1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2.5 h-1.5 sm:w-3 sm:h-2 bg-orange-700 rounded border border-orange-600"
                      animate={{ rotate: [0, 2, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    />
                  ))}
                  {/* Capacitores */}
                  {[1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-2.5 sm:w-2 sm:h-3 bg-gray-600 rounded"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </div>
              </div>

              {/* Lado Direito - Footer rotacionado */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-gray-300 text-[7px] sm:text-[9px] writing-vertical" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  Made in Italy
                </div>
              </div>
            </div>

            {/* Pinos - Superior e Inferior - Reduzidos */}
            <div className="mt-1.5">
              {/* Pinos Superiores - Digitais */}
              <div className="flex justify-center gap-0.5 mb-0.5">
                {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'].map((label, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col items-center"
                    initial={{ y: -5 }}
                    animate={{ y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <motion.div
                      className="w-1 h-2.5 sm:w-1.5 sm:h-3 bg-yellow-600 rounded-t border border-yellow-500"
                      animate={{ y: [0, -1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                    />
                    <div className="text-gray-300 text-[4px] sm:text-[5px] font-mono mt-0.5">{label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Pinos Inferiores - Analógicos */}
              <div className="flex justify-center gap-0.5">
                {['GND', 'GND', '5V', '3.3V', 'RST', 'AREF', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'].map((label, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col items-center"
                    initial={{ y: 5 }}
                    animate={{ y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div className="text-gray-300 text-[4px] sm:text-[5px] font-mono mb-0.5">{label}</div>
                    <motion.div
                      className="w-1 h-2.5 sm:w-1.5 sm:h-3 bg-yellow-600 rounded-t border border-yellow-500"
                      animate={{ y: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
            </motion.div>
          </motion.div>
        </motion.div>
        </div>

        {/* Componentes eletrônicos flutuantes */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Resistor */}
          <motion.div
            className="absolute top-20 left-10 sm:left-20"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-16 h-8 sm:w-20 sm:h-10 bg-yellow-700 rounded-lg border-2 border-yellow-600 flex items-center justify-center">
              <div className="w-full h-1 bg-yellow-500" />
            </div>
          </motion.div>

          {/* Capacitor */}
          <motion.div
            className="absolute top-40 right-10 sm:right-20"
            animate={{
              y: [0, 15, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <div className="w-6 h-12 sm:w-8 sm:h-16 bg-gray-600 rounded flex flex-col items-center justify-between p-1">
              <div className="w-full h-1 bg-gray-400" />
              <div className="w-full h-1 bg-gray-400" />
            </div>
          </motion.div>

          {/* Transistor */}
          <motion.div
            className="absolute top-60 left-1/3"
            animate={{
              x: [0, 15, 0],
              rotate: [0, -3, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8,
            }}
          >
            <div className="w-10 h-14 sm:w-12 sm:h-16 bg-gray-800 rounded border-2 border-gray-600 flex flex-col items-center justify-center p-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full mb-1"></div>
              <div className="w-1 h-4 bg-gray-400"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full mt-1"></div>
            </div>
          </motion.div>

          {/* Diodo */}
          <motion.div
            className="absolute top-80 right-1/3"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 8, 0],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.2,
            }}
          >
            <div className="w-8 h-12 sm:w-10 sm:h-14 bg-gray-700 rounded border-2 border-gray-500 flex items-center justify-center">
              <div className="w-4 h-1 bg-red-600"></div>
              <div className="w-1 h-8 bg-gray-400"></div>
              <div className="w-4 h-1 bg-gray-300"></div>
            </div>
          </motion.div>

          {/* Osciloscópio */}
          <motion.div
            className="absolute bottom-40 left-10 sm:left-20"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-24 h-16 sm:w-32 sm:h-20 bg-gray-800 rounded-lg border-2 border-gray-600 p-2">
              <div className="w-full h-full bg-black rounded border border-gray-700 relative overflow-hidden">
                {/* Tela do osciloscópio com onda senoidal */}
                <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                  <motion.path
                    d={`M 0 30 ${Array.from({ length: 100 }, (_, i) => {
                      const x = i;
                      const y = 30 + Math.sin(oscilloscopeValue + i * 0.1) * 15;
                      return `L ${x} ${y}`;
                    }).join(' ')}`}
                    stroke="#00ff00"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  {/* Grade */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <line key={`h-${i}`} x1="0" y1={i * 15} x2="100" y2={i * 15} stroke="#333" strokeWidth="0.3" />
                  ))}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <line key={`v-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="60" stroke="#333" strokeWidth="0.3" />
                  ))}
                </svg>
              </div>
              <div className="text-gray-300 text-[6px] sm:text-[8px] mt-1 text-center">OSC</div>
            </div>
          </motion.div>

          {/* Multímetro */}
          <motion.div
            className="absolute bottom-40 right-10 sm:right-20"
            animate={{
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <div className="w-20 h-14 sm:w-28 sm:h-18 bg-yellow-600 rounded-lg border-2 border-yellow-700 p-1.5">
              <div className="w-full h-full bg-gray-900 rounded border border-gray-700 flex flex-col items-center justify-center">
                <div className="text-green-400 text-[8px] sm:text-[10px] font-mono font-bold">
                  {multimeterValue.toFixed(1)}V
                </div>
                <div className="text-gray-500 text-[6px] sm:text-[7px] mt-0.5">DC</div>
              </div>
              <div className="text-gray-800 text-[6px] sm:text-[8px] mt-0.5 text-center font-semibold">DMM</div>
            </div>
          </motion.div>

          {/* Chip IC */}
          <motion.div
            className="absolute bottom-32 left-1/4"
            animate={{
              x: [0, 10, 0],
              rotate: [0, 3, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 rounded border-2 border-gray-600 flex items-center justify-center">
              <div className="text-white text-xs font-bold">IC</div>
            </div>
          </motion.div>

          {/* LED flutuante */}
          <motion.div
            className="absolute bottom-20 right-1/4"
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          >
            <motion.div
              className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-green-400 shadow-lg shadow-green-400"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            />
          </motion.div>
        </div>

        {/* Seções Informativas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-full max-w-5xl mx-auto mb-8 sm:mb-12 relative z-10"
        >
          {/* Estatísticas do Curso */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-1">{totalPeriodos}</div>
              <div className="text-xs sm:text-sm text-gray-300">Períodos</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-1">{totalMaterias}</div>
              <div className="text-xs sm:text-sm text-gray-300">Matérias</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold text-orange-400 mb-1">{trilhas.length}</div>
              <div className="text-xs sm:text-sm text-gray-300">Trilhas</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-1">5</div>
              <div className="text-xs sm:text-sm text-gray-300">Anos</div>
            </motion.div>
          </div>

          {/* Cards de Áreas da Eletrônica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group relative overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                borderColor: 'rgba(59, 130, 246, 0.5)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="text-2xl mb-2 relative z-10">🔌</div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1 relative z-10">Circuitos Analógicos</h3>
              <p className="text-gray-300 text-xs sm:text-sm relative z-10">Projeto e análise de circuitos com componentes passivos e ativos.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group relative overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                borderColor: 'rgba(249, 115, 22, 0.5)',
                boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="text-2xl mb-2 relative z-10">💻</div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1 relative z-10">Sistemas Digitais</h3>
              <p className="text-gray-300 text-xs sm:text-sm relative z-10">Lógica digital, microcontroladores e sistemas embarcados.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group relative overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                borderColor: 'rgba(34, 197, 94, 0.5)',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="text-2xl mb-2 relative z-10">📡</div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1 relative z-10">Telecomunicações</h3>
              <p className="text-gray-300 text-xs sm:text-sm relative z-10">Processamento de sinais e sistemas de comunicação.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group relative overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                borderColor: 'rgba(251, 191, 36, 0.5)',
                boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="text-2xl mb-2 relative z-10">⚡</div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1 relative z-10">Eletrônica de Potência</h3>
              <p className="text-gray-300 text-xs sm:text-sm relative z-10">Conversores, inversores e sistemas de energia.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group relative overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                borderColor: 'rgba(168, 85, 247, 0.5)',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="text-2xl mb-2 relative z-10">🤖</div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1 relative z-10">Automação</h3>
              <p className="text-gray-300 text-xs sm:text-sm relative z-10">Controle de processos e sistemas automatizados.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group relative overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                borderColor: 'rgba(236, 72, 153, 0.5)',
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/10 to-pink-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="text-2xl mb-2 relative z-10">🏥</div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1 relative z-10">Biomédica</h3>
              <p className="text-gray-300 text-xs sm:text-sm relative z-10">Instrumentação médica e equipamentos de saúde.</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Botões de ação */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center relative"
          style={{ zIndex: 50, pointerEvents: 'auto' }}
        >
          {/* Botão principal - Entrar nas matérias */}
          <motion.button
            onClick={() => navigate('/selecao_materia')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold text-lg sm:text-xl rounded-xl shadow-2xl transform transition-all cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.5)",
                "0 0 30px rgba(34, 197, 94, 0.7)",
                "0 0 20px rgba(59, 130, 246, 0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ pointerEvents: 'auto', position: 'relative', zIndex: 51 }}
          >
            <span className="flex items-center gap-2">
              <span>🔌</span>
              <span>Ver Matérias</span>
              <span>⚡</span>
            </span>
          </motion.button>

          {/* Botões de redes sociais */}
          <div className="flex gap-4" style={{ position: 'relative', zIndex: 51 }}>
            <motion.button
              onClick={() => setMostrarModalInstagram(true)}
              className="px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 52 }}
            >
              <span className="text-xl">📷</span>
              <span className="hidden sm:inline">Instagram</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Onda de partículas no fundo - Melhorada */}
        <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none z-0">
          {Array.from({ length: 30 }).map((_, i) => {
            const colors = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899'];
            const color = colors[i % colors.length];
            return (
              <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: `${2 + Math.random() * 3}px`,
                  height: `${2 + Math.random() * 3}px`,
                  left: `${(i * 3.33) % 100}%`,
                  bottom: `${Math.random() * 30}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 ${4 + Math.random() * 4}px ${color}`,
                }}
                animate={{
                  y: [0, -150 - Math.random() * 50, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.5, 1.2, 0.5],
                  x: [0, (Math.random() - 0.5) * 20, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Modal do Instagram com QR Code */}
      <AnimatePresence>
        {mostrarModalInstagram && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setMostrarModalInstagram(false)}
            style={{ zIndex: 10005 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
              style={{ zIndex: 10006 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📷</span>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Instagram
                  </h2>
                </div>
                <motion.button
                  onClick={() => setMostrarModalInstagram(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-gray-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('https://www.instagram.com/eletronicautfprcm/')}`}
                    alt="QR Code Instagram"
                    className="w-64 h-64"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Escaneie o QR Code para acessar nosso Instagram
                </p>
              </div>

              {/* Link e botão */}
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Link do Instagram:</p>
                  <a
                    href="https://www.instagram.com/eletronicautfprcm/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium break-all"
                  >
                    instagram.com/eletronicautfprcm
                  </a>
                </div>
                <motion.a
                  href="https://www.instagram.com/eletronicautfprcm/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-xl text-center shadow-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Abrir no Instagram
                </motion.a>
                <motion.button
                  onClick={() => setMostrarModalInstagram(false)}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Fechar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelecaoPeriodoMaterias() {
  const navigate = useNavigate();
  const [periodoSelecionado, setPeriodoSelecionado] = useState("1"); // inicia no 1º período
  const [materiasConcluidas, setMateriasConcluidas] = useState([]);
  const [possiveisMaterias, setPossiveisMaterias] = useState([]);
  const [mostrarModalPossiveis, setMostrarModalPossiveis] = useState(false);
  const [query, setQuery] = useState("");
  const [materiaDetalhada, setMateriaDetalhada] = useState(null);
  const [mostrarFluxograma, setMostrarFluxograma] = useState(false);
  const [trilhaFiltroFluxograma, setTrilhaFiltroFluxograma] = useState(null);

  const periodoParaMostrar = periodoSelecionado;
  const materias = MATERIAS_POR_PERIODO[periodoParaMostrar] || [];

  const handleMateriaClick = useCallback((materia) => {
    setMateriaDetalhada(materia);
  }, []);

  function toggleConcluida(codigo) {
    setMateriasConcluidas((prev) =>
      prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]
    );
  }

  function desmarcarTodasMaterias() {
    const codigosDoPeriodo = materiasFiltradas.map(m => m.codigo);
    setMateriasConcluidas((prev) => 
      prev.filter(codigo => !codigosDoPeriodo.includes(codigo))
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

    let periodosConsiderados;
    if (materiasConcluidas.length === 0) {
      periodosConsiderados = ["1"];
    } else {
      const idx = PERIODOS.findIndex((p) => p.id === periodoSelecionado);
      periodosConsiderados = PERIODOS.slice(idx, idx + 3).map((p) => p.id);
    }

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

    candidatas.sort((a, b) => {
      if (a.periodo !== b.periodo) return a.periodo - b.periodo;
      return (b.horasSemanais || 0) - (a.horasSemanais || 0);
    });

    const resultado = [];
    const LIMITE_HORAS_SEMANAIS = 40;
    let horasAcumuladas = 0;

    candidatas.forEach(m => {
      const horasMateria = m.horasSemanais || 0;
      if (horasAcumuladas + horasMateria <= LIMITE_HORAS_SEMANAIS) {
        resultado.push(m);
        horasAcumuladas += horasMateria;
      }
    });

    setPossiveisMaterias(resultado);
    setMostrarModalPossiveis(true); // Abre a modal automaticamente após calcular
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-2 sm:p-4 lg:p-8 relative overflow-hidden">
      {/* Background elegante com gradientes animados */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.06) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.06) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.06) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Padrão de grid sutil */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-0" style={{
        backgroundImage: `
          linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* Orbs flutuantes sutis */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[
          { size: 300, x: '10%', y: '20%', color: 'rgba(99, 102, 241, 0.05)' },
          { size: 400, x: '90%', y: '80%', color: 'rgba(59, 130, 246, 0.04)' },
          { size: 250, x: '50%', y: '10%', color: 'rgba(139, 92, 246, 0.03)' },
        ].map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              backgroundColor: orb.color,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header elegante com glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white backdrop-blur-xl rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-2xl border border-gray-200 relative overflow-hidden"
        >
          {/* Gradiente sutil no header */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none" />
          
          {/* Efeito shimmer animado */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "linear",
            }}
          />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                title="Voltar para a página inicial"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Voltar
              </motion.button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-indigo-700">
                  Selecione o período
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Escolha o semestre para ver e marcar as matérias que você já fez.</p>
              </div>
            </div>
            <motion.button
              onClick={() => setMostrarFluxograma(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📊 Ver Fluxograma
            </motion.button>
          </div>
        </motion.div>

        {/* Container principal elegante */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/50"
        >
        <section className="mb-4 sm:mb-6">
          <div className="space-y-4">
            {/* Botões de período com animações */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-3">
              {PERIODOS.map((p, index) => (
                <motion.button
                  key={p.id}
                  onClick={() => setPeriodoSelecionado(p.id)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`px-3 sm:px-4 py-2.5 rounded-full border-2 transition-all font-semibold text-xs sm:text-sm focus:outline-none relative overflow-hidden w-full
                    ${p.id === periodoSelecionado 
                      ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl border-transparent" 
                      : "bg-white/70 backdrop-blur-sm text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-white/90 hover:shadow-md"}`}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {p.id === periodoSelecionado && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 whitespace-nowrap">{p.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Barra de pesquisa elegante com animação */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 relative group">
                <motion.div 
                  className="absolute left-4 top-0 bottom-0 flex items-center text-gray-400 text-lg pointer-events-none z-10"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  🔍
                </motion.div>
                <motion.input
                  type="text"
                  placeholder="Pesquisar matérias..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all shadow-sm hover:shadow-lg"
                  whileFocus={{ scale: 1.02 }}
                />
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
          <motion.p 
            className="mt-3 text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Período selecionado: <motion.span 
              className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              key={periodoSelecionado}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {PERIODOSText(periodoSelecionado)}
            </motion.span>
          </motion.p>

        </section>

        <main className="space-y-6 sm:space-y-8">
          {/* Legenda das Trilhas e Botão lado a lado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col lg:flex-row gap-4 items-start lg:items-center"
          >
            {/* Legenda das Trilhas compacta */}
            <motion.section 
              className="bg-gradient-to-r from-gray-50 via-blue-50/40 to-indigo-50/30 rounded-xl p-3 border border-gray-200/50 shadow-md backdrop-blur-sm flex-1"
            >
              <h3 className="text-xs sm:text-sm font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Legenda das Trilhas
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  { name: 'Matemática e Física', emoji: '🔵', delay: 0.4 },
                  { name: 'Computação', emoji: '🟠', delay: 0.45 },
                  { name: 'Eletrônica', emoji: '🟢', delay: 0.5 },
                  { name: 'Industrial', emoji: '🔴', delay: 0.55 },
                  { name: 'Biomédica', emoji: '🟣', delay: 0.6 },
                  { name: 'Interdisciplinar', emoji: '⚪', delay: 0.65 },
                ].map((trilha, idx) => (
                  <motion.span
                    key={trilha.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: trilha.delay, duration: 0.3 }}
                    className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium border cursor-default transition-all ${getTrilhaColor(trilha.name)}`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {trilha.emoji} {trilha.name}
                  </motion.span>
                ))}
              </div>
            </motion.section>

            {/* Botão para calcular possíveis matérias */}
            <motion.div 
              className="w-full lg:w-auto flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.button
                onClick={calcularPossiveisMaterias}
                className="w-full lg:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xl hover:shadow-green-500/50 transition-all duration-300 relative overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 15px 30px rgba(16, 185, 129, 0.3)',
                    '0 15px 40px rgba(16, 185, 129, 0.5)',
                    '0 15px 30px rgba(16, 185, 129, 0.3)',
                  ],
                }}
                transition={{
                  boxShadow: { duration: 2, repeat: Infinity },
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <motion.span 
                    className="text-lg sm:text-xl"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    ⚡
                  </motion.span>
                  <span className="whitespace-nowrap">Calcular possíveis matérias</span>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.8 }}
                />
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            key={periodoSelecionado}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-5 gap-3">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="text-base sm:text-lg font-bold flex items-center gap-2 flex-1"
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="text-2xl"
                >
                  📚
                </motion.span>
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Matérias do período selecionado
                </span>
              </motion.h2>
              
              {materiasFiltradas.some(m => materiasConcluidas.includes(m.codigo)) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={desmarcarTodasMaterias}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Desmarcar todas as matérias deste período"
                >
                  <span>🗑️</span>
                  <span className="hidden sm:inline">Desmarcar todas</span>
                  <span className="sm:hidden">Limpar</span>
                </motion.button>
              )}
            </div>

            <AnimatePresence>
              {materiasFiltradas.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-6 sm:p-8 border-2 border-dashed border-gray-300 rounded-2xl text-center bg-gradient-to-br from-gray-50 to-blue-50/30"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl mb-3"
                  >
                    📚
                  </motion.div>
                  <p className="text-sm font-medium text-gray-500">Nenhuma matéria carregada.</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                  {materiasFiltradas.map((m, index) => (
                    <motion.article
                      key={m.codigo}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ 
                        duration: 0.4,
                        delay: index * 0.05,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className={`bg-white border-l-4 rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group ${m.trilha ? getTrilhaBorderColor(m.trilha) : 'border-l-gray-300'} ${materiasConcluidas.includes(m.codigo) ? "ring-2 ring-green-400/50 bg-gradient-to-br from-green-50/50 to-white" : "hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-white"}`}
                      whileHover={{ scale: 1.03, y: -6, rotateY: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Efeito de brilho no hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="space-y-3 relative z-10">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <motion.h3 
                              className="text-sm sm:text-base font-semibold flex-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 + 0.2 }}
                            >
                              {m.nome}
                            </motion.h3>
                            {m.trilha && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 + 0.3 }}
                                className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${getTrilhaColor(m.trilha)}`}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                              >
                                {m.trilha}
                              </motion.span>
                            )}
                          </div>
                          <motion.div 
                            className="text-xs text-gray-500 font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 + 0.25 }}
                          >
                            {m.codigo} • {m.carga}
                            {m.horasSemanais && (
                              <span className="ml-2 text-indigo-600 font-semibold">
                                • {m.horasSemanais.toFixed(1)}h/sem
                              </span>
                            )}
                          </motion.div>
                          <motion.p 
                            className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 + 0.3 }}
                          >
                            {m.descricao}
                          </motion.p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 relative z-10">
                          <motion.button 
                            onClick={() => abrirDetalhes(m)}
                            className="flex-1 px-3 py-2 text-xs sm:text-sm border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 text-center transition-all duration-300 font-medium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            📖 Ver detalhes
                          </motion.button>
                          <motion.button
                            onClick={() => toggleConcluida(m.codigo)}
                            className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl font-medium transition-all duration-300 ${materiasConcluidas.includes(m.codigo) ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg" : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"}`}
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {materiasConcluidas.includes(m.codigo) ? "❌ Remover" : "✅ Concluído"}
                          </motion.button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.section>

        </main>
        </motion.div>
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
            style={{ zIndex: 10003 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
              style={{ zIndex: 10004 }}
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

      {/* Modal de Matérias Possíveis */}
      <AnimatePresence>
        {mostrarModalPossiveis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setMostrarModalPossiveis(false)}
            style={{ zIndex: 10001 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
              style={{ zIndex: 10002 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header da Modal */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex-1">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3"
                  >
                    <span className="text-3xl">⭐</span>
                    Matérias Possíveis
                  </motion.h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-2">
                    Matérias que você pode cursar respeitando pré-requisitos e limite de 40h semanais
                  </p>
                </div>
                <motion.button
                  onClick={() => setMostrarModalPossiveis(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              </div>

              {/* Resumo de Horas */}
              {possiveisMaterias.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white shadow-lg"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm opacity-90">Total de horas semanais</p>
                      <p className="text-2xl sm:text-3xl font-bold">
                        {possiveisMaterias.reduce((sum, m) => sum + (m.horasSemanais || 0), 0).toFixed(1)}h/sem
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-90">Total de matérias</p>
                      <p className="text-2xl sm:text-3xl font-bold">{possiveisMaterias.length}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Lista de Matérias */}
              <div className="flex-1 overflow-y-auto pr-2">
                {possiveisMaterias.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 sm:p-12 border-2 border-dashed border-gray-300 rounded-2xl text-center bg-gray-50"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-5xl mb-4"
                    >
                      📚
                    </motion.div>
                    <p className="text-lg text-gray-600 font-medium">
                      Nenhuma matéria possível no momento
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Marque mais matérias como concluídas para ver opções disponíveis
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {possiveisMaterias.map((m, index) => (
                      <motion.div
                        key={m.codigo}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.05,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                        className="bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-pink-50/40 backdrop-blur-sm border-2 border-indigo-200/50 rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group cursor-pointer"
                        whileHover={{ scale: 1.03, y: -6 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => abrirDetalhes(m)}
                      >
                        {/* Efeito de brilho animado */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.8 }}
                        />
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm sm:text-base font-semibold flex-1">{m.nome}</h3>
                            <motion.span
                              className="ml-2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-md"
                              whileHover={{ scale: 1.15, rotate: 10 }}
                            >
                              {m.semestre}
                            </motion.span>
                          </div>
                          <div className="text-xs text-gray-500 font-medium mb-2">
                            {m.codigo} • {m.carga}
                            {m.horasSemanais && (
                              <span className="ml-2 text-indigo-600 font-semibold">
                                • {m.horasSemanais.toFixed(1)}h/sem
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{m.descricao}</p>
                          {m.trilha && (
                            <div className="mt-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTrilhaColor(m.trilha)}`}>
                                {m.trilha}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer da Modal */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <motion.button
                  onClick={() => setMostrarModalPossiveis(false)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Fechar
                </motion.button>
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

    const timer = setTimeout(updateDimensions, 0);
    
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
    return filtradas.length > 0 ? filtradas : todas;
  }, [todasMaterias, trilhaFiltro]);

  const materiasPorPeriodo = useMemo(() => {
    const grupos = {};
    materiasFiltradas.forEach(m => {
      if (!grupos[m.periodo]) grupos[m.periodo] = [];
      grupos[m.periodo].push(m);
    });
    return grupos;
  }, [materiasFiltradas]);

  const materiasConectadas = useMemo(() => {
    if (!materiaSelecionada) return new Set();
    
    const conectadas = new Set([materiaSelecionada]);
    const materiaSelecionadaObj = materiasFiltradas.find(m => m.codigo === materiaSelecionada);
    
    if (!materiaSelecionadaObj) return conectadas;
    
    if (materiaSelecionadaObj.prepara) {
      materiaSelecionadaObj.prepara.forEach(nome => {
        const m = materiasFiltradas.find(mat => mat.nome === nome);
        if (m) conectadas.add(m.codigo);
      });
    }
    
    if (materiaSelecionadaObj.requer) {
      materiaSelecionadaObj.requer.forEach(nome => {
        const m = materiasFiltradas.find(mat => mat.nome === nome);
        if (m) conectadas.add(m.codigo);
      });
    }
    
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

  const edges = useMemo(() => {
    const edgesList = [];
    const codigosExistentes = new Set(nodes.map(n => n.id));
    
    const isConectadaSelecionada = (source, target) => {
      return materiaSelecionada && 
             (materiasConectadas.has(source) || materiasConectadas.has(target));
    };
    
    materiasFiltradas.forEach((materia) => {
      if (!codigosExistentes.has(materia.codigo)) {
        return;
      }

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

// Componente principal com rotas
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TelaInicial />} />
      <Route path="/selecao_materia" element={<SelecaoPeriodoMaterias />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
