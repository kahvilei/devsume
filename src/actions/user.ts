"use server"
import User from "@/models/User";
import bcrypt from "bcryptjs";
import {createFailResponse, createSuccessResponse, dbOperation} from "@/lib/db/utils";

export const register = async (values: {
    email: string | null;
    password: string | null;
    name: string | null
}) => {
    const { email, password, name } = values;
    return dbOperation(async () => {
        const userFound = await User.findOne({ email });
        if(userFound){
            return createFailResponse('Email already exists!');
        }
        const hashedPassword = await bcrypt.hash(password || '', 10);
        const user = new User({
            name,
            email,
            admin : false,
            password: hashedPassword,
        });
        await user.save();
        return createSuccessResponse({})
    })
}