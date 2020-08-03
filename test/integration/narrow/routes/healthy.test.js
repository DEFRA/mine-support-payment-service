describe('Healthy test', () => {
  let server

  jest.mock('sequelize')
  const createServer = require('../../../../server')
  let databaseService

  beforeEach(async () => {
    databaseService = await require('../../../../server/services/database-service')
    server = await createServer()
    await server.initialize()
  })

  test('GET /healthy route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/healthy'
    }

    databaseService.authenticate.mockReturnValue(true)

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /healthy returns 503 and error message if database check throws an error', async () => {
    const options = {
      method: 'GET',
      url: '/healthy'
    }

    const errorMessage = 'database connection timeout'
    databaseService.authenticate.mockImplementation(() => { throw new Error(errorMessage) })

    const response = await server.inject(options)

    expect(response.statusCode).toBe(503)
    expect(response.payload).toBe(`error running healthy check: ${errorMessage}`)
  })

  afterEach(async () => {
    await server.stop()
    jest.clearAllMocks()
  })

  afterAll(async () => {
    jest.resetAllMocks()
  })
})
