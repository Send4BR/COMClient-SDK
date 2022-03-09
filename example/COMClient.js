import { COMClient, Email } from 'comclient-sdk'

const client = new COMClient({
  provider: 'faker',
  connectionString: 'super_secret',
  clientId: '0123',
  origin: 'example'
})

const message = new Email({
  message: {
    body: '<h1>Testing</h1>',
    from: 'example@after.sale',
    subject: 'Example'
  },
  recipient: {
    email: 'comclient@after.sale'
  },
  externalId: '123'
})

await client.dispatch(message)
