import test from 'node:test'
import assert from 'node:assert/strict'
import {
  TEMA_CLARO,
  TEMA_ESCURO,
  proximoTema,
  resolverTemaInicial,
  temaValido,
} from './tema.js'

test('temaValido aceita apenas claro e escuro', () => {
  assert.equal(temaValido(TEMA_CLARO), true)
  assert.equal(temaValido(TEMA_ESCURO), true)
  assert.equal(temaValido('sistema'), false)
  assert.equal(temaValido('Dark'), false)
  assert.equal(temaValido(null), false)
})

test('resolverTemaInicial prioriza a preferência salva válida', () => {
  assert.equal(resolverTemaInicial(TEMA_ESCURO, false), TEMA_ESCURO)
  assert.equal(resolverTemaInicial(TEMA_CLARO, true), TEMA_CLARO)
})

test('resolverTemaInicial segue o sistema quando ausente ou inválido', () => {
  assert.equal(resolverTemaInicial(null, true), TEMA_ESCURO)
  assert.equal(resolverTemaInicial(null, false), TEMA_CLARO)
  assert.equal(resolverTemaInicial('sistema', true), TEMA_ESCURO)
  assert.equal(resolverTemaInicial('', false), TEMA_CLARO)
})

test('proximoTema alterna entre claro e escuro', () => {
  assert.equal(proximoTema(TEMA_CLARO), TEMA_ESCURO)
  assert.equal(proximoTema(TEMA_ESCURO), TEMA_CLARO)
})
