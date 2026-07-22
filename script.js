// URL base da sua API
const API_URL = "https://elo-rating-calculator-api.onrender.com";

// Dispara a função de buscar jogadores assim que a página carrega
document.addEventListener('DOMContentLoaded', carregarJogadores);

async function carregarJogadores() {
    try {
        const resposta = await fetch(`${API_URL}/jogadores`);
        if (!resposta.ok) throw new Error('Falha ao conectar na API');
        
        const jogadores = await resposta.json();
        
        const selectBrancas = document.getElementById('jogador_brancas_id');
        const selectPretas = document.getElementById('jogador_pretas_id');
        
        // Limpa a mensagem "Carregando..." e coloca a opção padrão
        selectBrancas.innerHTML = '<option value="">Selecione o jogador...</option>';
        selectPretas.innerHTML = '<option value="">Selecione o jogador...</option>';
        
        // Injeta cada jogador vindo do banco de dados nas duas listas
        jogadores.forEach(jogador => {
            const opcaoBrancas = document.createElement('option');
            opcaoBrancas.value = jogador.id;
            opcaoBrancas.textContent = jogador.nome;
            selectBrancas.appendChild(opcaoBrancas);

            const opcaoPretas = document.createElement('option');
            opcaoPretas.value = jogador.id;
            opcaoPretas.textContent = jogador.nome;
            selectPretas.appendChild(opcaoPretas);
        });

    } catch (erro) {
        mostrarMensagem('Erro ao carregar a lista de alunos do servidor.', 'erro');
    }
}

// Lógica de envio do formulário
document.getElementById('formPartida').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const btnSubmit = document.querySelector('button[type="submit"]');
    
    const dados = {
        data_partida: document.getElementById('data_partida').value,
        hora_partida: document.getElementById('hora_partida').value,
        jogador_brancas_id: parseInt(document.getElementById('jogador_brancas_id').value),
        jogador_pretas_id: parseInt(document.getElementById('jogador_pretas_id').value),
        resultado: document.getElementById('resultado').value
    };

    if (dados.jogador_brancas_id === dados.jogador_pretas_id) {
        mostrarMensagem('Um jogador não pode jogar contra si mesmo.', 'erro');
        return;
    }

    btnSubmit.textContent = 'Enviando...';
    btnSubmit.disabled = true;
    document.getElementById('mensagem').style.display = 'none';

    try {
        const resposta = await fetch(`${API_URL}/registrar_partida`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const jsonRetorno = await resposta.json();

        if (resposta.ok) {
            mostrarMensagem(`Partida registrada! Os novos ratings são ${jsonRetorno.jogadores.brancas.novo_rating} para as brancas e ${jsonRetorno.jogadores.pretas.novo_rating} para as pretas.`, 'sucesso');
            document.getElementById('formPartida').reset();
        } else {
            mostrarMensagem(`Erro: ${jsonRetorno.detail}`, 'erro');
        }
    } catch (erro) {
        mostrarMensagem('Erro de conexão. A API está online?', 'erro');
    } finally {
        btnSubmit.textContent = 'Registrar Partida';
        btnSubmit.disabled = false;
    }
});

function mostrarMensagem(texto, classe) {
    const div = document.getElementById('mensagem');
    div.textContent = texto;
    div.className = classe;
    div.style.display = 'block';
}
