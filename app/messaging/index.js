const config = require('../config')
const processScheduleMessage = require('./process-schedule-message')
const processPaymentMessage = require('./process-payment-message')
const { MessageReceiver } = require('adp-messaging')
let scheduleReceiver
let paymentReceiver

async function start () {
  const scheduleAction = message => processScheduleMessage(message, scheduleReceiver)
  scheduleReceiver = new MessageReceiver(config.scheduleSubscription, scheduleAction)
  await scheduleReceiver.subscribe()

  const paymentAction = message => processPaymentMessage(message, paymentReceiver)
  paymentReceiver = new MessageReceiver(config.paymentSubscription, paymentAction)
  await paymentReceiver.subscribe()
  console.info('Ready to receive messages')
}

async function stop () {
  await scheduleReceiver.closeConnection()
  await paymentReceiver.closeConnection()
}

module.exports = { start, stop }
