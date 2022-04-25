import tap from 'tap'
import { Whatsapp } from '../../../lib'
import { whatsappTextTest } from '../../fixtures/whatsapp'

tap.test('should have need props', (t) => {
  const date = new Date()
  const message = new Whatsapp({ ...whatsappTextTest, scheduledTo: date })

  t.equal(message.channel, 'whatsapp')
  t.equal(message.message, whatsappTextTest.message)
  t.equal(message.recipient, whatsappTextTest.recipient)
  t.equal(message.externalId, whatsappTextTest.externalId)
  t.equal(message.scheduledTo, date.toISOString())

  t.end()
})
