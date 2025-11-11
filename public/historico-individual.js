// historico-individual.js

let paginaAtual = 1;
const registrosPorPagina = 10;
let historicoFiltrado = [];

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
    if (!usuarioAtual) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('nomeAlunoHistorico').textContent = usuarioAtual.nome;
    
    // Configurar eventos
    document.getElementById('btnFiltrar').addEventListener('click', aplicarFiltros);
    document.getElementById('btnLimparFiltro').addEventListener('click', limparFiltros);
    document.getElementById('btnAnterior').addEventListener('click', paginaAnterior);
    document.getElementById('btnProximo').addEventListener('click', paginaProxima);
    document.getElementById('btnLogout').addEventListener('click', logout);
    
    // Carregar dados iniciais
    carregarHistoricoCompleto();
    carregarResumo();
});

function aplicarFiltros() {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    
    const historicoUsuario = getHistoricoUsuario();
    
    historicoFiltrado = historicoUsuario.filter(registro => {
        const dataRegistro = new Date(registro.dataSaida).toISOString().split('T')[0];
        let passaFiltro = true;
        
        if (dataInicio && dataRegistro < dataInicio) {
            passaFiltro = false;
        }
        
        if (dataFim && dataRegistro > dataFim) {
            passaFiltro = false;
        }
        
        return passaFiltro;
    });
    
    paginaAtual = 1;
    carregarHistoricoCompleto();
    carregarResumo();
}

function limparFiltros() {
    document.getElementById('dataInicio').value = '';
    document.getElementById('dataFim').value = '';
    historicoFiltrado = [];
    paginaAtual = 1;
    carregarHistoricoCompleto();
    carregarResumo();
}

function carregarHistoricoCompleto() {
    const historicoUsuario = historicoFiltrado.length > 0 ? historicoFiltrado : getHistoricoUsuario();
    const totalRegistros = historicoUsuario.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    
    // Calcular índices para paginação
    const inicio = (paginaAtual - 1) * registrosPorPagina;
    const fim = inicio + registrosPorPagina;
    const registrosPagina = historicoUsuario.slice(inicio, fim);
    
    // Atualizar controles de paginação
    document.getElementById('infoPagina').textContent = `Página ${paginaAtual} de ${totalPaginas}`;
    document.getElementById('btnAnterior').disabled = paginaAtual <= 1;
    document.getElementById('btnProximo').disabled = paginaAtual >= totalPaginas;
    
    // Atualizar tabela
    const historicoEl = document.getElementById('historicoCompleto');
    
    if (registrosPagina.length > 0) {
        historicoEl.innerHTML = '';
        registrosPagina.forEach(registro => {
            const tr = document.createElement('tr');
            const dataSaida = new Date(registro.dataSaida);
            const dataRetorno = registro.dataRetorno ? new Date(registro.dataRetorno) : null;
            
            // Determinar status
            let status = 'Concluído';
            let statusClass = 'status-concluido';
            
            if (!registro.dataRetorno) {
                status = 'Em Andamento';
                statusClass = 'status-andamento';
            } else if (registro.tempoFora > 10) {
                status = 'Demorado';
                statusClass = 'status-demorado';
            }
            
            tr.innerHTML = `
                <td>${dataSaida.toLocaleDateString()}</td>
                <td>${dataSaida.toLocaleTimeString()}</td>
                <td>${dataRetorno ? dataRetorno.toLocaleTimeString() : '-'}</td>
                <td>${registro.tempoFora ? registro.tempoFora + ' min' : '-'}</td>
                <td><span class="${statusClass}">${status}</span></td>
            `;
            historicoEl.appendChild(tr);
        });
    } else {
        historicoEl.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum registro encontrado</td></tr>';
    }
}

function carregarResumo() {
    const historicoUsuario = historicoFiltrado.length > 0 ? historicoFiltrado : getHistoricoUsuario();
    const historicoConcluido = historicoUsuario.filter(h => h.dataRetorno);
    
    const totalSaidas = historicoConcluido.length;
    const tempoTotal = historicoConcluido.reduce((total, h) => total + (h.tempoFora || 0), 0);
    const tempoMedio = totalSaidas > 0 ? Math.round(tempoTotal / totalSaidas) : 0;
    const maiorTempo = historicoConcluido.length > 0 ? 
        Math.max(...historicoConcluido.map(h => h.tempoFora || 0)) : 0;
    
    document.getElementById('totalSaidas').textContent = totalSaidas;
    document.getElementById('tempoTotal').textContent = tempoTotal + ' min';
    document.getElementById('tempoMedio').textContent = tempoMedio + ' min';
    document.getElementById('maiorTempo').textContent = maiorTempo + ' min';
}

function paginaAnterior() {
    if (paginaAtual > 1) {
        paginaAtual--;
        carregarHistoricoCompleto();
    }
}

function paginaProxima() {
    const historicoUsuario = historicoFiltrado.length > 0 ? historicoFiltrado : getHistoricoUsuario();
    const totalPaginas = Math.ceil(historicoUsuario.length / registrosPorPagina);
    
    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        carregarHistoricoCompleto();
    }
}