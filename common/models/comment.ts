'use strict';

const moment = require('moment')

module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
      unique: true
    },
    /** 外键 */
    dynamicId: {
      type: DataTypes.INTEGER(11),
      field: 'dynamic_id',
      unique: true,
      comment: '动态的id'
    },
    userId: {
      type: DataTypes.INTEGER(11),
      field: 'user_id',
      unique: true,
      comment: '用户id'
    },
    content: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '评论内容'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return moment((this as any).getDataValue('createdAt')).format('YYYY-MM-DD HH:mm')
      }
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return moment((this as any).getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm')
      }
    }
  }, {
    
  });

  Comment.associate = function (models) {
    // associations can be defined here
    Comment.belongsTo(models.User, { foreignKey: 'userId', targetKey: 'id' })
    Comment.belongsTo(models.Dynamic, { foreignKey: 'dynamicId', targetKey: 'id' })
  };

  return Comment;
};

export { }
