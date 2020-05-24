const Sequelize = require('sequelize/lib/sequelize')
const moment = require('moment')
const sequelize = require('../../sequelize')

/** 评论 */
const Comment = sequelize.define('comment',
  {
    id: {
      type: Sequelize.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
      unique: true
    },
    /** 外键 */
    dynamicId: {
      type: Sequelize.INTEGER(11),
      field: 'dynamic_id',
      unique: true,
      comment: '动态的id'
    },
    content: {
      type: Sequelize.STRING(200),
      allowNull: false,
      comment: '评论内容'
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      get() {
        return moment((this as any).getDataValue('createdAt')).format('YYYY-MM-DD HH:mm')
      }
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      get() {
        return moment((this as any).getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm')
      }
    }
  },
  {
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    indexes: [
      {
        name: 'comment_dynamicId',
        method: 'BTREE',
        fields: ['dynamic_id']
      }
    ]
  }
)

module.exports = Comment

export { }
