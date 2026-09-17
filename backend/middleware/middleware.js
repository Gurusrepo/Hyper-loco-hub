const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")



const AuthenticateUser = async(request,response,next)=>{
    const authHeader = request.headers["authorization"] 
    

    if (authHeader === undefined){
        response.status(400).send("Bad Request")
    }
    else{
        const token = authHeader.split(" ")[1]
        if (token === undefined){
            response.status(400).send("Bad Request")
        }
        else{
            jwt.verify(token,"Secret",(error,payload)=>{
            if(error){
                response.status(401).send("Unauthorized")
            }
            else{
                request.user_id = payload.user_id
                request.role = payload.role
                next()
            }
            })
        }
        
    }
} 



module.exports = AuthenticateUser