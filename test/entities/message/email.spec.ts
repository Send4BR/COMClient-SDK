import tap from 'tap'
import { Email } from '../../../lib/domain/entities/message/email'
import emailTest from '../../fixtures/email'

tap.test('should have need props', (t) => {
  const message = new Email(emailTest)

  t.equal(message.channel, 'email')
  t.equal(message.message, emailTest.message)
  t.equal(message.recipient, emailTest.recipient)
  t.equal(message.externalId, emailTest.externalId)

  t.end()
})
