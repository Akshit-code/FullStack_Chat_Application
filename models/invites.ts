import {DataTypes, Model, InferAttributes, InferCreationAttributes, 
    CreationOptional} from "sequelize";
import sequelize from "../utils/database";


class Invites extends Model<InferAttributes<Invites>, InferCreationAttributes<Invites>> {
    declare id: CreationOptional<string>;
    declare senderId: string;
    declare receiverId: string;
    declare inviteType: string;
    declare otherDetails: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Invites.init({
    id: {
        type: DataTypes.UUID,
        allowNull:false,
        primaryKey:true,
        defaultValue:DataTypes.UUIDV4
    },
    senderId: {
        type:DataTypes.STRING,
        allowNull:false
    },
    receiverId: {
        type:DataTypes.STRING,
        allowNull: false
    },
    inviteType: {
        type:DataTypes.ENUM('private', 'group'),
        allowNull:false
    }, 
    otherDetails: {
        type:DataTypes.STRING,
        allowNull:false
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
    tableName:'invites',
    modelName: "Invites",
});

export default Invites;