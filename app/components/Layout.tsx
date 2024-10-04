'use client'
import React, { ReactNode} from 'react'
import { SessionProvider } from "next-auth/react"

type Props = {
    children: ReactNode
}

const Layout = ({ children }: Props) => {

    return (
        <>
            {
                    <div className="mx-auto p-8 shadow-xl min-h-screen flex flex-col lg:max-w-[900px] lg:px-16">
                       
                        <SessionProvider>
                            <div className="flex-auto">{children}</div>
                        </SessionProvider>
                    </div>
            }
        </>
    )
}

export default Layout