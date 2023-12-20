import jwt from 'jsonwebtoken'


export function signToken(payload) {
    const SECRET_KEY = process.env.JWT_SECRET_KEY
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '3h' })
    return token
}

export function verifyToken(token) {
    let decodedPayload;
    try {
        const SECRET_KEY = process.env.JWT_SECRET_KEY
        decodedPayload = jwt.verify(token, SECRET_KEY)
        console.log(arguments)
    } catch (error) {
        console.log('Could not verify token', error)
    }
    return decodedPayload
}

export function verifyUserAction(req, res, next) {
    const SECRET_KEY = process.env.JWT_SECRET_KEY
    try {
        const authHeader = req.headers.authorization
        if (!authHeader)
            throw new Error('Unauthorized action - You need to be logged in to do this')

        const extractedToken = authHeader.split(' ')[1]
        jwt.verify(extractedToken, SECRET_KEY, (error, decoded) => {
            if (error) {
                throw new Error('Forbidden - Invalid token!', error.message)
            }
            req.user = decoded
        })
        next()
    } catch (error) {
        next(error.message)
    }
}


