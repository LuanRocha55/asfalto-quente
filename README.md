# Asfalto Quente — Vila Maresia

Jogo de mundo aberto visto de cima, feito em JavaScript com gráficos 3D (Three.js) e um modo clássico em Canvas 2D. A cidade é fictícia, o visual é desenhado por código e o som é gerado com Web Audio. Não tem nenhuma dependência nem etapa de build.

Versão atual: **1.0.0** — veja o histórico em [CHANGELOG.md](CHANGELOG.md).

## Como rodar

Como o código usa módulos ES (`import`/`export`), o navegador não carrega abrindo o `index.html` direto do disco. Precisa de um servidor local:

```bash
npm start            # usa npx serve
# ou
python3 -m http.server 8000   # e abre http://localhost:8000
```

No VS Code, a extensão **Live Server** também resolve.

## Controles

| Tecla | Ação |
|---|---|
| WASD / setas | dirigir ou andar |
| Espaço | freio de mão (carro) / usar arma ou soco (a pé) |
| X ou Ctrl | atirar do carro |
| Q / E ou 1-4 | trocar de arma |
| F ou Enter | entrar, sair ou roubar carro |
| Shift | correr a pé |
| H | buzina |
| J | no veículo de trabalho: começar/encerrar turno · a pé: menu de empregos |
| M ou Tab | mapa em tela cheia (clique marca destino) |
| F na porta | entrar e andar dentro dos comércios |
| T | pular o tutorial |
| N | liga/desliga o som |
| P / Esc | pausa |
| G | troca os gráficos: 3D alta → 3D média → 3D leve → clássico |
| F3 | painel de desempenho (FPS, placa de vídeo usada, onde o tempo vai) |
| Mouse | mira |
| Clique esquerdo | atirar / soco (no carro, atira na direção da mira) |
| Clique direito | entrar, sair ou roubar carro |
| Roda do mouse | trocar de arma |

## Estrutura

```
index.html              página (canvas 3D + canvas 2D por cima pro HUD)
vendor/three/           Three.js (licença MIT)
src/
  main.js               loop principal (com recuperação de erros)
  core/
    canvas.js           canvas e redimensionamento
    version.js          número da versão do jogo
    state.js            estado mutável compartilhado (S, player, cam, keys)
    utils.js            aleatório, matemática, cores
    input.js            teclado e mouse
  world/
    map.js              malha de ruas e geração da cidade (prédios, praia, porto, lugares)
    zoning.js           em que bairro fica cada parte do mapa
    chunks.js           cache do chão em blocos e minimapa
    time.js             relógio e ciclo de dia e noite
    districts.js        bairros, avenidas, nomes de rua e semáforos
  entities/
    vehicles.js         tipos de veículo e física dos carros
    peds.js             pedestres
  ai/
    traffic.js          trânsito seguindo faixas e cruzamentos
    police.js           perseguição com campo de fluxo (BFS)
  game/
    world.js            procurado, mensagens, spawn
    player.js           ações do jogador, morte e prisão
    effects.js          explosões, marcas de pneu, atropelamentos
    weapons.js          armas, tiros, loja e inimigos atirando
    jobs.js             empregos, carreira e veículos de trabalho
    stadium.js          Arena Maresia: dia de jogo, gols e aposta
    interiors.js        portas e menus dos comércios
    interior.js         cenas internas onde dá pra andar (plantas em texto)
    tutorial.js         começo guiado e dicas de primeira vez
    save.js             salvar e carregar o jogo
    missions.js         missões dos orelhões
    update.js           atualização do mundo e colisões
  render/
    draw.js             mundo: carros, pessoas, prédios em perspectiva
    hud.js              interface, minimapa e tela de título
    lighting.js         escuridão da noite e pontos de luz
    icons.js            ícones do minimapa, do mapa e da legenda
    overlays.js         mapa em tela cheia e menus
    interiorDraw.js     desenho dos interiores
  render3d/
    build.js            cidade 3D estática (prédios, árvores, postes, estádio...)
    r3d.js              câmera, luz do dia, carros, pessoas, efeitos e HUD por cima
  audio/
    audio.js            motor, sirene e efeitos sintetizados
```

Todo estado que muda durante o jogo (listas de carros, pedestres, missão atual, pausa etc.) fica no objeto `S` em `src/core/state.js`, pra qualquer módulo poder ler e alterar sem variáveis globais soltas.

## Ideias pra próximas versões

- Rádio com trilhas geradas por código
- Mais missões, com historinha encadeada
