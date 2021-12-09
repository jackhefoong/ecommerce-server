const jwt = require ("jsonwebtoken")
require("dotenv").config()

module.exports = (req, res, next) => {
    const token = req.header("x-auth-token")

    if(!token) {
        return res.status(401).json({msg : "Unauthorized"})
    }

    //verify token
    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        req.user = decoded
        next() //do the next to your right
    } catch(e) {
        return res.status(401).json({e})
    }
}