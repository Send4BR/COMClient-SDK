import tap from 'tap'
import { COMInternal, MessageData, TemplateCreated, TemplateUpdated } from '../../../lib/application/service/internal-client'
import { FakerMessageSender } from '../../../lib/infra/senders/faker/message'

tap.test('should send a success message', async (t) => {
  t.before(() => FakerMessageSender.cleanMessages())
  const date = new Date()
  const client = new COMInternal({
    provider: 'faker',
    connectionString: 'faker_secret'
  })

  const message = {
    id: '2323232',
    sentAt: date
  }

  await client.success(message)

  t.equal(FakerMessageSender.messages.length, 1)
  t.equal((FakerMessageSender.messages[0] as MessageData).sentAt, date.toISOString())

  t.end()
})

tap.test('should send a error message', async (t) => {
  t.before(() => FakerMessageSender.cleanMessages())
  const client = new COMInternal({
    provider: 'faker',
    connectionString: 'faker_secret'
  })

  const message = {
    id: '2323232',
    error: 'Deu ruim no envio, meu bom'
  }

  await client.error(message)

  t.equal(FakerMessageSender.messages.length, 1)
  t.end()
})

tap.test('should send can retry flag', async (t) => {
  t.before(() => FakerMessageSender.cleanMessages())
  const client = new COMInternal({
    provider: 'faker',
    connectionString: 'faker_secret'
  })

  const message = {
    id: '2323232',
    error: 'Deu ruim no envio, meu bom',
    retrievable: true
  }

  await client.error(message)

  t.equal(FakerMessageSender.messages.length, 1)
  t.equal((FakerMessageSender.messages[0] as { retrievable: boolean }).retrievable, true)
  t.end()
})

tap.test('should can retry flag be falsy when not passed', async (t) => {
  t.before(() => FakerMessageSender.cleanMessages())
  const client = new COMInternal({
    provider: 'faker',
    connectionString: 'faker_secret'
  })

  const message = {
    id: '2323232',
    error: 'Deu ruim no envio, meu bom'
  }

  await client.error(message)

  t.equal(FakerMessageSender.messages.length, 1)
  t.equal(!!(FakerMessageSender.messages[0] as { retrievable: boolean }).retrievable, false)
  t.end()
})

tap.test('should send a template created', async (t) => {
  t.before(() => FakerMessageSender.cleanMessages())
  const client = new COMInternal({
    provider: 'faker',
    connectionString: 'faker_secret'
  })

  const message = {
    id: '2323232'
  }

  await client.templateCreated(message)

  t.equal(FakerMessageSender.messages.length, 1)
  t.equal((FakerMessageSender.messages[0] as TemplateCreated).id, message.id)

  t.end()
})

tap.test('should send a template updated', async (t) => {
  t.before(() => FakerMessageSender.cleanMessages())
  const client = new COMInternal({
    provider: 'faker',
    connectionString: 'faker_secret'
  })

  await client.templateUpdated({
    id: '2323232',
    status: 'approved'
  })

  t.equal(FakerMessageSender.messages.length, 1)
  t.equal((FakerMessageSender.messages[0] as TemplateUpdated).id, '2323232')
  t.equal((FakerMessageSender.messages[0] as TemplateUpdated).status, 'approved')

  t.end()
})
