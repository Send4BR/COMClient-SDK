import tap from 'tap'
import { COMClient, Email, MessageData, Whatsapp, WhatsappData } from '../../../lib'
import { SMS } from '../../../lib/domain/entities/message/sms'
import { ProviderNotImplemented } from '../../../lib/errors/provider-not-implemented'
import { FakerMessageSender } from '../../../lib/infra/senders/faker/message'
import emailTest from '../../fixtures/email'
import { whatsappTemplateTest, whatsappTextTest } from '../../fixtures/whatsapp'

type SMSData = Partial<Omit<MessageData, 'scheduledTo'>> & { scheduledTo?: string; message: { text: string } };

tap.test('Should instance a client', (t) => {
  const client = new COMClient({
    connectionString: 'Endpoint=sb://test.windows.net/;SharedAccessKeyName=test;SharedAccessKey=test',
    origin: 'test',
    clientId: 'test'
  })

  t.equal(client instanceof COMClient, true)
  t.end()
})

tap.test('should dispatch a error when provider is incorrect', async (t) => {
  const client = new COMClient({
    connectionString: 'Endpoint=sb://test.windows.net/;SharedAccessKeyName=test;SharedAccessKey=test',
    origin: 'test',
    clientId: 'test',
    provider: 'errado'
  })

  t.rejects(client.dispatch('test' as unknown as Email), new ProviderNotImplemented('errado'))
  t.end()
})

tap.test('should send a email message using fake provider', async (t) => {
  t.before(() => FakerMessageSender.cleanMessages())
  const client = new COMClient({
    provider: 'faker',
    connectionString: 'faker_secret',
    clientId: '4632b0b0-9be2-4797-92ad-7c53ff3c5662',
    origin: 'pc da nasa'
  })

  const message = new Email(emailTest)

  await client.dispatch(message)
  t.equal(FakerMessageSender.messages.length, 1)
  t.match(FakerMessageSender.messages[0], message.getMessage())
  t.end()
})

tap.test('should send a email message using fake provider with cc', async (t) => {
  t.before(() => FakerMessageSender.cleanMessages())
  const client = new COMClient({
    provider: 'faker',
    connectionString: 'faker_secret',
    clientId: '4632b0b0-9be2-4797-92ad-7c53ff3c5662',
    origin: 'pc da nasa'
  })

  const message = new Email({ ...emailTest, message: { ...emailTest.message, cc: ['test@test.com'] } })

  await client.dispatch(message)
  t.equal(FakerMessageSender.messages.length, 1)
  t.match(FakerMessageSender.messages[0], message.getMessage())
  t.equal((FakerMessageSender.messages[0] as {
    message: {
      cc: string[]
    }
  }).message.cc[0], message.message.cc?.[0])
  t.end()
})

tap.test('should send a SMS message using fake provider', async (t) => {
  t.before(() => FakerMessageSender.cleanMessages())
  const client = new COMClient({
    provider: 'faker',
    connectionString: 'faker_secret',
    clientId: '4632b0b0-9be2-4797-92ad-7c53ff3c5662',
    origin: 'pc da nasa'
  })

  const message = new SMS({
    message: {
      prefix: 'Loja da Ana:',
      text: 'É isso aí Como a gente achou que ia ser A vida tão simples é boa Quase sempre É isso aí Os passos vão pelas ruas E nem reparou na lua A vida sempre continua',
      suffix: 'PEDIDO #1234',
      variables: { link: 'https://lojadaana.delivery.after.sale/order/1234' }
    },
    recipient: { phone: '909000000000' }
  })

  message.shortify()

  await client.dispatch(message)

  t.equal(FakerMessageSender.messages.length, 1)
  t.equal(
    (FakerMessageSender.messages[0] as SMSData).message.text,
    'Loja da Ana: E isso ai Como a gente achou que ia ser A vida tao simples e boa Qu ... Veja mais em: https://lojadaana.delivery.after.sale/order/1234 PEDIDO #1234'
  )

  t.end()
})

tap.test('should send a SMS message using fake provider with schedule', async (t) => {
  t.before(() => FakerMessageSender.cleanMessages())
  const client = new COMClient({
    provider: 'faker',
    connectionString: 'faker_secret',
    clientId: '4632b0b0-9be2-4797-92ad-7c53ff3c5662',
    origin: 'pc da nasa'
  })

  const date = new Date()

  const message = new SMS({
    message: {
      prefix: 'Loja da Ana:',
      text: 'É isso aí Como a gente achou que ia ser A vida tão simples é boa Quase sempre É isso aí Os passos vão pelas ruas E nem reparou na lua A vida sempre continua',
      suffix: 'PEDIDO #1234',
      variables: { link: 'https://lojadaana.delivery.after.sale/order/1234' }
    },
    recipient: { phone: '909000000000' },
    scheduledTo: date
  })

  message.shortify()

  await client.dispatch(message)

  t.equal(FakerMessageSender.messages.length, 1)
  t.equal(
    (FakerMessageSender.messages[0] as SMSData).message.text,
    'Loja da Ana: E isso ai Como a gente achou que ia ser A vida tao simples e boa Qu ... Veja mais em: https://lojadaana.delivery.after.sale/order/1234 PEDIDO #1234'
  )
  t.equal((FakerMessageSender.messages[0] as SMSData).scheduledTo, date.toISOString())

  t.end()
})

tap.test('should send a whatsapp text message using fake provider', async (t) => {
  t.before(() => FakerMessageSender.cleanMessages())
  const client = new COMClient({
    provider: 'faker',
    connectionString: 'faker_secret',
    clientId: '4632b0b0-9be2-4797-92ad-7c53ff3c5662',
    origin: 'pc da nasa'
  })

  const message = new Whatsapp(whatsappTextTest as WhatsappData)

  await client.dispatch(message)
  t.equal(FakerMessageSender.messages.length, 1)
  t.match(FakerMessageSender.messages[0], message.getMessage())
  t.end()
})

tap.test('should send whatsapp message replying to other', async (t) => {
  t.before(() => FakerMessageSender.cleanMessages())
  const client = new COMClient({
    provider: 'faker',
    connectionString: 'faker_secret',
    clientId: '4632b0b0-9be2-4797-92ad-7c53ff3c5662',
    origin: 'pc da nasa'
  })

  const message = new Whatsapp({ ...whatsappTextTest, replyingTo: '1234' } as WhatsappData)

  await client.dispatch(message)
  t.equal(FakerMessageSender.messages.length, 1)
  t.match(FakerMessageSender.messages[0], message.getMessage())
  t.end()
})

tap.test('should send a whatsapp template message using fake provider', async (t) => {
  t.before(() => FakerMessageSender.cleanMessages())
  const client = new COMClient({
    provider: 'faker',
    connectionString: 'faker_secret',
    clientId: '4632b0b0-9be2-4797-92ad-7c53ff3c5662',
    origin: 'pc da nasa'
  })

  const message = new Whatsapp(whatsappTemplateTest as WhatsappData)

  await client.dispatch(message)
  t.equal(FakerMessageSender.messages.length, 1)
  t.match(FakerMessageSender.messages[0], message.getMessage())
  t.end()
})
