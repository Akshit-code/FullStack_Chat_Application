import sequelize from "../utils/database";
import User from "../models/user";
import Contacts from "../models/contacts";
import Groups from "../models/groups";
import GroupMembers from "../models/groupMembers";

import { Request, Response, NextFunction } from "express";
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
import Invites from "../models/invites";

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

interface adminOperationsReqest extends Request {
    body: {
        groupName: string,
        selectedMembers: [],
        opsType: string,
        groupId: string,
        UserId: string
    }
}

interface ResponseInvites extends Request {
    body: {
        invite: {
            id:string;
            inviteType:string;
            otherDetails: string;
            senderId:string;
            response: boolean;
        },
        UserId: string
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
        const isExistingUser = await User.findOne({where: {$phoneNo$: req.body.phoneNo}, transaction})
        if(!isExistingUser) {
            await transaction.rollback();
            return res.status(404).json({message: "User Details not found"});
        } else {
            const sender = await User.findOne( {where: {$id$: req.body.UserId}, transaction} );
            if(sender) {
                await Invites.create( {
                    senderId: sender.id ,
                    receiverId: isExistingUser.id,
                    inviteType: 'private',
                    otherDetails: sender.firstName + sender.lastName
                }, {transaction} );
            };
            await transaction.commit();
            return res.status(201).json({message: "Invite has been send "});
        }
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const getAllContacts = async (req:GetAllContactsRequest, res:Response, _next:NextFunction) => {
    let transaction = await sequelize.transaction();
    try {
        const contacts = await Contacts.findAll({where: {$UserId$: req.body.UserId} , transaction});
        transaction.commit();
        console.log("Fetched all contacts successfully")
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
        const groupMembers = req.body.groupMembers;
        const groupMembersPromises = groupMembers.map(async (memberId: string) => {
            await GroupMembers.create({
                contactId: memberId,
                GroupId: group.id,
                groupName: req.body.groupName
            }, { transaction });
        });

        await Promise.all(groupMembersPromises);
        await transaction.commit();
        console.log(`Added group: ${req.body.groupName}`);
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
        await transaction.commit();
        console.log("Fetched all Groups successfully")
        return res.status(200).json(responseData);
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const getAllGroupMembers =  async ( req:Request, res:Response, _next: NextFunction )=> {
    let transaction = await sequelize.transaction();
    try {
        const groupId = req.params.groupId;
        const isAdmin = await Groups.findOne( {where: {$id$ : groupId}, transaction} );
       
        if(isAdmin && req.body.UserId === isAdmin.UserId ){

            const allGroupMembers = await GroupMembers.findAll( {where: {$GroupId$: groupId}, transaction} );
            const responseData = [];
            for( const member of allGroupMembers) {
                const contact = await Contacts.findOne( {where: {$UserId$: req.body.UserId, $contactId$: member.contactId}, transaction} );
                if(contact) {
                    responseData.push(contact);
                };
            };
            await transaction.commit();
            return res.status(200).json(responseData);
        } else {
            await transaction.rollback();
            return res.status(403).json({message : "Unauthorized Access: User is not an Admin"});
        }
        
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const adminOperations = async (req:adminOperationsReqest, res:Response, _next: NextFunction) => {
    let transaction = await sequelize.transaction();

    try {
        const isAdmin = await Groups.findOne( {where: {$id$ : req.body.groupId}, transaction} );
        if(isAdmin && req.body.UserId === isAdmin.UserId) {
            if(req.body.opsType === "editGroupName") {
                await isAdmin.update( {groupName: req.body.groupName}, {transaction});
                await transaction.commit();
                return res.status(201).json(req.body);
            } else if( req.body.opsType === "addMembers" ) {
                await Promise.all(req.body.selectedMembers.map(async (member) => {
                    await Invites.create({
                        senderId: req.body.groupId,
                        receiverId: member,
                        inviteType: "group",
                        otherDetails: isAdmin.groupName
                    }, { transaction });
                }));
                await transaction.commit();
                return res.status(201).json(req.body);
            } else if( req.body.opsType === "removeMembers" ) {
                req.body.selectedMembers.forEach( (member) => {
                    GroupMembers.destroy( {where: {$contactId$: member, $GroupId$: req.body.groupId}} );
                } );
                await transaction.commit();
                return res.status(201).json(req.body);
            }
        } else {
            await transaction.rollback();
            return res.status(403).json( {message: "Unauthorized Access: User is not an Admin"} );
        }

        console.log(req.body);
        await transaction.commit();
        return res.status(201).json(req.body);
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const getAllInvites = async (req:Request, res:Response, _next:NextFunction) => {
    let transaction = await sequelize.transaction();
    try {
        const allInvites =  await Invites.findAll({where: {$receiverId$: req.body.UserId}});
       
        await transaction.commit();
        return res.status(200).json(allInvites);
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const responseInvites = async (req: ResponseInvites, res: Response, _next: NextFunction) => {
    let transaction = await sequelize.transaction();
    try {
        if (req.body.invite.response === false) {
            await Invites.destroy({ where: { id: req.body.invite.id }, transaction });
            await transaction.commit();
            return res.status(201).json({ message: "Invite has been declined" });
        } else {
            if (req.body.invite.inviteType === 'group') {
                await GroupMembers.create({
                    contactId: req.body.UserId,
                    groupName: req.body.invite.otherDetails,
                    GroupId: req.body.invite.senderId
                }, { transaction });
                await Invites.destroy({ where: { id: req.body.invite.id }, transaction });
                await transaction.commit();
                return res.status(201).json({ message: "Group membership added" });
            } else if (req.body.invite.inviteType === 'private') {
                const currentUser = await User.findOne({ where: { id: req.body.UserId }, transaction });
                const senderUser = await User.findOne({ where: { id: req.body.invite.senderId }, transaction });

                if (currentUser && senderUser) {
                    await Contacts.create({
                        firstName: senderUser.firstName,
                        lastName: senderUser.lastName,
                        phoneNo: senderUser.phoneNo,
                        contactId: senderUser.id,
                        UserId: currentUser.id
                    }, { transaction });

                    await Contacts.create({
                        firstName: currentUser.firstName,
                        lastName: currentUser.lastName,
                        phoneNo: currentUser.phoneNo,
                        contactId: currentUser.id,
                        UserId: senderUser.id
                    }, { transaction });
                }

                await Invites.destroy({ where: { id: req.body.invite.id }, transaction });
                await transaction.commit();
                return res.status(201).json({ message: "Contacts have been added" });
            }
            await transaction.rollback();
            return res.status(403).json({ message: "Unauthorized Access" });
        }
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
