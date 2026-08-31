// === CONSTANTES E VARIÁVEIS GLOBAIS === //

let chartInstancia = null; // Variável global para destruir o gráfico anterior se necessário
const API_URL = "https://elo-rating-calculator-api.onrender.com"; // URL base da API

// === FIM DE CONSTANTES E VARIÁVEIS GLOBAIS === //

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

// Configura o submit do form de novoJogador
document.addEventListener('DOMContentLoaded', () => {
    const formNovoJogador = document.getElementById('formNovoJogador');
    
    if (formNovoJogador) {
        formNovoJogador.addEventListener('submit', async function(e) {
            e.preventDefault(); // Impede o recarregamento da página
            
            const nome = document.getElementById('nome_jogador').value;
            const ratingInicial = parseInt(document.getElementById('rating_inicial').value);

            try {
                // Ajuste a API_URL se necessário
                const resposta = await fetch(`${API_URL}/adicionar_jogador`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome: nome,
                        rating_inicial: ratingInicial
                    })
                });

                if (!resposta.ok) {
                    throw new Error("Erro ao cadastrar o jogador.");
                }

                mostrarMensagem(`Jogador ${nome} cadastrado com sucesso!`, 'sucesso');
                
                // Limpa o nome, mas mantém o rating em 200 para facilitar múltiplos cadastros
                document.getElementById('nome_jogador').value = '';
                document.getElementById('rating_inicial').value = 200;

            } catch (erro) {
                console.error(erro);
                mostrarMensagem("Erro ao conectar com o servidor.", 'erro');
            }
        });
    }
});


// ===== Implementação do login pelo Google ===== //
const GOOGLE_CLIENT_ID = "852908104167-qv9eig90r0jtlu4cotkr736rs2ijbsa5.apps.googleusercontent.com"; 
const EMAIL_ADMIN = "dimitri.duque@yahoo.com.br"; // O único e-mail permitido

let tokenJWT = ""; // Guardaremos o token para enviar ao back-end

// Configura e renderiza o botão do Google
window.onload = function () {
    // 1. Verifica se já existe um token salvo no navegador
    const tokenSalvo = localStorage.getItem("chess_admin_token");

    if (tokenSalvo) {
        // Se tem token, restaura ele na variável e mostra o formulário
        tokenJWT = tokenSalvo;
        liberarFormulario("Bem-vindo de volta!");
    } else {
        // Se NÃO tem token, inicializa o botão do Google
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: tratarRespostaGoogle
        });
        
        google.accounts.id.renderButton(
            document.getElementById("botaoGoogleLogin"),
            { theme: "outline", size: "large" } 
        );
    }
};

// Função executada após o usuário fazer login no Google
function tratarRespostaGoogle(resposta) {
    tokenJWT = resposta.credential;
    
    // Decodifica o payload do JWT para pegar o e-mail
    const base64Url = tokenJWT.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const dadosUsuario = JSON.parse(jsonPayload);

    // Verifica se o e-mail é o seu
    if (dadosUsuario.email === EMAIL_ADMIN) {
        // SALVA O TOKEN NO NAVEGADOR AQUI 👇
        localStorage.setItem("chess_admin_token", tokenJWT);
        
        liberarFormulario("Login realizado com sucesso!");
    } else {
        mostrarMensagem(`Acesso negado: ${dadosUsuario.email} não tem permissão.`, 'erro');
    }
}

function liberarFormulario(mensagem) {
    document.getElementById('areaLogin').style.display = 'none';
    
    // Verifica qual formulário existe na página atual e o exibe
    const formPartida = document.getElementById('formPartida');
    const formNovoJogador = document.getElementById('formNovoJogador');
    
    if (formPartida) formPartida.style.display = 'flex';
    if (formNovoJogador) formNovoJogador.style.display = 'flex';
    
    document.getElementById('botaoLogout').style.display = 'inline-block'; 
    mostrarMensagem(mensagem, 'sucesso');
}

function fazerLogout() {
    localStorage.removeItem("chess_admin_token");
    tokenJWT = "";
    window.location.reload(); // Recarrega a página para mostrar o login de novo
}
// ===== FIM da implementação do login pelo Google ===== //

// Implementação do histórico de partidas
async function carregarHistorico() {
    const tbody = document.getElementById('tabelaHistorico');

    try {
        // Ajuste a URL para o endereço real do seu back-end local
        // Supondo que você criará um endpoint GET /historico na sua API
        const resposta = await fetch(`${API_URL}/historico`);
        
        if (!resposta.ok) {
            throw new Error('Falha ao carregar os dados do servidor.');
        }

        const partidas = await resposta.json();
        
        // Limpa a mensagem de "Carregando..."
        tbody.innerHTML = '';

        if (partidas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhuma partida registrada ainda.</td></tr>';
            return;
        }

        // Itera sobre a lista de partidas e cria as linhas dinamicamente
        partidas.forEach(partida => {
            // 1. Tratamento da Data e Hora (continua igual)
            let dataFormatada = partida.data_partida;
            if (dataFormatada && dataFormatada.includes('-')) {
                const [ano, mes, dia] = dataFormatada.split('-');
                dataFormatada = `${dia}/${mes}/${ano}`;
            }

            let horaFormatada = partida.hora_partida;
            if (horaFormatada) {
                horaFormatada = horaFormatada.substring(0, 5);
            }

            // 2. Lógica dos Ícones de Resultado
            let iconeBrancas = "";
            let iconePretas = "";

            const res = partida.resultado; 
            
            if (res === 'brancas_vencem') {
                iconeBrancas = " ⭐️";
            } else if (res === 'pretas_vencem') {
                iconePretas = " ⭐️";
            } else {
                // Se não foi vitória de ninguém, assumimos empate
                iconeBrancas = " 🟰";
                iconePretas = " 🟰";
            }

            // 3. Juntar o nome do jogador com o respectivo ícone
            const nomeBrancas = (partida.brancas?.nome || 'Jogador Desconhecido') + iconeBrancas;
            const nomePretas = (partida.pretas?.nome || 'Jogador Desconhecido') + iconePretas;

            const tr = document.createElement('tr');
            
            // 4. Montar a linha da tabela com apenas 3 colunas
            tr.innerHTML = `
                <td>${dataFormatada} às ${horaFormatada}</td>
                <td>${nomeBrancas}</td>
                <td>${nomePretas}</td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // --- NOVA LÓGICA DE FILTRO PELA URL ---
        const parametrosUrl = new URLSearchParams(window.location.search);
        const jogadorNaUrl = parametrosUrl.get('jogador');

        if (jogadorNaUrl) {
            const campoFiltro = document.getElementById('inputFiltro');
            // Preenche o input visualmente para o usuário saber o que está sendo filtrado
            campoFiltro.value = jogadorNaUrl; 
            // Aciona a função de filtro para esconder as outras linhas
            filtrarPorJogador(); 
            carregarGrafico(jogadorNaUrl);
        }

    } catch (erro) {
        console.error("Erro ao buscar histórico:", erro);
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Erro ao carregar o histórico de partidas.</td></tr>';
    }
}

// implementação da filtragem por jogador no histórico de partidas
function filtrarPorJogador() {
    // Pega o valor digitado e converte para minúsculas para facilitar a comparação
    const textoFiltro = document.getElementById('inputFiltro').value.toLowerCase();
    
    // Pega todas as linhas (tr) que estão dentro do corpo da tabela
    const linhas = document.querySelectorAll('#tabelaHistorico tr');

    linhas.forEach(linha => {
        // Ignora a linha se for a mensagem de "Carregando..." ou "Nenhuma partida"
        if (linha.cells.length < 3) return;

        // Pega o texto das colunas de Brancas (índice 1) e Pretas (índice 2)
        const nomeBrancas = linha.cells[1].textContent.toLowerCase();
        const nomePretas = linha.cells[2].textContent.toLowerCase();

        // Verifica se o texto digitado está no nome das Brancas OU das Pretas
        if (nomeBrancas.includes(textoFiltro) || nomePretas.includes(textoFiltro)) {
            linha.style.display = ''; // Mostra a linha
        } else {
            linha.style.display = 'none'; // Esconde a linha
        }
    });
}

// implementação do gráfico de evolução do rating
async function carregarGrafico(nomeJogador) {
    const container = document.getElementById('containerGrafico');
    const spanNome = document.getElementById('nomeJogadorGrafico');
    const ctx = document.getElementById('graficoEvolucao').getContext('2d');

    try {
        const resposta = await fetch(`${API_URL}/jogador/${encodeURIComponent(nomeJogador)}/evolucao`);
        if (!resposta.ok) throw new Error("Erro ao buscar dados do gráfico");
        
        const dados = await resposta.json();
        const jogador = dados.jogador;
        const partidas = dados.partidas;

        container.style.display = 'block';
        spanNome.textContent = jogador.nome;

        // --- CONSTRUÇÃO DOS PONTOS PARA EIXO TEMPORAL (X e Y) ---
        const dadosGrafico = [];

        // Ponto 1: Criação da conta (Assumindo meia-noite para o início)
        dadosGrafico.push({
            x: jogador.data_criacao + 'T00:00:00', 
            y: jogador.rating_inicial,
            notaCustomizada: 'Início' // Campo extra para usarmos no tooltip
        });

        // Pontos 2..N: Partidas jogadas
        let ultimoRating = jogador.rating_inicial;
        
        partidas.forEach(partida => {
            // Junta data e hora (ex: 2026-07-15T14:30:00) para precisão máxima no gráfico
            let dataHoraIso = partida.data_partida;
            if (partida.hora_partida) {
                dataHoraIso += 'T' + partida.hora_partida;
            } else {
                dataHoraIso += 'T12:00:00'; // Fallback pro meio do dia se não houver hora
            }
            
            if (partida.jogador_brancas_id === jogador.id) {
                ultimoRating = partida.rating_brancas_depois;
            } else {
                ultimoRating = partida.rating_pretas_depois;
            }
            
            dadosGrafico.push({ x: dataHoraIso, y: ultimoRating });
        });

        // Ponto Final: Exatamente o momento atual
        const hojeIso = new Date().toISOString();
        dadosGrafico.push({ 
            x: hojeIso, 
            y: jogador.rating,
            notaCustomizada: 'Hoje'
        }); 

        // --- RENDERIZAÇÃO DO CHART.JS ---
        if (chartInstancia) {
            chartInstancia.destroy(); 
        }

        chartInstancia = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Rating',
                    data: dadosGrafico, // Usando a nova estrutura
                    borderColor: '#0056b3',
                    backgroundColor: 'rgba(0, 86, 179, 0.1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#0056b3',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time', // 👈 ISSO ATIVA A ESCALA TEMPORAL PROPORCIONAL
                        time: {
                            unit: 'day', // Baseia o espaçamento visual em dias
                            tooltipFormat: 'dd/MM/yyyy HH:mm', // Formato no hover
                            displayFormats: {
                                day: 'dd/MM/yyyy' // Formato no eixo inferior
                            }
                        },
                        title: { display: true, text: 'Data' }
                    },
                    y: {
                        beginAtZero: false,
                        title: { display: true, text: 'Pontuação Elo' }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            // Adiciona as tags "(Início)" e "(Hoje)" no balãozinho quando passar o mouse
                            label: function(context) {
                                let label = `Rating: ${context.parsed.y}`;
                                if (context.raw.notaCustomizada) {
                                    label += ` (${context.raw.notaCustomizada})`;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });

    } catch (erro) {
        console.error("Erro ao gerar gráfico:", erro);
    }
}

// Função auxiliar para formatar YYYY-MM-DD para DD/MM/YYYY
function formatarDataBR(dataIso) {
    if (!dataIso) return "";
    const partes = dataIso.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
