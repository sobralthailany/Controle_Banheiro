// dashboard-admin.js

let intervaloAtualizacao;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado como admin
    const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
    if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    
    // Configurar eventos
    document.getElementById('btnLimparFila').addEventListener('click', limparFila);
    document.getElementById('btnResetarSistema').addEventListener('click', resetarSistema);
    document.getElementById('btnLogout').addEventListener('click', logout);
    
    // Iniciar atualizações
    atualizarInterfaceAdmin();
    
    // Atualizar a cada 3 segundos
    intervaloAtualizacao = setInterval(atualizarInterfaceAdmin, 3000);
});

function atualizarInterfaceAdmin() {
    const status = getStatusBanheiro();
    const filaBanheiro = JSON.parse(localStorage.getItem('filaBanheiro')) || [];
    const alunosForaSala = getAlunosForaSala();
    const estatisticas = getEstatisticas();
    
    // Atualizar status geral
    document.getElementById('statusBanheiroGeral').textContent = 
        status.status === 'disponivel' ? 'Disponível ✅' : 'Ocupado 🚫';
    document.getElementById('alunosFila').textContent = filaBanheiro.length;
    document.getElementById('alunoAtual').textContent = status.usuario || 'Nenhum';
    document.getElementById('tempoAtual').textContent = status.tempo || '00:00';
    
    // Atualizar alunos fora da sala
    const alunosForaSalaEl = document.getElementById('alunosForaSala');
    if (alunosForaSala.length > 0) {
        alunosForaSalaEl.innerHTML = '';
        alunosForaSala.forEach(aluno => {
            const tr = document.createElement('tr');
            const dataSaida = new Date(aluno.dataSaida);
            tr.innerHTML = `
                <td>${aluno.nome}</td>
                <td>${aluno.tempo}</td>
                <td>${dataSaida.toLocaleTimeString()}</td>
            `;
            alunosForaSalaEl.appendChild(tr);
        });
    } else {
        alunosForaSalaEl.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum aluno fora da sala</td></tr>';
    }
    
    // Atualizar fila de espera
    const listaFilaAdminEl = document.getElementById('listaFilaAdmin');
    if (filaBanheiro.length > 0) {
        listaFilaAdminEl.innerHTML = '';
        filaBanheiro.forEach(aluno => {
            const item = document.createElement('div');
            item.className = 'item-fila';
            item.textContent = `Posição ${aluno.posicao}: ${aluno.usuarioNome}`;
            listaFilaAdminEl.appendChild(item);
        });
    } else {
        listaFilaAdminEl.innerHTML = '<p class="fila-vazia">Nenhum aluno na fila</p>';
    }
    
    // Atualizar estatísticas
    document.getElementById('alunoMaisSaiu').textContent = estatisticas.alunoMaisSaiu || '-';
    document.getElementById('quantidadeMaisSaiu').textContent = estatisticas.quantidadeMaisSaiu ? `(${estatisticas.quantidadeMaisSaiu} vezes)` : '';
    document.getElementById('saidasHoje').textContent = estatisticas.totalSaidas;
    document.getElementById('tempoMedio').textContent = estatisticas.tempoMedio ? `${estatisticas.tempoMedio} min` : '0 min';
}

// Parar atualizações quando a página for fechada
window.addEventListener('beforeunload', function() {
    if (intervaloAtualizacao) {
        clearInterval(intervaloAtualizacao);
    }
});