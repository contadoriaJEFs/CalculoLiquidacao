// =====================================================================
// DIFERENÇAS – GUIA 4 (CORREÇÃO CONCEITUAL - GRADE CONTÍNUA)
// =====================================================================

var dadosDiferencas = {
    modoCompensacao: 'limite', // 'limite' ou 'negativo'
    celulasEditadas: {},       // { "competencia|beneficioId": valor }
};

// =====================================================================
// FUNÇÃO AUXILIAR PARA CONVERTER COMPETÊNCIA (ACEITA MM/AAAA OU DD/MM/AAAA)
// =====================================================================
function converterCompetenciaParaNumero(str) {
    if (!str) return NaN;
    const partes = str.split('/');
    let mes, ano;
    if (partes.length === 3) {
        // Formato DD/MM/AAAA
        mes = parseInt(partes[1], 10);
        ano = parseInt(partes[2], 10);
    } else if (partes.length === 2) {
        // Formato MM/AAAA
        mes = parseInt(partes[0], 10);
        ano = parseInt(partes[1], 10);
    } else {
        return NaN;
    }
    if (isNaN(mes) || isNaN(ano) || mes < 1 || mes > 12 || ano < 1900) return NaN;
    return ano * 100 + mes;
}

// =====================================================================
// FUNÇÕES AUXILIARES PARA GRADE DE COMPETÊNCIAS
// =====================================================================

// Gera lista de competências MM/AAAA entre duas datas
function gerarCompetencias(inicio, fim) {
    if (!inicio || !fim) return [];
    const parse = (s) => {
        let partes = s.split('/');
        return { mes: parseInt(partes[0], 10), ano: parseInt(partes[1], 10) };
    };
    const start = parse(inicio);
    const end = parse(fim);
    if (start.ano > end.ano || (start.ano === end.ano && start.mes > end.mes)) return [];

    const lista = [];
    let currentMes = start.mes;
    let currentAno = start.ano;
    const endMonths = end.ano * 12 + end.mes;

    while (currentAno * 12 + currentMes <= endMonths) {
        lista.push(String(currentMes).padStart(2, '0') + '/' + currentAno);
        if (currentMes === 12) {
            currentMes = 1;
            currentAno++;
        } else {
            currentMes++;
        }
    }
    return lista;
}

// Obtém o valor vigente em uma competência a partir de uma memória de reajustes
// Aplica carry-over progressivo (valor do último reajuste anterior ou igual à competência)
// Se não houver reajuste anterior, retorna o valor padrão (RMI)
function obterValorVigente(memoria, competencia, valorPadrao) {
    if (!memoria || memoria.length === 0) return valorPadrao || 0;

    let valor = valorPadrao || 0;
    const numComp = converterCompetenciaParaNumero(competencia);

    for (let item of memoria) {
        const numItem = converterCompetenciaParaNumero(item.competencia);
        if (!isNaN(numItem) && numItem <= numComp) {
            valor = item.valorFinal;
        } else {
            break;
        }
    }
    return valor;
}

// Obtém o valor de um benefício recebido na competência, respeitando DIB e DCB
// Se a memória estiver vazia, usa o RMA final (que é igual ao RMI)
function obterValorBeneficioRecebido(ben, comp, dataFinal) {
    // Se não tem DIB, não há como saber o período
    if (!ben.dib) return 0;

    const compNum = converterCompetenciaParaNumero(comp);
    const dibNum = converterCompetenciaParaNumero(ben.dib);
    let dcbNum = Infinity;

    // Se a conversão falhar, retorna 0
    if (isNaN(compNum) || isNaN(dibNum)) return 0;

    if (ben.dcb) {
        const dcbParsed = converterCompetenciaParaNumero(ben.dcb);
        if (!isNaN(dcbParsed)) dcbNum = dcbParsed;
    } else {
        // Se não tem DCB, considerar ativo até a Data Final da Evolução
        const dataFinalParsed = converterCompetenciaParaNumero(dataFinal);
        if (!isNaN(dataFinalParsed)) dcbNum = dataFinalParsed;
    }

    // Verificar se a competência está dentro do período de existência do benefício
    if (compNum < dibNum || compNum > dcbNum) {
        return 0;
    }

    // Se a memória não estiver vazia, usar carry-over
    if (ben.memoria && ben.memoria.length > 0) {
        return obterValorVigente(ben.memoria, comp, ben.rmi || 0);
    }

    // Se a memória estiver vazia, o valor é constante (RMI ou RMA final)
    return ben.rmaFinal || ben.rmi || 0;
}

// =====================================================================
// FUNÇÃO PRINCIPAL: MONTAR TABELA DE DIFERENÇAS
// =====================================================================

function montarTabelaDiferencas() {
    const tbody = document.getElementById('corpoDiferencas');
    const resumoDiv = document.getElementById('resumoDiferencas');

    // 1. Obter período da grade
    const termoInicial = document.getElementById('termoInicialDiferencas').value;
    const dataFinal = document.getElementById('dataFinal').value;

    if (!termoInicial || !dataFinal) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-400">Defina o Termo Inicial das Diferenças e a Data Final de Evolução na guia Entradas.</td></tr>`;
        resumoDiv.classList.add('hidden');
        return;
    }

    const listaCompetencias = gerarCompetencias(termoInicial, dataFinal);
    if (listaCompetencias.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-400">O Termo Inicial não pode ser posterior à Data Final.</td></tr>`;
        resumoDiv.classList.add('hidden');
        return;
    }

    // 2. Obter memória da Evolução Devida e RMI
    const memoriaDevida = window.memoriaEvolucaoDevida || [];
    const rmiDevida = parseFloat(document.getElementById('rmi').value.replace(/\./g, '').replace(',', '.')) || 0;

    // 3. Coleta de benefícios recebidos
    const beneficiosRecebidos = [];
    const blocos = document.querySelectorAll('.beneficio-recebido-bloco');
    console.log('[Guia 4] Blocos de benefícios recebidos encontrados:', blocos.length);

    blocos.forEach(bloco => {
        const nb = bloco.querySelector('[data-campo="nb"]')?.value || 'Benefício';
        const especie = bloco.querySelector('[data-campo="especie"]')?.value || '';
        const id = bloco.dataset.id || `ben-${beneficiosRecebidos.length+1}`;
        const dib = bloco.querySelector('[data-campo="dib"]')?.value || '';
        const dcb = bloco.querySelector('[data-campo="dcb"]')?.value || '';
        const rmiStr = bloco.querySelector('[data-campo="rmi"]')?.value || '0';
        const rmi = parseFloat(rmiStr.replace(/\./g, '').replace(',', '.')) || 0;

        const resultadoStr = bloco.dataset.resultado;
        let memoria = [];
        let rmaFinal = rmi;

        if (resultadoStr) {
            try {
                const resultado = JSON.parse(resultadoStr);
                memoria = resultado.memoria || [];
                rmaFinal = resultado.rmaFinal || rmi;
            } catch(e) {
                console.warn('[Guia 4] Erro ao parsear resultado do bloco', id, e);
            }
        }

        beneficiosRecebidos.push({
            id,
            nb,
            especie,
            memoria: memoria,
            label: `NB ${nb} ${especie ? 'ESPÉCIE ' + especie : ''}`.trim(),
            dib,
            dcb,
            rmi,
            rmaFinal: rmaFinal
        });
    });

    console.log('[Guia 4] Total de benefícios recebidos carregados:', beneficiosRecebidos.length);

    // 4. Montar cabeçalho da tabela (colunas dinâmicas)
    const thead = document.querySelector('#tabelaDiferencas thead tr');
    while (thead.children.length > 2) {
        thead.removeChild(thead.lastChild);
    }

    beneficiosRecebidos.forEach((ben, idx) => {
        const th = document.createElement('th');
        th.className = 'p-3 min-w-[110px]';
        th.textContent = ben.label || `Benefício Recebido ${idx+1}`;
        th.dataset.beneficioId = ben.id;
        thead.appendChild(th);
    });

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

    // 5. Montar corpo da tabela (grade contínua)
    tbody.innerHTML = '';

    let totalDevido = 0;
    let totalRecebido = 0;
    let qtdEditadas = 0;
    let rowIndex = 0;

    listaCompetencias.forEach(comp => {
        const devido = obterValorVigente(memoriaDevida, comp, rmiDevida);
        totalDevido += devido;

        const tr = document.createElement('tr');
        tr.dataset.competencia = comp;
        tr.className = (rowIndex % 2 === 0) ? 
            'bg-gray-100 hover:bg-blue-100' : 
            'bg-white hover:bg-blue-100';
        rowIndex++;

        const tdComp = document.createElement('td');
        tdComp.className = 'p-3 font-semibold sticky-left bg-inherit';
        tdComp.textContent = comp;
        tr.appendChild(tdComp);

        const tdDevido = document.createElement('td');
        tdDevido.className = 'p-3';
        tdDevido.textContent = formatarNumero(devido);
        tr.appendChild(tdDevido);

        let somaRecebido = 0;

        beneficiosRecebidos.forEach(ben => {
            const td = document.createElement('td');
            td.className = 'p-3';
            td.dataset.beneficioId = ben.id;

            const valorOriginal = obterValorBeneficioRecebido(ben, comp, dataFinal);
            let valorExibido = valorOriginal;

            const chaveCelula = `${comp}|${ben.id}`;
            if (dadosDiferencas.celulasEditadas[chaveCelula] !== undefined) {
                valorExibido = dadosDiferencas.celulasEditadas[chaveCelula];
                td.classList.add('celula-editada');
                qtdEditadas++;
            }

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
                recalcularLinha(tr, beneficiosRecebidos);
                atualizarResumo();
            });
            td.appendChild(input);
            tr.appendChild(td);

            somaRecebido += valorExibido;
        });

        totalRecebido += somaRecebido;
        const tdTotal = document.createElement('td');
        tdTotal.className = 'p-3 font-semibold';
        tdTotal.textContent = formatarNumero(somaRecebido);
        tr.appendChild(tdTotal);

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

        const tdObs = document.createElement('td');
        tdObs.className = 'p-3 text-slate-400 text-xs';
        tdObs.textContent = '-';
        tr.appendChild(tdObs);

        tbody.appendChild(tr);
    });

    document.getElementById('totalDevido').textContent = formatarMoeda(totalDevido);
    document.getElementById('totalRecebido').textContent = formatarMoeda(totalRecebido);
    const diffTotal = totalDevido - totalRecebido;
    document.getElementById('diferencaTotal').textContent = formatarMoeda(diffTotal);
    document.getElementById('qtdCompetencias').textContent = listaCompetencias.length;
    document.getElementById('qtdEditadas').textContent = qtdEditadas;
    resumoDiv.classList.remove('hidden');
}

// =====================================================================
// RECALCULAR LINHA APÓS EDIÇÃO MANUAL
// =====================================================================

function recalcularLinha(tr, beneficiosRecebidos) {
    const comp = tr.dataset.competencia;
    const tds = tr.querySelectorAll('td');
    const numBeneficios = beneficiosRecebidos.length;

    const devido = parseFloat(tds[1].textContent.replace(/\./g, '').replace(',', '.')) || 0;

    let somaRecebido = 0;
    for (let i = 0; i < numBeneficios; i++) {
        const td = tds[2 + i];
        const input = td.querySelector('input');
        if (input) {
            const val = parseFloat(input.value.replace(/\./g, '').replace(',', '.')) || 0;
            somaRecebido += val;
        }
    }

    const tdTotal = tds[2 + numBeneficios];
    tdTotal.textContent = formatarNumero(somaRecebido);

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

// =====================================================================
// ATUALIZAR RESUMO GERAL
// =====================================================================

function atualizarResumo() {
    let totalDevido = 0, totalRecebido = 0, qtdEditadas = 0;
    document.querySelectorAll('#corpoDiferencas tr').forEach(tr => {
        const tds = tr.querySelectorAll('td');
        if (tds.length < 3) return;
        const devido = parseFloat(tds[1].textContent.replace(/\./g, '').replace(',', '.')) || 0;
        const total = parseFloat(tds[tds.length-2].textContent.replace(/\./g, '').replace(',', '.')) || 0;
        totalDevido += devido;
        totalRecebido += total;
        tds.forEach(td => {
            if (td.classList.contains('celula-editada')) qtdEditadas++;
        });
    });
    document.getElementById('totalDevido').textContent = formatarMoeda(totalDevido);
    document.getElementById('totalRecebido').textContent = formatarMoeda(totalRecebido);
    document.getElementById('diferencaTotal').textContent = formatarMoeda(totalDevido - totalRecebido);
    document.getElementById('qtdEditadas').textContent = qtdEditadas;
}

// =====================================================================
// EXPORTAR E IMPORTAR DADOS DA GUIA 4 (PERSISTÊNCIA JSON)
// =====================================================================

function coletarDadosDiferencas() {
    return {
        modoCompensacao: dadosDiferencas.modoCompensacao,
        celulasEditadas: dadosDiferencas.celulasEditadas
    };
}

function restaurarDadosDiferencas(dados) {
    if (dados) {
        dadosDiferencas.modoCompensacao = dados.modoCompensacao || 'limite';
        dadosDiferencas.celulasEditadas = dados.celulasEditadas || {};
        const radio = document.querySelector(`input[name="modoCompensacao"][value="${dadosDiferencas.modoCompensacao}"]`);
        if (radio) radio.checked = true;
        montarTabelaDiferencas();
    }
}

// =====================================================================
// INICIALIZAR EVENTOS DA GUIA 4
// =====================================================================

function initGuiaDiferencas() {
    document.querySelectorAll('input[name="modoCompensacao"]').forEach(radio => {
        radio.addEventListener('change', function() {
            dadosDiferencas.modoCompensacao = this.value;
            montarTabelaDiferencas();
        });
    });

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
