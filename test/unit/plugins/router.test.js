const scheduleRoutes = require('../../../app/routes/schedule')
const healthyRoutes = require('../../../app/routes/healthy')
const healthzRoutes = require('../../../app/routes/healthz')
const router = require('../../../app/plugins/router')

jest.mock('../../../app/routes/schedule', () => [{ path: '/schedule' }])
jest.mock('../../../app/routes/healthy', () => [{ path: '/healthy' }])
jest.mock('../../../app/routes/healthz', () => [{ path: '/healthz' }])

describe('router plugin', () => {
  test('should register routes when register is called', () => {
    const mockServer = {
      route: jest.fn()
    }

    router.plugin.register(mockServer)

    expect(mockServer.route).toHaveBeenCalledWith(
      [].concat(scheduleRoutes, healthyRoutes, healthzRoutes)
    )
  })
})
