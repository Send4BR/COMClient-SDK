import { Email } from '../../domain/entities/message/email'
import { SMS } from '../../domain/entities/message/sms'
import { Whatsapp } from '../../domain/entities/message/whatsapp'
import SenderFactory from '../../infra/senders/sender-factory'
import { SenderOptions } from '../../infra/senders/types/sender-options'

type ClientParams = {
  environment?: string;
  provider?: string;
  connectionString: string;
  origin: string;
  clientId: string;
  options?: SenderOptions;
};

export class COMClient {
  private readonly provider: string
  private readonly origin: string
  private readonly clientId: string
  private readonly MESSAGE_QUEUE: string
  private readonly connectionString: string
  private senderOptions?: SenderOptions

  constructor({ environment = 'production', provider = 'servicebus', connectionString, origin, clientId, options }: ClientParams) {
    this.provider = provider
    this.senderOptions = options
    this.origin = origin
    this.clientId = clientId
    this.connectionString = connectionString
    this.MESSAGE_QUEUE = `${environment}--send-message`
  }

  public async dispatch(message: Email | SMS | Whatsapp) {
    const sender = SenderFactory.create(this.provider, this.connectionString, this.senderOptions)

    await sender.dispatch({ ...message.getMessage(), origin: this.origin, clientId: this.clientId }, this.MESSAGE_QUEUE)

    return message.id
  }
}
