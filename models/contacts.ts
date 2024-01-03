import {DataTypes, Model, InferAttributes, 
    InferCreationAttributes, CreationOptional, ForeignKey,
 } from "sequelize";
import sequelize from "../utils/database";
import User from "./user";

class Contacts extends Model<InferAttributes<Contacts>, InferCreationAttributes<Contacts>> {
    declare id: CreationOptional<string>;
    declare firstName: string;
    declare lastName: string;
    declare phoneNo: number;
    declare contactId: ForeignKey<User['id']>;
    declare UserId: ForeignKey<User['id']>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Contacts.init({
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt:{
        type:DataTypes.DATE
    },
    updatedAt:{
        type: DataTypes.DATE
    },
}, {
    sequelize,
    tableName:'contacts',
    modelName: "Contacts",
});

export default Contacts;