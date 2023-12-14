const sequelize = {
  define: jest.fn(() => ({
    associate: jest.fn()
  }))
}
const DataTypes = {
  STRING: 'string',
  DATE: 'date',
  BOOLEAN: 'boolean',
  DECIMAL: 'decimal'
}

describe('Payment Model', () => {
  let Payment
  beforeEach(() => {
    jest.clearAllMocks()
    Payment = require('../../../app/models/payment')(sequelize, DataTypes)
  })

  test('should define the model with correct fields', () => {
    expect(sequelize.define).toHaveBeenCalled()
    expect(Payment.associate).toBeDefined()
  })
})
