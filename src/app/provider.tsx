"use client";

import { SessionProvider } from "next-auth/react";
import {ReactNode} from "react";

type Props = {
    children?: ReactNode;
};

export const Provider = ({ children }: Props) => {
    return <SessionProvider>{children}</SessionProvider>;
};