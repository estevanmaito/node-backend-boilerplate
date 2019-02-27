const mongoose = require('mongoose')
const User = require('./User')

// mongoose.Promise = global.Promise

const startDB = ({ url, db }) => mongoose.connect(`mongodb://${url}/${db}`, { useNewUrlParser: true })

const models = {
  User
}

module.exports = { startDB, models }