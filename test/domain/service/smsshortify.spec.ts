import tap from 'tap'
import { SMSShortify } from '../../../lib/domain/service/smsshortify'

tap.test('Should shortify message and insert see more', (t) => {
  const { prefix, text, suffix } = new SMSShortify({
    prefix: 'Loja Aftersale |',
    text: 'Seu pedido está em transferência e em breve estará a caminho de uma cidade mais próxima, acompanhe as próximas atualizações em $link',
    suffix: '| PEDIDO 123456789-01',
    link: 'https://go.after.sale/abcdefg'
  }).execute()

  const message = `${prefix}${text}${suffix}`

  t.equal(message, 'Loja Aftersale |Seu pedido está em transferência e em breve estará a caminho de uma cidad... Veja mais em: https://go.after.sale/abcdefg | PEDIDO 123456789-01')
  t.end()
})

tap.test('Should not consider link size when calculating message size', (t) => {
  const { prefix, text, suffix } = new SMSShortify({
    prefix: 'Loja Aftersale |',
    text: 'Eba! Pode comemorar. Seu pedido está em transferência e em breve estará a caminho de uma cidade mais próxima',
    suffix: '| PEDIDO 123456789-01',
    link: 'https://go.after.sale/abcdefg'
  }).execute()

  const message = `${prefix}${text}${suffix}`

  t.equal(message, 'Loja Aftersale |Eba! Pode comemorar. Seu pedido está em transferência e em breve estará a caminho de uma cidade mais próxima| PEDIDO 123456789-01')
  t.end()
})

tap.test('Should get raw suffix if link is not passed', (t) => {
  const { suffix } = new SMSShortify({
    prefix: 'Lojinha Aftersale |',
    text: 'Seu pedido está em transferência e em breve estará a caminho de outra cidade. Acompanhe as próximas atualizações em $link',
    suffix: '| PEDIDO 123456789-01'
  }).execute()

  t.equal(suffix, '| PEDIDO 123456789-01')
  t.end()
})

tap.test('Should create see more suffix if suffix is not passed', (t) => {
  const { suffix } = new SMSShortify({
    text: '! O pacote 1 está em transferência e em breve estará a caminho de outra cidade. Acompanhe as próximas atualizações pela interface $link',
    link: 'https://go.after.sale/abcdefg'
  }).execute()

  t.equal(suffix, '... Veja mais em: https://go.after.sale/abcdefg')
  t.end()
})
