// =====================================================================
// MOTOR DE EVOLUÇÃO PREVIDENCIÁRIA (HOMOLOGADO)
// =====================================================================

// Estado global do motor
var indicesAtivos = BASE_INTERNA;
var fonteIndices = 'interna';
var dataFinalAlteradaManualmente = false;
var termoInicialManual = false;
var estadoTermoInicial = {
    valor: '',
    manual: false,
    origem: 'automatico'
};

function definirTermoInicial(valor, origem) {
    estadoTermoInicial.valor = valor;
    estadoTermoInicial.origem = origem;
    estadoTermoInicial.manual = (origem === 'manual');

    const campo1 = document.getElementById('termoInicialDiferencas');
    const campo2 = document.getElementById('termoInicialDiferencas2');
    if (campo1) campo1.value = valor;
    if (campo2) campo2.value = valor;

    const status1 = document.getElementById('statusTermoPrincipal');
    const status2 = document.getElementById('statusTermoBeneficio');
    if (origem === 'manual') {
        if (status1) status1.textContent = 'Termo informado manualmente.';
        if (status2) status2.textContent = 'Termo informado manualmente.';
    } else {
        if (status1) status1.textContent = 'Termo calculado automaticamente.';
        if (status2) status2.textContent = 'Termo calculado automaticamente.';
    }
}

function alternarModoTermoInicial(cadeadoClicado) {
    const cadeados = document.querySelectorAll('.cadeado');
    const campos = document.querySelectorAll('#termoInicialDiferencas, #termoInicialDiferencas2');
    const estaAberto = cadeadoClicado.classList.contains('aberto');

    if (estaAberto) {
        cadeados.forEach(el => {
            el.classList.remove('aberto');
            el.classList.add('fechado');
            el.textContent = '🔒';
        });
        campos.forEach(el => {
            if (el) {
                el.readOnly = true;
                el.classList.remove('bg-white');
                el.classList.add('bg-slate-50');
            }
        });
        termoInicialManual = false;
        calcularTermoInicial();
    } else {
        cadeados.forEach(el => {
            el.classList.remove('fechado');
            el.classList.add('aberto');
            el.textContent = '🔓';
        });
        campos.forEach(el => {
            if (el) {
                el.readOnly = false;
                el.classList.remove('bg-slate-50');
                el.classList.add('bg-white');
            }
        });
        termoInicialManual = true;
        const valorAtual = document.getElementById('termoInicialDiferencas').value;
        definirTermoInicial(valorAtual, 'manual');
    }
}

function sincronizarTermoInicial(campoOrigem) {
    if (!termoInicialManual) return;
    const valor = campoOrigem.value;
    const valido = /^\d{2}\/\d{4}$/.test(valor);
    if (valido) {
        const partes = valor.split('/');
        const mes = parseInt(partes[0], 10);
        const ano = parseInt(partes[1], 10);
        if (mes >= 1 && mes <= 12 && ano >= 1900 && ano <= 2100) {
            const outro = campoOrigem.id === 'termoInicialDiferencas' ?
                document.getElementById('termoInicialDiferencas2') :
                document.getElementById('termoInicialDiferencas');
            if (outro && outro.value !== valor) {
                outro.value = valor;
            }
            estadoTermoInicial.valor = valor;
            estadoTermoInicial.manual = true;
            estadoTermoInicial.origem = 'manual';
            return;
        }
    }
}

function calcularTermoInicial() {
    if (termoInicialManual) return;

    const aplicarPrescricao = document.getElementById('aplicarPrescricao').value === 'sim';
    const prazo = parseInt(document.getElementById('prazoPrescricional').value) || 5;
    const strDib = document.getElementById('dib').value;
    const dibObj = parseDataFlexivel(strDib, true);
    if (!dibObj) return;

    let termoMes = dibObj.mes;
    let termoAno = dibObj.ano;

    if (aplicarPrescricao) {
        const strAjuizamento = document.getElementById('dataAjuizamento').value;
        const ajuizamentoObj = parseDataFlexivel(strAjuizamento, true);
        if (ajuizamentoObj) {
            let anoMarco = ajuizamentoObj.ano - prazo;
            let mesMarco = ajuizamentoObj.mes;
            while (mesMarco < 1) { mesMarco += 12; anoMarco--; }
            const chaveDib = getChaveCronologica(dibObj.mes, dibObj.ano);
            const chaveMarco = getChaveCronologica(mesMarco, anoMarco);
            if (chaveMarco > chaveDib) {
                termoMes = mesMarco;
                termoAno = anoMarco;
            }
        }
    }

    const valor = `${String(termoMes).padStart(2,'0')}/${termoAno}`;
    definirTermoInicial(valor, 'automatico');
}

function toggleFonteIndices() {
    const opcao = document.querySelector('input[name="fonteIndices"]:checked').value;
    const grupoUpload = document.getElementById('grupoUpload');
    const fonteAtiva = document.getElementById('fonteAtiva');
    if (opcao === 'interna') {
        grupoUpload.classList.add('hidden');
        fonteAtiva.innerText = 'Interna';
        indicesAtivos = BASE_INTERNA;
        fonteIndices = 'interna';
        document.getElementById('statusIndices').innerText = '(usando base interna)';
    } else {
        grupoUpload.classList.remove('hidden');
        fonteAtiva.innerText = 'Externa (arquivo)';
        fonteIndices = 'externa';
        if (indicesAtivos === BASE_INTERNA) {
            document.getElementById('statusIndices').innerText = '(nenhum arquivo carregado)';
        }
    }
}

function carregarIndicesExternos() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Selecione um arquivo JSON primeiro.');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            const anos = Object.keys(dados);
            if (anos.length === 0 || !dados[anos[0]].competencia) {
                throw new Error('Estrutura JSON inválida. Verifique o formato.');
            }
            indicesAtivos = dados;
            fonteIndices = 'externa';
            document.getElementById('statusIndices').innerText = `✅ ${anos.length} anos carregados (${Object.keys(dados[anos[0]].pro_rata).length} pro-rata)`;
            document.getElementById('fonteAtiva').innerText = 'Externa (arquivo)';
            alert('Índices carregados com sucesso!');
        } catch (error) {
            alert('Erro ao carregar o arquivo: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function restaurarBaseInterna() {
    indicesAtivos = BASE_INTERNA;
    fonteIndices = 'interna';
    document.querySelector('input[name="fonteIndices"][value="interna"]').checked = true;
    toggleFonteIndices();
    document.getElementById('statusIndices').innerText = '(base interna restaurada)';
    document.getElementById('fileInput').value = '';
    alert('Base interna restaurada com sucesso.');
}

function onTipoAcaoChange() {
    const tipo = document.getElementById('tipoAcao').value;
    const blocoBeneficio = document.getElementById('blocoBeneficio');
    const msgOutros = document.getElementById('msgOutrosTipos');
    if (tipo === 'previdenciaria') {
        blocoBeneficio.style.display = 'block';
        msgOutros.classList.add('hidden');
    } else {
        blocoBeneficio.style.display = 'none';
        msgOutros.classList.remove('hidden');
    }
}

function sincronizarDataFinal() {
    if (dataFinalAlteradaManualmente) return;
    const dataAtualizacao = document.getElementById('dataAtualizacao').value;
    if (dataAtualizacao.length === 7) {
        document.getElementById('dataFinal').value = dataAtualizacao;
    }
}

function executarCalculo() {
    if (document.getElementById('tipoAcao').value !== 'previdenciaria') {
        mostrarErro('O cálculo de evolução está disponível apenas para "Ações Previdenciárias".');
        return;
    }

    const painelErro = document.getElementById('painelErro');
    if (painelErro) painelErro.classList.add('hidden');

    if (fonteIndices === 'externa' && indicesAtivos === BASE_INTERNA) {
        mostrarErro("Você selecionou 'Arquivo Externo', mas nenhum arquivo foi carregado. Clique em 'Carregar' após selecionar o arquivo JSON.");
        return;
    }

    const strDib = document.getElementById('dib').value;
    const strDataFinal = document.getElementById('dataFinal').value;

    const dibObj = parseDataFlexivel(strDib, true);
    if (!dibObj) {
        mostrarErro("A DIB informada é inválida. Digite no formato DD/MM/AAAA (ex: 21/05/2014) ou MM/AAAA (ex: 05/2014).");
        return;
    }

    const finalObj = parseDataFlexivel(strDataFinal, false);
    if (!finalObj) {
        mostrarErro("A Data Final de Evolução é inválida. Digite apenas MM/AAAA (ex: 01/2025).");
        return;
    }

    const chaveDib = getChaveCronologica(dibObj.mes, dibObj.ano);
    const chaveFinal = getChaveCronologica(finalObj.mes, finalObj.ano);
    if (chaveFinal < chaveDib) {
        mostrarErro("A Data Final de Evolução não pode ser anterior à DIB do benefício.");
        return;
    }

    const strRmi = document.getElementById('rmi').value;
    const rmi = parseMoeda(strRmi);
    if (isNaN(rmi) || rmi <= 0) {
        mostrarErro("A RMI informada é inválida. Deve ser um valor numérico maior que zero.");
        return;
    }

    const transformado = document.querySelector('input[name="transformado"]:checked').value === 'sim';
    let strDibAnt = document.getElementById('dibAnterior').value;
    let dibReferencia = dibObj;
    if (transformado) {
        if (!strDibAnt) {
            mostrarErro("Informe a DIB do benefício antecedente.");
            return;
        }
        const dibAntObj = parseDataFlexivel(strDibAnt, true);
        if (!dibAntObj) {
            mostrarErro("A DIB do benefício antecedente é inválida. Use DD/MM/AAAA ou MM/AAAA.");
            return;
        }
        dibReferencia = dibAntObj;
    }

    const anosDisponiveis = Object.keys(indicesAtivos).map(Number);
    const maxAno = Math.max(...anosDisponiveis);
    const limitadoresFinal = obterLimitadores(strDataFinal);
    if (!limitadoresFinal) {
        mostrarErro(`Não há cobertura de salário mínimo e teto para a competência ${strDataFinal}.`);
        return;
    }

    let tabelasOrdenadas = Object.keys(indicesAtivos).map(anoKey => {
        let item = indicesAtivos[anoKey];
        let [mesComp, anoComp] = item.competencia.split('/').map(Number);
        return {
            anoKey,
            competencia: item.competencia,
            integral: item.integral,
            pro_rata: item.pro_rata,
            chaveCronologica: getChaveCronologica(mesComp, anoComp)
        };
    }).sort((a, b) => a.chaveCronologica - b.chaveCronologica);

    let ultimaTabela = tabelasOrdenadas[tabelasOrdenadas.length - 1];
    const chaveDibRef = getChaveCronologica(dibReferencia.mes, dibReferencia.ano);
    if (chaveDibRef >= ultimaTabela.chaveCronologica) {
        mostrarErro("Não existe tabela de reajuste cadastrada para a data informada.");
        return;
    }

    let valorAtual = rmi;
    let statusAtual = "NORMAL";
    let indiceTetoGuardado = null;
    let valorEvoluido = rmi;
    let memoria = [];
    let qtdReajustes = 0;
    let primeiroReajusteFeito = false;
    let ultimoReajusteCompetencia = '';

    for (let tab of tabelasOrdenadas) {
        if (tab.chaveCronologica <= chaveDibRef) continue;
        if (tab.chaveCronologica > chaveFinal) break;

        const limitadores = obterLimitadores(tab.competencia);
        if (!limitadores) {
            mostrarErro(`Não foi encontrada vigência de salário mínimo/teto para a competência ${tab.competencia}.`);
            return;
        }
        const { salarioMinimo, teto } = limitadores;

        let indiceEvolucao = 0;
        if (!primeiroReajusteFeito) {
            let chaveMesAnoDib = dibReferencia.strCompetencia;
            if (tab.pro_rata && tab.pro_rata[chaveMesAnoDib]) {
                indiceEvolucao = tab.pro_rata[chaveMesAnoDib];
            } else {
                let [mesTab, anoTab] = tab.competencia.split('/').map(Number);
                if (dibReferencia.mes === mesTab) {
                    indiceEvolucao = tab.integral;
                } else {
                    indiceEvolucao = tab.integral;
                }
            }
        } else {
            indiceEvolucao = tab.integral;
        }
        valorEvoluido = Math.floor(valorEvoluido * indiceEvolucao * 100) / 100;

        if (statusAtual === "PISO") {
            memoria.push({
                competencia: tab.competencia,
                tipo: "PISO",
                indice: indiceEvolucao,
                salarioMinimo,
                teto,
                indiceTeto: null,
                status: "PISO",
                valorTeorico: salarioMinimo,
                valorFinal: salarioMinimo,
                valorEvoluido: valorEvoluido
            });
            valorAtual = salarioMinimo;
            qtdReajustes++;
            ultimoReajusteCompetencia = tab.competencia;
            continue;
        }

        let tipoIndice = "";
        let indiceAplicado = 0;
        if (!primeiroReajusteFeito) {
            tipoIndice = "PRO RATA";
            let chaveMesAnoDib = dibReferencia.strCompetencia;
            if (tab.pro_rata && tab.pro_rata[chaveMesAnoDib]) {
                indiceAplicado = tab.pro_rata[chaveMesAnoDib];
            } else {
                let [mesTab, anoTab] = tab.competencia.split('/').map(Number);
                if (dibReferencia.mes === mesTab) {
                    indiceAplicado = tab.integral;
                    tipoIndice = "PRO RATA/FALLBACK";
                } else {
                    mostrarErro(`Índice Pro Rata para DIB ${chaveMesAnoDib} não encontrado na tabela ${tab.competencia}.`);
                    return;
                }
            }
            primeiroReajusteFeito = true;
        } else {
            tipoIndice = "INTEGRAL";
            indiceAplicado = tab.integral;
        }

        let valorTeorico;
        if (statusAtual === "LIMITADO_TETO" && indiceTetoGuardado !== null) {
            valorTeorico = valorAtual * indiceAplicado * indiceTetoGuardado;
        } else {
            valorTeorico = valorAtual * indiceAplicado;
        }
        valorTeorico = Math.floor(valorTeorico * 100) / 100;

        let valorFinal = valorTeorico;
        let statusAtualizado = statusAtual;
        let indiceTetoCalculado = null;

        if (valorTeorico < salarioMinimo) {
            valorFinal = salarioMinimo;
            statusAtualizado = "PISO";
            indiceTetoGuardado = null;
        } else if (valorTeorico > teto) {
            if (statusAtual !== "LIMITADO_TETO") {
                indiceTetoCalculado = valorTeorico / teto;
                indiceTetoGuardado = indiceTetoCalculado;
            } else {
                indiceTetoCalculado = indiceTetoGuardado;
            }
            valorFinal = teto;
            statusAtualizado = "LIMITADO_TETO";
        } else {
            statusAtualizado = "NORMAL";
            indiceTetoGuardado = null;
        }

        valorAtual = valorFinal;
        statusAtual = statusAtualizado;

        memoria.push({
            competencia: tab.competencia,
            tipo: tipoIndice,
            indice: indiceAplicado,
            salarioMinimo,
            teto,
            indiceTeto: indiceTetoCalculado,
            status: statusAtualizado,
            valorTeorico,
            valorFinal,
            valorEvoluido: valorEvoluido
        });

        qtdReajustes++;
        ultimoReajusteCompetencia = tab.competencia;
    }

    // ===== EXIBIÇÃO DOS RESULTADOS =====
    const textoDIB = formatarDataExibicao(dibObj);
    let textoDIBCompleto = textoDIB;
    if (transformado) textoDIBCompleto += ` (Antec: ${formatarDataExibicao(dibReferencia)})`;
    const resDIB = document.getElementById('resDIB');
    if (resDIB) resDIB.innerText = textoDIBCompleto;
    const resRMI = document.getElementById('resRMI');
    if (resRMI) resRMI.innerText = formatarMoeda(rmi);
    const resDataFinal = document.getElementById('resDataFinal');
    if (resDataFinal) resDataFinal.innerText = formatarDataExibicao(finalObj);
    const resQtd = document.getElementById('resQtdReajustes');
    if (resQtd) resQtd.innerText = qtdReajustes;

    const ultimo = memoria.length ? memoria[memoria.length - 1].valorFinal : rmi;
    const resRMA = document.getElementById('resRMA');
    if (resRMA) resRMA.innerText = formatarMoeda(ultimo);

    const resumoExecutivo = document.getElementById('resumoExecutivo');
    if (memoria.length > 0) {
        const ultimoRegistro = memoria[memoria.length - 1];
        const statusExibicao = ultimoRegistro.status === 'LIMITADO_TETO' ? 'TETO' : ultimoRegistro.status;
        document.getElementById('resumoStatus').innerText = statusExibicao;
        document.getElementById('resumoSalarioMinimo').innerText = formatarNumero(ultimoRegistro.salarioMinimo);
        document.getElementById('resumoTeto').innerText = formatarNumero(ultimoRegistro.teto);
        document.getElementById('resumoValorEvoluido').innerText = formatarNumero(ultimoRegistro.valorEvoluido);
        document.getElementById('resumoUltimoIndice').innerText = ultimoRegistro.indice !== null ? ultimoRegistro.indice.toFixed(4) : '-';
        document.getElementById('resumoCompetencia').innerText = ultimoRegistro.competencia;
        resumoExecutivo.classList.remove('hidden');
    } else {
        resumoExecutivo.classList.add('hidden');
    }

    const avisoRma = document.getElementById('avisoRmaMantida');
    const ultimoReajusteEl = document.getElementById('ultimoReajusteData');
    if (ultimoReajusteCompetencia && memoria.length > 0) {
        const ultimaComp = memoria[memoria.length - 1].competencia;
        if (ultimaComp !== formatarDataExibicao(finalObj)) {
            avisoRma.classList.remove('hidden');
            ultimoReajusteEl.innerText = ultimaComp;
        } else {
            avisoRma.classList.add('hidden');
        }
    } else {
        avisoRma.classList.add('hidden');
    }

    const divIdent = document.getElementById('identificacaoCalculo');
    if (divIdent) {
        divIdent.innerHTML = '';
        let temCampo = false;
        const camposIdent = [
            { id: 'processo', label: 'Processo' },
            { id: 'autor', label: 'Autor' },
            { id: 'reu', label: 'Réu' },
            { id: 'nb', label: 'NB' },
            { id: 'especie', label: 'Espécie' },
            { id: 'cpf', label: 'CPF' },
            { id: 'dataCalculo', label: 'Data do Cálculo' },
            { id: 'observacoes', label: 'Observações' }
        ];
        for (let campo of camposIdent) {
            const el = document.getElementById(campo.id);
            if (el && el.value.trim() !== '') {
                temCampo = true;
                const item = document.createElement('div');
                item.className = 'item';
                const rotulo = document.createElement('span');
                rotulo.className = 'rotulo';
                rotulo.innerText = campo.label;
                const valor = document.createElement('span');
                valor.className = 'valor';
                valor.innerText = el.value.trim();
                item.appendChild(rotulo);
                item.appendChild(valor);
                divIdent.appendChild(item);
            }
        }
        divIdent.classList.toggle('hidden', !temCampo);
    }

    const tbody = document.getElementById('tabelaMemoria');
    if (tbody) {
        tbody.innerHTML = '';
        if (memoria.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-500">Nenhum reajuste aplicável para o intervalo informado.</td></tr>`;
        } else {
            memoria.forEach(item => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50 transition";
                let statusExibicao = item.status === 'LIMITADO_TETO' ? 'TETO' : item.status;
                let rowClass = '';
                if (item.status === 'PISO') rowClass = 'row-piso';
                else if (item.status === 'LIMITADO_TETO') rowClass = 'row-teto';
                if (rowClass) tr.classList.add(rowClass);
                let statusBadgeClass = 'status-normal';
                if (item.status === 'PISO') statusBadgeClass = 'status-piso';
                else if (item.status === 'LIMITADO_TETO') statusBadgeClass = 'status-teto';
                tr.innerHTML = `
                    <td class="p-3 font-semibold text-slate-800">${item.competencia}</td>
                    <td class="p-3">${item.tipo ? `<span class="px-2 py-0.5 rounded text-xs font-bold ${item.tipo === 'PRO RATA' ? 'bg-amber-100 text-amber-800 border border-amber-200' : item.tipo === 'INTEGRAL' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : item.tipo === 'PRO RATA/FALLBACK' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}">${item.tipo}</span>` : '-'}</td>
                    <td class="p-3 text-slate-600">${item.indice !== null ? item.indice.toFixed(4) : '-'}</td>
                    <td class="p-3 text-slate-600">${formatarNumero(item.salarioMinimo)}</td>
                    <td class="p-3 text-slate-600">${formatarNumero(item.teto)}</td>
                    <td class="p-3 text-slate-600">${item.indiceTeto !== null ? item.indiceTeto.toFixed(5) : '-'}</td>
                    <td class="p-3"><span class="status-badge ${statusBadgeClass}">${statusExibicao}</span></td>
                    <td class="p-3 text-slate-600">${formatarNumero(item.valorTeorico)}</td>
                    <td class="p-3 text-slate-600">${formatarNumero(item.valorEvoluido)}</td>
                    <td class="p-3 valor-final">${formatarNumero(item.valorFinal)}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    const painelResultado = document.getElementById('painelResultado');
    const msgSemCalculo = document.getElementById('msgSemCalculo');
    if (painelResultado) painelResultado.classList.remove('hidden');
    if (msgSemCalculo) {
        msgSemCalculo.classList.add('hidden');
        msgSemCalculo.style.display = 'none';
    }
    ativarGuia('evolucao-devida');
    if (painelResultado) {
        painelResultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// =====================================================================
// FUNÇÃO DE SEGURANÇA
// =====================================================================
function iniciarCalculoComSeguranca() {
    try {
        console.log('[CALCULO] Botão acionado');
        executarCalculo();
        console.log('[CALCULO] Cálculo concluído com sucesso.');
    } catch (erro) {
        console.error('[CALCULO] Erro inesperado:', erro);
        mostrarErro('Erro interno ao executar o cálculo: ' + erro.message);
        ativarGuia('entradas');
    }
}

// =====================================================================
// FUNÇÃO RESERVADA PARA FUTUROS BENEFÍCIOS RECEBIDOS
// =====================================================================
function evoluirBeneficio(parametros) {
    // Placeholder – futuramente reutilizará o mesmo motor
    console.log('[EVOLUIR] Função reservada para evolução de outros benefícios.');
    return null;
}