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



## 📂 Onde ficam os dados

- **Índices de reajuste** – `data/indices.js` (constante `BASE_INTERNA`).
- **Vigências (salário mínimo e teto)** – `data/indices.js` (constante `VIGENCIAS`).
- **Dados do caso** – exportados/importados via JSON na guia **Entradas**.

## 🧩 Onde implementar novas funcionalidades

- **Benefícios Recebidos** – `js/beneficios-recebidos.js` e guia correspondente.
- **Diferenças** – futura guia e módulo em `js/diferencas.js`.
- **Atualização (correção/juros)** – futura guia e módulo em `js/atualizacao.js`.
- **Acordo/Renúncia** – futura guia e módulo em `js/acordo-renuncia.js`.
- **Relatórios** – `js/relatorios.js` (geração de PDF futura).

## ⚠️ Atenção

O motor de cálculo (`js/motor-evolucao.js`) está **homologado** e não deve ser alterado. Qualquer modificação nos índices ou vigências deve ser feita exclusivamente em `data/indices.js`.

---

**Versão:** 3.1 – preparada para GitHub Pages.
