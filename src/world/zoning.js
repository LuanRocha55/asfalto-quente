// Zoneamento da cidade: qual bairro fica em cada tile.
// Sem imports de propósito: o gerador do mapa usa isto enquanto ainda está carregando.
//
//   oeste ............................................ leste (mar)
//   Alto do Cajueiro | Jardim Maresia | Alto da Maresia | Orla | praia | mar
//   Alto do Cajueiro | Centro         | Centro          | Orla | praia | mar
//   Vila Velha       | Vila Velha     | Centro          | Orla | praia | mar
//   Vila Velha       | Porto          | Porto           | Porto        | mar

export const CITY_X0=16, CITY_X1=222, CITY_Y0=16, CITY_Y1=248; // centros das ruas da borda (em tiles)
export const VV={x0:16,x1:120,y0:146,y1:248};                  // Vila Velha (becos)
export const BEACH_X0=229, BEACH_X1=252;                        // faixa de areia da praia

export function zoneAt(tx,ty){
  if(tx>=226) return 'orla';
  if(tx>=198) return ty>=224?'porto':'orla';
  if(ty>=224&&tx>=120) return 'porto';
  if(tx<120&&ty>=146) return 'velha';
  if(tx>=146&&ty<120) return 'rico';
  if(tx<94) return 'cajueiro';
  if(ty<94) return 'jardim';
  return 'centro';
}

// centro aproximado de cada bairro (para nomes no mapa)
export const ZONE_LABELS={ cajueiro:[52,70], jardim:[120,48], rico:[172,64], centro:[150,170], velha:[66,198], porto:[175,238], orla:[238,120] };
