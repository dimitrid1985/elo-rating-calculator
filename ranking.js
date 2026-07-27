const API_URL = "https://elo-rating-calculator-api.onrender.com";

// Dispara a função assim que a página de ranking carrega
document.addEventListener('DOMContentLoaded', carregarRanking);

async function carregarRanking() {
    try {
        const resposta = await fetch(`${API_URL}/ranking`);
        if (!resposta.ok) throw new Error('Falha ao conectar na API');
        
        const jogadores = await resposta.json();
        
        const tbody = document.querySelector('#tabelaRanking tbody');
        tbody.innerHTML = ''; // Limpa a mensagem "Carregando..."

        // Preenche a tabela com os jogadores
        jogadores.forEach((jogador, index) => {
            const posicao = index + 1;
            const tr = document.createElement('tr');
            const nomeSeguroUrl = encodeURIComponent(jogador.nome);
            const linkHistorico = `<a href="historico.html?jogador=${nomeSeguroUrl}" style="color: #0056b3; text-decoration: none; font-weight: bold;">${jogador.nome}</a>`;
            
            // Define a classe CSS caso o jogador esteja no pódio
            let classePosicao = '';
            if (posicao === 1) classePosicao = 'posicao-1';
            else if (posicao === 2) classePosicao = 'posicao-2';
            else if (posicao === 3) classePosicao = 'posicao-3';

            tr.innerHTML = `
                <td class="${classePosicao}">${posicao}º</td>
                <td>${linkHistorico}</td>
                <td><strong>${jogador.rating}</strong></td>
            `;
            tbody.appendChild(tr);
        });

    } catch (erro) {
        const tbody = document.querySelector('#tabelaRanking tbody');
        tbody.innerHTML = `<tr><td colspan="3" class="erro" style="text-align: center;">Erro ao carregar o ranking.</td></tr>`;
    }
}