const rheaPromise = require('rhea-promise')
const config = require('../config')
const scheduleService = require('./schedule-service')

module.exports = {
  setupReceivers: async function () {
    const scheduleConnection = await setupConnection(config.messageQueue, config.scheduleQueue)
    const paymentConnection = await setupConnection(config.messageQueue, config.paymentQueue)

    console.log('opening connections')
    try {
      await scheduleConnection.open()
      await paymentConnection.open()
    } catch (err) {
      console.log(`unable to connect to message queue - ${err}`)
    }

    try {
      await setupReceiver(scheduleConnection, 'payment-service-schedule', config.scheduleQueue.address)
      await setupReceiver(paymentConnection, 'payment-service-payment', config.valueQueue.address)
    } catch (err) {
      console.log(`unable to setup receiver - ${err}`)
    }

    process.on('SIGTERM', async function () {
      console.log('closing connection')
      try {
        scheduleConnection.close()
        paymentConnection.close()
      } catch (err) {
        console.log(`unable to close connection - ${err}`)
      }
      process.exit(0)
    })
  }
}

async function setupConnection (hostConfig, queueConfig) {
  const connectionOptions = configureMQ(hostConfig, queueConfig)
  const connection = new rheaPromise.Connection(connectionOptions)
  return connection
}

function configureMQ (hostConfig, queueConfig) {
  return {
    host: hostConfig.host,
    port: hostConfig.port,
    transport: hostConfig.transport,
    reconnect_limit: hostConfig.reconnectLimit,
    username: queueConfig.user,
    password: queueConfig.password
  }
}

async function setupReceiver (connection, name, address) {
  const receiverOptions = {
    name: name,
    source: {
      address
    },
    onSessionError: (context) => {
      const sessionError = context.session && context.session.error
      if (sessionError) {
        console.log(`session error for ${name} receiver - ${sessionError}`)
      }
    }
  }
  const receiver = await connection.createReceiver(receiverOptions)
  receiver.on(rheaPromise.ReceiverEvents.message, (context) => {
    console.log(`message received - ${name} - ${context.message.body}`)
    // TODO handle if message is from payment queue
    scheduleService.create(JSON.parse(context.message.body))
  })
  receiver.on(rheaPromise.ReceiverEvents.receiverError, (context) => {
    const receiverError = context.receiver && context.receiver.error
    if (receiverError) {
      console.log(`receipt error for ${name} receiver - ${receiverError}`)
    }
  })
}
