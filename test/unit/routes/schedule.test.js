const { getById, getAll } = require('../../../app/schedule')
const scheduleRoutes = require('../../../app/routes/schedule')

jest.mock('../../../app/schedule', () => ({
  getById: jest.fn(),
  getAll: jest.fn()
}))

describe('schedule routes', () => {
  test('should return 200 with data when getById is successful', async () => {
    const mockData = [{ id: 1 }]
    getById.mockResolvedValue(mockData)

    const mockRequest = {
      params: {
        claimId: 1
      }
    }
    const mockH = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn()
    }

    await scheduleRoutes[0].options.handler(mockRequest, mockH)

    expect(getById).toHaveBeenCalledWith(mockRequest.params.claimId)
    expect(mockH.response).toHaveBeenCalledWith(mockData)
    expect(mockH.code).toHaveBeenCalledWith(200)
  })

  test('should return 404 when getById returns no data', async () => {
    getById.mockResolvedValue([])

    const mockRequest = {
      params: {
        claimId: 1
      }
    }
    const mockH = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn()
    }

    await scheduleRoutes[0].options.handler(mockRequest, mockH)

    expect(getById).toHaveBeenCalledWith(mockRequest.params.claimId)
    expect(mockH.response).toHaveBeenCalledWith('Claim not found')
    expect(mockH.code).toHaveBeenCalledWith(404)
  })

  test('should return 200 with schedules when getAll is successful', async () => {
    const mockSchedules = [{ id: 1 }, { id: 2 }]
    getAll.mockResolvedValue(mockSchedules)

    const mockRequest = {}
    const mockH = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn()
    }

    await scheduleRoutes[1].options.handler(mockRequest, mockH)

    expect(getAll).toHaveBeenCalled()
    expect(mockH.response).toHaveBeenCalledWith(mockSchedules)
    expect(mockH.code).toHaveBeenCalledWith(200)
  })
})
