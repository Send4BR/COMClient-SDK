
import { MessageDispatcher } from '../../../domain/protocols/message-dispatcher'

export class FakerMessageSender implements MessageDispatcher {
  public static canHandle = 'faker'
  public static sender: unknown[] = []

  async dispatch(message: unknown, topic: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log('sending message to topic ' + topic)
    FakerMessageSender.sender.push(message)
  }

  public static get messages() {
    return this.sender
  }

  public static cleanMessages() {
    this.sender = []
  }
}
