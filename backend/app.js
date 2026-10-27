
const express  = require("express"); 
require("dotenv").config();
const app = express()
app.use(express.json());

const initializedb = require("./database/database")
const userroutes = require("./routes/userroutes")
const serviceroutes = require("./routes/serviceroutes")

app.use("/users",userroutes)
app.use("/",serviceroutes)


const startServer = async () => {
    try {

        await initializedb();
        
        app.listen(3000, () => {
            console.log("Server is running at http://localhost:3000/");
        });
    } 
    catch (err) {
        console.error("Starting server error:");
        console.error(err.stack || err);
        process.exit(1);
    }
};

startServer();


module.exports = app ;






