import tap from 'tap'
import { COMClient, Email } from '../../../lib'
import { ProviderNotImplemented } from '../../../lib/errors/provider-not-implemented'
import { FakerMessageSender } from '../../../lib/infra/senders/faker/message'
import emailTest from '../../fixtures/email'

tap.test('Should instance a client', (t) => {
  const client = new COMClient({
    connectionString: 'Endpoint=sb://test.windows.net/;SharedAccessKeyName=test;SharedAccessKey=test',
    origin: 'test',
    clientId: 'test'
  })

  t.equal(client instanceof COMClient, true)
  t.end()
})

tap.test('should send a message', async (t) => {
  const client = new COMClient({
    connectionString: 'Endpoint=sb://test.windows.net/;SharedAccessKeyName=test;SharedAccessKey=test',
    origin: 'test',
    clientId: 'test'
  })

  t.resolves(client.dispatch('hello from here' as unknown as Email))
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
  const client = new COMClient({
    provider: 'faker',
    connectionString: 'faker_secret',
    clientId: '4632b0b0-9be2-4797-92ad-7c53ff3c5662',
    origin: 'pc da nasa'
  })

  const message = new Email(emailTest)

  await client.dispatch(message)
  t.equal(FakerMessageSender.messages.length, 1)
  t.end()
})
