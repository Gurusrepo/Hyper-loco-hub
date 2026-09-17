const {open} = require("sqlite")
const sqlite3 = require("sqlite3") 
const path = require("path")

const dbpath = path.join(__dirname,"database.db")
let db 

const initializedb = async() =>{

    try{
        db = await open({
    filename : dbpath,
    driver : sqlite3.Database
})

//create table 

const createTable = `CREATE TABLE IF NOT EXISTS users(
    user_id INTEGER PRIMARY KEY AUTOINCREMENT ,
    name VARCHAR ,
    user_name VARCHAR UNIQUE,
    password VARCHAR ,
    email VARCHAR UNIQUE ,
    role VARCHAR ,
    phone VARCHAR ) `


await db.run(createTable)

return db

}catch(err){
           console.log(err.message)
           process.exit(1)
    }
}
    
    
module.exports = initializedb ;