import sequelize from "../utils/database";
import User from "../models/user";
import Contacts from "../models/contacts";

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

interface CurentUserRequest extends Request {
    body: {
        id: string;
    }
}

interface AddContactRequest extends Request {
    body: {
        firstName: string;
        lastName: string;
        phoneNo: number;
        UserId: string;
    }
}

interface GetAllContacts extends Request {
    body: {
        id: string;
    }
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
                const token = jsonwebtoken.sign({id: isExistingUser.id}, secretKey);
                const responseData =  {
                    id: isExistingUser.id,
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

export const logoutUser = async (req:CurentUserRequest, res:Response, _next:NextFunction) => {
    let transaction = await sequelize.transaction();
    try {
        const isExistingUser = await User.findOne({where: {id: req.body.id}, transaction});
        if(!isExistingUser) {
            await transaction.rollback();
            return res.status(404).json({message: "User Details not found"});
        } else {
            transaction.commit();
            console.log("User Have Log Out");
            return res.status(201).json({message: "User Have Logged Out"});
        }
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal server Error"});
    }
}
export const currentUser = async (req:CurentUserRequest, res:Response, _next:NextFunction) => {
    let transaction = await sequelize.transaction();
    try {
        const isExistingUser = await User.findOne({where :{$id$: req.body.id}});
        if(!isExistingUser) {
            await transaction.rollback();
            return res.status(404).json({message: "User Details not found"});
        } else {
            const responseData =  {
                id: isExistingUser.id,
                firstName: isExistingUser.firstName,
                lastName: isExistingUser.lastName,
                email: isExistingUser.email,
                phoneNo: isExistingUser.phoneNo,
            }
            await transaction.commit();
            return res.status(200).json(responseData);
        }
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const addContact = async (req:AddContactRequest, res:Response, _next:NextFunction)=> {
    let transaction = await sequelize.transaction();
    try {
        const isExistingUser = await User.findOne({where: {$phoneNo$: req.body.phoneNo}})
        if(!isExistingUser) {
            await transaction.rollback();
            return res.status(404).json({message: "User Details not found"});
        } else {
            const contactId = isExistingUser.id;
            const {firstName, lastName, phoneNo, UserId} = req.body;
            
            const result = await Contacts.create( {firstName, lastName, phoneNo, contactId, UserId}, {transaction});
            await transaction.commit();
            return res.status(201).json(result);
        }
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const getAllContacts = async (req:GetAllContacts, res:Response, _next:NextFunction) => {
    let transaction = await sequelize.transaction();
    console.log(req.body);
    try {
        const contacts = await Contacts.findAll({where: {$UserId$: req.body.id} , transaction});
        transaction.commit();
        return res.status(200).json(contacts);
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}