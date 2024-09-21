import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {

    const authHeader = req?.headers?.authorization || req?.headers?.Authorization;

    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const acccessToken = authHeader.split(' ')[1];

    // if the acccessToken is present 
    jwt.verify(acccessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log({tokenError: err})
            res.status(401).json({ msg: "Invalid Access token"});

        } else {
            req.user = user;
            next();
        }
    })

};

export { authMiddleware };