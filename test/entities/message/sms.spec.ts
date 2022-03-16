import tap from 'tap'
import { SMS } from '../../../lib/domain/entities/message/sms'

const recipient = { phone: '5541000000000' }
const mockMessage = {
  short: 'Sua entrega está a caminho',
  shortWithLink: 'Sua entrega está a caminho e você pode acompanhar mais pelo link: $link',
  long: 'Sua entrega está a caminho logo logo você terá o melhor produto perto de você, sua encomenda esta bem próximo do morro do careca e irá ser entregue logo logo... siga acompanhando pelo link: $link',
  longWithoutLink:
    'Sua entrega está a caminho logo logo você terá o melhor produto perto de você, sua encomenda esta próximo do morro do careca e irá ser entregue logo logo...',
  longWithTwoVariablesAndLink:
    '$name Sua entrega está a caminho logo logo você terá o $anotherVariable melhor produto perto de você, sua encomenda esta próximo do morro do careca e irá ser entregue logo logo...'
}
const link = 'www.trakr.com.br/tracking'

tap.test('should have need props', (t) => {
  const message = new SMS({ message: { text: 'test' }, recipient })

  t.equal(message.channel, 'sms')
  t.equal(message.getMessage().message.text, 'test')

  t.end()
})

tap.test('should normalize diacritics in message', (t) => {
  const msg = new SMS({
    message: {
      prefix: 'Loja da Ana',
      text: 'É isso ai, Como a gente achou que ia ser',
      suffix: 'PEDIDO #123'
    },
    recipient
  })

  const { message } = msg.getMessage()

  t.equal(message.text, 'Loja da Ana: E isso ai, Como a gente achou que ia ser PEDIDO #123')

  t.end()

  tap.test('should return message with prefix', (t) => {
    const msg = new SMS({
      message: {
        text: 'É isso ai, Como a gente achou que ia ser',
        suffix: 'PEDIDO #123'
      },
      recipient
    })

    const { message } = msg.getMessage()

    t.equal(message.text, 'E isso ai, Como a gente achou que ia ser PEDIDO #123')

    t.end()
  })

  tap.test('should return message with suffix', (t) => {
    const msg = new SMS({
      message: {
        prefix: 'Loja da Ana',
        text: 'É isso ai, Como a gente achou que ia ser'
      },
      recipient
    })

    const { message } = msg.getMessage()

    t.equal(message.text, 'Loja da Ana: E isso ai, Como a gente achou que ia ser')

    t.end()
  })
})

tap.test('SMS shortify', (t) => {
  t.test('should return message if prefix and suffix not provided', (t) => {
    const msg = new SMS(
      {
        message: {
          text: mockMessage.short
        },
        recipient
      }
    )
    msg.shortify()

    const { message } = msg.getMessage()

    t.equal(message.text, 'Sua entrega esta a caminho')
    t.equal(message.text.length <= 160, true)
    t.end()
  })

  t.test('should return message with link if prefix and suffix not provided', (t) => {
    const msg = new SMS(
      {
        message: {
          text: mockMessage.shortWithLink,
          variables: { link }
        },
        recipient
      }
    )
    msg.shortify()

    const { message } = msg.getMessage()

    t.equal(
      message.text,
      'Sua entrega esta a caminho e voce pode acompanhar mais pelo link: www.trakr.com.br/tracking'
    )
    t.equal(message.text.length <= 160, true)
    t.end()
  })

  t.test('should return message formatted with link', (t) => {
    const msg = new SMS(
      {
        message: {
          prefix: 'Batshop',
          text: mockMessage.shortWithLink,
          suffix: '#4421321',
          variables: { link }
        },
        recipient
      }
    )
    msg.shortify()

    const { message } = msg.getMessage()

    t.equal(
      message.text,
      'Batshop: Sua entrega esta a caminho e voce pode acompanhar mais pelo link: www.trakr.com.br/tracking #4421321'
    )
    t.equal(message.text.length <= 160, true)
    t.end()
  })

  t.test('should return long message correctly with link', (t) => {
    const msg = new SMS(
      {
        message: {
          prefix: 'Batshop',
          text: mockMessage.long,
          suffix: '#4421321',
          variables: { link }
        },
        recipient
      }
    )
    msg.shortify()

    const { message } = msg.getMessage()

    t.equal(
      message.text,
      'Batshop: Sua entrega esta a caminho logo logo voce tera o melhor produto perto de voce, sua encomenda esta  ... Veja mais em: www.trakr.com.br/tracking #4421321'
    )
    t.equal(message.text.length <= 160, true)
    t.end()
  })

  t.test('should return long message correctly without link', (t) => {
    const msg = new SMS(
      {
        message: {
          prefix: 'Batshop',
          text: mockMessage.longWithoutLink,
          suffix: '#4421321',
          variables: { link }
        },
        recipient
      }
    )
    msg.shortify()

    const { message } = msg.getMessage()

    t.equal(
      message.text,
      'Batshop: Sua entrega esta a caminho logo logo voce tera o melhor produto perto de voce, sua encomenda esta  ... Veja mais em: www.trakr.com.br/tracking #4421321'
    )
    t.equal(message.text.length <= 160, true)
    t.end()
  })

  t.test('should return long message correctly with replaces', (t) => {
    const msg = new SMS(
      {
        message: {
          prefix: 'Batshop',
          text: mockMessage.longWithTwoVariablesAndLink,
          suffix: '#4421321',
          variables: { link, name: 'Batman', anotherVariable: 'OUTRA VARIAVEL' }
        },
        recipient
      }
    )
    msg.shortify()

    const { message } = msg.getMessage()

    t.equal(
      message.text,
      'Batshop: Batman Sua entrega esta a caminho logo logo voce tera o OUTRA VARIAVEL melhor produto perto de voc ... Veja mais em: www.trakr.com.br/tracking #4421321'
    )
    t.equal(message.text.length <= 160, true)
    t.end()
  })

  t.test('should return long message correctly without prefix & suffix', (t) => {
    const msg = new SMS(
      {
        message: {
          text: mockMessage.longWithoutLink
        },
        recipient
      }
    )
    msg.shortify()

    const { message } = msg.getMessage()

    t.equal(
      message.text,
      'Sua entrega esta a caminho logo logo voce tera o melhor produto perto de voce, sua encomenda esta proximo do morro do careca e ira ser entregue logo logo...'
    )
    t.equal(message.text.length <= 160, true)
    t.end()
  })

  t.test('should return long message correctly with link but without prefix & suffix', (t) => {
    const msg = new SMS(
      {
        message: {
          text: mockMessage.long,
          variables: { link }
        },
        recipient
      }
    )
    msg.shortify()

    const { message } = msg.getMessage()

    t.equal(
      message.text,
      'Sua entrega esta a caminho logo logo voce tera o melhor produto perto de voce, sua encomenda esta bem proximo do m ... Veja mais em: www.trakr.com.br/tracking'
    )
    t.equal(message.text.length <= 160, true)
    t.end()
  })

  t.test('should return long message correctly with link but without prefix & suffix and 240 char', (t) => {
    const msg = new SMS(
      {
        message: {
          text: mockMessage.long,
          variables: { link }
        },
        recipient
      }
    )

    const { message } = msg.getMessage()

    t.equal(message.text.length <= 240, true)
    t.end()
  })
  t.end()
})
