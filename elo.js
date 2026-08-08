/* Calcula o novo ELO dos jogadores */
function calculateElo(whiteRating, blackRating, kFactor, actualScore) {
    // Calcula a pontuação esperada para as Brancas (Eb)
    const expectedWhite = 1 / (1 + Math.pow(10, (blackRating - whiteRating) / 400));
    
    // Calcula a variação de pontos (ΔRb)
    // Usamos Math.round para garantir que os pontos de ELO sejam números inteiros
    const ratingChange = Math.round(kFactor * (actualScore - expectedWhite));

    results = {
        ratingChangeWhite: ratingChange,
        ratingChangeBlack: -ratingChange,
        newWhiteRating: whiteRating + ratingChange,
        newBlackRating: blackRating - ratingChange
    }

    // console.log({actualScore, ratingChange, newWhiteRating: results.newWhiteRating, newBlackRating: results.newBlackRating})

    return results;
}