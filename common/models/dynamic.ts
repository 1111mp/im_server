const Sequelize = require('sequelize/lib/sequelize')
const moment = require('moment')
const sequelize = require('../../sequelize')
const Comment = require('./comment')
const Star = require('./star')

/** 动态 */
const Dynamic = sequelize.define('dynamic',
  {
    id: {
      type: Sequelize.INTEGER(11),
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      field: 'user_id',
    },
    content: {
      type: Sequelize.STRING(500),
      allowNull: false,
      comment: '动态内容'
    },
    star: {
      type: Sequelize.INTEGER(11),
      defaultValue: 0,
      comment: '点赞数'
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
        method: 'BTREE',
        fields: ['user_id']
      }
    ]
  }
)

// 一对多

/**
 * Dynamic的实例对象将拥有getComments、setComments、addComment、createComment、removeComment、hasComment方法
 */
Dynamic.hasMany(Comment)

/** 
 * Comment的实例对象将拥有getDynamic、setDynamic、createDynamic方法
 */
Comment.belongsTo(Dynamic)

Dynamic.hasMany(Star)
Star.belongsTo(Dynamic)

module.exports = Dynamic

export { }
