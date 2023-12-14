const processErrorResponse = require('../../../app/plugins/process-error-response')
const plugin = require('../../../app/plugins/error-pages')

jest.mock('../../../app/plugins/process-error-response', () => jest.fn())

describe('error-pages plugin', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should call processErrorResponse when request.response.isBoom is true', () => {
    const mockServer = {
      ext: jest.fn()
    }
    const mockRequest = {
      response: {
        isBoom: true
      }
    }
    const mockH = {
      continue: Symbol('continue')
    }

    plugin.plugin.register(mockServer)
    const onPreResponse = mockServer.ext.mock.calls[0][1]
    const result = onPreResponse(mockRequest, mockH)

    expect(processErrorResponse).toHaveBeenCalledWith(mockRequest)
    expect(result).toBe(processErrorResponse(mockRequest))
  })

  test('should continue when request.response.isBoom is false', () => {
    const mockServer = {
      ext: jest.fn()
    }
    const mockRequest = {
      response: {
        isBoom: false
      }
    }
    const mockH = {
      continue: Symbol('continue')
    }

    plugin.plugin.register(mockServer)
    const onPreResponse = mockServer.ext.mock.calls[0][1]
    const result = onPreResponse(mockRequest, mockH)

    expect(processErrorResponse).not.toHaveBeenCalled()
    expect(result).toBe(mockH.continue)
  })
})
