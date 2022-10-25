export default {
  message: { type: 'html' as const, body: '<p></p>', from: 'sdk@test.com', subject: 'SDK Test' },
  recipient: { email: 'sdk@test.com' },
  externalId: '123'
}
