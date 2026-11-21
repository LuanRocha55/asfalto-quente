# Documento de design: Maresia 97

> Rascunho de direção do jogo (21/11/2026). Nada aqui está implementado ainda. Serve pra decidir o que construir e em que ordem.

## O problema

O jogo tem cidade, carros, polícia, missões, empregos e comércios, mas depois de 10 a 20 minutos vira só passeio. Falta **motivo pra voltar**. Os jogos de referência prendem porque sempre existe uma meta em três escalas de tempo:

| Escala | Pergunta do jogador | Hoje no Maresia |
|---|---|---|
| Minutos | "o que eu faço agora?" | missão do orelhão, emprego |
| Dia | "o que eu preciso resolver hoje?" | nada |
| Semanas | "aonde isso vai dar?" | juntar dinheiro pro próximo bairro |

A proposta é preencher as duas linhas de baixo sem jogar fora o que já existe.

## Referências e o que pegar de cada uma

- **Watch Dogs (o 1º):** motivo pessoal e um verbo único que muda o jeito de olhar a cidade (o hacking e o *profiler*: cada pedestre tem nome e segredo).
- **Project Zomboid:** cada dia tem exigências; habilidades sobem com o uso; você monta seus equipamentos.
- **Punch Club:** gerir o dia (trabalhar, treinar, comer, descansar) a serviço de uma história de vingança, com visual simples.

## Pilares

1. **História séria, mundo estilizado.** O peso vem da escrita, das situações e das escolhas, não do gráfico. Punch Club e Papers, Please são sérios com visual simples. O humor local continua nas placas e nos nomes, mas a trama não é piada.
2. **Investigar é o verbo principal.** Ouvir, grampear, fotografar, anotar e ligar pistas. Dirigir e brigar continuam, mas a serviço da investigação.
3. **Todo dia é um problema pra resolver.** Comer, dormir, pagar o agiota, cuidar da barraca, e sobrar tempo pra investigar.
4. **Tudo que já existe ganha propósito.** Orelhão, blitz, desmanche, empregos, comércios e bairros fechados viram peças da história.

## Premissa

Fortaleza, 1997. A orla de Vila Maresia está na mira de um resort. A **Operação Maré Alta**, vendida como combate ao crime, fecha os bairros com blitz e assusta os moradores pra venderem barato.

Seu pai, dono de uma barraca de praia na Orla, foi preso na primeira semana da operação com um flagrante plantado. A barraca foi interditada e a família ficou devendo a um agiota ligado ao esquema. Você volta pra casa da família, no Jardim Maresia, pra tirar seu pai da cadeia, recuperar a barraca e provar quem está por trás da operação.

O **Centro e o Jardim** começam abertos. Cada bairro fechado é um capítulo, e a blitz dele só cai quando a história daquele capítulo termina.

### Personagens (nomes provisórios)

- **Você** (nome e gênero ainda a decidir)
- **Seu Raimundo**, o pai, preso. Visitar ele na delegacia dá pistas e peso emocional.
- **Dona Lúcia**, a mãe, cuida da casa no Jardim. É onde você dorme e salva.
- **Lauro Cabral**, o agiota. Cobra toda sexta e sabe mais do que fala.
- **Delegado Moura**, comanda a Operação Maré Alta.
- **Atlântica Empreendimentos**, a construtora do resort, e o político que a protege (a revelar).
- **Tião do Rádio**, radioamador do Cajueiro. Ensina você a ouvir a polícia.
- **Lena**, repórter do *Diário da Maré*. É quem pode publicar as provas.

## Os capítulos (um por bairro)

Cada capítulo pede um conjunto de **pistas** no quadro de investigação. O jogador escolhe a ordem e o jeito de conseguir cada uma (grampo, foto, conversa, invasão, suborno). Quando as pistas fecham, abre a missão final do capítulo, e a blitz daquele bairro cai.

| Cap. | Bairro | O que acontece | Ferramenta nova |
|---|---|---|---|
| Prólogo | Centro e Jardim | Chegada, a dívida, a primeira visita ao pai, o primeiro emprego | caderneta |
| 1 | Alto do Cajueiro | Quem plantou o flagrante? Tião do Rádio e a escuta da polícia | scanner de rádio |
| 2 | Alto da Maresia | Uma festa na mansão do dono da Atlântica: infiltrar e fotografar | câmera |
| 3 | Orla | Retomar a barraca da família; o fiscal comprado | grampo de orelhão |
| 4 | Vila Velha | Os moradores resistem; um incêndio "acidental" | gravador |
| 5 | Porto | O dinheiro do esquema passa pelo porto; entregar tudo pra Lena | (final) |

O final pode ter escolhas: publicar as provas, negociar com eles ou se vingar por conta própria.

## O verbo principal: escuta e investigação

Tecnologia de 1997 no lugar do hacking:

- **Caderneta (fichas de pessoas).** Uma tecla mostra a ficha de quem está perto: nome, ocupação e, às vezes, um segredo ("deve ao Lauro", "vende peça roubada", "viu a prisão do seu pai"). Algumas pessoas viram contatos ou geram bicos. É o *profiler* do Watch Dogs.
- **Scanner de rádio.** Ouve a polícia: avisa onde estão as viaturas e as blitz móveis, e às vezes solta uma pista.
- **Grampo de orelhão.** Instalado num orelhão, grava as ligações. Algumas são pistas; outras viram missões.
- **Câmera e gravador.** Provas. Fotografar uma pessoa ou um carro no lugar e na hora certos.
- **Quadro de investigação** (em casa). As pistas aparecem ligadas por barbante. Quando um grupo fecha, abre a missão.

## O dia

O tempo já passa e já existe dia e noite. Entram exigências leves:

- **Fome:** come na lanchonete, na padaria ou no mercadinho (já existem). Com fome, a pontaria e o fôlego caem.
- **Sono:** dorme em casa (já existe). Cansado, o carro fica mais difícil de controlar e a visão escurece nas bordas.
- **Sexta-feira:** o Lauro cobra a parcela. Pagar em dia mantém a paz. Atrasar traz juros, capangas e pistas fechadas.
- **A barraca** (depois do capítulo 3): abre de dia e rende dinheiro. Precisa de estoque (comprado no mercadinho) e de você aparecer de vez em quando.

O dia fica dividido entre **ganhar dinheiro** (empregos, barraca, bicos), **cuidar de si** (comer, dormir) e **investigar** (a história). Não dá pra fazer tudo: escolher é o jogo.

### Dificuldade (escolhida ao começar um jogo novo)

| | Tranquilo | Normal | Raiz |
|---|---|---|---|
| Fome e sono | bem lentos, só avisam | atrapalham | atrapalham muito |
| Agiota | aceita atraso | juros e capangas | juros altos, pode tomar a barraca |
| Morrer | perde parte do dinheiro | perde dinheiro e o dia | perde dinheiro, equipamento e o dia |
| Ferimentos | curam sozinhos | precisam de farmácia | precisam de hospital e repouso |

## Progressão

1. **História:** capítulos e bairros, a meta de semanas.
2. **Habilidades que sobem com o uso:**
   - Direção, Briga e Pontaria;
   - Lábia, que abre opções nas conversas e barateia subornos;
   - Mecânica, que melhora conserto e desmanche e rende mais peças;
   - Eletrônica, que permite montar e melhorar o scanner e o grampo.
3. **Equipamento montado:** a Oficina do Zé desmancha carros e as peças sobram. Com peças, componentes (de uma loja nova de eletrônica no Centro) e Eletrônica, você monta e melhora o scanner, o grampo, a câmera e o bip (pager que recebe dicas dos contatos).
4. **A barraca da família:** reformar, contratar ajudante e ampliar. Rende mais e vira um lugar seu.
5. **Contatos:** gente da caderneta que vira aliada (o mecânico, o radioamador, a repórter, um policial honesto) e abre serviços e descontos.

## O que muda nos sistemas que já existem

| Sistema | Hoje | Vira |
|---|---|---|
| Blitz dos bairros | abre com meta de dinheiro | abre ao terminar o capítulo do bairro (sai a meta de dinheiro) |
| Orelhões | missões avulsas | ligações de contatos e da história; alguns orelhões aceitam grampo |
| Oficina do Zé | desmanche por dinheiro | desmanche por dinheiro **e peças** |
| Empregos | renda e níveis | renda pra pagar o agiota e o dia a dia (mantém os níveis) |
| Comércios | compras | comida (fome), estoque da barraca, componentes |
| Casa | salvar e dormir | dormir passa a noite, tem o quadro de investigação e salva |
| Polícia e estrelas | procurado | igual, mas o scanner ajuda e a operação reage ao que você descobre |
| Arena Maresia | jogo às 15h30 | igual (lugar de encontro e de pista em algum capítulo) |

## Primeira fatia jogável: "Semana 1"

Pra testar se a ideia segura o jogador antes de construir tudo:

1. Escolha de dificuldade no jogo novo.
2. Fome, sono e a cobrança de sexta (com o Lauro).
3. Caderneta com fichas de pedestres (nomes e alguns segredos).
4. Prólogo e capítulo 1 (Alto do Cajueiro): visita ao pai, o Tião do Rádio, o scanner e o quadro com 3 a 4 pistas.
5. A blitz do Cajueiro cai pela história, não pelo dinheiro.

**Como saber se funcionou:** jogando do zero, depois de 30 minutos ainda existe uma meta clara pro dia e vontade de ver o próximo capítulo.

**Saves antigos:** quem já abriu bairros com dinheiro mantém os bairros abertos e começa a história no capítulo seguinte ao último bairro aberto. (A decidir.)

## Em aberto

- Nome e gênero de quem você joga (ou deixar escolher).
- Quantos finais e o que muda em cada um.
- Até onde vai o modo Raiz (perder a barraca? morte permanente?).
- O que acontece com as missões avulsas atuais (viram bicos de contatos ou saem).
