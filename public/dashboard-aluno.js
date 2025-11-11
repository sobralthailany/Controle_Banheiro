// dashboard-aluno.js

let intervaloAtualizacao;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado como aluno
    const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
    if (!usuarioAtual || usuarioAtual.tipo !== 'aluno') {
        window.location.href = 'index.html';
        return;
    }
    
    // Configurar interface
    document.getElementById('nomeAluno').textContent = usuarioAtual.nome;
    
    // Configurar eventos
    document.getElementById('btnSolicitar').addEventListener('click', solicitarSaida);
    document.getElementById('btnRetornar').addEventListener('click', registrarRetorno);
    document.getElementById('btnCancelar').addEventListener('click', cancelarSolicitacao);
    document.getElementById('btnLogout').addEventListener('click', logout);
    
    // Iniciar atualizações
    atualizarInterfaceFila();
    carregarHistoricoRecente();
    
    // Atualizar a cada 5 segundos
    intervaloAtualizacao = setInterval(atualizarInterfaceFila, 5000);
});

function atualizarInterfaceFila() {
    const status = getStatusBanheiro();
    const minhaPosicao = getMinhaPosicao();
    
    // Atualizar status do banheiro
    const statusEl = document.getElementById('statusBanheiro');
    if (statusEl) {
        statusEl.className = `status-indicator ${status.status === 'disponivel' ? 'disponivel' : 'ocupado'}`;
        statusEl.innerHTML = `
            <span class="status-text">${status.status === 'disponivel' ? 'Disponível' : 'Ocupado'}</span>
            <span class="status-icon">${status.status === 'disponivel' ? '✅' : '🚫'}</span>
        `;
    }
    
    // Atualizar informações da fila
    const infoFilaEl = document.getElementById('infoFila');
    const btnSolicitar = document.getElementById('btnSolicitar');
    const btnRetornar = document.getElementById('btnRetornar');
    const btnCancelar = document.getElementById('btnCancelar');
    
    if (minhaPosicao === 'banheiro') {
        infoFilaEl.textContent = 'Você está usando o banheiro';
        btnSolicitar.disabled = true;
        btnRetornar.disabled = false;
        btnCancelar.disabled = true;
    } else if (minhaPosicao) {
        infoFilaEl.textContent = `Você está na posição ${minhaPosicao} da fila`;
        btnSolicitar.disabled = true;
        btnRetornar.disabled = true;
        btnCancelar.disabled = false;
    } else {
        infoFilaEl.textContent = 'Você não está na fila';
        btnSolicitar.disabled = false;
        btnRetornar.disabled = true;
        btnCancelar.disabled = true;
    }
    
    // Atualizar lista da fila
    const filaBanheiro = JSON.parse(localStorage.getItem('filaBanheiro')) || [];
    const listaFilaEl = document.getElementById('listaFila');
    
    if (filaBanheiro.length > 0) {
        listaFilaEl.innerHTML = '';
        filaBanheiro.forEach(aluno => {
            const item = document.createElement('div');
            item.className = 'item-fila';
            item.textContent = `Posição ${aluno.posicao}: ${aluno.usuarioNome}`;
            listaFilaEl.appendChild(item);
        });
    } else {
        listaFilaEl.innerHTML = '<p class="fila-vazia">Nenhum aluno na fila no momento</p>';
    }
}

function carregarHistoricoRecente() {
    const historicoUsuario = getHistoricoUsuario();
    const historicoRecente = historicoUsuario.slice(0, 5); // Últimos 5 registros
    const historicoEl = document.getElementById('historicoAluno');
    
    if (historicoRecente.length > 0) {
        historicoEl.innerHTML = '';
        historicoRecente.forEach(registro => {
            const tr = document.createElement('tr');
            const dataSaida = new Date(registro.dataSaida);
            const dataRetorno = registro.dataRetorno ? new Date(registro.dataRetorno) : null;
            
            tr.innerHTML = `
                <td>${dataSaida.toLocaleDateString()}</td>
                <td>${dataSaida.toLocaleTimeString()}</td>
                <td>${dataRetorno ? dataRetorno.toLocaleTimeString() : '-'}</td>
                <td>${registro.tempoFora ? registro.tempoFora + ' min' : '-'}</td>
            `;
            historicoEl.appendChild(tr);
        });
    } else {
        historicoEl.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum registro encontrado</td></tr>';
    }
}

// Parar atualizações quando a página for fechada
window.addEventListener('beforeunload', function() {
    if (intervaloAtualizacao) {
        clearInterval(intervaloAtualizacao);
    }
});