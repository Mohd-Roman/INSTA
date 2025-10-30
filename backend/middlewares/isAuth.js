import jwt from 'jsonwebtoken'

const isAuthenticated = async (req,res) =>{
    try {
        const token = req.cookie.token;
        if(!token){
            return res.status(401).json({
                message:"User not the Authenticated Please login first",
                success:false
            })
        }
        const decode = await jwt.verify(token,process.env.SECRET_KEY)
        if(!decode){
            return res.status(401).json({
                message:"user invalid",
                success:false
            })
        }
        req.id = decode.userid;
        next();
    } catch (error) {
        console.log(`something erorr in authentication in the is authenticated `,error)
    }
}
export default isAuthenticated