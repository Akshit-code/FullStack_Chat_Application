import { Request, Response, NextFunction } from 'express';
import jsonwebtoken, {Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

interface DecodeToken extends jsonwebtoken.JwtPayload {
    id: string;
}

const authToken = async (req:Request, res:Response, next:NextFunction) => {
    const secretKey:Secret = process.env.SECRET_KEY as Secret;
    let token:string | undefined = req.headers['authorization'] as string | undefined;
    if(token) {
        token = token.split(' ')[1];
        try {
            const decode:DecodeToken = jsonwebtoken.verify(token, secretKey) as DecodeToken;
            console.log(decode);
            if(decode && decode.id) {
                req.body.id = decode.id;
                req.body.UserId = decode.id;
                next();
            } else {
                res.status(403).json({message: "Invalid Token"});
            }
        } catch (error) {
            res.status(401).json({ message: 'Token expired or invalid' });
        }
    } else {
        res.status(401).json({ message: 'Authorization header not found' });
    }
}

export default authToken;