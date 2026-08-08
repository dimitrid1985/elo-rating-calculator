
/* SLIDER DE RESULTADO DA PARTIDA */
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona o slider e os spans (rótulos)
    const resultSlider = document.getElementById('match-result');
    const resultLabels = document.querySelectorAll('.result-labels span');

    // Função para atualizar qual rótulo recebe a classe .active
    function updateActiveLabel(sliderValue) {
        // 1. Remove a classe 'active' de todos os rótulos
        resultLabels.forEach(label => label.classList.remove('active'));

        // 2. Converte o valor do slider (-1, 0, 1) para o índice correto (0, 1, 2)
        // -1 + 1 = 0 (WHITE)
        //  0 + 1 = 1 (DRAW)
        //  1 + 1 = 2 (BLACK)
        const activeIndex = parseInt(sliderValue) + 1;

        // 3. Adiciona a classe 'active' ao rótulo correspondente
        resultLabels[activeIndex].classList.add('active');
    }

    // Escuta as mudanças no slider feitas pelo usuário
    resultSlider.addEventListener('input', (event) => {
        updateActiveLabel(event.target.value);
    });
});
/* FIM DO SLIDER DE RESULTADO DA PARTIDA */


/* EXIBIÇÃO DO RESULTADO */
const form = document.querySelector('form'); 
const resultsCard = document.querySelector('.results-card'); 

form.addEventListener('submit', function(event) {
    event.preventDefault();

    // 1. Captura os valores dos inputs
    const whiteRating = parseInt(document.getElementById('white-rating').value);
    const blackRating = parseInt(document.getElementById('black-rating').value);
    const kFactor = parseInt(document.getElementById('k-factor').value);
    
    // 2. Determina a pontuação real com base no slider
    const sliderValue = document.querySelector('input[type="range"]').value;
    let actualScore;
    let resultText; // Variável para armazenar o texto do rodapé
    
    if (sliderValue == -1) {
        actualScore = 1;
        resultText = "White won";
    } else if (sliderValue == 0) {
        actualScore = 0.5;
        resultText = "Draw";
    } else {
        actualScore = 0;
        resultText = "Black won";
    }

    // 3. Executa o cálculo utilizando a função do arquivo elo.js
    const result = calculateElo(whiteRating, blackRating, kFactor, actualScore);

    // 4. Função auxiliar para montar o HTML da variação com as classes corretas
    function formatScoreChange(change) {
        if (change > 0) {
            return `<span class="positive">+ ${change}</span>`;
        } else if (change < 0) {
            // Usa Math.abs para remover o sinal de menos nativo e forçar o nosso layout
            return `<span class="negative">- ${Math.abs(change)}</span>`;
        } else {
            return `<span>+0</span>`; // Para casos de empate onde o rating não muda
        }
    }

    // 5. Injeta os resultados no HTML usando template literals
    document.querySelector('.white-result .score-calc').innerHTML = `
        ${formatScoreChange(result.ratingChangeWhite)} = <strong>${result.newWhiteRating}</strong>
    `;

    document.querySelector('.black-result .score-calc').innerHTML = `
        ${formatScoreChange(result.ratingChangeBlack)} = <strong>${result.newBlackRating}</strong>
    `;

    // 6. Atualiza o rodapé com o Fator K e quem venceu
    document.querySelector('.results-footer').textContent = `K=${kFactor} · ${resultText}`;

    // 7. Revela o card de resultados
    resultsCard.classList.remove('hidden');
});