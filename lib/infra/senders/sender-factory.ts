import { ServiceBusClient } from '@azure/service-bus'
import { ProviderNotImplemented } from '../../errors/provider-not-implemented'
import { FakerMessageSender } from './faker/message'
import { MessageServiceBusSender } from './service-bus/message'

export default class SenderFactory {
  public static senders = [MessageServiceBusSender, FakerMessageSender]

  public static create(provider: string, connectionString: string) {
    const Sender = SenderFactory.senders.find(sender => sender.canHandle === provider)

    switch (Sender) {
      case MessageServiceBusSender:
        return new Sender(new ServiceBusClient(connectionString))
      case FakerMessageSender:
        return new Sender()
    }

    throw new ProviderNotImplemented(provider)
  }
}
