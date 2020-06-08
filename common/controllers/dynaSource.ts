const { DynaSource } = require('../models')
const { Op } = require('sequelize/lib/sequelize')

async function getDynaSources(params: { userId: number; dynamicId: number; }) {
	return DynaSource.findAll({
		attributes: ['url'],
		where: {
			userId: {
				[Op.eq]: params.userId
			},
			dynamicId: {
				[Op.eq]: params.dynamicId
			}
		}
	})
}

module.exports = {
	getDynaSources
}

export { }
