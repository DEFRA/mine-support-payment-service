const joi = require('joi')
jest.mock('joi')

describe('Test mqSchema validation', () => {
  beforeEach(() => {
    joi.object.mockClear()
  })

  test('should return valid config', () => {
    joi.string = jest.fn().mockImplementation(() => {
      return {
        required: jest.fn().mockReturnThis(),
        optional: jest.fn().mockReturnThis(),
        default: jest.fn().mockReturnThis()
      }
    })

    joi.bool = jest.fn().mockImplementation(() => {
      return {
        default: jest.fn().mockReturnValue(false)
      }
    })

    joi.object.mockReturnValue({
      validate: () => ({
        value: {
          scheduleSubscription: {
            host: process.env.MESSAGE_QUEUE_HOST,
            useCredentialChain: false,
            managedIdentityClientId: 'id',
            type: 'topic',
            appInsights: undefined,
            name: 'ffc-demo-claim-service-calculation',
            address: 'process.env.CALCULATION_QUEUE_ADDRESS',
            username: 'process.env.MESSAGE_QUEUE_USER',
            password: 'process.env.MESSAGE_QUEUE_PASSWORD'
          },
          paymentSubscription: {
            host: process.env.MESSAGE_QUEUE_HOST,
            useCredentialChain: false,
            managedIdentityClientId: 'id',
            appInsights: undefined,
            name: 'ffc-demo-claim-service-schedule',
            address: 'process.env.SCHEDULE_TOPIC_ADDRESS',
            username: 'process.env.MESSAGE_QUEUE_USER',
            password: 'process.env.MESSAGE_QUEUE_PASSWORD',
            type: 'topic'
          }
        },
        error: null
      })
    })

    const {
      scheduleSubscription,
      paymentSubscription
    } = require('../../../app/config/mq-config')

    expect(scheduleSubscription).toBeDefined()
    expect(paymentSubscription).toBeDefined()
  })
})
