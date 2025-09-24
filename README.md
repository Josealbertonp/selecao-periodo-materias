# 🎓 Sistema de Seleção de Período e Matérias

Um sistema web moderno e responsivo para visualização e seleção de matérias por semestre acadêmico, com funcionalidades avançadas de cálculo de pré-requisitos e planejamento curricular.

![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-10.16.0-0055FF?style=for-the-badge&logo=framer)

## ✨ Funcionalidades

### 🎯 **Seleção Inteligente de Semestres**
- Interface intuitiva para seleção de períodos acadêmicos
- Visualização clara das matérias por semestre
- Navegação fluida entre diferentes períodos

### 📚 **Gestão Completa de Matérias**
- **Informações detalhadas**: Código, nome, carga horária e descrição
- **Detalhes expandidos**: Professor, horário, sala e pré-requisitos
- **Modal interativo**: Visualização completa com animações suaves
- **Sistema de conclusão**: Marcação de matérias concluídas

### 🔍 **Sistema de Pesquisa**
- Busca em tempo real por nome, código ou descrição
- Filtros instantâneos para localização rápida
- Interface otimizada para mobile e desktop

### 🧮 **Calculadora de Matérias Possíveis**
- Algoritmo inteligente de cálculo de pré-requisitos
- Visualização de matérias elegíveis para os próximos semestres
- Badges visuais indicando o semestre de cada matéria
- Validação automática de dependências

### 📱 **Design Responsivo**
- **Mobile-first**: Otimizado para todos os tamanhos de tela
- **Animações fluidas**: Transições suaves com Framer Motion
- **Interface moderna**: Design limpo e profissional
- **Acessibilidade**: Contraste e usabilidade aprimorados

## 🚀 Tecnologias Utilizadas

- **React 18.2.0** - Biblioteca principal para interface
- **Tailwind CSS 3.3.0** - Framework de estilização
- **Framer Motion 10.16.0** - Animações e transições
- **Create React App** - Configuração e build automatizado

## 🎮 Como Usar

### 1. **Seleção de Semestre**
- Clique nos botões de período (1º ao 5º semestre)
- Visualize as matérias disponíveis para o período selecionado

### 2. **Exploração de Matérias**
- Use a barra de pesquisa para filtrar matérias
- Clique em "Ver detalhes" para informações completas
- Marque matérias como concluídas usando o botão "Concluído"

### 3. **Cálculo de Possibilidades**
- Após marcar matérias concluídas, clique em "Calcular possíveis matérias"
- Visualize as matérias elegíveis para os próximos semestres
- Observe os badges de semestre para planejamento

## 🏗️ Estrutura do Projeto

```
src/
├── App.js              # Componente principal
├── App.css             # Estilos globais
├── index.js            # Ponto de entrada
└── index.css           # Estilos base
```

## 📊 Dados das Matérias

O sistema inclui um conjunto completo de matérias organizadas por semestre:

- **1º Semestre**: Cálculo I, Física Geral I, Introdução à Programação
- **2º Semestre**: Cálculo II, Estruturas de Dados
- **3º Semestre**: Física Geral II, Banco de Dados
- **4º Semestre**: Sistemas Operacionais, Redes de Computadores, Engenharia de Software
- **5º Semestre**: Inteligência Artificial, Segurança da Informação, Projeto Integrador

Cada matéria contém:
- Informações básicas (código, nome, carga horária)
- Descrição detalhada do conteúdo
- Dados do professor e horário
- Pré-requisitos para cursar a disciplina

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
**Última atualização**: 2024

> 💡 **Dica**: Use o sistema para planejar seu curso de forma inteligente, considerando os pré-requisitos e sua progressão acadêmica!