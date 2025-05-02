"use server"
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const register = async (values: {
    email: string | null;
    password: string | null;
    name: string | null
}) => {
    const { email, password, name } = values;
    try {
        await connectDB();
        const userFound = await User.findOne({ email });
        if(userFound){
            return {
                error: 'Email already exists!'
            }
        }
        const hashedPassword = await bcrypt.hash(password || '', 10);
        const user = new User({
            name,
            email,
            admin : false,
            password: hashedPassword,
        });
        await user.save();
    }catch(e){
        console.log(e);
    }
}