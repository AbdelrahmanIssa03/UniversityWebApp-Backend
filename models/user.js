'use strict';
import bcrypt from 'bcrypt'
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsToMany(models.Course, {
        through : 'StudentCoursesJunc'
      })
    }
  }
  User.init({
    id : {
      primaryKey:true,
      autoIncrement:true,
      type : DataTypes.INTEGER
    },
    password : {
      type : DataTypes.STRING,
      allowNull : false,
      validate : {
        is : {
          args : /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/,
          msg : 'Your password needs to have 6-20 characters including at least one uppercase / one lowercase / one numeric digit'}
      }
    },
    name: {
      type : DataTypes.STRING,
      allowNull:false,
      unique : true
    },
    dateOfBirth : {
      type : DataTypes.DATE,
      allowNull: false
    },
    passwordChangedAt: {
      type : DataTypes.DATE
    },
    role : {
      type : DataTypes.ENUM('Student', 'Admin'),
      defaultValue : 'Student',
      allowNull : false
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks : {
      beforeCreate: (async (user) => {
        const hashedPassword = await bcrypt.hash(user.getDataValue('password'),12);
        user.setDataValue('password', hashedPassword)
      }),
      beforeUpdate: (async (user) => {
        console.log('update hook got triggered')
        const hashedPassword = await bcrypt.hash(user.getDataValue('password'),12);
        user.setDataValue('password', hashedPassword)
      })
    }
  });
  return User;
};