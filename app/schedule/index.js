const { models, sequelize } = require('../services/database-service')
const { getPaymentDates } = require('./scheduler')

async function createSchedule (claim, scheduleStartDate) {
  await sequelize.transaction(async (transaction) => {
    const existingSchedule = await models.schedule.findOne({ where: { claimId: claim.claimId } }, { transaction })
    if (!existingSchedule) {
      const paymentDates = getPaymentDates(scheduleStartDate)
      for (const paymentDate of paymentDates) {
        await models.schedule.create({ claimId: claim.claimId, paymentDate }, { transaction })
      }
      console.info(`Created payment schedule: ${claim.claimId}`)
    }
  })
}

async function getById (claimId) {
  const schedule = await models.schedule.findAll({
    where: { claimId },
    include: [models.payment],
    order: [['paymentDate', 'DESC']]
  })
  return schedule.map(scheduleMapper)
}

async function getAll () {
  const schedule = await models.schedule.findAll({
    include: [models.payment],
    order: [['paymentDate', 'DESC']]
  })
  return schedule.map(scheduleMapper)
}

function scheduleMapper (schedule) {
  const payment = {
    claimId: schedule.claimId,
    paymentDate: schedule.paymentDate
  }
  if (schedule.payment) {
    payment.paymentAmount = Number.parseFloat(schedule.payment.value).toFixed(2)
  }
  return payment
}

module.exports = {
  createSchedule,
  getById,
  getAll
}
