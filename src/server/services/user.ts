"use server"
import User from "@/server/models/User";
import bcrypt from "bcryptjs";
import {createFailResponse, createSuccessResponse} from "@/lib/db/utils";
import {dbOperation} from "@/lib/db/db-operation";

export const register = async (values: {
    email: string | null;
    password: string | null;
    name: string | null
}) => {
    const { email, password, name } = values;
    return dbOperation(true, async () => {
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