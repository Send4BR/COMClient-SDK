import { COMClient, Email } from './lib'

const client = new COMClient({
  clientId: 'e9dbf1fa-6dc4-49d7-b9da-9c06557a3ba1',
  environment: 'stg',
  origin: 'fake',
  connectionString: 'Endpoint=sb://aftersale.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=4uVq7R4ruGyWYVLG2zg51pRmSAik9VPADUouGv2pnCM=',
  options: {
    silent: true
  }
})
const message = new Email({
  message: {
    body: '<h1>teste</h1>',
    from: 'igornfaustino@gmail.com',
    subject: 'test SEM service com agendamento'
  },
  recipient: {
    email: 'igor@nfaustino.com'
  },
  // scheduledTo: new Date(new Date().getTime() + (1000 * 60 * 5)),
  externalId: '123'
})
client.dispatch(message)
