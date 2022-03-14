import tap from 'tap'

import { COMInternal } from '../../../lib/domain/service/internal-client'
import { FakerMessageSender } from '../../../lib/infra/senders/faker/message'

tap.test('should send a success message', async (t) => {
  t.before(() => FakerMessageSender.cleanMessages())
  const client = new COMInternal({
    provider: 'faker',
    connectionString: 'faker_secret'
  })

  const message = {
    id: '2323232',
    sentAt: 1647261032
  }

  await client.success(message)
  t.equal(FakerMessageSender.messages.length, 1)
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
    message: 'Deu ruim no envio, meu bom'
  }

  await client.error(message)

  t.equal(FakerMessageSender.messages.length, 1)
  t.end()
})
