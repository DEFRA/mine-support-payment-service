const createEvent = require('../../../app/events/create-event')

describe('create event', () => {
  test('should create event', async () => {
    const claim = {
      claimId: 'claim123',
      value: 100
    }
    const event = createEvent(claim, 'type')
    expect(event).toEqual({
      body: claim,
      type: 'type',
      source: 'ffc-demo-payment-service'
    })
  })
})
