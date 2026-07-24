# Sistema de Evolução de Benefício RGPS

Sistema para cálculo de evolução de benefícios previdenciários (RMI/RMA) conforme regras do RGPS/INSS, com suporte a piso, teto, índice-teto e prescrição.

## 📁 Estrutura do Projeto

/
├── index.html # Página principal
├── README.md # Este arquivo
├── css/
│ └── styles.css # Estilos personalizados
├── js/
│ ├── core.js # Funções auxiliares, máscaras, formatação
│ ├── motor-evolucao.js # Motor de cálculo previdenciário (homologado)
│ ├── beneficios-recebidos.js # Guia Benefícios Recebidos
│ ├── json.js # Exportar/Importar dados do caso (JSON)
│ ├── relatorios.js # Estrutura de relatórios (em desenvolvimento)
│ └── app.js # Inicialização, navegação, eventos
└── data/
└── indices.js # Vigências (salário mínimo/teto) e índices de reajuste
