import { COMClient, SMS } from '@aftersale/comclient-sdk'

const client = new COMClient({
  provider: 'faker',
  connectionString: 'super_secret',
  clientId: '0123',
  origin: 'example'
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
