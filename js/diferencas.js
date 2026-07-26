// =====================================================================
// DIFERENÇAS – GUIA 4 (FASE 1.5 – PROPORCIONALIDADE)
// =====================================================================

var dadosDiferencas = {
    modoCompensacao: 'limite',
    celulasEditadas: {},
};

// =====================================================================
// FUNÇÕES AUXILIARES DE PROPORCIONALIDADE (MÊS COMERCIAL 30 DIAS)
// =====================================================================

function normalizarDia30(dia) {
    // Converte dia 31 para 30; qualquer dia >30 vira 30.
    return Math.min(dia, 30);
}

function parseDataProporcional(str) {
    // Retorna { dia, mes, ano } ou null.
    if (!str) return null;
    let limpo = str.trim().replace(/\D/g, '');
    if (limpo.length === 6) { // MM/AAAA
        let mes = parseInt(limpo.substring(0, 2), 10);
        let ano = parseInt(limpo.substring(2, 6), 10);
        if (mes < 1 || mes > 12 || ano < 1900) return null;
        return { dia: 1, mes, ano };
    }
    if (limpo.length === 8) { // DD/MM/AAAA
        let dia = parseInt(limpo.substring(0, 2), 10);
        let mes = parseInt(limpo.substring(2, 4), 10);
        let ano = parseInt(limpo.substring(4, 8), 10);
        if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || ano < 1900) return null;
        dia = normalizarDia30(dia);
        return { dia, mes, ano };
    }
    return null;
}

function calcularFracaoInicial(dia) {
    // Data inicial: dias ativos = 30 - dia + 1
    return (30 - dia + 1) / 30;
}

function calcularFracaoFinal(dia) {
    // Data final: dias ativos = dia
    return dia / 30;
}

function calcularDiasAtivos(inicio1, fim1, inicio2, fim2) {
    // Interseção de dois intervalos [inicio, fim] inclusivos, dentro de um mês de 30 dias.
    // Retorna número de dias em comum.
    const ini = Math.max(inicio1, inicio2);
    const fim = Math.min(fim1, fim2);
    if (ini > fim) return 0;
    return fim - ini + 1;
}

// =====================================================================
// FUNÇÃO AUXILIAR PARA CONVERTER COMPETÊNCIA
// =====================================================================
function converterCompetenciaParaNumero(str) {
    if (!str) return NaN;
    const partes = str.split('/');
    let mes, ano;
    if (partes.length === 3) {
        mes = parseInt(partes[1], 10);
        ano = parseInt(partes[2], 10);
    } else if (partes.length === 2) {
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

// Obtém o valor vigente em uma competência a partir de uma memória de reajustes (carry-over)
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

// Obtém o valor integral do benefício recebido para uma competência, considerando DIB, DCB e DIP.
function obterValorBeneficioRecebido(ben, comp, dataFinal) {
    if (!ben.dib) return 0;

    const compNum = converterCompetenciaParaNumero(comp);
    const dibNum = converterCompetenciaParaNumero(ben.dib);
    let dcbNum = Infinity;

    if (isNaN(compNum) || isNaN(dibNum)) return 0;

    // DIP: se existir, a competência deve ser >= mês do DIP para ter valor
    if (ben.dip) {
        const dipNum = converterCompetenciaParaNumero(ben.dip);
        if (!isNaN(dipNum) && compNum < dipNum) {
            return 0; // antes do DIP -> zero
        }
    }

    if (ben.dcb) {
        const dcbParsed = converterCompetenciaParaNumero(ben.dcb);
        if (!isNaN(dcbParsed)) dcbNum = dcbParsed;
    } else {
        const dataFinalParsed = converterCompetenciaParaNumero(dataFinal);
        if (!isNaN(dataFinalParsed)) dcbNum = dataFinalParsed;
    }

    if (compNum < dibNum || compNum > dcbNum) {
        return 0;
    }

    if (ben.memoria && ben.memoria.length > 0) {
        return obterValorVigente(ben.memoria, comp, ben.rmi || 0);
    }

    return ben.rmaFinal || ben.rmi || 0;
}

// =====================================================================
// FUNÇÃO PRINCIPAL: MONTAR TABELA DE DIFERENÇAS (COM PROPORCIONALIDADE)
// =====================================================================

function montarTabelaDiferencas() {
    const tbody = document.getElementById('corpoDiferencas');
    const resumoDiv = document.getElementById('resumoDiferencas');

    const termoInicialStr = document.getElementById('termoInicialDiferencas').value;
    const dataFinalStr = document.getElementById('dataFinal').value;

    if (!termoInicialStr || !dataFinalStr) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-400">Defina o Termo Inicial das Diferenças e a Data Final de Evolução na guia Entradas.</td></tr>`;
        resumoDiv.classList.add('hidden');
        return;
    }

    // Parse do Termo Inicial (pode ter dia)
    const termoObj = parseDataProporcional(termoInicialStr);
    if (!termoObj) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-red-500">Termo Inicial inválido. Use MM/AAAA ou DD/MM/AAAA.</td></tr>`;
        resumoDiv.classList.add('hidden');
        return;
    }

    const termoMesAno = String(termoObj.mes).padStart(2,'0') + '/' + termoObj.ano;
    const listaCompetencias = gerarCompetencias(termoMesAno, dataFinalStr);
    if (listaCompetencias.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-400">O Termo Inicial não pode ser posterior à Data Final.</td></tr>`;
        resumoDiv.classList.add('hidden');
        return;
    }

    // Benefício devido
    const memoriaDevida = window.memoriaEvolucaoDevida || [];
    const rmiDevida = parseFloat(document.getElementById('rmi').value.replace(/\./g, '').replace(',', '.')) || 0;
    const dibDevidaStr = document.getElementById('dib').value;
    const dibDevidaObj = parseDataProporcional(dibDevidaStr);
    const dibDevidaMesAno = dibDevidaObj ? String(dibDevidaObj.mes).padStart(2,'0') + '/' + dibDevidaObj.ano : null;
    const dibDevidaDia = dibDevidaObj ? dibDevidaObj.dia : 1;

    // Coleta de benefícios recebidos
    const beneficiosRecebidos = [];
    const blocos = document.querySelectorAll('.beneficio-recebido-bloco');
    blocos.forEach(bloco => {
        const nb = bloco.querySelector('[data-campo="nb"]')?.value || 'Benefício';
        const especie = bloco.querySelector('[data-campo="especie"]')?.value || '';
        const id = bloco.dataset.id || `ben-${beneficiosRecebidos.length+1}`;
        const dib = bloco.querySelector('[data-campo="dib"]')?.value || '';
        const dip = bloco.querySelector('[data-campo="dip"]')?.value || '';
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
            memoria,
            label: `NB ${nb} ${especie ? 'ESPÉCIE ' + especie : ''}`.trim(),
            dib,
            dip,
            dcb,
            rmi,
            rmaFinal
        });
    });

    // Montar cabeçalho da tabela
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

    // Montar corpo
    tbody.innerHTML = '';
    let totalDevido = 0;
    let totalRecebido = 0;
    let rowIndex = 0;

    listaCompetencias.forEach(comp => {
        // Parse da competência (mês/ano)
        const [mesStr, anoStr] = comp.split('/');
        const mes = parseInt(mesStr, 10);
        const ano = parseInt(anoStr, 10);

        // --- Determinar período de apuração (influenciado pelo Termo Inicial) ---
        let inicioApuração = 1;
        let fimApuração = 30;
        if (comp === termoMesAno) {
            // Primeiro mês: inicia no dia do Termo Inicial
            inicioApuração = termoObj.dia;
        }

        // --- VALOR DEVIDO (proporcional) ---
        let devidoIntegral = 0;
        if (dibDevidaObj && comp >= dibDevidaMesAno) {
            devidoIntegral = obterValorVigente(memoriaDevida, comp, rmiDevida);
        }
        let fracDevido = 0;
        if (devidoIntegral > 0) {
            if (comp === dibDevidaMesAno) {
                // Mês da DIB: vigência do devido inicia no dia da DIB
                const inicioDevido = dibDevidaDia;
                const fimDevido = 30;
                const dias = calcularDiasAtivos(inicioApuração, fimApuração, inicioDevido, fimDevido);
                fracDevido = dias / 30;
            } else {
                // Mês integral (se a competência for posterior à DIB)
                const dias = calcularDiasAtivos(inicioApuração, fimApuração, 1, 30);
                fracDevido = dias / 30;
            }
        }
        const devidoProrratado = devidoIntegral * fracDevido;
        totalDevido += devidoProrratado;

        // --- VALORES RECEBIDOS (proporcional) ---
        let somaRecebido = 0;
        const valoresRecebidos = [];
        beneficiosRecebidos.forEach(ben => {
            const benDibObj = parseDataProporcional(ben.dib);
            const benDcbObj = ben.dcb ? parseDataProporcional(ben.dcb) : null;
            const benDipObj = ben.dip ? parseDataProporcional(ben.dip) : null;

            // Data efetiva de início: DIP se existir, senão DIB
            const inicioEfetivo = benDipObj || benDibObj;
            if (!inicioEfetivo) {
                valoresRecebidos.push(0);
                return;
            }
            const inicioMesAno = String(inicioEfetivo.mes).padStart(2,'0') + '/' + inicioEfetivo.ano;
            const inicioDia = inicioEfetivo.dia;

            // Data final efetiva: DCB ou fim do mês da Data Final
            let fimEfetivo = null;
            let fimDia = 30;
            if (benDcbObj) {
                fimEfetivo = benDcbObj;
                fimDia = fimEfetivo.dia;
            } else {
                // Se não tem DCB, considera até a Data Final (mês cheio)
                fimEfetivo = { mes: parseInt(dataFinalStr.split('/')[0]), ano: parseInt(dataFinalStr.split('/')[1]) };
                fimDia = 30;
            }
            const fimMesAno = String(fimEfetivo.mes).padStart(2,'0') + '/' + fimEfetivo.ano;

            // Obter valor integral para esta competência
            let valorIntegral = 0;
            if (comp >= inicioMesAno && comp <= fimMesAno) {
                valorIntegral = obterValorBeneficioRecebido(ben, comp, dataFinalStr);
            }

            let fracRecebido = 0;
            if (valorIntegral > 0) {
                let inicioRecebido = 1;
                let fimRecebido = 30;
                if (comp === inicioMesAno) {
                    inicioRecebido = inicioDia;
                }
                if (comp === fimMesAno && benDcbObj) {
                    fimRecebido = fimDia;
                }
                const dias = calcularDiasAtivos(inicioApuração, fimApuração, inicioRecebido, fimRecebido);
                fracRecebido = dias / 30;
            }
            const valorProrratado = valorIntegral * fracRecebido;
            valoresRecebidos.push(valorProrratado);
            somaRecebido += valorProrratado;
        });

        totalRecebido += somaRecebido;

        // --- DIFERENÇA ---
        let diferenca = 0;
        if (dadosDiferencas.modoCompensacao === 'limite') {
            diferenca = Math.max(0, devidoProrratado - somaRecebido);
        } else {
            diferenca = devidoProrratado - somaRecebido;
        }

        // --- CRIAR LINHA ---
        const tr = document.createElement('tr');
        tr.dataset.competencia = comp;
        tr.className = (rowIndex % 2 === 0) ? 'bg-gray-100 hover:bg-blue-100' : 'bg-white hover:bg-blue-100';
        rowIndex++;

        const tdComp = document.createElement('td');
        tdComp.className = 'p-3 font-semibold sticky-left bg-inherit';
        tdComp.textContent = comp;
        tr.appendChild(tdComp);

        const tdDevido = document.createElement('td');
        tdDevido.className = 'p-3';
        tdDevido.textContent = formatarNumero(devidoProrratado);
        tr.appendChild(tdDevido);

        // Colunas dos recebidos
        beneficiosRecebidos.forEach((ben, idx) => {
            const td = document.createElement('td');
            td.className = 'p-3';
            td.dataset.beneficioId = ben.id;

            const valorOriginal = valoresRecebidos[idx] || 0;
            let valorExibido = valorOriginal;
            const chaveCelula = `${comp}|${ben.id}`;
            if (dadosDiferencas.celulasEditadas[chaveCelula] !== undefined) {
                valorExibido = dadosDiferencas.celulasEditadas[chaveCelula];
                td.classList.add('celula-editada');
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
        });

        // Total Recebido
        const tdTotal = document.createElement('td');
        tdTotal.className = 'p-3 font-semibold';
        tdTotal.textContent = formatarNumero(somaRecebido);
        tr.appendChild(tdTotal);

        // Diferença
        const tdDiff = document.createElement('td');
        tdDiff.className = 'p-3 font-bold';
        tdDiff.textContent = formatarNumero(diferenca);
        if (diferenca < 0) tdDiff.style.color = '#dc2626';
        else if (diferenca > 0) tdDiff.style.color = '#16a34a';
        tr.appendChild(tdDiff);

        // Observações
        const tdObs = document.createElement('td');
        tdObs.className = 'p-3 text-slate-400 text-xs';
        tdObs.textContent = '-';
        tr.appendChild(tdObs);

        tbody.appendChild(tr);
    });

    // Atualizar resumo
    document.getElementById('qtdCompetencias').textContent = listaCompetencias.length;
    resumoDiv.classList.remove('hidden');
    atualizarResumo();
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
    let totalDevido = 0, totalRecebido = 0, diferencaTotal = 0, qtdEditadas = 0;
    
    document.querySelectorAll('#corpoDiferencas tr').forEach(tr => {
        const tds = tr.querySelectorAll('td');
        if (tds.length < 3) return;
        const devido = parseFloat(tds[1].textContent.replace(/\./g, '').replace(',', '.')) || 0;
        const total = parseFloat(tds[tds.length-2].textContent.replace(/\./g, '').replace(',', '.')) || 0;
        totalDevido += devido;
        totalRecebido += total;
        if (dadosDiferencas.modoCompensacao === 'limite') {
            diferencaTotal += Math.max(0, devido - total);
        } else {
            diferencaTotal += (devido - total);
        }
        tds.forEach(td => {
            if (td.classList.contains('celula-editada')) qtdEditadas++;
        });
    });
    
    document.getElementById('totalDevido').textContent = formatarMoeda(totalDevido);
    document.getElementById('totalRecebido').textContent = formatarMoeda(totalRecebido);
    document.getElementById('diferencaTotal').textContent = formatarMoeda(diferencaTotal);
    document.getElementById('qtdEditadas').textContent = qtdEditadas;
}

// =====================================================================
// EXPORTAR E IMPORTAR DADOS DA GUIA 4
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
