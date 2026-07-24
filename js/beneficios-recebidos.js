// =====================================================================
// BENEFÍCIOS RECEBIDOS – GUIAS 3
// =====================================================================

var contadorBeneficio = 0;

function adicionarBeneficioRecebido() {
    contadorBeneficio++;
    const container = document.getElementById('containerBeneficiosRecebidos');
    if (!container) return;
    const bloco = document.createElement('div');
    bloco.className = 'beneficio-recebido-bloco';
    bloco.dataset.id = contadorBeneficio;
    bloco.innerHTML = `
        <button type="button" class="btn-remover" onclick="removerBeneficioRecebido(this)">Remover</button>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Identificador</label>
                <input type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: BEN-001">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">NB</label>
                <input type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: 1234567890">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Espécie</label>
                <input type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: 42">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Tipo</label>
                <select class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="previdenciario">Previdenciário</option>
                    <option value="assistencial">Assistencial</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">DIB</label>
                <input type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="DD/MM/AAAA ou MM/AAAA" oninput="aplicarMascaraData(this, false)">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">DCB</label>
                <input type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="DD/MM/AAAA" oninput="aplicarMascaraDataSimples(this)">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">RMI</label>
                <input type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="R$ 0,00" oninput="aplicarMascaraMoeda(this)">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Benefício transformado?</label>
                <select class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">DIB antecedente</label>
                <input type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="DD/MM/AAAA ou MM/AAAA" oninput="aplicarMascaraData(this, false)">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Percentual de desdobramento/cota</label>
                <input type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="100%">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Adicional</label>
                <select class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="0">0%</option>
                    <option value="25">25%</option>
                    <option value="outro">Outro</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Percentual do adicional</label>
                <input type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: 15">
            </div>
            <div class="md:col-span-3">
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Observações</label>
                <textarea rows="2" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Observações sobre este benefício recebido..."></textarea>
            </div>
        </div>
    `;
    container.appendChild(bloco);
}

function removerBeneficioRecebido(botao) {
    if (confirm('Remover este benefício recebido?')) {
        const bloco = botao.closest('.beneficio-recebido-bloco');
        if (bloco) bloco.remove();
    }
}