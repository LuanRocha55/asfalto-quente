# Documento de design: Maresia 97

> Rascunho de direção do jogo (21/11/2026, 2ª versão: a história passa para uma cidade inspirada no Rio de Janeiro de 1997). Nada aqui está implementado ainda. Serve pra decidir o que construir e em que ordem.

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

1. **História séria, mundo estilizado.** O peso vem da escrita, das situações e das escolhas, não do gráfico. O humor carioca fica nas placas, nos nomes e no rádio, mas a trama não é piada.
2. **Investigar é o verbo principal.** Ouvir, gravar, fotografar, anotar e ligar pistas. Dirigir e brigar continuam, mas a serviço da investigação.
3. **Todo dia é um problema pra resolver.** Comer, dormir, pagar o agiota toda sexta, e sobrar tempo pra investigar.
4. **Tudo que já existe ganha propósito.** Orelhão, blitz, desmanche, empregos, comércios e bairros fechados viram peças da história.
5. **Prova analógica.** Em 1997 não tem celular com câmera nem nuvem. Prova é filme revelado, fita K7 gravada e papel com carimbo de cartório, e precisa ser carregada fisicamente pela cidade.

## Por que o Rio de 1997

A estrutura (blitz travando bairros por capítulo e a dívida semanal como relógio de pressão) já funcionava em Fortaleza, mas ganha um **motivo real** no Rio daquele ano:

- A Zona Oeste vivia o auge da especulação imobiliária, com a via expressa recém-aberta encurtando o caminho até a orla e fazendo o metro quadrado explodir.
- Ainda resistiam na faixa de praia comunidades de pescadores e quiosques de madeira, antes da onda de condomínios fechados e resorts.
- A segurança pública da época era de operações de choque e discurso de "limpeza". Uma operação policial truculenta usada pra desvalorizar terrenos e expulsar moradores é totalmente verossímil.

### Regra dos nomes (importante)

A cidade é **inspirada** no Rio, do mesmo jeito que a Vila Maresia era inspirada em Fortaleza. Isso vale pra tudo que aparece na trama de corrupção:

- **Nada de nomes reais** de políticos, governos, programas de governo, jornais, rádios, delegacias, empresas ou policiais. Usamos versões inventadas que **lembram** os reais.
- **Lugares com nomes trocados.** Bairros, avenidas e pontos famosos ganham um nome próprio do jogo.
- Ícones genéricos podem ficar (camelódromo, bingo, van pirata, frescão, orelhão, quiosque, foto 1 hora), porque não apontam pra ninguém.
- Times de futebol também são inventados, como já são na Arena.
- Antes de lançar, procurar cada nome inventado na internet pra ver se não bate com alguém real.

## Premissa

**Guanabara, 1997** (nome provisório da cidade). A recém-aberta **Via Expressa** ligou o subúrbio do Jacaré à orla da **Barra Sul** e do **Recanto**, e o preço dos terrenos disparou. A **BarraSul Incorporações** quer limpar a faixa de quiosques e a colônia de pescadores pra erguer um resort fechado. Pra isso nasce a **Operação Maré Alta**: vendida no rádio como "limpeza na orla", ela fecha os bairros com blitz e assusta os moradores pra venderem barato.

Seu pai, dono de um quiosque de madeira e palha na Praia do Recanto há 30 anos, foi preso na primeira semana da operação com um flagrante plantado. O quiosque foi interditado e a família ficou devendo a um agiota ligado ao esquema. Você volta pra casa da família, no Jacaré, pra tirar seu pai da cadeia, recuperar o quiosque e provar quem está por trás da operação.

O **Jacaré** e o **Centro** começam abertos. Cada bairro fechado é um capítulo, e a blitz dele só cai quando a história daquele capítulo termina.

### Personagens (nomes provisórios)

- **Você** (nome e gênero ainda a decidir).
- **Seu Oswaldo**, o pai. Carioca da gema, torcedor doente do Unidos do Jacaré (time inventado). Começa preso na **Carceragem Central**, no Centro: cela lotada, visita no corredor, grade e barulho. No capítulo 2 é transferido pra **DP da Barra Sul**, uma delegacia nova e limpa onde ninguém fala nada. Cada visita dá uma pista e peso emocional.
- **Dona Tereza**, a mãe. Mora numa casa de vila no Jacaré, com quintal de caquinho vermelho e muro alto. É o ponto de save: você dorme, come o feijão que ela deixou no fogão e guarda coisas no guarda-roupa.
- **Cabralzinho**, o agiota. Opera nos fundos de uma casa de câmbio no Centro e aparece no **Bingo Estrela**, na Barra Sul (bingo era febre em 1997). Toda sexta cobra os juros em dinheiro vivo, ou pede um "favor" sujo se você não tiver a grana.
- **Delegado Azevedo**, comanda a Operação Maré Alta. Linha-dura, dá entrevista na porta da delegacia cercado de repórter de rádio.
- **BarraSul Incorporações**, a construtora do resort, ligada a obras viárias da prefeitura, e o **deputado estadual** que a protege (nome a criar, a revelar no fim).
- **Seu Zeca do Rádio**, ex-técnico da companhia telefônica, aposentado, mora no alto do Morro do Cajueiro. Tem uma estação de radioamador e um scanner modificado que capta a polícia (o rádio da polícia ainda não é digital nem criptografado). Ensina você a ouvir.
- **Mariana**, repórter do **Jornal da Guanabara**. Trabalha numa redação cheia de fumaça, papel, máquina de escrever e computador de tubo. Só convence o editor com prova física.
- **Rádio Metrópole** e o programa policial **Ronda da Cidade**, que vende a operação no começo e muda de tom conforme as provas aparecem.

## A cidade: reaproveitar o mapa atual

O mapa não é refeito. Os sete bairros e as blitz já existem; eles ganham nome e cara carioca **por etapas**. Os códigos internos (`jardim`, `centro`, `rico`...) **não mudam**, então os saves continuam valendo.

| Código | Hoje | Vira | Inspirado em | Papel na história |
|---|---|---|---|---|
| `jardim` | Jardim Maresia | **Jacaré** | Freguesia e Pechincha (Jacarepaguá) | casa da família, aberto desde o início |
| `centro` | Centro | **Centro** | Saara, Praça XV, Cinelândia | carceragem, jornal, cartório, casa de câmbio, camelódromo, foto 1 hora. Aberto |
| `cajueiro` | Alto do Cajueiro | **Morro do Cajueiro** | morros de Jacarepaguá | capítulo 1 |
| `rico` | Alto da Maresia | **Barra Sul** | Barra da Tijuca | capítulo 2 |
| `orla` | Orla | **Praia do Recanto** | Recreio e Reserva | capítulo 3 |
| `velha` | Vila Velha | **Vila dos Pescadores** | colônias de Guaratiba e Pontal | capítulo 4 |
| `porto` | Porto | **Cais do Porto** | Gamboa e zona portuária | capítulo 5 |

O tamanho do mapa encolhe a geografia real (no Rio, Centro e Barra ficam longe), e tudo bem: o jogo é uma versão de bolso da cidade.

### Avenidas

As blitz ficam sempre em cima de rua, então as avenidas viram as "portas" dos capítulos.

| Hoje | Vira | Inspirada em |
|---|---|---|
| Av. Sol Nascente (norte, liga Cajueiro, Jacaré e Barra Sul) | **Via Expressa**, com praça de pedágio | Linha Amarela |
| Av. Atlântica (meio, do Centro até a praia) | **Av. das Nações** | Av. das Américas |
| Av. dos Coqueiros (oeste, Cajueiro e Vila) | **Estrada dos Tropeiros** | Estrada dos Bandeirantes |
| Av. Maresia (Jacaré, Centro e Barra Sul) | **Av. Aurora** | Av. Alvorada |
| Av. Beira-Mar (praia) | **Av. Beira-Mar** (fica) | orla do Recreio |
| Av. do Porto (sul) | **Av. do Cais** | — |

As ruas menores ganham nomes cariocas inventados na etapa de cada bairro.

### Etapas de renomear e redecorar

1. **Nomes (junto da Semana 1).** Só texto: bairros, avenidas, placas de loja, falas, mapa de papel, rádio. Posto Maresia vira **Posto Guanabara**, a Arena vira **Estádio do Jacaré**, o Diário vira o Jornal da Guanabara. Custo baixo e já muda a cara do jogo.
2. **Um bairro por capítulo.** Quando um capítulo é feito, o bairro dele ganha decoração própria:
   - **Jacaré:** casas de vila com muro alto e portão de ferro, caquinho vermelho, bar de esquina com mesa de plástico.
   - **Centro:** sobrados antigos, marquises, camelódromo com lona, ponto de frescão e de van.
   - **Morro do Cajueiro:** escadarias, lajes, caixas d'água azuis, antenas e a casa do Zeca lá em cima.
   - **Barra Sul:** condomínios com guarita, outdoor de lançamento ("More no paraíso"), o neon do Bingo Estrela, canteiro de obra.
   - **Praia do Recanto:** quiosques de madeira e palha, restinga, ciclovia, o quiosque da família interditado com faixa.
   - **Vila dos Pescadores:** barcos na areia, redes secando, casas de tijolo, a colônia.
   - **Cais do Porto:** guindastes, contêineres, galpões.
3. **Carros e polícia.** Os modelos 90 que já existem ganham pintura carioca: táxi amarelo com faixa azul, ônibus e frescão, van pirata, viatura da polícia do jogo.
4. **Relevo do morro (em aberto).** O mapa é plano. Dá pra sugerir o morro com escadarias e rampas sem mexer no terreno; relevo de verdade é trabalho grande e fica pra depois.

## Os capítulos (um por bairro)

Cada capítulo pede um conjunto de **pistas** no quadro de investigação. O jogador escolhe a ordem e o jeito de conseguir cada uma (escuta, foto, conversa, invasão, suborno). Quando as pistas fecham, abre a missão final do capítulo, e a blitz daquele bairro cai.

**Entrar num bairro fechado.** Enquanto o capítulo dele está ativo, o bairro fica "sob vigilância": a blitz continua nas avenidas (de carro, ela para você), mas dá pra entrar a pé por um caminho do capítulo (a escadaria do morro, a areia da praia, o barco da colônia). Lá dentro, as viaturas patrulham e só dão estrela se você fizer besteira. Quando o capítulo termina, a blitz cai de vez.

| Cap. | Bairro | O que acontece | Ferramenta nova |
|---|---|---|---|
| Prólogo | Jacaré e Centro | Chegada, a dívida, a primeira visita ao pai, o primeiro bico | caderneta |
| 1 | Morro do Cajueiro | Quem plantou o flagrante? Zeca do Rádio e a escuta da polícia | scanner de rádio |
| 2 | Barra Sul | O pai é transferido. Uma festa no condomínio do dono da BarraSul e o bingo do Cabralzinho: infiltrar e fotografar | câmera 35mm |
| 3 | Praia do Recanto | Retomar o quiosque; o fiscal comprado da prefeitura | grampo de orelhão |
| 4 | Vila dos Pescadores | Os pescadores resistem; um incêndio "acidental" na colônia | gravador K7 |
| 5 | Cais do Porto | O dinheiro do esquema passa pelo porto; entregar tudo pra Mariana | (final) |

O final pode ter escolhas: publicar as provas no jornal, negociar com eles ou se vingar por conta própria.

## O verbo principal: escuta e investigação

Tecnologia de 1997 no lugar do hacking:

- **Caderneta (fichas de pessoas).** A tecla **C** mostra a ficha de quem está perto: nome, ocupação e, às vezes, um segredo ("deve ao Cabralzinho", "vende peça roubada", "viu a prisão do seu pai"). Algumas pessoas viram contatos ou geram bicos. É o *profiler* do Watch Dogs.
- **Scanner de rádio.** A tecla **R** liga e desliga. Ouve a polícia: avisa onde estão as viaturas e as blitz móveis, e às vezes solta uma pista ("viatura 12, desova no terreno da Via Expressa").
- **Grampo de orelhão.** Instalado num orelhão, grava as ligações. Algumas são pistas; outras viram missões.
- **Câmera 35mm e gravador K7.** Fotografar uma pessoa ou um carro no lugar e na hora certos; gravar o áudio do scanner ou de uma conversa.
- **Revelar o filme.** Foto só vira prova depois de revelada na **Foto 1 Hora** do Centro. Você leva o filme até lá e espera (1 hora do jogo), às vezes seguido por capangas da construtora. Se te pegarem com o filme, perdem a prova.
- **Quadro de investigação** (em casa, no quarto). As pistas aparecem ligadas por barbante. Quando um grupo fecha, abre a missão.

## O dia

O tempo já passa (um dia do jogo dura 12 minutos reais) e já existe dia e noite. Entram exigências leves e os **dias da semana**:

- **Fome:** come na lanchonete, na padaria, no mercadinho ou o feijão da Dona Tereza (já existem, menos o feijão). Com fome, a pontaria e o fôlego caem.
- **Sono:** dorme em casa (já existe). Cansado, o carro fica mais difícil de controlar e a visão escurece nas bordas.
- **Sexta-feira:** o Cabralzinho cobra a parcela na casa de câmbio do Centro. Pagar em dia mantém a paz. Atrasar traz juros, capangas e pistas fechadas.
- **O quiosque** (depois do capítulo 3): abre de dia e rende dinheiro. Precisa de estoque (comprado no mercadinho) e de você aparecer de vez em quando.

O dia fica dividido entre **ganhar dinheiro** (empregos, quiosque, bicos), **cuidar de si** (comer, dormir) e **investigar** (a história). Não dá pra fazer tudo: escolher é o jogo.

### Bicos cariocas pra pagar o agiota

- **Van pirata** na linha Jacaré–Centro: pega passageiro no ponto, cobra na porta e foge da fiscalização de transporte (uma viatura de fiscal que te persegue sem dar estrela, mas multa e apreende a van). É uma variação do emprego de ônibus.
- **Camelô no camelódromo do Centro:** compra muamba eletrônica de um fornecedor e revende na barraca, de olho no rapa.
- Os empregos atuais (táxi, motoboy, guincho, ônibus, vigilante) continuam.

### O rádio do carro

Ao dirigir, a **Rádio Metrópole** toca boletins de trânsito (engarrafamento na Via Expressa, pedágio parado) e notícias da Operação Maré Alta. O tom muda com a história: no começo o Ronda da Cidade elogia a "limpeza na orla"; depois de cada capítulo, aparecem denúncias, e no fim o próprio programa cobra o delegado.

### Dificuldade (escolhida ao começar um jogo novo)

| | Tranquilo | Normal | Raiz |
|---|---|---|---|
| Fome e sono | bem lentos, só avisam | atrapalham | atrapalham muito |
| Agiota | aceita atraso | juros e capangas | juros altos, pode tomar o quiosque |
| Morrer | perde parte do dinheiro | perde dinheiro e o dia | perde dinheiro, equipamento e o dia |
| Ferimentos | curam sozinhos | precisam de farmácia | precisam de hospital e repouso |

## Progressão

1. **História:** capítulos e bairros, a meta de semanas.
2. **Habilidades que sobem com o uso:**
   - Direção, Briga e Pontaria;
   - Lábia, que abre opções nas conversas e barateia subornos;
   - Mecânica, que melhora conserto e desmanche e rende mais peças;
   - Eletrônica, que permite montar e melhorar o scanner e o grampo.
3. **Equipamento montado:** a Oficina do Zé desmancha carros e as peças sobram. Com peças, componentes (comprados no camelódromo) e Eletrônica, você monta e melhora o scanner, o grampo, a câmera e o bip (pager que recebe dicas dos contatos).
4. **O quiosque da família:** reformar, contratar ajudante e ampliar. Rende mais e vira um lugar seu.
5. **Contatos:** gente da caderneta que vira aliada (o mecânico, o Zeca, a Mariana, um policial honesto) e abre serviços e descontos.

## O que muda nos sistemas que já existem

| Sistema | Hoje | Vira |
|---|---|---|
| Blitz dos bairros | abre com meta de dinheiro | abre ao terminar o capítulo do bairro (sai a meta de dinheiro) |
| Orelhões | missões avulsas | ligações de contatos e da história; alguns orelhões aceitam grampo |
| Oficina do Zé | desmanche por dinheiro | desmanche por dinheiro **e peças** |
| Empregos | renda e níveis | renda pra pagar o agiota e o dia a dia (mantém os níveis); ganha a van pirata |
| Comércios | compras | comida (fome), estoque do quiosque, componentes |
| Casa | salvar e dormir | dormir passa a noite, tem o quadro de investigação, o feijão da mãe e salva |
| Delegacia do Centro | fiança | vira a Carceragem Central: fiança e visita ao pai |
| Polícia e estrelas | procurado | igual, mas o scanner ajuda e a operação reage ao que você descobre |
| Estádio (hoje Arena Maresia) | jogo às 15h30 | igual, com times cariocas inventados (lugar de encontro e de pista em algum capítulo) |

## Primeira fatia jogável: "Semana 1"

Objetivo: testar se a ideia segura o jogador antes de construir tudo. Cobre o prólogo e o capítulo 1, numa semana do jogo (de domingo a sexta, uns 70 minutos reais no Normal). Os números abaixo são ponto de partida pra calibrar jogando.

### 1. Jogo novo e dificuldade

- Na tela de título, "Jogo novo" abre a escolha **Tranquilo / Normal / Raiz** (tabela acima), com uma linha explicando cada uma. Normal vem marcado.
- A dificuldade fica gravada no save e não muda no meio do jogo (a decidir se o Tranquilo pode ser escolhido depois, como ajuda).
- O jogo começa num **domingo, 16h30**, na porta da casa no Jacaré. O tutorial atual continua, com as falas trocadas pra história.

### 2. Dias da semana

- O relógio do HUD passa a mostrar o dia: **DOM 16:30**. O pager avisa "Sexta: parcela do Cabralzinho" na quinta e na sexta de manhã.
- Hoje o jogo já conta dias (`S.day`); só falta mostrar o nome do dia e usar isso nas regras.

### 3. Fome e sono

Duas barras pequenas embaixo da vida, no estilo do HUD 97. De 100 (bem) a 0.

| | Tranquilo | Normal | Raiz |
|---|---|---|---|
| Fome cai de 100 a 0 em | 3 dias do jogo | 1,5 dia (18 min reais) | 1 dia |
| Sono cai de 100 a 0 em | 4 dias | 2 dias | 1,5 dia |
| Abaixo de 30 | só aviso | efeito leve | efeito forte |
| Em 0 | só aviso | perde vida devagar (fome) ou desmaia e acorda em casa às 7h (sono) | idem, mais rápido |

- **Efeitos da fome:** a mira balança mais e a corrida acaba mais rápido.
- **Efeitos do sono:** o carro responde com atraso e as bordas da tela escurecem.
- **Comer:** a comida que já existe passa a encher a fome além da vida (marmita, X-tudo e café da manhã enchem bastante; cafezinho e água, pouco). O **feijão da Dona Tereza** no fogão é de graça, uma vez por dia.
- **Dormir:** a cama de casa passa a noite até 7h, enche o sono e salva. Dormir de dia descansa 4 horas.

### 4. A dívida e a sexta-feira

- Dívida inicial de **$5.000**, parcela de **$500** por semana (juros já embutidos), paga na casa de câmbio do Centro até as **20h de sexta**.
- Calibrar os empregos pra um dia de trabalho focado render mais ou menos uma parcela, sobrando dinheiro pra comida só se o jogador trabalhar mais de um dia.
- **Atrasou (Normal):** a parcela sobe 20% e, no sábado, dois capangas aparecem perto de casa. Dá pra pagar, brigar ou fugir. Enquanto estiver devendo, o Cabralzinho não passa pistas.
- **Tranquilo:** aceita atraso com bronca. **Raiz:** juros de 40% e os capangas vêm já na sexta à noite.
- **Sem dinheiro:** ele oferece um "favor" (entregar um envelope fechado num endereço). Paga a semana, mas vira uma pista de que o agiota trabalha pra BarraSul.

### 5. Caderneta (tecla C)

- Perto de um pedestre, **C** abre uma ficha pequena no canto: **nome** (sorteado de uma lista de nomes comuns no Rio de 97), **ocupação** e, em cerca de 1 a cada 10, um **segredo**.
- Os segredos sorteados geram bicos simples ("deve ao Cabralzinho: cobrar e ficar com 20%", "vende peça roubada: entregar pra polícia ou pro Zé").
- Alguns personagens fixos têm ficha escrita à mão (o Zeca, a testemunha da prisão, o PM que plantou o flagrante).
- As fichas vistas ficam salvas na caderneta, que também tem a página de **pistas** do capítulo.

### 6. Prólogo: a chegada (Jacaré e Centro)

1. **Domingo à tarde.** Dona Tereza conta o que aconteceu e mostra o carnê da dívida. Você come o feijão e ganha a caderneta.
2. **Visita ao pai na Carceragem Central** (horário de visita: 9h às 17h). Seu Oswaldo diz que a droga "apareceu" no quiosque depois que um PM pediu pra olhar o freezer, e que só um velho amigo do morro, o **Zeca do Rádio**, "escuta tudo que a polícia fala".
3. **Primeiro bico** (qualquer emprego ou a van pirata) e a primeira cobrança do Cabralzinho, que é apresentado na casa de câmbio e deixa claro que sabe do pai.
4. Um orelhão no Centro toca: é o Zeca, que manda subir o Morro do Cajueiro **a pé pela escadaria**, porque a blitz para carro na Estrada dos Tropeiros. O capítulo 1 começa.

### 7. Capítulo 1: quem plantou o flagrante? (Morro do Cajueiro)

O Zeca ensina a usar o scanner (tecla **R**) e pede ajuda pra montar uma antena nova. Quatro pistas, em qualquer ordem:

| Pista | Como conseguir | Sistema usado |
|---|---|---|
| **A testemunha** | achar na caderneta alguém com o segredo "viu a prisão do seu Oswaldo" (um quiosqueiro vizinho que agora vende no camelódromo do Centro) e convencer a falar | caderneta |
| **O número da viatura** | ligar o scanner e esperar o chamado que cita o quiosque; anotar a viatura | scanner |
| **O PM** | seguir a viatura sem ser visto até o batalhão provisório no morro e ver quem dirige | perseguição a distância |
| **A ordem de cima** | no arquivo da Carceragem (visita à noite, com suborno ou invasão), achar o papel com o nome do Delegado Azevedo | interior, Lábia ou briga |

- As pistas aparecem no **quadro de investigação** em casa, ligadas por barbante.
- Com as quatro, abre a **missão final**: pegar o PM sozinho, fora de serviço, e arrancar a confissão (conversa, ameaça ou briga), enquanto o scanner avisa se a operação mandou reforço.
- **Fim do capítulo:** a confissão não solta o pai ainda (é a palavra de um PM contra o delegado), mas expõe o batalhão do morro. A blitz do Morro do Cajueiro cai, o Ronda da Cidade fala de "denúncia anônima", e um gancho aponta pro capítulo 2: o pai vai ser transferido pra Barra Sul.

### 8. Nomes no jogo (etapa 1 do mapa)

Entra junto da Semana 1: os nomes novos dos bairros e avenidas, Posto Guanabara, Estádio do Jacaré e as placas, pra fatia já parecer a cidade nova. Decoração por bairro fica pra depois.

### 9. Saves antigos

Quem já abriu bairros com dinheiro mantém os bairros abertos e começa a história no capítulo seguinte ao último bairro aberto, na dificuldade Normal. (A decidir.)

### Como saber se funcionou

Jogando do zero, depois de 30 minutos ainda existe uma meta clara pro dia (a sexta chegando, uma pista pendente) e vontade de ver o próximo capítulo. Testar com pelo menos duas pessoas que não conhecem o jogo.

### Fora da Semana 1

Câmera e revelação do filme, gravador K7, grampo de orelhão, habilidades novas, peças e montagem de equipamento, quiosque, camelô e rádio do carro com notícias. Entram nos capítulos seguintes.

## Em aberto

- Nome da cidade (Guanabara é a proposta) e se o jogo continua se chamando Maresia 97.
- Nome e gênero de quem você joga (ou deixar escolher).
- Nome do deputado e da cara da BarraSul.
- Quantos finais e o que muda em cada um.
- Até onde vai o modo Raiz (perder o quiosque? morte permanente?).
- O que acontece com as missões avulsas atuais (viram bicos de contatos ou saem).
- Relevo de verdade no Morro do Cajueiro.
