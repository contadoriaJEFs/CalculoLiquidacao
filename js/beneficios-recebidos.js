// =====================================================================
// BENEFÍCIOS RECEBIDOS – GUIAS 3
// =====================================================================

var contadorBeneficio = 0;

function adicionarBeneficioRecebido(dados) {
    dados = dados || {};
    contadorBeneficio++;
    const container = document.getElementById('containerBeneficiosRecebidos');
    if (!container) return null;

    const bloco = document.createElement('div');
    bloco.className = 'beneficio-recebido-bloco';
    bloco.dataset.id = contadorBeneficio;

    bloco.innerHTML = `
        <button type="button" class="btn-remover" onclick="removerBeneficioRecebido(this)">Remover</button>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Identificador</label>
                <input type="text" data-campo="identificador" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: BEN-001" value="${dados.identificador || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">NB</label>
                <input type="text" data-campo="nb" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: 1234567890" value="${dados.nb || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Espécie</label>
                <input type="text" data-campo="especie" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: 42" value="${dados.especie || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Tipo</label>
                <select data-campo="tipo" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="previdenciario" ${dados.tipo === 'previdenciario' ? 'selected' : ''}>Previdenciário</option>
                    <option value="assistencial" ${dados.tipo === 'assistencial' ? 'selected' : ''}>Assistencial</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">DIB</label>
                <input type="text" data-campo="dib" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="DD/MM/AAAA ou MM/AAAA" oninput="aplicarMascaraData(this, false)" value="${dados.dib || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">DCB</label>
                <input type="text" data-campo="dcb" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="DD/MM/AAAA" oninput="aplicarMascaraDataSimples(this)" value="${dados.dcb || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">RMI</label>
                <input type="text" data-campo="rmi" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="R$ 0,00" oninput="aplicarMascaraMoeda(this)" value="${dados.rmi || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Benefício transformado?</label>
                <select data-campo="transformado" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="nao" ${dados.transformado === 'sim' ? '' : 'selected'}>Não</option>
                    <option value="sim" ${dados.transformado === 'sim' ? 'selected' : ''}>Sim</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">DIB antecedente</label>
                <input type="text" data-campo="dibAntecedente" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="DD/MM/AAAA ou MM/AAAA" oninput="aplicarMascaraData(this, false)" value="${dados.dibAntecedente || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Percentual de desdobramento/cota</label>
                <input type="text" data-campo="percentualDesdobramento" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="100%" value="${dados.percentualDesdobramento || '100,00'}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Adicional</label>
                <select data-campo="adicional" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="0" ${dados.adicional === '0' ? 'selected' : ''}>0%</option>
                    <option value="25" ${dados.adicional === '25' ? 'selected' : ''}>25%</option>
                    <option value="outro" ${dados.adicional === 'outro' ? 'selected' : ''}>Outro</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Percentual do adicional</label>
                <input type="text" data-campo="adicionalPercentual" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: 15" value="${dados.adicionalPercentual || ''}">
            </div>
            <div class="md:col-span-3">
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Observações</label>
                <textarea data-campo="observacoes" rows="2" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Observações sobre este benefício recebido...">${dados.observacoes || ''}</textarea>
            </div>
        </div>
    `;
    container.appendChild(bloco);
    return bloco;
}

function removerBeneficioRecebido(botao) {
    if (confirm('Remover este benefício recebido?')) {
        const bloco = botao.closest('.beneficio-recebido-bloco');
        if (bloco) bloco.remove();
    }
}

function coletarBeneficiosRecebidos() {
    const blocos = document.querySelectorAll('.beneficio-recebido-bloco');
    const resultados = [];

    // Para cada bloco, extrai os dados
    blocos.forEach(bloco => {
        const campos = bloco.querySelectorAll('[data-campo]');
        const dados = {};

        campos.forEach(el => {
            const nome = el.getAttribute('data-campo');
            // Para input, select e textarea, o valor é sempre .value
            dados[nome] = el.value;
        });

        // Se o bloco tiver pelo menos um campo preenchido, adiciona ao resultado
        // (ou sempre adiciona, mesmo vazio, para preservar a estrutura)
        resultados.push(dados);
    });

    return resultados;
}

function restaurarBeneficiosRecebidos(dados) {
    const container = document.getElementById('containerBeneficiosRecebidos');
    if (!container) return;
    container.innerHTML = '';
    if (!dados || !Array.isArray(dados) || dados.length === 0) {
        // Adiciona um bloco vazio como exemplo
        adicionarBeneficioRecebido({});
        return;
    }
    dados.forEach(item => {
        adicionarBeneficioRecebido(item);
    });
}
