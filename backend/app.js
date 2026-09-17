const express  = require("express"); 
const app = express()
app.use(express.json());
const initializedb = require("./database/database")
const userroutes = require("./routes/userroutes")

app.use("/users",userroutes)

const startServer = async() => {
    await initializedb()
    app.listen(3000,
        () => {
            console.log("Server is running at http://localhost:3000/");
        }
    ) 

}

startServer()

module.exports = app ;






