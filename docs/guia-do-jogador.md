# Guia do jogador

Tudo o que dá pra fazer em Vila Maresia, do primeiro passo até liberar a cidade inteira. Os números exatos (preços, velocidades, pagamentos) estão na [referência](referencia.md).

- [Começando](#começando)
- [Controles](#controles)
- [A tela](#a-tela)
- [A cidade e os bairros](#a-cidade-e-os-bairros)
- [Operação Maré Alta: bairros fechados](#operação-maré-alta-bairros-fechados)
- [Dinheiro: como ganhar e onde gastar](#dinheiro-como-ganhar-e-onde-gastar)
- [Missões dos orelhões](#missões-dos-orelhões)
- [Empregos](#empregos)
- [Arena Maresia](#arena-maresia)
- [Comércios e interiores](#comércios-e-interiores)
- [Armas e combate](#armas-e-combate)
- [Polícia e procurado](#polícia-e-procurado)
- [Carros](#carros)
- [Dia e noite](#dia-e-noite)
- [Morrer, ser preso e salvar](#morrer-ser-preso-e-salvar)
- [Gráficos e desempenho](#gráficos-e-desempenho)
- [Dicas rápidas](#dicas-rápidas)

---

## Começando

A tela de título tem um menu (W/S ou setas escolhem, ENTER ou clique confirma):

- **CONTINUAR** volta pro jogo salvo (ou **COMEÇAR**, se não tiver save).
- **NOVO JOGO** pede confirmação e apaga o save. **BACKSPACE** faz o mesmo direto.
- **CONTROLES** mostra todas as teclas.
- **GRÁFICOS**, **FILTRO 97** e **SOM** mudam as opções ali mesmo.

A pausa (P ou Esc) usa o mesmo menu, com **VOLTAR PRO JOGO** no topo.

O jogo novo começa na frente do hospital, no Centro, com um carro estacionado do lado. Um tutorial curto ensina jogando, em 5 passos: andar, pegar o carro, dirigir, abrir o mapa e atender o orelhão. Cada passo mostra as teclas e uma seta pro objetivo. **T** pula o tutorial.

Depois do tutorial aparecem dicas só na primeira vez que algo acontece (primeira estrela, vida baixa, carro soltando fumaça, noite, primeira grana, veículo com emprego).

## Controles

### Na rua

| Tecla | A pé | No carro |
|---|---|---|
| WASD / setas | andar | acelerar, frear/ré, virar |
| Shift | correr | — |
| Espaço | soco (com o punho) ou atirar | freio de mão |
| X ou Ctrl | — | atirar pra frente |
| Clique esquerdo | atirar ou soco (segurar = rajada da SMG) | atirar na direção da mira, pela janela |
| Mouse | o personagem olha pra mira | mira do tiro |
| F, Enter ou clique direito | entrar no carro, roubar carro, entrar na porta | sair do carro (freia antes) |
| Q / E, 1-4 ou roda do mouse | trocar de arma (1 punho, 2 pistola, 3 escopeta, 4 SMG) | idem |
| H | — | buzina |
| J | menu de empregos (ou vigilante na porta da loja, à noite) | começar/encerrar turno no veículo de trabalho |

### Gerais

| Tecla | Ação |
|---|---|
| M ou Tab | mapa em tela cheia (clique marca destino, clique direito apaga) |
| P ou Esc | pausa com menu (Esc ou P volta) |
| G | gráficos: 3D alta → 3D média → 3D leve → clássico (2D) |
| V | liga/desliga o Filtro 97 (só no 3D) |
| F3 | contador de FPS → painel de desempenho completo → desligado |
| N | liga/desliga o som |
| T | pula o tutorial |

### Dentro dos lugares e nos menus

- WASD anda, Shift corre. **F, Enter ou E** fala com o atendente, deita na cama ou usa o computador (no ponto marcado com anel no chão). Clique direito também interage.
- Pra sair, anda pra baixo em cima do tapete vermelho da porta.
- Nos menus: setas ou W/S escolhem, **Enter/Espaço/F** compra, **1-9** escolhe direto, **Esc/Backspace** fecha. Com o mouse, clique escolhe e clique direito fecha.

> No teclado, o tiro a pé tem mira automática forte. Com o mouse, a mira é exata e a ajuda é bem pequena.

## A tela

- **Minimapa** no canto, com ícones dos lugares, polícia, objetivo e bairros fechados hachurados em vermelho.
- **Vida** e, embaixo, a barra cinza do **colete**.
- **Estrelas** de procurado (até 6).
- **Dinheiro**, relógio, nome da rua e do bairro. O nome do bairro aparece grande quando você entra nele.
- Linha de dicas com a missão ou o serviço atual e uma seta pro objetivo.
- Aviso com a tecla desenhada em cima de carros e portas ("F  Roubar Táxi", "F  Entrar: Farmácia").
- Quanto falta pro próximo bairro liberar.
- No topo, o contador `58 FPS · 3D alta` (verde, amarelo ou vermelho conforme o desempenho).

O **mapa em tela cheia** (M) mostra os bairros, a legenda dos ícones, a polícia, o objetivo e você. Clique num ponto pra marcar um destino rosa com seta; ele some quando você chega.

## A cidade e os bairros

Vila Maresia é uma cidade litorânea inventada, inspirada em Fortaleza, em 1997. O mar fica a leste.

```
  oeste ................................................ leste (mar)
  Alto do Cajueiro | Jardim Maresia | Alto da Maresia | Orla | praia | mar
  Alto do Cajueiro | Centro         | Centro          | Orla | praia | mar
  Vila Velha       | Vila Velha     | Centro          | Orla | praia | mar
  Vila Velha       | Porto          | Porto           | Porto        | mar
```

| Bairro | Como é | O que tem |
|---|---|---|
| **Centro** | torres altas, praças, calçada de lajes | hospital, delegacia, Arena Maresia, escolas, mercadinhos, farmácia, padaria |
| **Jardim Maresia** | casas, canteiro de grama, lombadas | sua casa, as duas Pinturas Express, Armas do Tonhão |
| **Alto do Cajueiro** | periferia: casinhas de tijolo, terra batida, asfalto remendado, campinho de várzea, muitas motos | lanchonetes, mercadinhos, padaria, terminal de ônibus |
| **Alto da Maresia** | bairro rico: mansões com piscina, condomínios, esportivos e sedãs de luxo no trânsito | os dois Postos Maresia, estacionamentos |
| **Orla** | praia larga com coqueiros, barracas, guarda-sóis, vôlei, salva-vidas, hotéis, calçadão de ondas e ciclofaixa | Oficina do Zé |
| **Vila Velha** | centro histórico: becos de paralelepípedo e casarões coloridos geminados | farmácias, lanchonetes, padarias, mercadinhos |
| **Porto** | galpões, contêineres, guindastes, caminhões | — |

**Ruas.** Há três tipos: **avenidas** de 4 faixas mão dupla (Av. dos Coqueiros, Av. Maresia, Av. Beira-Mar, Av. Sol Nascente, Av. Atlântica), **ruas** de 2 faixas e **becos** estreitos de mão única (só na Vila Velha). Cruzamentos com avenida têm semáforo, e o trânsito para no vermelho. Onde rua encontra avenida tem PARE pintado.

**Lugares no mapa** (ícones):

| Ícone | Lugar | Pra quê |
|---|---|---|
| cruz vermelha | Hospital | tratamento; onde você renasce |
| estrela | Delegacia | fiança; onde você sai depois de preso |
| casinha | Sua casa | salvar e dormir |
| gota | Pintura Express | apaga as estrelas |
| mira | Armas do Tonhão | armas, munição e colete |
| bomba de gasolina | Posto Maresia | conserta o carro |
| chave | Oficina do Zé | compra carro roubado |
| cruz verde | Farmácia | vida e colete |
| carrinho / pão / hambúrguer | Mercadinho / Padaria / Lanchonete | comida (vida) |
| livro | Escola | cursos permanentes |
| orelhão | Orelhão | missões |
| táxi / ônibus | Ponto de táxi / Terminal | empregos |
| estádio | Arena Maresia | jogo, aposta |

## Operação Maré Alta: bairros fechados

A cidade está sob operação policial. No começo só o **Centro** e o **Jardim Maresia** estão abertos. Os outros bairros abrem quando você **junta dinheiro**, sempre nesta ordem:

| Ordem | Bairro | Meta (dinheiro em mãos) |
|---|---|---|
| 1 | Alto do Cajueiro | $2.000 |
| 2 | Alto da Maresia | $5.000 |
| 3 | Orla | $10.000 |
| 4 | Vila Velha | $16.000 |
| 5 | Porto | $25.000 |

- A meta é o **saldo** que você tem na hora, não o total ganho. Ao bater a meta, aparece "BAIRRO LIBERADO", um contato "desenrola" e a blitz daquele bairro some. Gastar depois não fecha de novo.
- Só o **próximo** bairro da fila pode abrir. Se você já tem $10.000 e o Cajueiro ainda está fechado, ele abre primeiro e logo em seguida o próximo.
- No mapa e no minimapa os bairros fechados ficam hachurados em vermelho, com a meta escrita. As **avenidas da divisa** continuam livres.

**A blitz.** Em cada rua que entra num bairro fechado tem uma blitz: cones afunilando, cancela listrada, placa, tapete de pregos, duas viaturas na calçada e policiais em pé.

- **Devagar ou a pé:** "Área sob operação, só morador. Volta!" e você é barrado. A pé, a grade não deixa passar. O jogo diz quanto falta pra liberar.
- **Rápido (furando):** você quebra a cancela, ganha **3 estrelas** na hora, a blitz parte pra cima e o tapete **fura os pneus**. Com pneu furado o carro fica com metade da velocidade e escorregando até consertar num posto.
- **Lá dentro:** a operação te acha em uns 3 segundos e não larga. Enquanto você estiver na área fechada, o procurado não cai abaixo de 3 estrelas. A saída é voltar pra área aberta.

Missões, empregos, orelhões e o tutorial só mandam você pra bairros abertos.

> **O que tem disponível no começo.** Com só Centro e Jardim abertos, os dois postos de conserto, as lanchonetes das motocas, o terminal de ônibus e a Oficina do Zé ficam em bairros fechados. Os jeitos de ganhar dinheiro no início são as missões dos orelhões, o emprego de **taxista** (qualquer táxi da rua serve), o de **vigilante noturno** (mercadinhos e farmácia do Centro), a aposta no estádio e a raspadinha.

## Dinheiro: como ganhar e onde gastar

**Ganhar**

- Missões dos orelhões ($1.000 a $4.000, aumenta a cada rodada)
- Empregos (pagam por serviço, sobem de nível)
- Vender carro na Oficina do Zé (desmanche)
- Aposta no Maresia FC (paga 2,5x) e raspadinha do mercadinho

**Gastar**

- Comida, curativo e tratamento (vida)
- Colete ($350)
- Armas e munição
- Cursos da escola
- Pintura Express ($500 por estrela) e conserto no posto ($150)
- Fiança na delegacia ($300 por estrela)
- Morrer custa $300 e ser preso custa $500

O recorde (maior dinheiro que você já teve) aparece na tela de título.

## Missões dos orelhões

Os orelhões amarelos tocando têm missão. Chegue perto a pé ou de carro e ela começa sozinha (fora de emprego e de outra missão). Há uma missão por vez e elas seguem uma ordem. Depois da quinta, a lista recomeça pagando **60% a mais** a cada rodada.

| # | Missão | O que fazer | Tempo | Prêmio (1ª rodada) |
|---|---|---|---|---|
| 1 | **Encomenda da Dona Socorro** | arrumar um carro e levar a encomenda ao ponto marcado | 80 s | $1.000 |
| 2 | **Corrida do Chico** | pegar o passageiro de amarelo (encosta devagar) e levar ao destino. Se ele for atingido, falha | 110 s (+25 s ao embarcar) | $1.500 |
| 3 | **O Brisa do Doutor** | roubar o Brisa GT vermelho do estacionamento (o alarme dá estrelas) e levar pra Oficina do Zé | 200 s | $2.500 |
| 4 | **Acerto de Contas** | destruir as 3 caminhonetes verdes da gangue do Galego, batendo nelas. Elas atiram de volta | 200 s | $3.000 |
| 5 | **Fuga pela Orla** | começa com 3 estrelas: despistar a polícia até zerar | 150 s | $4.000 |

- "O Brisa do Doutor" precisa do Alto da Maresia e da Orla abertos. Até lá ela é pulada e volta na rodada seguinte.
- A missão falha se o tempo acabar, se você morrer ou for preso.
- Depois de cumprir, o jogo salva sozinho.

## Empregos

Aperte **J a pé** pra abrir o menu de empregos: ele explica cada um e marca no mapa onde começar. Pra trabalhar, entre no veículo certo e aperte **J**. **J** de novo encerra o turno. Sair do veículo de trabalho, morrer, ser preso ou destruir o veículo também encerra.

| Emprego | Onde começa | Como funciona | Paga |
|---|---|---|---|
| **Taxista** | qualquer táxi (da rua ou do ponto) | busca o passageiro acenando na calçada e leva ao destino | por corrida: mais se chegar rápido. Se bater muito (25+ de dano), ele paga 40% menos. Com 2+ estrelas o passageiro desce |
| **Motoboy** | qualquer Motoca (as de trabalho ficam paradas nas lanchonetes). Só funciona com alguma lanchonete em bairro aberto | pega o pedido na lanchonete e entrega antes de esfriar | por entrega, com gorjeta se for rápida |
| **Motorista de busão** | busão do Terminal | volta pelas avenidas parando em cada ponto azul (bem devagar, por 1,4 s) | por passageiro (1 a 5 por ponto), bônus de $200 por volta completa |
| **Guincho** | guincho dos postos | encosta a traseira no carro quebrado, reboca e entrega no posto ou na Oficina do Zé | por reboque |
| **Vigilante noturno** | a pé, na porta de mercadinho ou farmácia, de noite | derruba os assaltantes antes de chegarem na porta. Eles atiram. Se assaltarem 3 vezes, você é demitido do turno. Se afastar ou entrar num carro também encerra | por assaltante, mais bônus de $300 se você aguentar até o amanhecer (5h), com pelo menos 2 horas de turno |

**Sequência:** a cada 5 serviços seguidos sem falhar, bônus extra ($150 vezes o multiplicador do nível). Falhar zera a sequência.

**Carreira:** cada emprego sobe 1 nível a cada 5 serviços, até o **nível 5**. Cada nível paga 25% a mais (nível 5 paga o dobro). No vigilante, nível alto também traz assaltantes com mais frequência. O progresso da carreira fica guardado no navegador, separado do save.

Os veículos de trabalho ficam estacionados nos pontos e reaparecem se sumirem (mas nunca na sua frente).

## Arena Maresia

O estádio fica no Centro. Todo dia de jogo, das **15h30 às 18h**, o **Maresia FC** enfrenta um adversário diferente (Tubarões do Porto, Cajueiro EC, Unidos da Orla, Jangadeiros).

- A arquibancada lota, a torcida chega na praça em volta e dá pra ouvir de perto.
- Os gols aparecem na tela se você estiver perto, e o placar ao vivo fica em cima do estádio.

**Bilheteria** (F no portão):

| Opção | Preço | O que faz |
|---|---|---|
| Assistir ao jogo | $20 | pula até o fim da partida (18h) e recupera 15 de vida. Uma vez por dia |
| Apostar no Maresia FC | $100 | se o Maresia ganhar, paga $250 no fim do jogo. Apostas fecham às 17h. Empate perde |
| Ver placar | grátis | placar agora ou o próximo jogo |

## Comércios e interiores

Portas com ícone no chão e toldo colorido podem ser abertas com **F** (ou clique direito). Lá dentro você anda numa sala em 3D e fala com o atendente no balcão. O tempo continua passando lá fora.

- **Procurado não entra**, a não ser na delegacia.
- Quando o menu está aberto, o mundo pausa.

| Lugar | O que vende |
|---|---|
| **Farmácia** | curativo +30 vida ($25), kit completo ($80), colete ($350) |
| **Mercadinho** | refrigerante +10 ($5), biscoito +20 ($10), marmita +50 ($25), raspadinha ($10, 12% de chance de ganhar $250) |
| **Padaria** | cafezinho +10 ($4), pão de queijo +15 ($8), café da manhã +45 ($20) |
| **Lanchonete** | pastel +20 ($10), X-tudo +50 ($22), combo com suco +70 ($30) |
| **Lojinha do posto** | água +8 ($3), salgado +25 ($12) |
| **Hospital** | tratamento completo ($100). A vida também volta devagar enquanto você está lá dentro |
| **Delegacia** | pagar fiança ($300 por estrela, só até 2 estrelas) ou se entregar |
| **Armas do Tonhão** | pistola, escopeta, SMG (munição) e colete |
| **Escola** | cursos que valem pra sempre (veja abaixo) |
| **Sua casa** | salvar (computador), dormir até 8h ou até 20h (cama; enche a vida; não dá com estrelas) |

**Cursos da escola**

| Curso | Preço | Efeito |
|---|---|---|
| Pontaria | $500 | tiros bem mais precisos (espalham quase metade) |
| Direção | $400 | carro 15% mais firme nas curvas |
| Primeiros socorros | $600 | você renasce com meio colete |

**Colete:** a barra cinza embaixo da vida. Absorve 75% do dano enquanto durar.

## Armas e combate

| Arma | Preço (pacote) | Característica |
|---|---|---|
| Punho | — | soco: 3 socos derrubam um pedestre |
| Pistola | $300 (24 balas) | precisa, alcance longo |
| Escopeta | $800 (12 cartuchos) | 7 chumbos por tiro, curto alcance |
| Submetralhadora (SMG) | $1.500 (90 balas) | automática: segure o gatilho |

- O jogo novo começa com a pistola e 12 balas.
- No **Armas do Tonhão** dá pra comprar falando com o atendente lá dentro ou, a pé, pisando na arma no pátio da loja.
- Sem munição, troca sozinho pra arma anterior.
- Tiros assustam os pedestres e cada disparo aumenta um pouco o procurado.
- SWAT, FBI e exército usam **colete** e aguentam vários tiros.
- Carros pegam fogo com muito dano e explodem uns 3 segundos depois. Se você estiver dentro, morre: saia (F) quando aparecer o aviso.

## Polícia e procurado

O procurado vai de **0 a 6 estrelas**.

| Estrelas | Quem vem |
|---|---|
| 1 | viaturas te seguindo. Se você estiver a pé, desce um policial |
| 2 | a polícia começa a **atirar** |
| 3 | **bloqueios** atravessados na rua à sua frente, e descem dois policiais por viatura |
| 4 | **SWAT**: van blindada que aguenta muita batida e desce 3 agentes com submetralhadora e colete |
| 5 | **FBI**: sedãs pretos mais rápidos que quase tudo, que preferem te cortar pela frente |
| 6 | **Exército**: jipes, blindado quase indestrutível, soldados com colete. O bloqueio vira blindado |

Quanto mais estrelas, mais viaturas ao mesmo tempo (2 com 1 estrela, até 11 com 6).

**O que dá estrela** (do mais leve ao mais pesado): cada tiro, socar alguém, roubar carro com motorista, bater ou atirar numa viatura, destruir um carro, atropelar ou matar pedestre, matar policial, roubar uma viatura, destruir uma viatura, furar a blitz.

**Como a polícia pensa**

- Ela só sabe onde você está se alguém te viu. Perdendo o contato, ela vai até o último lugar onde te viu e vasculha a área.
- Parte das viaturas tenta te interceptar pela frente em vez de seguir atrás. Viaturas novas aparecem à frente de quem está fugindo.
- Elas se espalham pra te cercar.

**Como esfriar**

1. **Sumir da vista:** se ninguém te vê por uns 4 segundos, as estrelas começam a cair (mais ou menos 1 estrela a cada 11 s).
2. **Se esconder:** parado (ou bem devagar) num **beco** ou num **estacionamento**, fora de vista, cai **3 vezes mais rápido**.
3. **Trocar de carro sem ninguém ver:** a polícia perde a placa e cai 1 estrela.
4. **Pintura Express:** apaga tudo na hora. Custa $500 por estrela.
5. **Delegacia:** com até 2 estrelas, paga a fiança ($300 por estrela).

**Preso:** se uma viatura encostar em você parado (ou um policial te alcançar a pé) por um instante, você é preso.

## Carros

Chegue perto e aperte **F** pra entrar. Se tiver motorista, você rouba (e ganha procurado). Pra sair, freie primeiro.

- Cada modelo tem velocidade, aceleração, aderência e resistência próprias (tabela na [referência](referencia.md#veículos)). O Brisa GT é rápido, o Busão é lento e pesado, a Motoca é a mais ágil.
- **Areia** e **grama** deixam o carro lento e escorregando, menos o **Bugue** e o **Jipe do Exército**, que são feitos pra areia.
- Com menos de 25% de vida o carro perde velocidade. Com menos de 35% solta fumaça.
- **Posto Maresia:** passe por baixo da cobertura pra consertar ($150). Apaga o fogo e conserta pneu furado.
- **Oficina do Zé (desmanche):** entre de carro na garagem e o Zé paga pelo carro, proporcional ao estado. Carro com menos de 40% de vida ele não quer.
- O trânsito muda por bairro: esportivos no Alto da Maresia, motos no Cajueiro, caminhões no Porto.

## Dia e noite

- Um dia inteiro dura **12 minutos** reais.
- Pôr do sol e nascer do sol alaranjados. Noite fechada das 19h30 às 5h.
- À noite as janelas, os postes e os faróis acendem.
- O emprego de vigilante só funciona quando escurece, e o turno termina às 5h.
- Dormir em casa pula pra 8h ou 20h.

## Morrer, ser preso e salvar

| | Morreu ("VOCÊ SE LASCOU") | Preso ("EM CANA!") |
|---|---|---|
| Custo | $300 de hospital | $500 de fiança |
| Perde | todas as armas e munição | todas as armas e munição |
| Volta em | Hospital | Delegacia |
| Missão | falha | falha |

Você volta com vida cheia, sem estrelas e com 2 segundos de invencibilidade.

**Save**

- Salva sozinho a cada 45 segundos, mas só fora de missão e sem estrelas. Também salva ao terminar missão ou turno, a cada compra e ao dormir.
- Salvar manual: computador da **sua casa**.
- Guarda dinheiro, vida, colete, armas e munição, cursos, progresso das missões, bairros liberados, horário, posição e o carro em que você estava.
- O save fica no navegador. Limpar os dados do site apaga o save.

## Gráficos e desempenho

**G** troca entre os modos, e a escolha fica salva:

| Modo | O que muda |
|---|---|
| 3D alta | resolução cheia (até 2x em telas de alta densidade), sombras grandes todo quadro |
| 3D média | resolução normal, sombras menores atualizadas quadro sim, quadro não |
| 3D leve | resolução reduzida, sem sombras |
| Clássico (2D) | visual de cima em Canvas 2D, o mais leve |

Se o jogo ficar abaixo de uns 35 FPS por alguns segundos, a qualidade baixa sozinha (até você escolher uma com G). Sem suporte a WebGL, o jogo usa o clássico.

**F3** mostra o contador de FPS e, no segundo toque, o painel completo: tempo da lógica e do desenho, resolução real, chamadas de desenho, triângulos e **qual placa de vídeo o navegador está usando**. Se aparecer a placa integrada (Intel UHD/Iris) ou software, o painel avisa, e também diz se o gargalo é a placa ou o processador.

**Notebook com placa dedicada (NVIDIA/AMD).** Se o F3 mostrar a placa integrada:

1. Windows: **Configurações → Sistema → Tela → Elementos gráficos**, adicione o navegador (Chrome, Edge...) e escolha **Alto desempenho**.
2. No navegador, confirme que a aceleração de hardware está ligada (no Chrome: Configurações → Sistema → "Usar aceleração gráfica quando disponível").
3. Feche e abra o navegador de novo, depois confira no F3.
4. Ligue o notebook na tomada: na bateria muitos limitam a placa.

## Dicas rápidas

- Comece com missões e o táxi pra juntar os primeiros $2.000.
- Estrela na cola? Entre num beco, pare e espere.
- Vida baixa: lanchonete, padaria e mercadinho são baratos.
- Antes de furar uma blitz, saiba onde fica o posto mais perto: pneu furado deixa o carro muito lento.
- Compre o curso de primeiros socorros cedo: o meio colete ao renascer salva muita fuga.
- Use o mapa (M) e marque o destino com um clique.
