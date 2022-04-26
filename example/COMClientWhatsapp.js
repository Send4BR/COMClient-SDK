import { COMClient, Whatsapp } from '@aftersale/comclient-sdk'

const client = new COMClient({
  provider: 'faker',
  connectionString: 'super_secret',
  clientId: '0123',
  origin: 'example'
})

const textMessage = new Whatsapp({
  message: { type: 'text', text: 'SDK Test' },
  recipient: { phone: '5541000000000' },
  externalId: '123'
})

await client.dispatch(textMessage)

const templateMessage = new Whatsapp({
  message: {
    type: 'template',
    template: 'template-1',
    fields: { name: 'João Claudio', company: 'Andaimes JC', description: 'Joao Claudio do Andaime' }
  },
  recipient: { phone: '5541000000000' },
  externalId: '123'
})

await client.dispatch(templateMessage)
