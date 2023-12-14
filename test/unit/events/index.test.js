const sendEvent = require('../../../app/events/index')
const createEvent = require('../../../app/events/create-event')

jest.mock('../../../app/events/create-event', () => jest.fn())
jest.mock('../../../app/config', () => {
  return { eventConfig: {} }
})
jest.mock('ffc-events')
const { EventSender } = require('ffc-events')
EventSender.mockImplementation(() => {
  return {
    connect: jest.fn(),
    sendEvents: jest.fn(),
    closeConnection: jest.fn()
  }
})

describe('send event', () => {
  let sender
  beforeEach(() => {
    sender = new EventSender()
    EventSender.mockImplementation(() => sender)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should send event', async () => {
    const claim = {
      claimId: 'claim123',
      value: 100
    }
    await sendEvent(claim, 'type')
    expect(createEvent).toHaveBeenCalled()
    expect(sender.connect).toHaveBeenCalled()
    expect(sender.sendEvents).toHaveBeenCalled()
    expect(sender.closeConnection).toHaveBeenCalled()
  })

  test('handle error', async () => {
    const claim = {
      claimId: 'claim123',
      value: 100
    }
    createEvent.mockImplementationOnce(() => {
      throw new Error('error')
    })
    await sendEvent(claim, 'type')
    expect(createEvent).toHaveBeenCalled()
    expect(sender.closeConnection).toHaveBeenCalled()
  })
})
