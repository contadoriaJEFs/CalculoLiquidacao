// =====================================================================
// JSON – EXPORTAR E IMPORTAR DADOS DO CASO
// =====================================================================

function coletarDadosCaso() {
    const dados = {
        versao: "3.1",
        tipoArquivo: "calculo_judicial_previdenciario",
        dataExportacao: new Date().toLocaleDateString('pt-BR'),
        entradas: {
            processo: {
                vara: document.getElementById('vara').value,
                numero: document.getElementById('processo').value,
                autor: document.getElementById('autor').value,
                reu: document.getElementById('reu').value,
                cpf: document.getElementById('cpf').value,
                dataCalculo: document.getElementById('dataCalculo').value,
                observacoes: document.getElementById('observacoes').value
            },
            tipoAcao: document.getElementById('tipoAcao').value,
            datas: {
                ajuizamento: document.getElementById('dataAjuizamento').value,
                atualizacao: document.getElementById('dataAtualizacao').value,
                inicioJuros: document.getElementById('inicioJuros').value
            },
            prescricao: {
                aplicar: document.getElementById('aplicarPrescricao').value === 'sim',
                prazoAnos: parseInt(document.getElementById('prazoPrescricional').value) || 5,
                termoInicial: estadoTermoInicial.valor,
                termoInicialManual: estadoTermoInicial.manual
            },
            beneficioDevido: {
                nb: document.getElementById('nb').value,
                especie: document.getElementById('especie').value,
                tipo: document.getElementById('tipoBeneficio').value,
                dib: document.getElementById('dib').value,
                rmi: document.getElementById('rmi').value,
                transformado: document.querySelector('input[name="transformado"]:checked').value === 'sim',
                dibAntecedente: document.getElementById('dibAnterior').value,
                percentualDesdobramento: document.getElementById('percentualDesdobramento').value,
                adicionalTipo: document.getElementById('adicionalRenda').value,
                adicionalPercentual: document.getElementById('adicionalPercentual').value,
                dataFinalEvolucao: document.getElementById('dataFinal').value
            }
        },
        evolucaoDevida: {
            // Parâmetros utilizados (opcionais)
        },
        beneficiosRecebidos: coletarBeneficiosRecebidos(),
        diferencas: coletarDadosDiferencas(),
        atualizacao: {
            dataAtualizacao: document.getElementById('dataAtualizacao2').value,
            inicioJuros: document.getElementById('inicioJuros2').value,
            criterioCorrecao: document.getElementById('criterioCorrecao').value,
            criterioJuros: document.getElementById('criterioJuros').value,
            observacoes: document.getElementById('obsAtualizacao').value
        },
        acordoRenuncia: {
            acordo: {
                ativo: document.getElementById('acordoAtivo').value === 'sim',
                percentual: document.getElementById('percentualAcordo').value,
                observacoes: document.getElementById('obsAcordo').value
            },
            renuncia: {
                ativo: document.getElementById('renunciaAtiva').value === 'sim',
                tipoLimite: document.getElementById('tipoLimiteRenuncia').value,
                qtdSalarios: document.getElementById('qtdSalariosRenuncia').value,
                valorLimite: document.getElementById('valorLimiteRenuncia').value,
                dataReferencia: document.getElementById('dataReferenciaRenuncia').value,
                observacoes: document.getElementById('obsRenuncia').value
            }
        }
    };
    return dados;
}

function exportarCaso() {
    const dados = coletarDadosCaso();
    const json = JSON.stringify(dados, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    let nomeArquivo = 'calculo_previdenciario';
    const processo = document.getElementById('processo').value.trim();
    if (processo) {
        nomeArquivo += '_' + processo.replace(/[^a-zA-Z0-9]/g, '_');
    } else {
        nomeArquivo += '_' + new Date().toISOString().slice(0,10);
    }
    nomeArquivo += '.json';
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function importarCaso(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            if (dados.tipoArquivo !== 'calculo_judicial_previdenciario') {
                alert('O arquivo selecionado não corresponde a um caso previdenciário.');
                return;
            }
            if (dados.versao !== '3.1') {
                alert('Versão do arquivo não suportada. Versão esperada: 3.1');
                return;
            }

            const ent = dados.entradas || {};
            const proc = ent.processo || {};
            const datas = ent.datas || {};
            const presc = ent.prescricao || { aplicar: true, prazoAnos: 5, termoInicial: '', termoInicialManual: false };
            const bene = ent.beneficioDevido || {};

            document.getElementById('vara').value = proc.vara || '';
            document.getElementById('processo').value = proc.numero || '';
            document.getElementById('autor').value = proc.autor || '';
            document.getElementById('reu').value = proc.reu || 'INSS';
            document.getElementById('cpf').value = proc.cpf || '';
            document.getElementById('dataCalculo').value = proc.dataCalculo || '';
            document.getElementById('observacoes').value = proc.observacoes || '';

            document.getElementById('tipoAcao').value = ent.tipoAcao || 'previdenciaria';
            onTipoAcaoChange();

            document.getElementById('dataAjuizamento').value = datas.ajuizamento || '';
            document.getElementById('dataAtualizacao').value = datas.atualizacao || '';
            document.getElementById('inicioJuros').value = datas.inicioJuros || '';

            document.getElementById('aplicarPrescricao').value = presc.aplicar ? 'sim' : 'nao';
            document.getElementById('prazoPrescricional').value = presc.prazoAnos || 5;

            const termoValor = presc.termoInicial || '';
            const termoManual = presc.termoInicialManual || false;
            if (termoManual) {
                termoInicialManual = true;
                document.querySelectorAll('.cadeado').forEach(el => {
                    el.classList.remove('fechado');
                    el.classList.add('aberto');
                    el.textContent = '🔓';
                });
                document.querySelectorAll('#termoInicialDiferencas, #termoInicialDiferencas2').forEach(el => {
                    if (el) {
                        el.readOnly = false;
                        el.classList.remove('bg-slate-50');
                        el.classList.add('bg-white');
                    }
                });
                definirTermoInicial(termoValor, 'manual');
            } else {
                termoInicialManual = false;
                document.querySelectorAll('.cadeado').forEach(el => {
                    el.classList.remove('aberto');
                    el.classList.add('fechado');
                    el.textContent = '🔒';
                });
                document.querySelectorAll('#termoInicialDiferencas, #termoInicialDiferencas2').forEach(el => {
                    if (el) {
                        el.readOnly = true;
                        el.classList.remove('bg-white');
                        el.classList.add('bg-slate-50');
                    }
                });
                definirTermoInicial(termoValor, 'automatico');
            }

            document.getElementById('nb').value = bene.nb || '';
            document.getElementById('especie').value = bene.especie || '';
            document.getElementById('tipoBeneficio').value = bene.tipo || 'previdenciario';
            document.getElementById('dib').value = bene.dib || '';
            document.getElementById('rmi').value = bene.rmi || '';
            const transformado = bene.transformado ? 'sim' : 'nao';
            document.querySelector(`input[name="transformado"][value="${transformado}"]`).checked = true;
            toggleTransformacao(transformado === 'sim');
            document.getElementById('dibAnterior').value = bene.dibAntecedente || '';
            document.getElementById('percentualDesdobramento').value = bene.percentualDesdobramento || '100,00';
            document.getElementById('adicionalRenda').value = bene.adicionalTipo || '0';
            toggleAdicionalPercentual(document.getElementById('adicionalRenda'));
            document.getElementById('adicionalPercentual').value = bene.adicionalPercentual || '';
            document.getElementById('dataFinal').value = bene.dataFinalEvolucao || '';

            // Atualização
            const atu = dados.atualizacao || {};
            document.getElementById('dataAtualizacao2').value = atu.dataAtualizacao || '';
            document.getElementById('inicioJuros2').value = atu.inicioJuros || '';
            document.getElementById('criterioCorrecao').value = atu.criterioCorrecao || '';
            document.getElementById('criterioJuros').value = atu.criterioJuros || '';
            document.getElementById('obsAtualizacao').value = atu.observacoes || '';

            // Acordo/Renúncia
            const ar = dados.acordoRenuncia || {};
            const ac = ar.acordo || {};
            const ren = ar.renuncia || {};
            document.getElementById('acordoAtivo').value = ac.ativo ? 'sim' : 'nao';
            document.getElementById('percentualAcordo').value = ac.percentual || '100%';
            document.getElementById('obsAcordo').value = ac.observacoes || '';
            document.getElementById('renunciaAtiva').value = ren.ativo ? 'sim' : 'nao';
            document.getElementById('tipoLimiteRenuncia').value = ren.tipoLimite || 'salarios';
            document.getElementById('qtdSalariosRenuncia').value = ren.qtdSalarios || '';
            document.getElementById('valorLimiteRenuncia').value = ren.valorLimite || '';
            document.getElementById('dataReferenciaRenuncia').value = ren.dataReferencia || '';
            document.getElementById('obsRenuncia').value = ren.observacoes || '';

            // BENEFÍCIOS RECEBIDOS – restauração completa
            if (dados.beneficiosRecebidos) {
                restaurarBeneficiosRecebidos(dados.beneficiosRecebidos);
            } else {
                restaurarBeneficiosRecebidos([]);
            }

            // Restaurar dados da Guia 4
            if (dados.diferencas) {
                restaurarDadosDiferencas(dados.diferencas);
            }

            if (!termoManual) calcularTermoInicial();

            // ===== ÚNICO ALERTA =====
            alert('Dados do caso importados com sucesso!');

            // ===== RECÁLCULO AUTOMÁTICO APÓS IMPORTAÇÃO =====
            setTimeout(function() {
                if (typeof recalcularCasoCompleto === 'function') {
                    recalcularCasoCompleto();
                } else {
                    console.warn('[IMPORTAR] Função recalcularCasoCompleto não disponível.');
                }
            }, 300);

        } catch (error) {
            alert('Erro ao importar o arquivo: ' + error.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function novoCaso() {
    if (confirm('Limpar todos os dados do caso atual?')) {
        limparFormulario();
        restaurarBeneficiosRecebidos([]);
        dadosDiferencas.modoCompensacao = 'limite';
        dadosDiferencas.celulasEditadas = {};
        document.querySelector('input[name="modoCompensacao"][value="limite"]').checked = true;
    }
}
