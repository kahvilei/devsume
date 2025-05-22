import  mongoose, { Schema, model } from  "mongoose";
import {BaseDataModel} from "@/interfaces/data";

export interface IUser extends BaseDataModel {
    _id: string;
    email: string;
    password: string;
    name: string;
    admin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
        email: {
            type: String,
            unique: true,
            required: [true, "Email is required"],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Email is invalid",
            ],
        },
        password: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: [true, "Name is required"]
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.models?.User || model<IUser>('User', UserSchema);
export default User;