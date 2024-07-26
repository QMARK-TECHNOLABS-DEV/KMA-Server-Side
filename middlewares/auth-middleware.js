import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {

    const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
    // console.log("authHeader", authHeader)
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const acccessToken = authHeader.split(' ')[1];
    // console.log("acccessToken", acccessToken);

    // if the acccessToken is present 
    jwt.verify(acccessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            // The access token is expired/invalid
            res.send(403).json({ msg: "Access token is expired"});

        } else {
            if (user.role !== 'admin') {
                res.sendStatus(401);
            }
            req.user = user;
            next();
        }
    })

};

export { authMiddleware };