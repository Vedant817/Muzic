import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prismaClient } from "./lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET
    })],
    callbacks: {
        async signIn(params){
            if(!params.user.email){
                return false;
            }
            try {
                await prismaClient.user.create({
                    data: {
                        email: params.user.email,
                        provider: 'Google',
                    }
                })
            } catch (error) {
                
            }
            return true;
        }
    }
})