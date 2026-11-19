# Histórico de versões

O número segue o padrão `MAIOR.MENOR.CORREÇÃO`:
- **MAIOR** — mudança grande no jogo (ainda 0 enquanto é protótipo)
- **MENOR** — novidade (sistema, missão, veículo, reorganização)
- **CORREÇÃO** — conserto de bug ou ajuste pequeno

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
