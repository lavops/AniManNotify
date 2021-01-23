const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./db/database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
    if (error) {
        return console.log(error.message)
    }

    console.log('Connected to the SQlite database')
})

module.exports = db