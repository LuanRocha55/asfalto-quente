# Histórico de versões

O número segue o padrão `MAIOR.MENOR.CORREÇÃO`:
- **MAIOR** — mudança grande no jogo (ainda 0 enquanto é protótipo)
- **MENOR** — novidade (sistema, missão, veículo, reorganização)
- **CORREÇÃO** — conserto de bug ou ajuste pequeno

## 0.8.0 — 19/11/2026
**Cidade nova** (o mapa foi refeito do zero; saves antigos continuam valendo, mas você recomeça no hospital)
- Ruas de três tipos: **avenidas** de 4 faixas mão dupla, **ruas** de 2 faixas e **becos** estreitos de mão única
- **Orla**: praia larga de areia com coqueiros, barracas, guarda-sóis, quadras de vôlei e posto de salva-vidas; hotéis altos de frente pro mar e calçadão de ondas
- **Vila Velha**: centro histórico apertado, cheio de becos de paralelepípedo e casarões coloridos geminados
- **Alto da Maresia** (bairro rico): mansões com piscina e jardim, condomínios de frente pro mar, quarteirões grandes
- **Alto do Cajueiro**: periferia com casinhas de tijolo, terra batida e campinho de várzea
- **Centro**: torres altas, praças e os principais serviços (hospital, delegacia)
- **Porto**: galpões, pilhas de contêiner e guindastes no cais
- Postes ao longo de todas as ruas, PARE na saída dos becos, semáforos em todos os cruzamentos com avenida

**Trânsito**
- Carros usam as faixas certas, trocam de faixa pra ultrapassar e pra fazer a conversão, respeitam a mão única dos becos
- Avenidas com muito mais movimento; ônibus e caminhões não entram em beco
- Carros diferentes por bairro: esportivos e sedãs de luxo no bairro rico, motos na periferia, caminhões no porto
- Veículos novos: Sedã Executivo, Utilitário e Caminhão Baú

**Polícia mais esperta**
- Só sabe onde você está se alguém te viu; quando perde o contato, vai até o último lugar onde te viu e vasculha a área
- Estrelas só caem quando ninguém te vê por alguns segundos
- Parte das viaturas tenta te interceptar pela frente em vez de só seguir atrás; viaturas novas aparecem à frente de quem está fugindo
- As viaturas se espalham pra te cercar em vez de empilhar
- A partir de 3 estrelas: bloqueios atravessados na rua à frente
- A pé: policiais descem da viatura, correm atrás de você, atiram (2+ estrelas) e te prendem se encostarem

## 0.7.0 — 19/11/2026
**Save**
- Salva sozinho a cada 45 segundos (fora de missão e sem estrelas), ao terminar missão e turno de emprego, e a cada compra
- Salvar manual na **Sua casa** (ícone de casinha, perto do hospital); lá também dá pra dormir até de manhã ou de noite
- Guarda dinheiro, vida, colete, armas e munição, cursos, progresso das missões, horário, posição e o carro em que você estava
- Tela de título: ENTER continua o jogo salvo, BACKSPACE começa do zero

**Comércios onde dá pra entrar** (F ou clique direito na porta)
- Farmácia (curativo, kit, colete), Mercadinho (lanches e raspadinha), Padaria, Lanchonete, Lojinha do posto
- Hospital (tratamento), Delegacia (pagar fiança até 2 estrelas ou se entregar), Armas do Tonhão (armas e colete)
- Escola com cursos permanentes: pontaria (tiro mais preciso), direção (carro mais firme) e primeiros socorros (renasce com meio colete)
- Colete à prova de balas: barra cinza embaixo da vida, absorve a maior parte do dano
- Portas marcadas no chão com o ícone do lugar; o mundo pausa enquanto o menu está aberto

**Mapa e ícones**
- Mapa em tela cheia (M ou TAB) com bairros, legenda, polícia, objetivo e sua posição
- Clique no mapa marca um destino (seta e marcador rosa); clique direito apaga
- Letras trocadas por ícones desenhados com cor própria: cruz vermelha (hospital) e cruz verde (farmácia), estrela (polícia), chave (Zé), gota (pintura), mira (armas), bomba de gasolina (posto), hambúrguer, carrinho, pão, livro, casa, ônibus, táxi e orelhão

## 0.6.0 — 19/11/2026
**Empregos** (aperta J pra começar e pra encerrar o turno)
- **Taxista** (Táxi): busca o passageiro acenando e leva no destino. Paga mais se chegar rápido; batidas fazem o passageiro reclamar e pagar menos
- **Motoboy** (Motoca nova, nas lanchonetes L): pega o pedido e entrega antes de esfriar; entrega rápida dá gorjeta
- **Motorista de busão** (Busão, Terminal B): faz a volta das avenidas parando nos pontos azuis; paga por passageiro e tem bônus por volta completa
- **Guincho** (caminhão novo, nos postos G): encosta a traseira no carro quebrado, reboca e entrega no posto ou na Oficina do Zé
- **Vigilante noturno** (a pé, na porta de mercadinho ou farmácia V, só de noite): derruba os assaltantes antes de chegarem na loja; eles atiram de volta. Bônus ao amanhecer
- Sequência: a cada 5 serviços seguidos sem falhar, bônus extra
- Carreira: cada emprego sobe de nível a cada 5 serviços (até o nível 5) e passa a pagar mais; o progresso fica salvo no navegador
- Dinheiro ganho aparece flutuando na tela
- Veículos de trabalho ficam estacionados nos pontos e reaparecem se sumirem
- Ícones no minimapa: T ponto de táxi, L lanchonete, B terminal, V lojas
- Motocas também circulam no trânsito

## 0.5.0 — 19/11/2026
**Controles no mouse**
- A pé: o personagem olha pra mira do mouse enquanto anda com WASD
- Clique esquerdo atira (segurar = rajada da SMG); com o punho, dá soco
- Do carro: clique esquerdo atira na direção da mira, pela janela (X continua atirando pra frente)
- Clique direito entra, sai ou rouba carro
- Roda do mouse troca de arma
- Mira desenhada na tela; o cursor do sistema some durante o jogo
- Com o mouse a mira é precisa; no teclado continua a mira automática

## 0.4.0 — 19/11/2026
**Sinalização dos lugares**
- Cada lugar especial tem telhado próprio com ícone e placa: estrela na Polícia, chave inglesa na Oficina do Zé, faixas de tinta na Pintura Express, mira nas Armas do Tonhão
- Comércios novos espalhados pela cidade: farmácia, mercadinho, padaria, escola (com quadra no telhado) e lanchonete
- 2 Postos Maresia: passa de carro debaixo da cobertura pra consertar o carro por $150 (apaga até fogo)
- Ícones no minimapa: + hospital, ★ polícia, Z Zé, P pintura, A armas, G posto

**Bairros e ruas**
- 5 bairros com visual próprio: Centro (lajes), Orla (calçadão de ondas e ciclofaixa), Vila Velha (paralelepípedo e calçada de tijolo), Alto do Cajueiro (asfalto remendado e buracos), Jardim Maresia (canteiro de grama e lombadas)
- Avenidas (Av. Central, Av. Maresia etc.) com faixa dupla amarela, bordas brancas e setas
- Semáforos nos cruzamentos de avenida; o trânsito para no vermelho
- PARE pintado onde rua comum encontra avenida
- Nomes de rua e bairro no canto da tela; o nome do bairro aparece grande ao entrar nele
- Carros não entram mais no cruzamento se não couberem do outro lado, e engarrafamentos travados fora da tela se desfazem

## 0.3.0 — 19/11/2026
**Armas**
- Pistola, escopeta e submetralhadora (SMG), com munição
- A pé: ESPAÇO atira na direção em que você está virado, com mira automática leve
- No carro: X ou Ctrl atira pra frente
- Q/E ou 1-4 trocam de arma; o punho continua no ESPAÇO
- Loja Armas do Tonhão (vermelha no minimapa): entra a pé e pisa na arma pra comprar
- Polícia atira de volta a partir de 2 estrelas; as caminhonetes da gangue também atiram
- Tiros assustam os pedestres e aumentam o procurado
- Ao morrer ou ser preso, perde as armas
- Começa com a pistola e 12 balas

**Dia e noite**
- Relógio no canto da tela; um dia inteiro dura 12 minutos
- Pôr do sol e nascer do sol alaranjados, noite escura
- Postes nas calçadas, faróis com facho de luz, lanternas de freio
- Janelas dos prédios acendem à noite
- Sirene da polícia ilumina em volta

## 0.2.1 — 19/11/2026
- Número da versão aparece na tela de título e no canto do minimapa
- Este histórico de versões

## 0.2.0 — 19/11/2026
- Código separado em módulos (`src/core`, `world`, `entities`, `ai`, `game`, `render`, `audio`)
- Estado do jogo centralizado no objeto `S` (`src/core/state.js`)
- README com instruções pra rodar com servidor local

## 0.1.2 — 19/11/2026
- O jogo não congela mais quando acontece um erro: ele se recupera e mostra a mensagem numa faixa vermelha
- Corrigido um possível loop infinito no cálculo de ângulo dos carros
- Limpeza automática de carros, pedestres e partículas com posição inválida

## 0.1.1 — 19/11/2026
- Pausa agora sai com ESC, P, Enter ou clique
- Missão "Acerto de Contas": batidas do jogador causam mais dano, barra de vida nas caminhonetes verdes e dicas na tela

## 0.1.0 — 19/11/2026
- Primeira versão jogável (arquivo HTML único)
- Cidade Vila Maresia com prédios em perspectiva, praças e orla
- 7 veículos com física de derrapagem, trânsito com IA, pedestres
- Polícia com 5 estrelas, perseguição e prisão
- 5 missões nos orelhões, Pintura Express e Oficina do Zé
- Som sintetizado, minimapa e recorde salvo no navegador
