import tap from 'tap'
import { Whatsapp, WhatsappData } from '../../../lib'
import { whatsappTextTest } from '../../fixtures/whatsapp'

tap.test('should have need props', (t) => {
  const date = new Date()
  const message = new Whatsapp({ ...whatsappTextTest as WhatsappData, scheduledTo: date })

  t.equal(message.channel, 'whatsapp')
  t.equal(message.message, whatsappTextTest.message)
  t.equal(message.recipient, whatsappTextTest.recipient)
  t.equal(message.externalId, whatsappTextTest.externalId)
  t.equal(message.scheduledTo, date.toISOString())

  t.end()
})

tap.test('should have replying to props', (t) => {
  const message = new Whatsapp({ ...whatsappTextTest as WhatsappData, replyingTo: '1234' })

  t.equal(message.replyingTo, '1234')

  t.end()
})
