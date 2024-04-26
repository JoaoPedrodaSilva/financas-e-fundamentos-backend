const { Pool } = require("pg")
const pool = new Pool({ ssl: true })

module.exports = {
    query: (text, params, callback) => pool.query(text, params, callback)
}


