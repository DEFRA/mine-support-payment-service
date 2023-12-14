const mockDatabaseService = {
  models: {
    payment: {
      create: jest.fn(),
      findOne: jest.fn()
    }
  },
  sequelize: {
    transaction: jest
      .fn()
      .mockImplementation((callback) => Promise.resolve(callback()))
  }
}
jest.mock('../../../app/services/database-service', () => mockDatabaseService)

const { createPayment } = require('../../../app/payment/index')

describe('Payment', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('should create a new payment if it not exists', async () => {
    const payment = {
      claimId: 'claim101',
      value: 100
    }
    mockDatabaseService.models.payment.findOne.mockResolvedValue(null)
    await createPayment(payment)
    expect(mockDatabaseService.models.payment.create).toHaveBeenCalled()
  })
})
