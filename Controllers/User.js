const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../Errors/bad-request");
const User = require("../Models/User");


const Login = async (req,res) => {
    const {email , password} = req.body;
    if(!email || !password){
        throw new BadRequestError("The Form Should Provide an Email and Password")
    }
    const user = await User.login(email,password)
    const token = user.generateJWT()
    res.setHeader("jwt",`Bearer ${token}`);
    res.status(StatusCodes.OK).json({
        token : token,
        status : "success",
        message: 'Authentication successful!',
        user : {
            name : `${user.first_name}`,
            lastname : `${user.last_name}`,
            email : user.email,
        },
    })
}



const Register = async (req,res) => {
    const user = await User.create(req.body);
    const token = user.generateJWT()
    res.status(StatusCodes.CREATED).json({
        token : token,
        status : "success",
        message: 'Authentication successful!',
        user : {
            name : `Hello, ${user.first_name}`,
            email : user.email
        },
    })
}

const Logout = async (req,res) => {
    const authHeader  = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')){
        throw new Error("Authentication Invalid")
    }

    const token = authHeader.split(' ')[1];

    res.status(200).json({ message: 'Successfully logged out' });
}


module.exports = {
    Login,
    Register,
    Logout
}
