# Calculadora de rating ELO

Front-end de aplicação web para registrar partidas de xadrez e calcular o rating dos jogadores dinamicamente, utilizando o sistema Elo.

O back-end encontra-se [neste repositório](https://github.com/dimitrid1985/elo-rating-calculator-api).

## Features ##

| Recurso                                                | Status       |
| :----------------------------------------------------- | :------------|
| Registro de partidas                                   | Implementado |
| Ranking de jogadores                                   | Implementado |
| Gráfico de desempenho individual                       | Implementado |
| Controle de acesso                                     | Implementado |
| Histórico de partidas                                  | Implementado |
| Possibilidade de incluir novos jogadores               | Implementado |

## Outros ajustes pendentes ##

* Retirar as estilizações in-line e colocar tudo no CSS separado.
* O formulário de registro de partidas pode ser facilmente acessado pelo inspetor web do navegador. Corrigir isso.
* Blindar a API para exigir tokenJWT.

## Tecnologias ##

* Front-end: HTML5, CSS3 (Mobile-first, sem frameworks), JavaScript (Fetch API).
* Back-end: Python, FastAPI.
* Banco de Dados: PostgreSQL (via Supabase).
* Hospedagem: GitHub Pages (Front-end) e Render (Back-end API).

