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
});