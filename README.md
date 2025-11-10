# 🎓 Sistema de Seleção de Período e Matérias

Um sistema web moderno e responsivo para visualização e seleção de matérias por semestre acadêmico, com funcionalidades avançadas de cálculo de pré-requisitos e planejamento curricular.

![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-10.16.0-0055FF?style=for-the-badge&logo=framer)

## ✨ Funcionalidades

### 🎯 **Seleção Inteligente de Semestres**
- Interface intuitiva para seleção de períodos acadêmicos (1º ao 9º período)
- Visualização clara das matérias por semestre
- Navegação fluida entre diferentes períodos
- Layout responsivo com grid adaptativo

### 📚 **Gestão Completa de Matérias**
- **Informações detalhadas**: Código, nome, carga horária total e horas semanais
- **Detalhes expandidos**: Ementa, pré-requisitos, trilhas e relacionamentos
- **Modal interativo**: Visualização completa com animações suaves
- **Sistema de conclusão**: Marcação de matérias concluídas por período
- **Desmarcar em lote**: Botão para desmarcar todas as matérias do período selecionado

### 🔍 **Sistema de Pesquisa**
- Busca em tempo real por nome, código ou descrição
- Filtros instantâneos para localização rápida
- Interface otimizada para mobile e desktop

### 🧮 **Calculadora de Matérias Possíveis**
- Algoritmo inteligente de cálculo de pré-requisitos
- **Modal dedicada**: Visualização focada das matérias possíveis
- Respeita limite de 40h semanais para planejamento realista
- Badges visuais indicando o semestre de cada matéria
- Validação automática de dependências
- Exibição de horas semanais totais

### 📱 **Design Responsivo e Moderno**
- **Mobile-first**: Otimizado para todos os tamanhos de tela
- **Animações fluidas**: Transições suaves com Framer Motion
- **Interface moderna**: Design limpo com glassmorphism e gradientes
- **Acessibilidade**: Contraste e usabilidade aprimorados
- **Tela inicial interativa**: Componentes eletrônicos animados (Arduino, LEDs, osciloscópio)
- **Fluxograma visual**: Visualização interativa das dependências entre matérias

## 🚀 Tecnologias Utilizadas

- **React 19.1.1** - Biblioteca principal para interface
- **React Router DOM 7.9.5** - Roteamento e navegação
- **Tailwind CSS 3.3.0** - Framework de estilização
- **Framer Motion 12.23.13** - Animações e transições
- **React Flow (@xyflow/react) 12.9.2** - Visualização de fluxogramas
- **Create React App** - Configuração e build automatizado

## 🎮 Como Usar

### 1. **Tela Inicial**
- Visualize informações sobre o curso de Engenharia Eletrônica
- Explore componentes eletrônicos interativos
- Acesse o Instagram através do QR Code na modal
- Clique em "Ver Matérias" para começar

### 2. **Seleção de Semestre**
- Clique nos botões de período (1º ao 9º período)
- Visualize as matérias disponíveis para o período selecionado
- Use a barra de pesquisa para filtrar matérias

### 3. **Exploração de Matérias**
- Clique em "Ver detalhes" para informações completas
- Marque matérias como concluídas usando o botão "Concluído"
- Use o botão "Desmarcar todas" para limpar as seleções do período

### 4. **Cálculo de Possibilidades**
- Após marcar matérias concluídas, clique em "Calcular possíveis matérias"
- Uma modal será aberta mostrando as matérias elegíveis
- Visualize o total de horas semanais e quantidade de matérias
- O sistema respeita o limite de 40h semanais automaticamente

### 5. **Fluxograma**
- Clique em "Ver Fluxograma" para visualizar todas as matérias e suas conexões
- Filtre por trilha para ver matérias específicas
- Clique em matérias para ver detalhes

## 🏗️ Estrutura do Projeto

```
src/
├── App.js              # Componente principal
├── App.css             # Estilos globais
├── index.js            # Ponto de entrada
└── index.css           # Estilos base
```

## 📊 Dados das Matérias

O sistema inclui um conjunto completo de matérias do curso de Engenharia Eletrônica organizadas por período:

- **1º ao 9º Período**: Cobertura completa do curso
- **Trilhas de aprofundamento**: Matemática e Física, Computação, Eletrônica, Industrial, Biomédica, Interdisciplinar
- **Carga horária total**: 3600h

Cada matéria contém:
- Informações básicas (código, nome, carga horária total)
- Horas semanais para cálculo de carga de trabalho
- Descrição detalhada (ementa)
- Pré-requisitos obrigatórios e recomendados
- Trilha de aprofundamento
- Relacionamentos (prepara outras matérias, requer conhecimentos)

## 🎨 Personalização

### Adicionando Novas Matérias
Edite o objeto `MATERIAS_POR_PERIODO` em `App.js`:

```javascript
const MATERIAS_POR_PERIODO = {
  "1s": [
    {
      codigo: "NOV101",
      nome: "Nova Matéria",
      descricao: "Descrição resumida",
      descricaoDetalhada: "Descrição completa...",
      carga: "60h",
      prereq: ["MAT101"],
      professor: "Prof. Dr. Nome",
      horario: "Segunda, 14h-16h",
      sala: "A201"
    }
  ]
};
```

### Modificando Períodos
Ajuste o array `PERIODOS` para alterar os períodos disponíveis:

```javascript
const PERIODOS = [
  { id: "1s", label: "1º Semestre" },
  { id: "2s", label: "2º Semestre" },
  // Adicione mais períodos conforme necessário
];
```

## 🚀 Scripts Disponíveis

- `npm start` - Executa a aplicação em modo de desenvolvimento
- `npm test` - Executa os testes automatizados
- `npm run build` - Gera build de produção
- `npm run eject` - Ejetar configurações (irreversível)

## 📱 Responsividade

A aplicação foi desenvolvida com abordagem mobile-first:

- **Mobile**: Layout otimizado para telas pequenas
- **Tablet**: Adaptação para telas médias
- **Desktop**: Experiência completa em telas grandes

## 🔧 Desenvolvimento

### Estrutura de Componentes
- **Componente Principal**: `SelecaoPeriodoMaterias`
- **Estado Gerenciado**: React Hooks (useState)
- **Animações**: Framer Motion para transições suaves
- **Estilização**: Tailwind CSS com classes utilitárias

### Padrões de Código
- **ES6+**: Sintaxe moderna do JavaScript
- **Componentes Funcionais**: Uso de hooks do React
- **Props e Estado**: Gerenciamento eficiente de dados
- **Event Handlers**: Manipulação de eventos otimizada

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar o planejamento acadêmico.

---

**Versão**: 1.0.0  
**Última atualização**: 2025

> 💡 **Dica**: Use o sistema para planejar seu curso de forma inteligente, considerando os pré-requisitos e sua progressão acadêmica!