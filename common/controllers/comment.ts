const { Comment } = require('../models')
const { Op } = require('sequelize/lib/sequelize')

async function createOne(params: { userId: number; dynamicId: number; content: string; }) {
	try {
		await Comment.create(params)
	} catch (err) {
		throw err
	}
}

async function getAll(params: { userId: number; dynamicId: number; }) {
	return Comment.findAll({
		attributes: ['dynamicId', 'content', 'createdAt'],
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
	createOne,
	getAll
}

export { }
