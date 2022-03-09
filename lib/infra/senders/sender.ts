import { ServiceBusClient } from '@azure/service-bus'
import { ProviderNotImplemented } from '../../errors/provider-not-implemented'
import { FakerMessageSender } from './faker/message'
import { MessageServiceBusSender } from './service-bus/message'

export class SenderFactory {
  public static senders = [MessageServiceBusSender, FakerMessageSender]

  public static create(provider: string, connectionString: string) {
    const Sender = SenderFactory.senders.find(sender => sender.canHandle === provider)

    if (Sender === MessageServiceBusSender) {
      const client = new ServiceBusClient(connectionString)
      return {
        sender: new Sender(client)
      }
    }

    if (Sender === FakerMessageSender) {
      return {
        sender: new Sender()
      }
    }

    throw new ProviderNotImplemented(provider)
  }
}
