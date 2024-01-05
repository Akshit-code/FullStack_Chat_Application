import { Request, Response, NextFunction } from "express";
import dotenv from 'dotenv';
import { Op } from "sequelize";
import AWS from 'aws-sdk';

import sequelize from "../utils/database";
import { AWS_Instance } from "../config/aws";
import Messages from "../models/messages";

dotenv.config();
AWS.config.update ( {
    accessKeyId: AWS_Instance.aws_access_key_id,
    secretAccessKey: AWS_Instance.aws_secret_access_key,
    region: AWS_Instance.region
} );
const s3 = new AWS.S3();


interface sendMessageRequest extends Request {
    body: {
        message:string;
        UserId:string;
        receiverId: string;
        messageType: string;
    }
}

interface getAllPrivateMessagesRequest extends Request {
    body: {
        UserId: string;
    }
}

interface getAllGroupMessageRequest extends Request {
    body: {
        UserId: string;
        allGroupsId: [];
    }
}


export const sendMessage = async (req: sendMessageRequest, res:Response, _next: NextFunction) => {
    let transaction = await sequelize.transaction();
    try {
        const data = await Messages.create( {
            message: req.body.message,
            senderId: req.body.UserId,
            receiverId: req.body.receiverId,
            messageType: req.body.messageType 
        }, {transaction});
        transaction.commit();

        return res.status(201).json(data);
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export  const getAllPrivateMessages = async (req:getAllPrivateMessagesRequest, res:Response, _next:NextFunction) => {
    let transaction = await sequelize.transaction();
    try {
        const allMessages = await Messages.findAll( {
            where: {
                [Op.or] : [
                    {$senderId$: req.body.UserId, messageType: 'private'},
                    {$receiverId$: req.body.UserId, messageType: 'private'}
                ]
            },
            attributes: {exclude: ['id','updatedAt'] },
            order: [['createdAt','ASC' ]],
            // limit:10,
            transaction
        } );
        transaction.commit();
        return res.status(200).json(allMessages);
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const getAllGroupMessages = async (req:getAllGroupMessageRequest, res:Response, _next:NextFunction) => {
    let transaction = await sequelize.transaction();
    try {
        const allMessagesPrmoise =  req.body.allGroupsId.map( async (groupId) => {
            const message = await Messages.findAll( {
                where: { $receiverId$: groupId, $messageType$: 'group' },
                order: [['createdAt','ASC' ]],
                // limit:10,
                transaction
            } );
            return message;
        } ); 

        const allMessagesArrays = await Promise.all(allMessagesPrmoise);
        const allMessages = allMessagesArrays.flatMap(messages => messages);
        transaction.commit();
        return res.status(200).json(allMessages);
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const sendMediaMessage = async (req:Request, res:Response,  _next:NextFunction) => {
    let transaction = await sequelize.transaction();
    try {
        if (!req.file || Object.keys(req.file).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        const params = {
            Bucket: AWS_Instance.bucket_name,
            Key: `${req.file.originalname}`,
            ACL: 'public-read',
            Body: req.file.buffer
        }
        const data = await s3.upload(params).promise();
        const message = await Messages.create( {
            message: data.Location,
            senderId: req.body.UserId,
            receiverId: req.body.receiverId,
            messageType: req.body.messageType
        } )
        transaction.commit();
       
        return res.status(200).json(message);
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return res.status(500).json({message: "Internal Server Error"});
    }
}