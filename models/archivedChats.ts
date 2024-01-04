import {DataTypes, Model, InferAttributes, 
    InferCreationAttributes, CreationOptional,
 } from "sequelize";
import sequelize from "../utils/database";

class ArchivedChats extends Model<InferAttributes<ArchivedChats>, InferCreationAttributes<ArchivedChats>> {
    declare id: CreationOptional<string>;
    declare message: string;
    declare senderId: string;
    declare receiverId: string;
    declare messageType: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

ArchivedChats.init({
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    senderId: {
        type:DataTypes.STRING,
        allowNull:false
    },
    receiverId: {
        type:DataTypes.STRING,
        allowNull: false
    },
    messageType: {
        type:DataTypes.ENUM('private', 'group'),
        allowNull: false
    },
    createdAt:{
        type:DataTypes.DATE,
        allowNull:false
    },
    updatedAt:{
        type: DataTypes.DATE,
        allowNull:false
    },
}, {
    sequelize,
    tableName:'archivedchats',
    modelName: "ArchivedChats",
});

export default ArchivedChats;