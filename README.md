# Asfalto Quente — Vila Maresia

Jogo de mundo aberto visto de cima, feito em JavaScript com gráficos 3D (Three.js) e um modo clássico em Canvas 2D. A cidade é fictícia, o visual é desenhado por código e o som é gerado com Web Audio. Não tem nenhuma dependência nem etapa de build.

Versão atual: **1.4.0** — veja o histórico em [CHANGELOG.md](CHANGELOG.md).

**Documentação completa:** [docs/](docs/README.md) — [guia do jogador](docs/guia-do-jogador.md), [referência de números](docs/referencia.md), [guia do desenvolvedor](docs/guia-do-desenvolvedor.md) e [roadmap](docs/roadmap.md).

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
| V | liga/desliga o Filtro 97 (visual de placa de vídeo de 1997, só no 3D) |
| F3 | desempenho: contador de FPS e qualidade → painel completo (FPS, placa de vídeo usada, onde o tempo vai) → desligado |
| Mouse | mira |
| Clique esquerdo | atirar / soco (no carro, atira na direção da mira) |
| Clique direito | entrar, sair ou roubar carro |
| Roda do mouse | trocar de arma |

## Estrutura e arquitetura

A árvore de arquivos, o loop principal, o estado compartilhado (`S` em `src/core/state.js`) e como cada sistema funciona estão no [guia do desenvolvedor](docs/guia-do-desenvolvedor.md).

## Próximas versões

As ideias e o que está em aberto ficam no [roadmap](docs/roadmap.md).
