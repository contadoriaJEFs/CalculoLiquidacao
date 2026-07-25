// =====================================================================
// DIFERENÇAS – GUIA 4
// =====================================================================

var dadosDiferencas = {
    modoCompensacao: 'limite', // 'limite' ou 'negativo'
    celulasEditadas: {},       // { competencia: { colunaId: valor } }
};

// Função principal para montar a tabela
function montarTabelaDiferencas() {
    // 1. Obter memória da Evolução Devida
    const memoriaDevida = window.memoriaEvolucaoDevida || [];
    if (!memoriaDevida.length) {
        document.getElementById('corpoDiferencas').innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-400">Nenhum cálculo de evolução devida encontrado. Calcule a Evolução Devida primeiro.</td></tr>`;
        document.getElementById('resumoDiferencas').classList.add('hidden');
        return;
    }

    // 2. Obter memórias dos benefícios recebidos
    const beneficiosRecebidos = [];
    document.querySelectorAll('.beneficio-recebido-bloco').forEach(bloco => {
        const resultadoStr = bloco.dataset.resultado;
        if (resultadoStr) {
            try {
                const resultado = JSON.parse(resultadoStr);
                if (resultado.memoria && resultado.memoria.length) {
                    const nb = bloco.querySelector('[data-campo="nb"]')?.value || 'Benefício';
                    const especie = bloco.querySelector('[data-campo="especie"]')?.value || '';
                    const id = bloco.dataset.id || `ben-${beneficiosRecebidos.length+1}`;
                    beneficiosRecebidos.push({
                        id,
                        nb,
                        especie,
                        memoria: resultado.memoria,
                        label: `NB ${nb} ${especie ? 'ESPÉCIE ' + especie : ''}`.trim()
                    });
                }
            } catch(e) {}
        }
    });

    // 3. Montar cabeçalho da tabela (colunas dinâmicas)
    const thead = document.querySelector('#tabelaDiferencas thead tr');
    // Limpar colunas antigas (manter Competência e Benefício Devido)
    const colunasFixas = ['Competência', 'Benefício Devido'];
    // Remover colunas dinâmicas, Total Recebido, Diferença e Observações
    const cabecalhoAtual = thead.querySelectorAll('th');
    // Manter apenas as duas primeiras (Competência e Benefício Devido)
    while (thead.children.length > 2) {
        thead.removeChild(thead.lastChild);
    }

    // Adicionar colunas para cada benefício recebido
    beneficiosRecebidos.forEach((ben, idx) => {
        const th = document.createElement('th');
        th.className = 'p-3 min-w-[110px]';
        th.textContent = ben.label || `Benefício Recebido ${idx+1}`;
        th.dataset.beneficioId = ben.id;
        thead.appendChild(th);
    });

    // Adicionar colunas fixas: Total Recebido, Diferença, Observações
    const thTotal = document.createElement('th');
    thTotal.className = 'p-3 min-w-[110px]';
    thTotal.textContent = 'Total Recebido';
    thead.appendChild(thTotal);

    const thDiff = document.createElement('th');
    thDiff.className = 'p-3 min-w-[110px]';
    thDiff.textContent = 'Diferença Devida';
    thead.appendChild(thDiff);

    const thObs = document.createElement('th');
    thObs.className = 'p-3 min-w-[100px]';
    thObs.textContent = 'Observações';
    thead.appendChild(thObs);

    // 4. Montar corpo da tabela
    const tbody = document.getElementById('corpoDiferencas');
    tbody.innerHTML = '';

    // Mapear memórias por competência para acesso rápido
    const mapMemoriaDevida = {};
    memoriaDevida.forEach(item => {
        mapMemoriaDevida[item.competencia] = item.valorFinal;
    });

    const mapMemoriasRecebidas = {};
    beneficiosRecebidos.forEach(ben => {
        const map = {};
        ben.memoria.forEach(item => {
            map[item.competencia] = item.valorFinal;
        });
        mapMemoriasRecebidas[ben.id] = map;
    });

    // Para cada competência na memória devida, criar uma linha
    const competencias = Object.keys(mapMemoriaDevida).sort(); // ordenar cronologicamente
    let totalDevido = 0;
    let totalRecebido = 0;
    let qtdEditadas = 0;

    competencias.forEach(comp => {
        const devido = mapMemoriaDevida[comp] || 0;
        totalDevido += devido;

        const tr = document.createElement('tr');
        tr.dataset.competencia = comp;

        // Coluna Competência
        const tdComp = document.createElement('td');
        tdComp.className = 'p-3 font-semibold sticky-left bg-white';
        tdComp.textContent = comp;
        tr.appendChild(tdComp);

        // Coluna Benefício Devido
        const tdDevido = document.createElement('td');
        tdDevido.className = 'p-3';
        tdDevido.textContent = formatarNumero(devido);
        tr.appendChild(tdDevido);

        // Colunas para cada benefício recebido
        let somaRecebido = 0;
        const valoresRecebidos = {};

        beneficiosRecebidos.forEach(ben => {
            const td = document.createElement('td');
            td.className = 'p-3';
            td.dataset.beneficioId = ben.id;

            const valorOriginal = mapMemoriasRecebidas[ben.id]?.[comp] || 0;
            let valorExibido = valorOriginal;

            // Verificar se há edição manual para esta célula
            const chaveCelula = `${comp}|${ben.id}`;
            if (dadosDiferencas.celulasEditadas[chaveCelula] !== undefined) {
                valorExibido = dadosDiferencas.celulasEditadas[chaveCelula];
                td.classList.add('celula-editada');
                qtdEditadas++;
            }

            // Criar input editável
            const input = document.createElement('input');
            input.type = 'text';
            input.value = formatarNumero(valorExibido);
            input.className = 'w-full bg-transparent';
            input.addEventListener('focus', function() {
                this.select();
            });
            input.addEventListener('blur', function() {
                let novoValor = parseFloat(this.value.replace(/\./g, '').replace(',', '.'));
                if (isNaN(novoValor)) novoValor = 0;
                novoValor = Math.round(novoValor * 100) / 100;
                const chave = `${comp}|${ben.id}`;
                if (novoValor !== valorOriginal) {
                    dadosDiferencas.celulasEditadas[chave] = novoValor;
                    td.classList.add('celula-editada');
                } else {
                    delete dadosDiferencas.celulasEditadas[chave];
                    td.classList.remove('celula-editada');
                }
                // Recalcular linha
                recalcularLinha(tr, beneficiosRecebidos);
                atualizarResumo();
            });
            td.appendChild(input);
            tr.appendChild(td);

            somaRecebido += valorExibido;
            valoresRecebidos[ben.id] = valorExibido;
        });

        // Total Recebido
        totalRecebido += somaRecebido;
        const tdTotal = document.createElement('td');
        tdTotal.className = 'p-3 font-semibold';
        tdTotal.textContent = formatarNumero(somaRecebido);
        tr.appendChild(tdTotal);

        // Diferença
        let diferenca = 0;
        const modo = dadosDiferencas.modoCompensacao;
        if (modo === 'limite') {
            diferenca = Math.max(0, devido - somaRecebido);
        } else {
            diferenca = devido - somaRecebido;
        }
        const tdDiff = document.createElement('td');
        tdDiff.className = 'p-3 font-bold';
        tdDiff.textContent = formatarNumero(diferenca);
        if (diferenca < 0) tdDiff.style.color = '#dc2626';
        else if (diferenca > 0) tdDiff.style.color = '#16a34a';
        tr.appendChild(tdDiff);

        // Observações (placeholder)
        const tdObs = document.createElement('td');
        tdObs.className = 'p-3 text-slate-400 text-xs';
        tdObs.textContent = '-';
        tr.appendChild(tdObs);

        tbody.appendChild(tr);
    });

    // Atualizar resumo
    document.getElementById('totalDevido').textContent = formatarMoeda(totalDevido);
    document.getElementById('totalRecebido').textContent = formatarMoeda(totalRecebido);
    const diffTotal = totalDevido - totalRecebido;
    document.getElementById('diferencaTotal').textContent = formatarMoeda(diffTotal);
    document.getElementById('qtdCompetencias').textContent = competencias.length;
    document.getElementById('qtdEditadas').textContent = qtdEditadas;
    document.getElementById('resumoDiferencas').classList.remove('hidden');
}

// Função para recalcular uma linha após edição
function recalcularLinha(tr, beneficiosRecebidos) {
    const comp = tr.dataset.competencia;
    const tdDevido = tr.querySelector('td:nth-child(2)');
    const devido = parseFloat(tdDevido.textContent.replace(/\./g, '').replace(',', '.')) || 0;

    let somaRecebido = 0;
    // Percorrer colunas de benefícios (a partir da terceira)
    const tds = tr.querySelectorAll('td');
    // Índices: 0=Competência, 1=Devido, 2..n-3=Benefícios, n-2=Total, n-1=Diferença
    const numBeneficios = beneficiosRecebidos.length;
    for (let i = 0; i < numBeneficios; i++) {
        const td = tds[2 + i];
        const input = td.querySelector('input');
        if (input) {
            const val = parseFloat(input.value.replace(/\./g, '').replace(',', '.')) || 0;
            somaRecebido += val;
        }
    }

    // Atualizar Total
    const tdTotal = tds[2 + numBeneficios];
    tdTotal.textContent = formatarNumero(somaRecebido);

    // Atualizar Diferença
    const tdDiff = tds[3 + numBeneficios];
    let diferenca = 0;
    const modo = dadosDiferencas.modoCompensacao;
    if (modo === 'limite') {
        diferenca = Math.max(0, devido - somaRecebido);
    } else {
        diferenca = devido - somaRecebido;
    }
    tdDiff.textContent = formatarNumero(diferenca);
    if (diferenca < 0) tdDiff.style.color = '#dc2626';
    else if (diferenca > 0) tdDiff.style.color = '#16a34a';
    else tdDiff.style.color = 'inherit';
}

// Atualizar resumo
function atualizarResumo() {
    let totalDevido = 0, totalRecebido = 0, qtdEditadas = 0;
    document.querySelectorAll('#corpoDiferencas tr').forEach(tr => {
        const tds = tr.querySelectorAll('td');
        if (tds.length < 3) return;
        const devido = parseFloat(tds[1].textContent.replace(/\./g, '').replace(',', '.')) || 0;
        const total = parseFloat(tds[tds.length-2].textContent.replace(/\./g, '').replace(',', '.')) || 0;
        totalDevido += devido;
        totalRecebido += total;
        // Contar células editadas
        tds.forEach(td => {
            if (td.classList.contains('celula-editada')) qtdEditadas++;
        });
    });
    document.getElementById('totalDevido').textContent = formatarMoeda(totalDevido);
    document.getElementById('totalRecebido').textContent = formatarMoeda(totalRecebido);
    document.getElementById('diferencaTotal').textContent = formatarMoeda(totalDevido - totalRecebido);
    document.getElementById('qtdEditadas').textContent = qtdEditadas;
}

// Exportar dados da Guia 4
function coletarDadosDiferencas() {
    return {
        modoCompensacao: dadosDiferencas.modoCompensacao,
        celulasEditadas: dadosDiferencas.celulasEditadas
    };
}

// Importar dados da Guia 4
function restaurarDadosDiferencas(dados) {
    if (dados) {
        dadosDiferencas.modoCompensacao = dados.modoCompensacao || 'limite';
        dadosDiferencas.celulasEditadas = dados.celulasEditadas || {};
        // Atualizar radio buttons
        document.querySelector(`input[name="modoCompensacao"][value="${dadosDiferencas.modoCompensacao}"]`).checked = true;
        // Remontar tabela
        montarTabelaDiferencas();
    }
}

// Inicializar eventos da Guia 4
function initGuiaDiferencas() {
    // Modo de compensação
    document.querySelectorAll('input[name="modoCompensacao"]').forEach(radio => {
        radio.addEventListener('change', function() {
            dadosDiferencas.modoCompensacao = this.value;
            montarTabelaDiferencas();
        });
    });

    // Modal Tema 1027 STJ
    const btnTema = document.getElementById('btnTemaSTJ');
    const modal = document.getElementById('modalTemaSTJ');
    const fechar = document.getElementById('fecharModalSTJ');
    if (btnTema && modal && fechar) {
        btnTema.addEventListener('click', () => modal.classList.remove('hidden'));
        fechar.addEventListener('click', () => modal.classList.add('hidden'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }
}

// Chamada automática quando a guia 4 for ativada (app.js)
