# COMClient-SDK

SDK de comunicação com o COM-Service

# Instalação do SDK

Para utilizar a SDK, você deve instalar como dependência ao projeto.

``` shell
$ npm i https://github.com/Send4BR/COMClient-SDK
```

## Como utilizar


```ts
import {COMClient, Email} from '@aftersale/comclient-sdk'

const client = new COMClient({
  clientId: 'YOUR-CLIENT-ID',
  origin: 'your server name',
  connectionString: 'provider connection string',
})

const message = new Mail({
  message: {
    body: '<h1>body</h1>',
    from: 'from@mail.com',
    subject: 'subject'
  },
  recipient: {
    email: 'recipient@mail.com'
  }
})

client.dispatch(message)
```

## Client

O Client é o objeto que vai realizar a conexão com o COM-service.
Ele recebe algumas configurações:

|field|type|description|required|defaultOption|available options |
|-----|----|-----------|--------|-------------|----|
|ClientId|`string`|Your COM-service client id | `true` | - | - |
| origin | `string` | Your server name | `true` | - | - |
| connectionString | `string` | COM-service provider connection string | `true` | - | - |
| provider | `string` | Provider to send message | `false` | `servicebus` | `servicebus` \| `faker` |
| environment | `string` | COM-service environment | `false` | `production` | `production` \| `staging` \| `sprint` |

O `Client` possui um único método chamado `dispatch`

- `dispatch: (message: Message) => Promise<void>`: Realiza o envio da mensagem


## Message

a mensagem que vai ser enviada.

uma mensagem pode ser do tipo `Email`, `SMS` ou `Whatsapp`.

### Email

O email recebe um objeto de configurações com as seguintes propriedades

| field | type | description | required |
|-------|------|-------------|----------|
|recipient| `{email: string}` | Para quem o email será envaido | `true` |
|message| `{body: string, from: string, subject: string}` | Corpo do email que será enviado | `true` |
| externalId | `string` | Id de referencia para identificar uma mensagem no COM-service | `false` | 
