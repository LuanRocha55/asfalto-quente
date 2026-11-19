# Asfalto Quente — Vila Maresia

Jogo top-down de mundo aberto feito em JavaScript puro com Canvas 2D. A cidade é fictícia, o visual é desenhado por código e o som é gerado com Web Audio. Não tem nenhuma dependência nem etapa de build.

Versão atual: **0.3.0** — veja o histórico em [CHANGELOG.md](CHANGELOG.md).

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
| N | liga/desliga o som |
| P / Esc | pausa |

## Estrutura

```
index.html              página e canvas
src/
  main.js               loop principal (com recuperação de erros)
  core/
    canvas.js           canvas e redimensionamento
    version.js          número da versão do jogo
    state.js            estado mutável compartilhado (S, player, cam, keys)
    utils.js            aleatório, matemática, cores
    input.js            teclado e mouse
  world/
    map.js              geração da cidade (tiles, prédios, zonas, orelhões)
    chunks.js           cache do chão em blocos e minimapa
    time.js             relógio e ciclo de dia e noite
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
    missions.js         missões dos orelhões
    update.js           atualização do mundo e colisões
  render/
    draw.js             mundo: carros, pessoas, prédios em perspectiva
    hud.js              interface, minimapa e tela de título
    lighting.js         escuridão da noite e pontos de luz
  audio/
    audio.js            motor, sirene e efeitos sintetizados
```

Todo estado que muda durante o jogo (listas de carros, pedestres, missão atual, pausa etc.) fica no objeto `S` em `src/core/state.js`, pra qualquer módulo poder ler e alterar sem variáveis globais soltas.

## Ideias pra próximas versões

- Rádio com trilhas geradas por código
- Mais missões, com historinha encadeada
