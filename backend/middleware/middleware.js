const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")



const AuthenticateUser = async(request,response,next)=>{
    const authHeader = request.headers["authorization"] 
    

    if (!authHeader){
        response.status(400).send("Bad Request")
    }
    else{
        const token = authHeader.split(" ")[1]
        if (!token){
            return response.status(400).send("Bad Request")
        }
        else{
            const secret = process.env.JWT_SECRET;

            if (!secret) {
                 return response.status(500).send("Server configuration error");
            }

            jwt.verify(token,secret,(error,payload)=>{

            if(error){
                return response.status(401).send("Unauthorized")
            }
            else{
                request.user_id = payload.user_id
                next()
            }

            })
        }
        
    }
} 



module.exports = AuthenticateUser