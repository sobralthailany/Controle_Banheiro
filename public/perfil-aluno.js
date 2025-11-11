// perfil-aluno.js

let modoEdicao = false;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se está logado
    const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
    if (!usuarioAtual) {
        window.location.href = 'index.html';
        return;
    }

    // Configurar eventos
    document.getElementById('btnEditarPerfil').addEventListener('click', ativarEdicaoPerfil);
    document.getElementById('btnCancelarEdicao').addEventListener('click', cancelarEdicaoPerfil);
    document.getElementById('btnSalvarPerfil').addEventListener('click', salvarPerfil);
    document.getElementById('formSenha').addEventListener('submit', alterarSenha);
    document.getElementById('btnSalvarPreferencias').addEventListener('click', salvarPreferencias);
    document.getElementById('btnLogout').addEventListener('click', logout);
    
    // Carregar dados do perfil
    carregarPerfil();
    carregarEstatisticasPessoais();
    carregarPreferencias();
});

function carregarPerfil() {
    const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioCompleto = usuarios.find(u => u.id === usuarioAtual.id);
    
    if (usuarioCompleto) {
        document.getElementById('nomePerfil').textContent = usuarioCompleto.nome;
        document.getElementById('perfilNome').value = usuarioCompleto.nome;
        document.getElementById('perfilRm').value = usuarioCompleto.rm;
        document.getElementById('perfilEmail').value = usuarioCompleto.email;
        document.getElementById('perfilTipo').value = usuarioCompleto.tipo === 'admin' ? 'Administrador' : 'Aluno';
    }
}

function carregarEstatisticasPessoais() {
    const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
    const historico = JSON.parse(localStorage.getItem('historico')) || [];
    
    // Filtrar registros do mês atual
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const historicoMes = historico.filter(h => 
        new Date(h.dataSaida) >= primeiroDiaMes && h.usuarioId === usuarioAtual.id && h.dataRetorno
    );
    
    const saidasMes = historicoMes.length;
    const tempoTotal = historicoMes.reduce((total, h) => total + (h.tempoFora || 0), 0);
    const tempoMedio = saidasMes > 0 ? Math.round(tempoTotal / saidasMes) : 0;
    const maiorTempo = historicoMes.length > 0 ? Math.max(...historicoMes.map(h => h.tempoFora || 0)) : 0;
    
    // Calcular posição na escola (simulado)
    const todosUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const alunos = todosUsuarios.filter(u => u.tipo === 'aluno');
    const posicao = alunos.findIndex(a => a.id === usuarioAtual.id) + 1;
    
    document.getElementById('estatisticaSaidasMes').textContent = saidasMes;
    document.getElementById('estatisticaTempoMedio').textContent = tempoMedio + ' min';
    document.getElementById('estatisticaMaiorTempo').textContent = maiorTempo + ' min';
    document.getElementById('estatisticaPosicao').textContent = posicao > 0 ? `${posicao}º de ${alunos.length}` : '-';
}

function carregarPreferencias() {
    // Carregar preferências do localStorage ou usar padrões
    const preferencias = JSON.parse(localStorage.getItem('preferencias')) || {
        notificacoesEmail: false,
        lembreteTempo: true,
        temaInterface: 'claro'
    };
    
    document.getElementById('notificacoesEmail').checked = preferencias.notificacoesEmail;
    document.getElementById('lembreteTempo').checked = preferencias.lembreteTempo;
    document.getElementById('temaInterface').value = preferencias.temaInterface;
}

function ativarEdicaoPerfil() {
    modoEdicao = true;
    
    // Habilitar edição dos campos
    document.getElementById('perfilNome').readOnly = false;
    document.getElementById('perfilEmail').readOnly = false;
    
    // Mostrar/ocultar botões
    document.getElementById('btnEditarPerfil').style.display = 'none';
    document.getElementById('btnSalvarPerfil').style.display = 'inline-block';
    document.getElementById('btnCancelarEdicao').style.display = 'inline-block';
    
    // Destacar campos editáveis
    document.getElementById('perfilNome').style.background = '#fff';
    document.getElementById('perfilEmail').style.background = '#fff';
}

function cancelarEdicaoPerfil() {
    modoEdicao = false;
    
    // Restaurar valores originais
    carregarPerfil();
    
    // Desabilitar edição
    document.getElementById('perfilNome').readOnly = true;
    document.getElementById('perfilEmail').readOnly = true;
    
    // Mostrar/ocultar botões
    document.getElementById('btnEditarPerfil').style.display = 'inline-block';
    document.getElementById('btnSalvarPerfil').style.display = 'none';
    document.getElementById('btnCancelarEdicao').style.display = 'none';
    
    // Restaurar estilo dos campos
    document.getElementById('perfilNome').style.background = 'transparent';
    document.getElementById('perfilEmail').style.background = 'transparent';
}

function salvarPerfil(event) {
    event.preventDefault();
    
    const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioIndex = usuarios.findIndex(u => u.id === usuarioAtual.id);
    
    if (usuarioIndex !== -1) {
        const novoNome = document.getElementById('perfilNome').value;
        const novoEmail = document.getElementById('perfilEmail').value;
        
        // Validações
        if (!novoNome.trim()) {
            alert('O nome não pode estar vazio');
            return;
        }
        
        if (!novoEmail.trim()) {
            alert('O e-mail não pode estar vazio');
            return;
        }
        
        // Verificar se email já existe (exceto para o próprio usuário)
        const emailExistente = usuarios.find(u => u.email === novoEmail && u.id !== usuarioAtual.id);
        if (emailExistente) {
            alert('Já existe um usuário com este e-mail');
            return;
        }
        
        // Atualizar dados
        usuarios[usuarioIndex].nome = novoNome;
        usuarios[usuarioIndex].email = novoEmail;
        
        // Atualizar usuário atual na sessão
        usuarioAtual.nome = novoNome;
        usuarioAtual.email = novoEmail;
        
        // Salvar no localStorage
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        localStorage.setItem('usuarioAtual', JSON.stringify(usuarioAtual));
        
        // Sair do modo edição
        cancelarEdicaoPerfil();
        
        alert('Perfil atualizado com sucesso!');
    }
}

function alterarSenha(event) {
    event.preventDefault();
    
    const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioIndex = usuarios.findIndex(u => u.id === usuarioAtual.id);
    
    if (usuarioIndex !== -1) {
        const senhaAtual = document.getElementById('senhaAtual').value;
        const novaSenha = document.getElementById('novaSenha').value;
        const confirmarNovaSenha = document.getElementById('confirmarNovaSenha').value;
        
        // Validações
        if (!senhaAtual) {
            alert('Digite sua senha atual');
            return;
        }
        
        // Verificar senha atual
        if (senhaAtual !== usuarios[usuarioIndex].senha) {
            alert('Senha atual incorreta');
            return;
        }
        
        if (!novaSenha) {
            alert('Digite a nova senha');
            return;
        }
        
        if (novaSenha.length < 6) {
            alert('A nova senha deve ter pelo menos 6 caracteres');
            return;
        }
        
        if (novaSenha !== confirmarNovaSenha) {
            alert('As senhas não coincidem');
            return;
        }
        
        // Atualizar senha
        usuarios[usuarioIndex].senha = novaSenha;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        // Limpar formulário
        document.getElementById('formSenha').reset();
        
        alert('Senha alterada com sucesso!');
    }
}

function salvarPreferencias() {
    const preferencias = {
        notificacoesEmail: document.getElementById('notificacoesEmail').checked,
        lembreteTempo: document.getElementById('lembreteTempo').checked,
        temaInterface: document.getElementById('temaInterface').value
    };
    
    localStorage.setItem('preferencias', JSON.stringify(preferencias));
    
    // Aplicar tema
    aplicarTemaInterface(preferencias.temaInterface);
    
    alert('Preferências salvas com sucesso!');
}

function aplicarTemaInterface(tema) {
    // Implementação básica de temas
    const body = document.body;
    
    // Remover classes de tema anteriores
    body.classList.remove('tema-claro', 'tema-escuro', 'tema-auto');
    
    // Aplicar novo tema
    switch (tema) {
        case 'escuro':
            body.classList.add('tema-escuro');
            break;
        case 'auto':
            body.classList.add('tema-auto');
            // Aqui poderia detectar preferência do sistema
            break;
        default:
            body.classList.add('tema-claro');
    }
}