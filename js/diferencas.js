// =====================================================================
// GUIA 4 – DIFERENÇAS
// =====================================================================

var modoCompensacao = 'limite'; // 'limite' ou 'negativo'
var celulasEditadas = {};

// =====================================================================
// FUNÇÃO PRINCIPAL – MONTAR TABELA
// =====================================================================
function montarTabelaDiferencas() {
    // 1) Buscar memórias
    const memoriaDevida = obterMemoriaDevida();
    const beneficiosRecebidos = obterMemoriasRecebidas();

    // 2) Se não houver memória devida, exibir mensagem
    if (!memoriaDevida || memoriaDevida.length === 0) {
        exibirMensagemSemDados();
        return;
    }

    // 3) Ordenar competências (crescente)
    const competencias = memoriaDevida.map(item => item.competencia).sort(ordenarCompetencias);

    // 4) Montar cabeçalho
    const cabecalho = montarCabecalho(beneficiosRecebidos);

    // 5) Montar linhas
    const linhas = competencias.map(competencia => {
        const devido = encontrarValor(memoriaDevida, competencia, 'valorFinal');
        const recebidos = beneficiosRecebidos.map(ben => {
            const valor = encontrarValor(ben.memoria, competencia, 'valorFinal');
            // Verificar se há edição manual
            const chave = `${ben.id}_${competencia}`;
            return celulasEditadas[chave] !== undefined ? celulasEditadas[chave] : valor;
        });
        const totalRecebido = recebidos.reduce((s, v) => s + v, 0);
        const diferenca = calcularDiferenca(devido, totalRecebido);
        return {
            competencia,
            devido,
            recebidos,
            totalRecebido,
            diferenca
        };
    });

    // 6) Renderizar tabela
    renderizarTabela(cabecalho, linhas, beneficiosRecebidos);

    // 7) Atualizar resumo
    atualizarResumo(linhas);

    // 8) Restaurar edições salvas no JSON
    restaurarEdicoes();
}

// =====================================================================
// FUNÇÕES AUXILIARES
// =====================================================================
function obterMemoriaDevida() {
    // Busca a memória da Evolução Devida (guia 2)
    // A memória está em window.memoriaDevida (definida em motor-evolucao.js)
    if (window.memoriaDevida && window.memoriaDevida.length > 0) {
        return window.memoriaDevida;
    }
    // Tentar buscar do painel de resultado
    const tbody = document.getElementById('tabelaMemoria');
    if (tbody) {
        const linhas = tbody.querySelectorAll('tr');
        if (linhas.length > 0 && !linhas[0].textContent.includes('Nenhum')) {
            // Extrair dados da tabela (fallback)
            return extrairMemoriaDaTabela(tbody);
        }
    }
    return [];
}

function obterMemoriasRecebidas() {
    const beneficios = [];
    const blocos = document.querySelectorAll('.beneficio-recebido-bloco');
    blocos.forEach(bloco => {
        const nb = bloco.querySelector('[data-campo="nb"]')?.value || 'Sem NB';
        const especie = bloco.querySelector('[data-campo="especie"]')?.value || 'Sem Espécie';
        const resultadoStr = bloco.dataset.resultado;
        let memoria = [];
        if (resultadoStr) {
            try {
                const resultado = JSON.parse(resultadoStr);
                memoria = resultado.memoria || [];
            } catch (e) {}
        }
        // Identificador único
        const id = `ben_${beneficios.length}`;
        beneficios.push({
            id,
            nb,
            especie,
            memoria,
            bloco
        });
    });
    return beneficios;
}

function encontrarValor(memoria, competencia, campo) {
    const item = memoria.find(m => m.competencia === competencia);
    return item ? item[campo] : 0;
}

function ordenarCompetencias(a, b) {
    const [mesA, anoA] = a.split('/').map(Number);
    const [mesB, anoB] = b.split('/').map(Number);
    if (anoA !== anoB) return anoA - anoB;
    return mesA - mesB;
}

function calcularDiferenca(devido, recebido) {
    const diff = devido - recebido;
    if (modoCompensacao === 'limite') {
        return Math.max(0, diff);
    }
    return diff;
}

// =====================================================================
// RENDERIZAÇÃO DA TABELA
// =====================================================================
function montarCabecalho(beneficios) {
    const cols = ['Competência', 'Benefício Devido'];
    beneficios.forEach((ben, idx) => {
        const label = ben.nb && ben.especie ? `${ben.nb} (${ben.especie})` : `Benefício Recebido ${idx + 1}`;
        cols.push(label);
    });
    cols.push('Total Recebido', 'Diferença Devida');
    return cols;
}

function renderizarTabela(cabecalho, linhas, beneficios) {
    const container = document.getElementById('guia-diferencas');
    if (!container) return;

    // Encontrar ou criar o wrapper da tabela
    let tabelaWrapper = container.querySelector('.tabela-diferencas-wrapper');
    if (!tabelaWrapper) {
        tabelaWrapper = document.createElement('div');
        tabelaWrapper.className = 'tabela-diferencas-wrapper overflow-x-auto';
        container.appendChild(tabelaWrapper);
    }

    // Construir tabela
    let html = '<table class="w-full text-left border-collapse text-sm diferencas-tabela">';
    // Cabeçalho
    html += '<thead><tr class="bg-slate-100 text-slate-700 border-b border-slate-200">';
    cabecalho.forEach(col => {
        html += `<th class="p-3 min-w-[100px]">${col}</th>`;
    });
    html += '</tr></thead>';

    // Corpo
    html += '<tbody>';
    linhas.forEach(linha => {
        html += `<tr class="hover:bg-slate-50 transition border-b border-slate-100">`;
        html += `<td class="p-3 font-semibold">${linha.competencia}</td>`;
        html += `<td class="p-3 text-slate-800">${formatarNumero(linha.devido)}</td>`;

        linha.recebidos.forEach((valor, idx) => {
            const benef = beneficios[idx];
            const chave = `${benef.id}_${linha.competencia}`;
            const isEditada = celulasEditadas[chave] !== undefined;
            const classe = isEditada ? 'celula-editada bg-yellow-50' : '';
            html += `<td class="p-3 ${classe} cursor-pointer" data-beneficio="${benef.id}" data-competencia="${linha.competencia}" onclick="editarCelula(this, '${benef.id}', '${linha.competencia}')">${formatarNumero(valor)}</td>`;
        });

        html += `<td class="p-3 font-semibold text-slate-700">${formatarNumero(linha.totalRecebido)}</td>`;
        const diffClass = linha.diferenca < 0 ? 'text-red-600' : 'text-emerald-700';
        html += `<td class="p-3 font-bold ${diffClass}">${formatarNumero(linha.diferenca)}</td>`;
        html += '</tr>';
    });
    html += '</tbody></table>';

    tabelaWrapper.innerHTML = html;
}

// =====================================================================
// EDIÇÃO MANUAL DE CÉLULAS
// =====================================================================
function editarCelula(cell, beneficioId, competencia) {
    const valorAtual = cell.textContent.trim().replace(/[^0-9,.]/g, '').replace(',', '.');
    const valorNumerico = parseFloat(valorAtual) || 0;

    const novoValor = prompt(`Editar valor para ${competencia}:`, formatarNumero(valorNumerico));
    if (novoValor === null) return;

    const numero = parseFloat(novoValor.replace(/[^0-9,.]/g, '').replace(',', '.'));
    if (isNaN(numero)) {
        alert('Valor inválido.');
        return;
    }

    const chave = `${beneficioId}_${competencia}`;
    celulasEditadas[chave] = numero;
    cell.textContent = formatarNumero(numero);
    cell.classList.add('bg-yellow-50');

    // Recalcular totais e diferenças
    recalcularTotais();
    atualizarResumo();
}

function recalcularTotais() {
    // Recalcula totais e diferenças a partir das células
    const linhas = document.querySelectorAll('.diferencas-tabela tbody tr');
    linhas.forEach(tr => {
        const cells = tr.querySelectorAll('td');
        if (cells.length < 3) return;
        // A primeira coluna é Competência, segunda é Devido, as do meio são Recebidos, penúltima Total, última Diferença
        const devido = parseFloat(cells[1].textContent.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;
        let totalRecebido = 0;
        for (let i = 2; i < cells.length - 2; i++) {
            const val = parseFloat(cells[i].textContent.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;
            totalRecebido += val;
        }
        const diferenca = calcularDiferenca(devido, totalRecebido);
        const totalCell = cells[cells.length - 2];
        const diffCell = cells[cells.length - 1];
        totalCell.textContent = formatarNumero(totalRecebido);
        diffCell.textContent = formatarNumero(diferenca);
        const diffClass = diferenca < 0 ? 'text-red-600' : 'text-emerald-700';
        diffCell.className = `p-3 font-bold ${diffClass}`;
    });
}

// =====================================================================
// RESUMO
// =====================================================================
function atualizarResumo(linhas) {
    if (!linhas) {
        linhas = extrairLinhasDaTabela();
    }
    let totalDevido = 0, totalRecebido = 0, totalDiferenca = 0;
    let celulasEditadasCount = Object.keys(celulasEditadas).length;

    linhas.forEach(linha => {
        totalDevido += linha.devido;
        totalRecebido += linha.totalRecebido;
        totalDiferenca += linha.diferenca;
    });

    const resumoDiv = document.getElementById('resumoDiferencas');
    if (resumoDiv) {
        resumoDiv.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                <div>
                    <span class="block text-xs text-slate-500 font-semibold uppercase">Total Devido</span>
                    <span class="font-bold text-slate-800">${formatarMoeda(totalDevido)}</span>
                </div>
                <div>
                    <span class="block text-xs text-slate-500 font-semibold uppercase">Total Recebido</span>
                    <span class="font-bold text-slate-800">${formatarMoeda(totalRecebido)}</span>
                </div>
                <div>
                    <span class="block text-xs text-slate-500 font-semibold uppercase">Diferença Total</span>
                    <span class="font-bold ${totalDiferenca < 0 ? 'text-red-600' : 'text-emerald-700'}">${formatarMoeda(totalDiferenca)}</span>
                </div>
                <div>
                    <span class="block text-xs text-slate-500 font-semibold uppercase">Competências</span>
                    <span class="font-bold text-slate-800">${linhas.length}</span>
                </div>
                <div>
                    <span class="block text-xs text-slate-500 font-semibold uppercase">Células Editadas</span>
                    <span class="font-bold text-slate-800">${celulasEditadasCount}</span>
                </div>
            </div>
        `;
    }
}

// =====================================================================
// MODO DE COMPENSAÇÃO
// =====================================================================
function alterarModoCompensacao(modo) {
    modoCompensacao = modo;
    document.querySelectorAll('.btn-modo-compensacao').forEach(btn => {
        btn.classList.toggle('bg-blue-600', btn.dataset.modo === modo);
        btn.classList.toggle('bg-slate-300', btn.dataset.modo !== modo);
    });
    // Recalcular diferenças
    recalcularTotais();
    atualizarResumo();
}

// =====================================================================
// TEMA 692 STJ – MODAL
// =====================================================================
function abrirModalTema692() {
    const modal = document.getElementById('modalTema692');
    if (modal) modal.classList.remove('hidden');
}

function fecharModalTema692() {
    const modal = document.getElementById('modalTema692');
    if (modal) modal.classList.add('hidden');
}

// =====================================================================
// JSON – SALVAR E RESTAURAR
// =====================================================================
function salvarDadosDiferencas() {
    return {
        modoCompensacao: modoCompensacao,
        celulasEditadas: celulasEditadas
    };
}

function restaurarDadosDiferencas(dados) {
    if (!dados) return;
    if (dados.modoCompensacao) {
        modoCompensacao = dados.modoCompensacao;
        document.querySelectorAll('.btn-modo-compensacao').forEach(btn => {
            btn.classList.toggle('bg-blue-600', btn.dataset.modo === modoCompensacao);
            btn.classList.toggle('bg-slate-300', btn.dataset.modo !== modoCompensacao);
        });
    }
    if (dados.celulasEditadas) {
        celulasEditadas = dados.celulasEditadas;
    }
    // Recarregar tabela para aplicar edições
    montarTabelaDiferencas();
}

// =====================================================================
// INICIALIZAÇÃO
// =====================================================================
function initDiferencas() {
    // Garantir que a tabela seja montada ao ativar a guia
    const observer = new MutationObserver(() => {
        const guia = document.getElementById('guia-diferencas');
        if (guia && guia.classList.contains('ativo')) {
            montarTabelaDiferencas();
        }
    });
    observer.observe(document.getElementById('guia-diferencas'), { attributes: true, attributeFilter: ['class'] });
    // Montar se já estiver ativa
    if (document.getElementById('guia-diferencas').classList.contains('ativo')) {
        montarTabelaDiferencas();
    }
}

// Executar na inicialização
document.addEventListener('DOMContentLoaded', initDiferencas);