import { ServiceBusClient } from '@azure/service-bus'
import { MessageDispatcher } from '../../../domain/protocols/message-dispatcher'

export class MessageServiceBusSender implements MessageDispatcher {
  public static canHandle = 'servicebus'
  constructor(private client: ServiceBusClient) {}

  async dispatch(message: unknown, topic: string): Promise<void> {
    const sender = this.client.createSender(topic)

    try {
      await sender.sendMessages({
        body: message,
        contentType: 'application/json'
      })
    } catch (err) {
      console.error(err)
    } finally {
      await sender.close()
      await this.client.close()
    }
  }
}
