const sequelize = {
  define: jest.fn(() => ({
    associate: jest.fn()
  }))
}
const DataTypes = {
  STRING: 'string',
  DATE: 'date',
  BOOLEAN: 'boolean',
  DECIMAL: 'decimal',
  INTEGER: 'integer'
}

describe('Payment Model', () => {
  let Schedule
  beforeEach(() => {
    jest.clearAllMocks()
    Schedule = require('../../../app/models/schedule')(sequelize, DataTypes)
  })

  test('should define the model with correct fields', () => {
    expect(sequelize.define).toHaveBeenCalled()
    expect(Schedule.associate).toBeDefined()
  })
})
