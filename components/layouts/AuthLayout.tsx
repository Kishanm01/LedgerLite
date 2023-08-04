import React, { createContext, useEffect, useState } from "react";
import NavBar from "../NavBar";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

export const UserContext = createContext({role: "regular", full_name: "", avatar_url: null, id: null});


export default function AuthLayout({children}: any){
    const supabase = useSupabaseClient();
    const user = useUser();

    const [userInfo, setUserInfo] = useState({role: "regular", full_name: "", avatar_url: null, id: null});


    const getRole = async () => {
        const {data, error} = await supabase.from(`profiles`).select("role, full_name, avatar_url, id").eq("id", user?.id ?? "");
        if(data){
            setUserInfo({...data[0]});
        }
    }
    useEffect(() => {
        getRole();
    }, []);
    return (
        <UserContext.Provider value={userInfo}>
        <NavBar />
        <main>
            {children}
        </main>
        </UserContext.Provider>
    )
}