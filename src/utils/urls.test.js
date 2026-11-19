import test from 'node:test'
import assert from 'node:assert/strict'
import { urlHttpSegura } from './urls.js'

test('urlHttpSegura aceita http e https absolutos', () => {
  assert.equal(urlHttpSegura('https://exemplo.com/aula?x=1'), 'https://exemplo.com/aula?x=1')
  assert.equal(urlHttpSegura('  http://localhost:5123/docs  '), 'http://localhost:5123/docs')
})

test('urlHttpSegura rejeita esquemas ativos', () => {
  assert.equal(urlHttpSegura('javascript:alert(document.domain)'), null)
  assert.equal(urlHttpSegura('JavaScript:alert(1)'), null)
  assert.equal(urlHttpSegura('data:text/html,<script>alert(1)</script>'), null)
  assert.equal(urlHttpSegura('vbscript:msgbox(1)'), null)
  assert.equal(urlHttpSegura('file:///etc/passwd'), null)
})

test('urlHttpSegura rejeita valores vazios, relativos ou inválidos', () => {
  assert.equal(urlHttpSegura(''), null)
  assert.equal(urlHttpSegura('   '), null)
  assert.equal(urlHttpSegura('/caminho/relativo'), null)
  assert.equal(urlHttpSegura('exemplo.com'), null)
  assert.equal(urlHttpSegura(null), null)
  assert.equal(urlHttpSegura(42), null)
  assert.equal(urlHttpSegura(`https://exemplo.com/${'a'.repeat(2048)}`), null)
})
