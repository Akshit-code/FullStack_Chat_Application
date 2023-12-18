import sequelize from "../utils/database";
import User from "../models/user";
import { Request, Response, NextFunction } from "express";
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

interface RegisterRequest extends Request {
    body: {
        firstName: string,
        lastName: string,
        email: string,
        phoneNo: number,
        password: string,
    };
}

interface LoginRequest extends Request {
    body: {
        phoneNo: number;
        password: string;
    };
}

export const register = async (req:RegisterRequest, res:Response, _next:NextFunction) => {
    let transaction = await sequelize.transaction();

    try {
        const salt:string = await bcrypt.genSalt(10);
        const hashPassword:string = await bcrypt.hash(req.body.password, salt);

        req.body.password = hashPassword;
        const isExistingUser = await User.findOne({where: {phoneNo: req.body.phoneNo}, transaction});

        if(!isExistingUser) {
            const user  = await User.create(req.body, {transaction});
            await transaction.commit();
            console.log(`New User ${req.body.firstName} ${req.body.lastName} Added`);
            console.log("UserDetails => ", user);
            return res.status(201).json(user);
        } else {
            await transaction.rollback();
            console.log("User Already exits");
            return res.status(409).json({ error: 'User already exists' });
        }

    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const login = async (req:LoginRequest, res:Response, _next:NextFunction) => {
    let transaction = await sequelize.transaction();
    try {
        const secretKey:string = process.env.SECRET_KEY || "";
        const isExistingUser = await User.findOne({where: {$phoneNo$:req.body.phoneNo}, transaction});
        if(isExistingUser) {
            const isValidPassword:boolean = await bcrypt.compare(req.body.password, isExistingUser.password);
            if(!isValidPassword) {
                console.log("Incorrect Password");
                return res.status(401).json({message: 'Incorrect Password'});
            } else {
                const token = jsonwebtoken.sign({phoneNo: req.body.phoneNo}, secretKey);
                const responseData =  {
                    firstName: isExistingUser.firstName,
                    lastName: isExistingUser.lastName,
                    email: isExistingUser.email,
                    phoneNo: isExistingUser.phoneNo,
                    token: token
                }
                await transaction.commit();
                console.log(`User ${responseData.firstName} ${responseData.lastName} have Logged IN `);
                return res.status(200).json(responseData);
            }
        } else {
            console.log("No user Found");
            await transaction.rollback();
            return res.status(404).json({message: "User not Found"});
        }
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal server Error"});
    }
}