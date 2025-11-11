// script.js - GERENCIAMENTO DE USUÁRIOS E LOGIN

// Banco de dados simulado
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let filaBanheiro = JSON.parse(localStorage.getItem('filaBanheiro')) || [];
let historico = JSON.parse(localStorage.getItem('historico')) || [];
let banheiroOcupado = JSON.parse(localStorage.getItem('banheiroOcupado')) || false;
let usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual')) || null;

// Inicializar com alguns dados de exemplo
if (usuarios.length === 0) {
    usuarios = [
        { id: 1, rm: "123", nome: "João Silva", email: "joao@email.com", senha: "123", tipo: "aluno" },
        { id: 2, rm: "456", nome: "Maria Santos", email: "maria@email.com", senha: "123", tipo: "aluno" },
        { id: 3, rm: "admin", nome: "Professor Admin", email: "admin@escola.com", senha: "admin", tipo: "admin" }
    ];
    salvarNoLocalStorage();
}

document.addEventListener('DOMContentLoaded', function() {
    // Configurar formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', fazerLogin);
    }

    // Configurar formulário de cadastro
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', cadastrarUsuario);
    }

    // Verificar se usuário já está logado
    verificarLoginExistente();
});

function salvarNoLocalStorage() {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('filaBanheiro', JSON.stringify(filaBanheiro));
    localStorage.setItem('historico', JSON.stringify(historico));
    localStorage.setItem('banheiroOcupado', JSON.stringify(banheiroOcupado));
    localStorage.setItem('usuarioAtual', JSON.stringify(usuarioAtual));
}

function fazerLogin(event) {
    event.preventDefault();
    
    const rm = document.getElementById('rm').value;
    const senha = document.getElementById('senha').value;
    const tipoUsuario = document.querySelector('input[name="tipoUsuario"]:checked').value;
    
    if (!rm || !senha) {
        alert("Preencha RM e senha");
        return;
    }

    const usuario = usuarios.find(u => u.rm === rm && u.senha === senha && u.tipo === tipoUsuario);
    
    if (usuario) {
        usuarioAtual = usuario;
        salvarNoLocalStorage();
        
        alert(`Login realizado com sucesso! Bem-vindo, ${usuario.nome}`);
        
        if (tipoUsuario === 'aluno') {
            window.location.href = 'dashboard-aluno.html';
        } else {
            window.location.href = 'dashboard-admin.html';
        }
    } else {
        alert("RM ou senha incorretos, ou tipo de usuário inválido");
    }
}

function cadastrarUsuario(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nomeCompleto').value;
    const rm = document.getElementById('rm').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const tipoUsuario = document.querySelector('input[name="tipoUsuario"]:checked').value;
    
    // Validações
    if (!nome || !rm || !email || !senha || !confirmarSenha) {
        alert("Preencha todos os campos");
        return;
    }
    
    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem");
        return;
    }
    
    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres");
        return;
    }
    
    if (usuarios.find(u => u.rm === rm)) {
        alert("Já existe um usuário com este RM");
        return;
    }
    
    if (usuarios.find(u => u.email === email)) {
        alert("Já existe um usuário com este e-mail");
        return;
    }

    // Criar novo usuário
    const novoUsuario = {
        id: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1,
        rm: rm,
        nome: nome,
        email: email,
        senha: senha,
        tipo: tipoUsuario
    };
    
    usuarios.push(novoUsuario);
    salvarNoLocalStorage();
    
    alert("Cadastro realizado com sucesso! Você já pode fazer login.");
    window.location.href = 'index.html';
}

function verificarLoginExistente() {
    if (usuarioAtual) {
        if (usuarioAtual.tipo === 'aluno' && !window.location.href.includes('dashboard-aluno')) {
            window.location.href = 'dashboard-aluno.html';
        } else if (usuarioAtual.tipo === 'admin' && !window.location.href.includes('dashboard-admin')) {
            window.location.href = 'dashboard-admin.html';
        }
    }
}

function logout() {
    usuarioAtual = null;
    salvarNoLocalStorage();
    window.location.href = 'index.html';
}

// Funções do sistema de fila
function solicitarSaida() {
    if (!usuarioAtual || usuarioAtual.tipo !== 'aluno') {
        alert("Você precisa estar logado como aluno para solicitar saída");
        return;
    }

    // Verificar se já está na fila
    if (filaBanheiro.some(item => item.usuarioId === usuarioAtual.id)) {
        alert("Você já está na fila!");
        return;
    }

    // Verificar se já está no banheiro
    const usuarioNoBanheiro = historico.find(h => h.usuarioId === usuarioAtual.id && !h.dataRetorno);
    if (usuarioNoBanheiro) {
        alert("Você já está usando o banheiro!");
        return;
    }

    if (!banheiroOcupado && filaBanheiro.length === 0) {
        // Liberar banheiro imediatamente
        banheiroOcupado = true;
        const historicoEntry = {
            id: historico.length > 0 ? Math.max(...historico.map(h => h.id)) + 1 : 1,
            usuarioId: usuarioAtual.id,
            usuarioNome: usuarioAtual.nome,
            dataSaida: new Date().toISOString(),
            dataRetorno: null,
            tempoFora: null
        };
        historico.push(historicoEntry);
        salvarNoLocalStorage();
        alert("✅ Saída liberada! Você pode usar o banheiro agora.");
    } else {
        // Entrar na fila
        const posicao = filaBanheiro.length + 1;
        filaBanheiro.push({
            usuarioId: usuarioAtual.id,
            usuarioNome: usuarioAtual.nome,
            dataSolicitacao: new Date().toISOString(),
            posicao: posicao
        });
        salvarNoLocalStorage();
        alert(`⏳ Banheiro ocupado. Você é o nº ${posicao} na fila.`);
    }
    
    // Atualizar a interface se estiver no dashboard
    if (typeof atualizarInterfaceFila === 'function') {
        atualizarInterfaceFila();
    }
}

function cancelarSolicitacao() {
    if (!usuarioAtual) return;

    const index = filaBanheiro.findIndex(item => item.usuarioId === usuarioAtual.id);
    if (index !== -1) {
        filaBanheiro.splice(index, 1);
        // Reorganizar posições
        filaBanheiro.forEach((item, idx) => {
            item.posicao = idx + 1;
        });
        salvarNoLocalStorage();
        alert("Solicitação cancelada!");
        
        if (typeof atualizarInterfaceFila === 'function') {
            atualizarInterfaceFila();
        }
    }
}

function registrarRetorno() {
    if (!usuarioAtual) return;

    const historicoEntry = historico.find(h => h.usuarioId === usuarioAtual.id && !h.dataRetorno);
    if (historicoEntry) {
        const dataRetorno = new Date();
        const dataSaida = new Date(historicoEntry.dataSaida);
        const tempoFora = Math.round((dataRetorno - dataSaida) / (1000 * 60)); // em minutos
        
        historicoEntry.dataRetorno = dataRetorno.toISOString();
        historicoEntry.tempoFora = tempoFora;
        
        banheiroOcupado = false;
        
        // Chamar próximo da fila
        if (filaBanheiro.length > 0) {
            setTimeout(chamarProximoDaFila, 1000);
        }
        
        salvarNoLocalStorage();
        alert(`Retorno registrado! Tempo fora: ${tempoFora} minutos`);
        
        if (typeof atualizarInterfaceFila === 'function') {
            atualizarInterfaceFila();
        }
    }
}

function chamarProximoDaFila() {
    if (filaBanheiro.length > 0 && !banheiroOcupado) {
        const proximo = filaBanheiro.shift();
        banheiroOcupado = true;
        
        const historicoEntry = {
            id: historico.length > 0 ? Math.max(...historico.map(h => h.id)) + 1 : 1,
            usuarioId: proximo.usuarioId,
            usuarioNome: proximo.usuarioNome,
            dataSaida: new Date().toISOString(),
            dataRetorno: null,
            tempoFora: null
        };
        historico.push(historicoEntry);
        
        // Reorganizar posições da fila
        filaBanheiro.forEach((item, idx) => {
            item.posicao = idx + 1;
        });
        
        salvarNoLocalStorage();
        
        // Atualizar interfaces
        if (typeof atualizarInterfaceFila === 'function') {
            atualizarInterfaceFila();
        }
        
        // Simular notificação para o próximo aluno
        console.log(`📢 Próximo da fila: ${proximo.usuarioNome}`);
    }
}

function limparFila() {
    if (confirm('Tem certeza que deseja limpar toda a fila de espera?')) {
        filaBanheiro = [];
        salvarNoLocalStorage();
        alert('Fila limpa com sucesso!');
        
        if (typeof atualizarInterfaceFila === 'function') {
            atualizarInterfaceFila();
        }
    }
}

function resetarSistema() {
    if (confirm('ATENÇÃO: Isso irá resetar todo o sistema (fila e histórico do dia). Continuar?')) {
        filaBanheiro = [];
        // Manter apenas o histórico de dias anteriores
        const hoje = new Date().toDateString();
        historico = historico.filter(h => {
            const dataRegistro = new Date(h.dataSaida).toDateString();
            return dataRegistro !== hoje;
        });
        banheiroOcupado = false;
        salvarNoLocalStorage();
        alert('Sistema resetado com sucesso!');
        
        if (typeof atualizarInterfaceFila === 'function') {
            atualizarInterfaceFila();
        }
    }
}

// Funções para obter dados
function getStatusBanheiro() {
    if (banheiroOcupado) {
        const usuarioNoBanheiro = historico.find(h => !h.dataRetorno);
        return {
            status: 'ocupado',
            usuario: usuarioNoBanheiro ? usuarioNoBanheiro.usuarioNome : 'Desconhecido',
            tempo: usuarioNoBanheiro ? calcularTempoDecorrido(usuarioNoBanheiro.dataSaida) : '0 min'
        };
    } else {
        return {
            status: 'disponivel',
            usuario: null,
            tempo: null
        };
    }
}

function getMinhaPosicao() {
    if (!usuarioAtual) return null;
    
    const naFila = filaBanheiro.find(item => item.usuarioId === usuarioAtual.id);
    if (naFila) {
        return naFila.posicao;
    }
    
    const noBanheiro = historico.find(h => h.usuarioId === usuarioAtual.id && !h.dataRetorno);
    if (noBanheiro) {
        return 'banheiro';
    }
    
    return null;
}

function getHistoricoUsuario(usuarioId = null) {
    const id = usuarioId || (usuarioAtual ? usuarioAtual.id : null);
    if (!id) return [];
    
    return historico
        .filter(h => h.usuarioId === id)
        .sort((a, b) => new Date(b.dataSaida) - new Date(a.dataSaida));
}

function getAlunosForaSala() {
    return historico
        .filter(h => !h.dataRetorno)
        .map(h => ({
            nome: h.usuarioNome,
            tempo: calcularTempoDecorrido(h.dataSaida),
            dataSaida: h.dataSaida
        }));
}

function getEstatisticas() {
    const hoje = new Date().toDateString();
    const historicoHoje = historico.filter(h => 
        new Date(h.dataSaida).toDateString() === hoje
    );
    
    // Aluno que mais saiu
    const contagemSaidas = {};
    historicoHoje.forEach(h => {
        if (h.dataRetorno) { // Só contar saídas concluídas
            contagemSaidas[h.usuarioNome] = (contagemSaidas[h.usuarioNome] || 0) + 1;
        }
    });
    
    let alunoMaisSaiu = null;
    let maxSaidas = 0;
    Object.entries(contagemSaidas).forEach(([nome, quantidade]) => {
        if (quantidade > maxSaidas) {
            maxSaidas = quantidade;
            alunoMaisSaiu = nome;
        }
    });
    
    // Tempo médio
    const tempos = historicoHoje
        .filter(h => h.tempoFora)
        .map(h => h.tempoFora);
    const tempoMedio = tempos.length > 0 ? 
        Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 0;
    
    return {
        totalSaidas: historicoHoje.filter(h => h.dataRetorno).length,
        alunoMaisSaiu: alunoMaisSaiu,
        quantidadeMaisSaiu: maxSaidas,
        tempoMedio: tempoMedio
    };
}

function calcularTempoDecorrido(dataString) {
    const diff = new Date() - new Date(dataString);
    const minutos = Math.floor(diff / (1000 * 60));
    return `${minutos} min`;
}