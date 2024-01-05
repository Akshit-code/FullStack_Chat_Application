import {DataTypes, Model, InferAttributes, 
    InferCreationAttributes, CreationOptional, ForeignKey,
 } from "sequelize";
import sequelize from "../utils/database";
import User from "./user";
import GroupMembers from "./groupMembers";

class Groups extends Model<InferAttributes<Groups>, InferCreationAttributes<Groups>> {
    declare id: CreationOptional<string>;
    declare groupName: string;
    declare groupId: CreationOptional<string>;
    declare UserId: ForeignKey<User['id']>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Groups.init({
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    groupId: {
        type:DataTypes.STRING,
        allowNull:true
    },
    groupName: {
        type: DataTypes.STRING,
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
    tableName:'groups',
    modelName: "Groups",
});

Groups.hasMany(GroupMembers);
GroupMembers.belongsTo(Groups);

export default Groups;