import {DataTypes, Model, InferAttributes, InferCreationAttributes, 
    CreationOptional,
    ForeignKey} from "sequelize";
import sequelize from "../utils/database";
import Groups from "./groups";

class GroupMembers extends Model<InferAttributes<GroupMembers>, InferCreationAttributes<GroupMembers>> {
    declare id: CreationOptional<string>;
    declare contactId: string;
    declare GroupId: ForeignKey<Groups['id']>;
    declare groupName: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

GroupMembers.init({
    id: {
        type: DataTypes.UUID,
        allowNull:false,
        primaryKey:true,
        defaultValue:DataTypes.UUIDV4
    },
    contactId: {
        type: DataTypes.STRING,
        allowNull:false
    },
    groupName: {
        type:DataTypes.STRING,
        allowNull:false
    },
    createdAt:{
        type:DataTypes.DATE
    },
    updatedAt:{
        type: DataTypes.DATE
    },
}, {
    sequelize,
    tableName:'GroupMembers',
    modelName: "GroupMembers",
});


export default GroupMembers;