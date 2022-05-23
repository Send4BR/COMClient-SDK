import tap from 'tap'
import { Email } from '../../../lib/domain/entities/message/email'
import emailTest from '../../fixtures/email'

tap.test('should have need props', (t) => {
  const date = new Date()
  const message = new Email({ ...emailTest, scheduledTo: date })

  t.equal(message.channel, 'email')
  t.equal(message.message, emailTest.message)
  t.equal(message.recipient, emailTest.recipient)
  t.equal(message.externalId, emailTest.externalId)
  t.equal(message.scheduledTo, date.toISOString())

  t.end()
})

tap.test('should have replying to props', (t) => {
  const message = new Email({ ...emailTest, replyingTo: '1234' })

  t.equal(message.replyingTo, '1234')

  t.end()
})
