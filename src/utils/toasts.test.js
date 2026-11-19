import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DURACAO_TOAST,
  MAX_TOASTS,
  adicionarToast,
  removerToast,
} from './toasts.js'

const toast = (id) => ({ id, tipo: 'sucesso', mensagem: `Mensagem ${id}` })

test('adicionarToast acrescenta ao fim da fila', () => {
  const fila = adicionarToast([], toast('1'))

  assert.deepEqual(fila, [toast('1')])
})

test('adicionarToast mantém no máximo MAX_TOASTS, descartando o mais antigo', () => {
  let fila = []

  for (let i = 1; i <= MAX_TOASTS + 1; i += 1) {
    fila = adicionarToast(fila, toast(String(i)))
  }

  assert.equal(fila.length, MAX_TOASTS)
  assert.deepEqual(
    fila.map((item) => item.id),
    ['2', '3', '4'],
  )
})

test('removerToast remove pelo id e ignora id inexistente', () => {
  const fila = [toast('1'), toast('2')]

  assert.deepEqual(removerToast(fila, '1'), [toast('2')])
  assert.deepEqual(removerToast(fila, 'inexistente'), fila)
  assert.equal(MAX_TOASTS, 3)
  assert.equal(DURACAO_TOAST.sucesso, 4000)
  assert.equal(DURACAO_TOAST.erro, 6000)
})
