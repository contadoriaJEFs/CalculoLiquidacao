// =====================================================================
// BENEFÍCIOS RECEBIDOS – GUIA 3
// =====================================================================

var contadorBeneficio = 0;

function adicionarBeneficioRecebido(dados) {
    dados = dados || {};
    const resultado = dados.resultado || null;
    const memoriaExpandida = dados.memoriaExpandida || false;

    contadorBeneficio++;
    const container = document.getElementById('containerBeneficiosRecebidos');
    if (!container) return null;

    const bloco = document.createElement('div');
    bloco.className = 'beneficio-recebido-bloco';
    bloco.dataset.id = contadorBeneficio;

    // Montagem do HTML com a estrutura corrigida
    let html = `
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

        <!-- BOTÕES (sempre visíveis) -->
        <div class="flex flex-wrap items-center gap-2 mt-3 border-t border-slate-200 pt-3">
            <button class="btn-calcular-evolucao px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition">Calcular Evolução</button>
            <button class="btn-toggle-memoria px-3 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-700 transition">${memoriaExpandida ? 'Ocultar' : 'Exibir'} Memória</button>
        </div>
    `;

    // ÁREA DE RESULTADO (inicialmente oculta)
    html += `
        <div class="resultado-beneficio-recebido mt-3 ${resultado ? '' : 'hidden'}">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <span class="text-xs font-bold text-slate-500">RMA Final:</span>
                    <span class="text-sm font-bold text-blue-700 rma-final">${resultado ? formatarMoeda(resultado.rmaFinal) : 'R$ 0,00'}</span>
                    <span class="text-xs font-bold text-slate-500 ml-3">Status:</span>
                    <span class="status-badge ${resultado ? (resultado.statusFinal === 'LIMITADO_TETO' ? 'status-teto' : resultado.statusFinal === 'PISO' ? 'status-piso' : 'status-normal') : 'status-normal'} status-final">${resultado ? (resultado.statusFinal === 'LIMITADO_TETO' ? 'TETO' : resultado.statusFinal) : 'NORMAL'}</span>
                </div>
            </div>
            <div class="resumo-beneficio-recebido mt-2 text-xs text-slate-600 flex flex-wrap gap-4">
                <span>Reajustes: <strong class="qtd-reajustes">${resultado ? resultado.qtdReajustes : 0}</strong></span>
                <span>Último reajuste: <strong class="ultimo-reajuste">${resultado ? resultado.ultimoReajuste : '-'}</strong></span>
                <span>Último índice: <strong class="ultimo-indice">${resultado && resultado.ultimoIndice !== null ? resultado.ultimoIndice.toFixed(4) : '-'}</strong></span>
            </div>
            <div class="memoria-beneficio-recebido mt-3 overflow-x-auto ${memoriaExpandida ? '' : 'hidden'}">
                <table class="w-full text-left border-collapse text-xs memoria-tabela">
                    <thead>
                        <tr class="bg-slate-100 text-slate-700 border-b border-slate-200 text-xs uppercase">
                            <th class="p-2">Competência</th>
                            <th class="p-2">Tipo</th>
                            <th class="p-2">Índice</th>
                            <th class="p-2">Sal. Min.</th>
                            <th class="p-2">Teto</th>
                            <th class="p-2">Índ. Teto</th>
                            <th class="p-2">Status</th>
                            <th class="p-2">Vlr. Teórico</th>
                            <th class="p-2">Vlr. Evoluído</th>
                            <th class="p-2">Vlr. Final</th>
                        </tr>
                    </thead>
                    <tbody class="memoria-tbody">
                        ${resultado && resultado.memoria ? resultado.memoria.map(item => `
                            <tr class="${item.status === 'PISO' ? 'row-piso' : item.status === 'LIMITADO_TETO' ? 'row-teto' : ''}">
                                <td class="p-2 font-semibold">${item.competencia}</td>
                                <td class="p-2">${item.tipo ? `<span class="px-1 py-0.5 rounded text-xs font-bold ${item.tipo === 'PRO RATA' ? 'bg-amber-100 text-amber-800 border border-amber-200' : item.tipo === 'INTEGRAL' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : item.tipo === 'PRO RATA/FALLBACK' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}">${item.tipo}</span>` : '-'}</td>
                                <td class="p-2">${item.indice !== null ? item.indice.toFixed(4) : '-'}</td>
                                <td class="p-2">${formatarNumero(item.salarioMinimo)}</td>
                                <td class="p-2">${formatarNumero(item.teto)}</td>
                                <td class="p-2">${item.indiceTeto !== null ? item.indiceTeto.toFixed(5) : '-'}</td>
                                <td class="p-2"><span class="status-badge ${item.status === 'PISO' ? 'status-piso' : item.status === 'LIMITADO_TETO' ? 'status-teto' : 'status-normal'}">${item.status === 'LIMITADO_TETO' ? 'TETO' : item.status}</span></td>
                                <td class="p-2">${formatarNumero(item.valorTeorico)}</td>
                                <td class="p-2">${formatarNumero(item.valorEvoluido)}</td>
                                <td class="p-2 font-bold">${formatarNumero(item.valorFinal)}</td>
                            </tr>
                        `).join('') : ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    bloco.innerHTML = html;
    container.appendChild(bloco);

    // ===== SELEÇÃO DOS ELEMENTOS (com validação e logs) =====
    const btnCalcular = bloco.querySelector('.btn-calcular-evolucao');
    const btnToggle = bloco.querySelector('.btn-toggle-memoria');
    const divResultado = bloco.querySelector('.resultado-beneficio-recebido');
    const memoriaDiv = bloco.querySelector('.memoria-beneficio-recebido');

    // Logs temporários para auditoria
    console.log('[adicionarBeneficioRecebido] btnCalcular:', !!btnCalcular);
    console.log('[adicionarBeneficioRecebido] btnToggle:', !!btnToggle);
    console.log('[adicionarBeneficioRecebido] divResultado:', !!divResultado);
    console.log('[adicionarBeneficioRecebido] memoriaDiv:', !!memoriaDiv);

    // Anexa eventos somente se os elementos existirem
    if (btnCalcular) {
        btnCalcular.addEventListener('click', function() {
            calcularBeneficioRecebido(bloco);
        });
    } else {
        console.error('[adicionarBeneficioRecebido] btnCalcular é null!');
    }

    if (btnToggle) {
        btnToggle.addEventListener('click', function() {
            const isHidden = memoriaDiv ? memoriaDiv.classList.contains('hidden') : true;
            if (memoriaDiv) {
                memoriaDiv.classList.toggle('hidden');
                this.textContent = isHidden ? 'Ocultar Memória' : 'Exibir Memória';
                bloco.dataset.memoriaExpandida = isHidden ? 'true' : 'false';
            }
        });
    } else {
        console.error('[adicionarBeneficioRecebido] btnToggle é null!');
    }

    // Restaurar estado se houver resultado
    if (resultado && divResultado) {
        divResultado.classList.remove('hidden');
        if (memoriaExpandida && memoriaDiv) {
            memoriaDiv.classList.remove('hidden');
            btnToggle.textContent = 'Ocultar Memória';
        } else if (memoriaDiv) {
            memoriaDiv.classList.add('hidden');
            btnToggle.textContent = 'Exibir Memória';
        }
        bloco.dataset.memoriaExpandida = memoriaExpandida ? 'true' : 'false';
    } else if (divResultado) {
        divResultado.classList.add('hidden');
        if (memoriaDiv) {
            memoriaDiv.classList.add('hidden');
            btnToggle.textContent = 'Exibir Memória';
        }
        bloco.dataset.memoriaExpandida = 'false';
    }

    return bloco;
}

// =====================================================================
// FUNÇÃO QUE CALCULA UM BENEFÍCIO RECEBIDO INDIVIDUAL
// =====================================================================
function calcularBeneficioRecebido(bloco) {
    try {
        // Coletar dados do bloco
        const getVal = (campo) => bloco.querySelector(`[data-campo="${campo}"]`).value;
        const getSelect = (campo) => bloco.querySelector(`[data-campo="${campo}"]`).value;

        const dib = getVal('dib');
        const rmiStr = getVal('rmi');
        // Data final: usa DCB se preenchida, senão usa a data final da guia Entradas
        let dataFinalBeneficio = getVal('dcb');
        if (!dataFinalBeneficio || dataFinalBeneficio.length < 7) {
            dataFinalBeneficio = document.getElementById('dataFinal').value;
        }
        if (!dataFinalBeneficio || dataFinalBeneficio.length < 7) {
            alert('Defina uma DCB ou preencha a Data Final de Evolução na guia Entradas.');
            return;
        }

        const transformado = getSelect('transformado') === 'sim';
        const dibAntecedente = getVal('dibAntecedente');
        const tipoBeneficio = getSelect('tipo');
        const percentualDesdobramento = parseFloat(getVal('percentualDesdobramento').replace(',', '.')) || 100;
        const adicionalTipo = getSelect('adicional');
        const adicionalPercentual = parseFloat(getVal('adicionalPercentual').replace(',', '.')) || 0;

        const rmi = parseMoeda(rmiStr);
        if (isNaN(rmi) || rmi <= 0) {
            alert('RMI inválida.');
            return;
        }

        const parametros = {
            dib: dib,
            rmi: rmi,
            dataFinal: dataFinalBeneficio,
            transformado: transformado,
            dibAntecedente: dibAntecedente,
            tipoBeneficio: tipoBeneficio,
            percentualDesdobramento: percentualDesdobramento,
            adicionalTipo: adicionalTipo,
            adicionalPercentual: adicionalPercentual
        };

        // Chama o motor (agora real)
        const resultado = evoluirBeneficio(parametros);

        // Atualizar a exibição
        const divResultado = bloco.querySelector('.resultado-beneficio-recebido');
        divResultado.classList.remove('hidden');

        const rmaEl = divResultado.querySelector('.rma-final');
        const statusEl = divResultado.querySelector('.status-final');
        const qtdEl = divResultado.querySelector('.qtd-reajustes');
        const ultimoReajusteEl = divResultado.querySelector('.ultimo-reajuste');
        const ultimoIndiceEl = divResultado.querySelector('.ultimo-indice');
        const tbody = divResultado.querySelector('.memoria-tbody');

        rmaEl.textContent = formatarMoeda(resultado.rmaFinal);
        const statusExibicao = resultado.statusFinal === 'LIMITADO_TETO' ? 'TETO' : resultado.statusFinal;
        statusEl.textContent = statusExibicao;
        statusEl.className = `status-badge ${resultado.statusFinal === 'LIMITADO_TETO' ? 'status-teto' : resultado.statusFinal === 'PISO' ? 'status-piso' : 'status-normal'} status-final`;
        qtdEl.textContent = resultado.qtdReajustes;
        ultimoReajusteEl.textContent = resultado.ultimoReajuste;
        ultimoIndiceEl.textContent = resultado.ultimoIndice !== null ? resultado.ultimoIndice.toFixed(4) : '-';

        tbody.innerHTML = resultado.memoria.map(item => `
            <tr class="${item.status === 'PISO' ? 'row-piso' : item.status === 'LIMITADO_TETO' ? 'row-teto' : ''}">
                <td class="p-2 font-semibold">${item.competencia}</td>
                <td class="p-2">${item.tipo ? `<span class="px-1 py-0.5 rounded text-xs font-bold ${item.tipo === 'PRO RATA' ? 'bg-amber-100 text-amber-800 border border-amber-200' : item.tipo === 'INTEGRAL' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : item.tipo === 'PRO RATA/FALLBACK' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}">${item.tipo}</span>` : '-'}</td>
                <td class="p-2">${item.indice !== null ? item.indice.toFixed(4) : '-'}</td>
                <td class="p-2">${formatarNumero(item.salarioMinimo)}</td>
                <td class="p-2">${formatarNumero(item.teto)}</td>
                <td class="p-2">${item.indiceTeto !== null ? item.indiceTeto.toFixed(5) : '-'}</td>
                <td class="p-2"><span class="status-badge ${item.status === 'PISO' ? 'status-piso' : item.status === 'LIMITADO_TETO' ? 'status-teto' : 'status-normal'}">${item.status === 'LIMITADO_TETO' ? 'TETO' : item.status}</span></td>
                <td class="p-2">${formatarNumero(item.valorTeorico)}</td>
                <td class="p-2">${formatarNumero(item.valorEvoluido)}</td>
                <td class="p-2 font-bold">${formatarNumero(item.valorFinal)}</td>
            </tr>
        `).join('');

        // Guarda resultado no bloco para exportação
        bloco.dataset.resultado = JSON.stringify(resultado);
        // Expandir memória automaticamente
        const memoriaDiv = divResultado.querySelector('.memoria-beneficio-recebido');
        memoriaDiv.classList.remove('hidden');
        const btnToggle = divResultado.closest('.beneficio-recebido-bloco').querySelector('.btn-toggle-memoria');
        btnToggle.textContent = 'Ocultar Memória';
        bloco.dataset.memoriaExpandida = 'true';

    } catch (erro) {
        alert('Erro ao calcular benefício recebido: ' + erro.message);
    }
}

// =====================================================================
// COLETA E RESTAURAÇÃO (com resultado)
// =====================================================================
function coletarBeneficiosRecebidos() {
    const blocos = document.querySelectorAll('.beneficio-recebido-bloco');
    const resultados = [];
    blocos.forEach(bloco => {
        const campos = bloco.querySelectorAll('[data-campo]');
        const dados = {};
        campos.forEach(el => {
            const nome = el.getAttribute('data-campo');
            dados[nome] = el.value;
        });
        const resultadoStr = bloco.dataset.resultado;
        if (resultadoStr) {
            dados.resultado = JSON.parse(resultadoStr);
        }
        dados.memoriaExpandida = bloco.dataset.memoriaExpandida === 'true';
        resultados.push(dados);
    });
    return resultados;
}

function restaurarBeneficiosRecebidos(dados) {
    const container = document.getElementById('containerBeneficiosRecebidos');
    if (!container) return;
    container.innerHTML = '';
    if (!dados || !Array.isArray(dados) || dados.length === 0) {
        adicionarBeneficioRecebido({});
        return;
    }
    dados.forEach(item => {
        adicionarBeneficioRecebido(item);
    });
}

// =====================================================================
// REMOVER
// =====================================================================
function removerBeneficioRecebido(botao) {
    if (confirm('Remover este benefício recebido?')) {
        const bloco = botao.closest('.beneficio-recebido-bloco');
        if (bloco) bloco.remove();
    }
}
