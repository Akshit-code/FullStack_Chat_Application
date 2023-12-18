import {DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import sequelize from "../utils/database";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<string>;
    declare firstName: string;
    declare lastName: string;
    declare email: string;
    declare password: string
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
        }
    },
    password: {
        type:DataTypes.STRING,
        allowNull:false
    },
}, {
    sequelize,
    tableName:'users',
    modelName: "User",
});

export default User;