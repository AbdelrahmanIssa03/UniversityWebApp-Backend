'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Course.belongsToMany(models.User,{
        through : 'StudentCoursesJunc'
      })
    }
  }
  Course.init({
    name: {
      type : DataTypes.STRING,
      allowNull : false,
    },
    id: {
      type : DataTypes.INTEGER,
      primaryKey : true,
      autoIncrement : true
    },
    tutor: {
      type : DataTypes.STRING,
      defaultValue : 'N/A'
    },
    classroom : {
      type : DataTypes.STRING,
      defaultValue : 'N/A'
    },
    Time : {
      type : DataTypes.STRING,
      defaultValue : 'N/A'
    },
    capacity : {
      type : DataTypes.INTEGER,
      defaultValue : 20
    },
    enrolledNum : {
      type : DataTypes.INTEGER,
      defaultValue : 0
    }
  }, {
    sequelize,
    modelName: 'Course',
    timestamps : false
  });
  return Course;
};