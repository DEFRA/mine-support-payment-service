const joi = require('joi')
jest.mock('joi')

describe('Test event config validation', () => {
  beforeEach(() => {
    joi.object.mockClear()
  })

  test('should return valid config', () => {
    joi.string = jest.fn().mockImplementation(() => {
      return {
        required: jest.fn().mockReturnThis(),
        optional: jest.fn().mockReturnThis(),
        default: jest.fn().mockReturnThis(),
        allow: jest.fn().mockReturnThis()
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
          name: 'process.env.CLAIM_UPDATE_TOPIC_NAME',
          host: 'process.env.EVENT_HOST',
          port: 'process.env.EVENT_PORT',
          authentication: 'password',
          username: 'process.env.EVENT_USERNAME',
          password: 'process.env.EVENT_PASSWORD',
          mechanism: 'process.env.EVENT_MECHANISM',
          topic: 'process.env.CLAIM_UPDATE_TOPIC',
          clientId: 'process.env.EVENT_CLIENT_ID',
          consumerGroupId: 'process.env.EVENT_CONSUMER_GROUP_ID',
          fromBeginning: 'process.env.CLAIM_UPDATE_FROM_BEGINNING',
          appInsights: undefined,
          routingKey: 'process.env.EVENT_ROUTING_KEY'
        },
        error: null
      })
    })

    const eventConfig = require('../../../app/config/event-config')

    expect(eventConfig).toBeDefined()
  })
})
