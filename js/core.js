// =====================================================================
// FUNÇÕES AUXILIARES E MÁSCARAS
// =====================================================================

function competenciaParaNumero(competencia) {
    let partes = competencia.split('/');
    let mes = parseInt(partes[0], 10);
    let ano = parseInt(partes[1], 10);
    return ano * 100 + mes;
}

function obterLimitadores(competencia) {
    const numCompetencia = competenciaParaNumero(competencia);
    for (let vig of VIGENCIAS) {
        let numInicio = competenciaParaNumero(vig.inicio);
        let numFim = competenciaParaNumero(vig.fim);
        if (numCompetencia >= numInicio && numCompetencia <= numFim) {
            return { salarioMinimo: vig.salarioMinimo, teto: vig.teto };
        }
    }
    return null;
}

function aplicarMascaraData(input, apenasMesAno) {
    let v = input.value.replace(/\D/g, '');
    if (apenasMesAno) {
        if (v.length > 6) v = v.substring(0, 6);
        if (v.length >= 3) {
            input.value = v.substring(0, 2) + '/' + v.substring(2);
        } else {
            input.value = v;
        }
    } else {
        if (v.length > 8) v = v.substring(0, 8);
        if (v.length === 8) {
            input.value = v.substring(0, 2) + '/' + v.substring(2, 4) + '/' + v.substring(4, 8);
        } else if (v.length >= 3 && v.length < 8) {
            input.value = v.substring(0, 2) + '/' + v.substring(2);
        } else {
            input.value = v;
        }
    }
}

function aplicarMascaraDataSimples(input) {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    if (v.length >= 3 && v.length <= 5) {
        input.value = v.substring(0, 2) + '/' + v.substring(2);
    } else if (v.length >= 6) {
        input.value = v.substring(0, 2) + '/' + v.substring(2, 4) + '/' + v.substring(4, 8);
    } else {
        input.value = v;
    }
}

function aplicarMascaraCPF(input) {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length >= 4 && v.length < 7) {
        input.value = v.substring(0, 3) + '.' + v.substring(3);
    } else if (v.length >= 7 && v.length < 10) {
        input.value = v.substring(0, 3) + '.' + v.substring(3, 6) + '.' + v.substring(6);
    } else if (v.length >= 10) {
        input.value = v.substring(0, 3) + '.' + v.substring(3, 6) + '.' + v.substring(6, 9) + '-' + v.substring(9);
    } else {
        input.value = v;
    }
}

function aplicarMascaraMoeda(input) {
    let v = input.value.replace(/\D/g, '');
    if (!v) { input.value = ''; return; }
    let valor = (parseInt(v, 10) / 100).toFixed(2);
    let partes = valor.split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    input.value = partes.join(',');
}

function toggleTransformacao(ativo) {
    const grupo = document.getElementById('grupoTransformacao');
    if (grupo) grupo.classList.toggle('hidden', !ativo);
    if (!ativo) {
        const dibAnt = document.getElementById('dibAnterior');
        if (dibAnt) dibAnt.value = '';
    }
}

function toggleAdicionalPercentual(select) {
    const grupo = document.getElementById('grupoAdicionalPercentual');
    if (!grupo) return;
    if (select.value === 'outro') {
        grupo.classList.remove('hidden');
    } else {
        grupo.classList.add('hidden');
        const input = document.getElementById('adicionalPercentual');
        if (input) input.value = '';
    }
}

function parseDataFlexivel(str, permitirDia) {
    if (!str) return null;
    let limpo = str.trim().replace(/\D/g, '');
    if (!permitirDia && limpo.length === 6) {
        let mes = parseInt(limpo.substring(0, 2), 10);
        let ano = parseInt(limpo.substring(2, 6), 10);
        if (mes < 1 || mes > 12 || ano < 1900) return null;
        return { dia: null, mes, ano, strCompetencia: `${String(mes).padStart(2,'0')}/${ano}` };
    }
    if (permitirDia && (limpo.length === 6 || limpo.length === 8)) {
        if (limpo.length === 6) {
            let mes = parseInt(limpo.substring(0, 2), 10);
            let ano = parseInt(limpo.substring(2, 6), 10);
            if (mes < 1 || mes > 12 || ano < 1900) return null;
            return { dia: null, mes, ano, strCompetencia: `${String(mes).padStart(2,'0')}/${ano}` };
        } else {
            let dia = parseInt(limpo.substring(0, 2), 10);
            let mes = parseInt(limpo.substring(2, 4), 10);
            let ano = parseInt(limpo.substring(4, 8), 10);
            if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || ano < 1900) return null;
            const dataTest = new Date(ano, mes - 1, dia);
            if (dataTest.getFullYear() !== ano || dataTest.getMonth() !== mes - 1 || dataTest.getDate() !== dia) return null;
            return { dia, mes, ano, strCompetencia: `${String(mes).padStart(2,'0')}/${ano}` };
        }
    }
    return null;
}

function formatarDataExibicao(dataObj) {
    if (!dataObj) return '-';
    if (dataObj.dia !== null)
        return `${String(dataObj.dia).padStart(2,'0')}/${String(dataObj.mes).padStart(2,'0')}/${dataObj.ano}`;
    return `${String(dataObj.mes).padStart(2,'0')}/${dataObj.ano}`;
}

function parseMoeda(str) {
    if (!str) return NaN;
    let limpo = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(limpo);
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarNumero(valor) {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getChaveCronologica(mes, ano) {
    return ano * 100 + mes;
}

function preencherDataAtual() {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    const el = document.getElementById('dataCalculo');
    if (el) el.value = dia + '/' + mes + '/' + ano;
}

function limparFormulario() {
    document.getElementById('calcForm').reset();
    const selPresc = document.getElementById('aplicarPrescricao');
    if (selPresc) selPresc.value = 'sim';
    const prazo = document.getElementById('prazoPrescricional');
    if (prazo) prazo.value = 5;

    const painelErro = document.getElementById('painelErro');
    if (painelErro) painelErro.classList.add('hidden');
    const painelResultado = document.getElementById('painelResultado');
    if (painelResultado) painelResultado.classList.add('hidden');
    const msgSemCalculo = document.getElementById('msgSemCalculo');
    if (msgSemCalculo) msgSemCalculo.style.display = 'block';
    const resumoExecutivo = document.getElementById('resumoExecutivo');
    if (resumoExecutivo) resumoExecutivo.classList.add('hidden');
    const identificacao = document.getElementById('identificacaoCalculo');
    if (identificacao) identificacao.classList.add('hidden');

    toggleTransformacao(false);
    preencherDataAtual();
    dataFinalAlteradaManualmente = false;
    termoInicialManual = false;

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
    const st1 = document.getElementById('statusTermoPrincipal');
    const st2 = document.getElementById('statusTermoBeneficio');
    if (st1) st1.textContent = 'Termo calculado automaticamente.';
    if (st2) st2.textContent = 'Termo calculado automaticamente.';
    calcularTermoInicial();
}

function mostrarErro(mensagem) {
    const painelErro = document.getElementById('painelErro');
    const msgErro = document.getElementById('mensagemErro');
    if (painelErro && msgErro) {
        msgErro.innerHTML = mensagem;
        painelErro.classList.remove('hidden');
        painelErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        alert(mensagem);
    }
    const painelResultado = document.getElementById('painelResultado');
    if (painelResultado) painelResultado.classList.add('hidden');
    const msgSemCalculo = document.getElementById('msgSemCalculo');
    if (msgSemCalculo) msgSemCalculo.style.display = 'block';
}