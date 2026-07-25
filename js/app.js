// =====================================================================
// APLICAÇÃO – INICIALIZAÇÃO, NAVEGAÇÃO, EVENTOS
// =====================================================================

function ativarGuia(nomeGuia) {
    const botoes = document.querySelectorAll('.nav-guia button');
    const conteudos = document.querySelectorAll('.conteudo-guia');
    botoes.forEach(btn => {
        btn.classList.toggle('ativo', btn.dataset.guia === nomeGuia);
    });
    conteudos.forEach(div => {
        div.classList.toggle('ativo', div.id === 'guia-' + nomeGuia);
    });

    // === CORREÇÃO: Montar a Guia 4 ao acessar a aba Diferenças ===
    if (nomeGuia === 'diferencas') {
        // Se a função existir, montar a tabela
        if (typeof montarTabelaDiferencas === 'function') {
            montarTabelaDiferencas();
        }
    }
}

// Eventos de navegação
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-guia button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            ativarGuia(this.dataset.guia);
        });
    });

    // Eventos dos cadeados – delegado
    document.addEventListener('click', function(e) {
        const cadeado = e.target.closest('.cadeado');
        if (cadeado) {
            e.preventDefault();
            alternarModoTermoInicial(cadeado);
        }
    });

    // Sincronização dos campos manuais
    document.querySelectorAll('#termoInicialDiferencas, #termoInicialDiferencas2').forEach(el => {
        if (el) {
            el.addEventListener('input', function() {
                if (termoInicialManual) {
                    sincronizarTermoInicial(this);
                }
            });
            el.addEventListener('blur', function() {
                if (termoInicialManual) {
                    aplicarMascaraData(this, true);
                    sincronizarTermoInicial(this);
                }
            });
        }
    });

    // Gatilhos para recalcular termo automático
    ['dib', 'dataAjuizamento', 'aplicarPrescricao', 'prazoPrescricional'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', function() {
                if (!termoInicialManual) calcularTermoInicial();
            });
            if (el.tagName === 'INPUT') {
                el.addEventListener('input', function() {
                    if (!termoInicialManual) {
                        const dibVal = document.getElementById('dib').value;
                        const ajuizVal = document.getElementById('dataAjuizamento').value;
                        if (dibVal.length >= 6 && (document.getElementById('aplicarPrescricao').value === 'nao' || ajuizVal.length >= 8)) {
                            calcularTermoInicial();
                        }
                    }
                });
            }
        }
    });

    // Sincronização Data de Atualização → Data Final
    const dataFinal = document.getElementById('dataFinal');
    if (dataFinal) {
        dataFinal.addEventListener('input', function() {
            if (this.value.length === 7) {
                dataFinalAlteradaManualmente = true;
            }
        });
    }
    const dataAtualizacao = document.getElementById('dataAtualizacao');
    if (dataAtualizacao) {
        dataAtualizacao.addEventListener('input', sincronizarDataFinal);
    }

    // === CORREÇÃO: Inicializar a Guia 4 ===
    if (typeof initGuiaDiferencas === 'function') {
        initGuiaDiferencas();
    }

    // Inicialização
    toggleFonteIndices();
    preencherDataAtual();
    ativarGuia('entradas');
    adicionarBeneficioRecebido();
    onTipoAcaoChange();

    // Prescrição padrão
    document.getElementById('aplicarPrescricao').value = 'sim';
    document.getElementById('prazoPrescricional').value = 5;

    // Fecha cadeados
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
    termoInicialManual = false;
    calcularTermoInicial();

    // Se a guia atual for "diferencas" (ex: recarregar a página com a guia ativa), montar a tabela
    const guiaAtiva = document.querySelector('.nav-guia button.ativo');
    if (guiaAtiva && guiaAtiva.dataset.guia === 'diferencas') {
        if (typeof montarTabelaDiferencas === 'function') {
            montarTabelaDiferencas();
        }
    }
});
// =====================================================================
// RECALCULAR CASO COMPLETO (automação do fluxo)
// =====================================================================

function recalcularCasoCompleto() {
    console.log('[RECALCULO] Iniciando recálculo completo do caso...');

    try {
        // 1. Executar Evolução Devida
        console.log('[RECALCULO] 1. Calculando Evolução Devida...');
        executarCalculo();

        // 2. Executar evolução de todos os benefícios da Guia 3
        const blocos = document.querySelectorAll('.beneficio-recebido-bloco');
        console.log(`[RECALCULO] 2. Calculando ${blocos.length} benefício(s) recebido(s)...`);
        blocos.forEach((bloco, index) => {
            console.log(`[RECALCULO]   - Benefício ${index + 1}: ${bloco.dataset.id || 'sem id'}`);
            calcularBeneficioRecebido(bloco);
        });

        // 3. Atualizar Guia 4 (montar tabela e resumo)
        console.log('[RECALCULO] 3. Atualizando Guia 4...');
        if (typeof montarTabelaDiferencas === 'function') {
            montarTabelaDiferencas();
        } else {
            console.warn('[RECALCULO] Função montarTabelaDiferencas não encontrada.');
        }

        // 4. Ativar guia 4 para exibir o resultado
        ativarGuia('diferencas');
        console.log('[RECALCULO] 4. Guia 4 ativada.');

        // 5. Mensagem de sucesso
        alert('Caso recalculado com sucesso.');

    } catch (erro) {
        console.error('[RECALCULO] Erro durante o recálculo:', erro);
        alert('Erro ao recalcular o caso: ' + erro.message);
        ativarGuia('entradas');
    }
}
