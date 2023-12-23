import {DataTypes, Model, InferAttributes, InferCreationAttributes, 
    CreationOptional, HasManyGetAssociationsMixin} from "sequelize";
import sequelize from "../utils/database";
import Contacts from "./contacts";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<string>;
    declare firstName: string;
    declare lastName: string;
    declare email: string;
    declare phoneNo: number;
    declare password: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare getContacts: HasManyGetAssociationsMixin<Contacts>;
}

User.init({
    id: {
        type: DataTypes.UUID,
        allowNull:false,
        primaryKey:true,
        defaultValue:DataTypes.UUIDV4
    }, 
    firstName: {
        type:DataTypes.STRING,
        allowNull:false
    },
    lastName: {
        type:DataTypes.STRING,
        allowNull:false
    },
    email: {
        type:DataTypes.STRING,
        allowNull:false,
        validate: {
            isEmail:true
        },
        unique:true
    },
    phoneNo: {
        type:DataTypes.INTEGER,
        allowNull:false,
        unique:true
    },
    password: {
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
    tableName:'users',
    modelName: "User",
});


User.hasMany(Contacts);
Contacts.belongsTo(User);
export default User;