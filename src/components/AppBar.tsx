"use client"
import { signIn, signOut, useSession } from 'next-auth/react'
import React from 'react'

const AppBar = () => {
    const session = useSession()
    return (
        <div className="flex justify-between px-20 pt-4">
            <div className="text-lg font-bold flex flex-col justify-center text-white">
                Muzic
            </div>
            <div>
                {session.data?.user ?
                    <button className="bg-purple-600 text-white hover:bg-purple-700 p-1 rounded-md" onClick={() => signOut()}>SignOut</button>
                    : <button className="bg-purple-600 text-white hover:bg-purple-700 p-1 rounded-md" onClick={() => signIn()}>SignIn</button>
                }
            </div>
        </div>
    )
}

export default AppBar