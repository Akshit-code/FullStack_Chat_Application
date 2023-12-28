import {DataTypes, Model, InferAttributes, 
    InferCreationAttributes, CreationOptional,
 } from "sequelize";
import sequelize from "../utils/database";

class Messages extends Model<InferAttributes<Messages>, InferCreationAttributes<Messages>> {
    declare id: CreationOptional<string>;
    declare message: string;
    declare senderId: string;
    declare receiverId: string;
    declare messageType: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Messages.init({
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
        type:DataTypes.DATE
    },
    updatedAt:{
        type: DataTypes.DATE
    },
}, {
    sequelize,
    tableName:'Messages',
    modelName: "Messages",
});

export default Messages;