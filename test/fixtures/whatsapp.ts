import { WhatsappData } from '../../lib'

export const whatsappTextTest = {
  message: { type: 'text', text: 'SDK Test' },
  recipient: { phone: '5541000000000' },
  externalId: '123'
} as WhatsappData

export const whatsappTemplateTest = {
  message: { type: 'template', template: 'template-1', fields: {} },
  recipient: { phone: '5541000000000' },
  externalId: '123'
} as WhatsappData
