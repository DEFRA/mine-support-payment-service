const { start, stop } = require('../../../app/messaging/index')

jest.mock('adp-messaging')
const { MessageReceiver } = require('adp-messaging')
MessageReceiver.mockImplementation(() => {
  return {
    subscribe: jest.fn(),
    closeConnection: jest.fn()
  }
})

jest.mock('../../../app/messaging/process-schedule-message')

jest.mock('../../../app/messaging/process-payment-message')

describe('index', () => {
  let receiver
  beforeEach(() => {
    receiver = new MessageReceiver()
    MessageReceiver.mockImplementation(() => receiver)
  })

  test('should start', async () => {
    await start()
    expect(receiver.subscribe).toHaveBeenCalled()
  })

  test('should stop', async () => {
    await stop()
    expect(receiver.closeConnection).toHaveBeenCalled()
  })
})
