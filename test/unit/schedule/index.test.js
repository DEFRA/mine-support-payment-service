const { models, sequelize } = require('../../../app/services/database-service')
const { getPaymentDates } = require('../../../app/schedule/scheduler')
const index = require('../../../app/schedule/index')

jest.mock('../../../app/services/database-service', () => ({
  models: {
    schedule: {
      findOne: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn()
    },
    payment: {}
  },
  sequelize: {
    transaction: jest.fn()
  }
}))
jest.mock('../../../app/schedule/scheduler', () => ({
  getPaymentDates: jest.fn()
}))

describe('index', () => {
  beforeEach(() => {
    sequelize.transaction.mockImplementation((callback) => callback())
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should create schedule when no existing schedule is found', async () => {
    const mockClaim = { claimId: 1 }
    const mockScheduleStartDate = new Date()
    const mockPaymentDates = [new Date(), new Date()]
    getPaymentDates.mockReturnValue(mockPaymentDates)
    models.schedule.findOne.mockResolvedValue(null)

    await index.createSchedule(mockClaim, mockScheduleStartDate)

    expect(models.schedule.findOne).toHaveBeenCalled()
    expect(models.schedule.create).toHaveBeenCalled()
  })

  test('should not create schedule when existing schedule is found', async () => {
    const mockClaim = { claimId: 1 }
    const mockScheduleStartDate = new Date()
    const mockExistingSchedule = { claimId: mockClaim.claimId }
    models.schedule.findOne.mockResolvedValue(mockExistingSchedule)

    await index.createSchedule(mockClaim, mockScheduleStartDate)

    expect(models.schedule.findOne).toHaveBeenCalled()
    expect(models.schedule.create).not.toHaveBeenCalled()
  })

  test('should get schedule by id', async () => {
    const mockClaimId = 1
    const mockSchedules = [{ claimId: mockClaimId }]
    models.schedule.findAll.mockResolvedValue(mockSchedules)

    await index.getById(mockClaimId)

    expect(models.schedule.findAll).toHaveBeenCalled()
  })

  test('should get all schedules', async () => {
    const mockSchedules = [{ claimId: 1 }, { claimId: 2 }]
    models.schedule.findAll.mockResolvedValue(mockSchedules)

    await index.getAll()

    expect(models.schedule.findAll).toHaveBeenCalled()
  })
})
