import sequelize from "../utils/database";
import User from "../models/user";
import Contacts from "../models/contacts";
import Groups from "../models/groups";
import GroupMembers from "../models/groupMembers";

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

interface GetAllContactsRequest extends Request {
    body: {
        UserId: string;
    }
}

interface GetAllGroupsRequest extends Request {
    body: {
        UserId: string;
    }
}

interface addGroupRequest extends Request {
    body: {
        groupName:string;
        groupMembers: [];
        UserId: string;
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
            const userData = await User.findOne({where : {$id$: req.body.UserId}, transaction});

            if(userData) {
                const user = {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phoneNo:userData.phoneNo,
                    contactId: userData.id,
                    UserId: isExistingUser.id
                }
                await Contacts.create( user, {transaction});
            }
            await transaction.commit();
            return res.status(201).json(result);
        }
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const getAllContacts = async (req:GetAllContactsRequest, res:Response, _next:NextFunction) => {
    let transaction = await sequelize.transaction();
    console.log(req.body);
    try {
        const contacts = await Contacts.findAll({where: {$UserId$: req.body.UserId} , transaction});
        transaction.commit();
        return res.status(200).json(contacts);
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const addGroup = async  (req:addGroupRequest, res:Response, _next:NextFunction) => {
    let transaction = await sequelize.transaction();
    try {
        const group = await Groups.create( { 
            groupName: req.body.groupName,
            UserId: req.body.UserId
        }, {transaction});
        console.log("GroupId =>", group.id);
        const groupMembers = req.body.groupMembers;
        const groupMembersPromises = groupMembers.map(async (memberId: string) => {
            await GroupMembers.create({
                contactId: memberId,
                GroupId: group.id,
                groupName: req.body.groupName
            }, { transaction });
        });

        await Promise.all(groupMembersPromises);
        transaction.commit();
       
        return res.status(201).json(group);
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const getAllGroups = async  (req:GetAllGroupsRequest, res: Response, _next: NextFunction) => {
    let transaction = await sequelize.transaction();
    try {
        const adminGroupsPromise = Groups.findAll({where: {$UserId$: req.body.UserId}, transaction})
        const membersGroupsPromise =  GroupMembers.findAll( {where: {$contactId$: req.body.UserId}, transaction} );

        const [adminGroups, membersGroups] = await Promise.all([adminGroupsPromise, membersGroupsPromise]);
        const adminGroupsModified = adminGroups.map(group => ({ ...group.toJSON(), isAdmin: true, GroupId: group.id }));
        const membersGroupsModified = membersGroups.map(group => ({ ...group.toJSON(), isAdmin: false }));

        const responseData = [...adminGroupsModified, ...membersGroupsModified];
        transaction.commit();
        return res.status(200).json(responseData);
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}

