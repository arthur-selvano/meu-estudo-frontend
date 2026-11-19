import test from 'node:test'
import assert from 'node:assert/strict'
import {
  COLUNAS_PADRAO,
  adicionarTopicoNoGrupo,
  atualizarTopicoNoGrupo,
  calcularOrdemMover,
  obterColunaInicial,
  obterColunaSelecionada,
  obterColunas,
  obterColunasReais,
} from './quadro.js'

const COLUNAS_API = [
  {
    id: '2478d92d-8929-46d3-9cca-60cdf0a13b72',
    titulo: 'Concluído',
    ordem: 3,
  },
  {
    id: 'f2804ec3-3f07-4812-a820-811f769b4f69',
    titulo: 'A Fazer',
    ordem: 0,
  },
  {
    id: 'c75183f5-a689-40d4-a65f-5d4e590b4fe4',
    titulo: 'Em Andamento',
    ordem: 1,
  },
  {
    id: '2548b2ac-daff-485d-8f7e-03b9c66aa84a',
    titulo: 'Revisão',
    ordem: 2,
  },
]

test('obterColunaInicial devolve o GUID real da primeira coluna por ordem', () => {
  const coluna = obterColunaInicial({ colunas: COLUNAS_API })

  assert.deepEqual(coluna, COLUNAS_API[1])
  assert.equal(coluna.id, 'f2804ec3-3f07-4812-a820-811f769b4f69')
  assert.equal(coluna.titulo, 'A Fazer')
})

test('obterColunaInicial não usa os ids fixos de COLUNAS_PADRAO quando a API não devolve colunas', () => {
  assert.equal(obterColunaInicial({ colunas: [] }), null)
  assert.equal(obterColunaInicial({}), null)

  const idsPadrao = COLUNAS_PADRAO.map((coluna) => coluna.id)
  assert.ok(idsPadrao.includes('A_FAZER'))
})

test('obterColunaInicial ignora colunas sem id ou sem título', () => {
  const colunas = [
    { id: null, titulo: 'Inválida', ordem: 0 },
    { id: 'sem-titulo', ordem: 1 },
    { id: 'f2804ec3-3f07-4812-a820-811f769b4f69', titulo: 'A Fazer', ordem: 2 },
  ]

  assert.equal(
    obterColunaInicial({ colunas }).id,
    'f2804ec3-3f07-4812-a820-811f769b4f69',
  )
})

test('obterColunasReais preserva exatamente os GUIDs recebidos da API', () => {
  const colunas = obterColunasReais({ colunas: COLUNAS_API })

  assert.deepEqual(
    colunas.map((coluna) => coluna.id),
    [
      'f2804ec3-3f07-4812-a820-811f769b4f69',
      'c75183f5-a689-40d4-a65f-5d4e590b4fe4',
      '2548b2ac-daff-485d-8f7e-03b9c66aa84a',
      '2478d92d-8929-46d3-9cca-60cdf0a13b72',
    ],
  )
  assert.equal(colunas[0], COLUNAS_API[1])
})

test('obterColunas mantém o fallback visual para quadros legados sem colunas', () => {
  assert.deepEqual(obterColunas({ colunas: [] }), COLUNAS_PADRAO)
  assert.deepEqual(obterColunas({}), COLUNAS_PADRAO)
})

test('obterColunaSelecionada respeita a coluna escolhida no formulário', () => {
  const revisao = '2548b2ac-daff-485d-8f7e-03b9c66aa84a'

  assert.equal(obterColunaSelecionada({ colunas: COLUNAS_API }, revisao).id, revisao)
})

test('obterColunaSelecionada usa A Fazer quando nada foi escolhido', () => {
  assert.equal(
    obterColunaSelecionada({ colunas: COLUNAS_API }, '').id,
    'f2804ec3-3f07-4812-a820-811f769b4f69',
  )
})

test('obterColunaSelecionada ignora id inválido e volta para a primeira coluna', () => {
  const coluna = obterColunaSelecionada(
    { colunas: COLUNAS_API },
    'A_FAZER',
  )

  assert.equal(coluna.id, 'f2804ec3-3f07-4812-a820-811f769b4f69')
})

test('obterColunaSelecionada retorna null quando não há colunas reais', () => {
  assert.equal(obterColunaSelecionada({ colunas: [] }, ''), null)
  assert.equal(obterColunaSelecionada({}, 'A_FAZER'), null)
})

const GRUPO_A = {
  id: 'grupo-a',
  topicos: [
    { id: 'card-1', titulo: 'Card 1', colunaId: 'coluna-1' },
    { id: 'card-2', titulo: 'Card 2', colunaId: 'coluna-1' },
  ],
}

const GRUPO_B = {
  id: 'grupo-b',
  topicos: [{ id: 'card-9', titulo: 'Card 9', colunaId: 'coluna-x' }],
}

test('atualizarTopicoNoGrupo substitui o card existente sem duplicar', () => {
  const grupos = atualizarTopicoNoGrupo([GRUPO_A], 'grupo-a', {
    id: 'card-1',
    titulo: 'Card 1',
    colunaId: 'coluna-2',
    responsavelNome: 'Ana',
  })

  assert.equal(grupos[0].topicos.length, 2)
  assert.equal(grupos[0].topicos[0].colunaId, 'coluna-2')
  assert.equal(grupos[0].topicos[0].responsavelNome, 'Ana')
})

test('atualizarTopicoNoGrupo insere um card novo', () => {
  const grupos = atualizarTopicoNoGrupo([GRUPO_A], 'grupo-a', {
    id: 'card-3',
    titulo: 'Card 3',
    colunaId: 'coluna-1',
  })

  assert.equal(grupos[0].topicos.length, 3)
  assert.equal(grupos[0].topicos[2].id, 'card-3')
})

test('atualizarTopicoNoGrupo não altera outros quadros', () => {
  const grupos = atualizarTopicoNoGrupo([GRUPO_A, GRUPO_B], 'grupo-a', {
    id: 'card-1',
    titulo: 'Card 1',
    colunaId: 'coluna-2',
  })

  assert.equal(grupos[1], GRUPO_B)
})

test('atualizarTopicoNoGrupo é idempotente para o mesmo evento', () => {
  const evento = { id: 'card-1', titulo: 'Card 1', colunaId: 'coluna-2' }

  const umaVez = atualizarTopicoNoGrupo([GRUPO_A], 'grupo-a', evento)
  const duasVezes = atualizarTopicoNoGrupo(umaVez, 'grupo-a', evento)

  assert.equal(duasVezes[0].topicos.length, 2)
})

test('atualizarTopicoNoGrupo mantém os demais quadros quando o grupo não existe', () => {
  const grupos = atualizarTopicoNoGrupo([GRUPO_B], 'grupo-inexistente', {
    id: 'card-1',
  })

  assert.deepEqual(grupos, [GRUPO_B])
})

test('adicionarTopicoNoGrupo não duplica quando o eco chega antes da resposta', () => {
  const criado = { id: 'card-3', titulo: 'Card 3', colunaId: 'coluna-1' }

  const comEco = atualizarTopicoNoGrupo([GRUPO_A], 'grupo-a', criado)
  const comResposta = adicionarTopicoNoGrupo(comEco, 'grupo-a', criado)

  assert.equal(comResposta[0].topicos.length, 3)
  assert.equal(
    comResposta[0].topicos.filter((topico) => topico.id === 'card-3').length,
    1,
  )
})

const COLUNAS_MOVER = [
  { id: 'fazer', titulo: 'A Fazer', ordem: 0 },
  { id: 'andamento', titulo: 'Em Andamento', ordem: 1 },
]

test('calcularOrdemMover conta os cards da coluna destino sem o próprio card', () => {
  const topicos = [
    { id: 'card-1', titulo: 'Card 1', colunaId: 'fazer' },
    { id: 'card-2', titulo: 'Card 2', colunaId: 'fazer' },
    { id: 'card-3', titulo: 'Card 3', colunaId: 'andamento' },
  ]

  assert.equal(calcularOrdemMover(topicos, 'card-2', 'andamento', COLUNAS_MOVER), 1)
  assert.equal(calcularOrdemMover(topicos, 'card-1', 'fazer', COLUNAS_MOVER), 1)
})

test('calcularOrdemMover devolve 0 para coluna destino vazia', () => {
  const topicos = [{ id: 'card-1', titulo: 'Card 1', colunaId: 'fazer' }]

  assert.equal(calcularOrdemMover(topicos, 'card-1', 'andamento', COLUNAS_MOVER), 0)
})
