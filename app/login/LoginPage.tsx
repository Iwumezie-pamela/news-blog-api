'use client'
import React, { FormEvent, useEffect, useState } from 'react'

import { signIn, useSession } from 'next-auth/react'
import { LoginRequest } from '../models/ILogin'
import { useRouter } from 'next/navigation'

const LoginPage = () => {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false)
    const [formValues, setFormValues] = useState<LoginRequest>()
    const [formMessage, setFormMessage] = useState<string>()

    const router = useRouter()

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        // Prevent default form submission
        e.preventDefault();

        // Validate user input
        if (!formValues?.email || !formValues.password) {
            setFormMessage('Please fill in all fields');
            return;
        }
        setFormMessage('');

        const email = formValues.email;
        const password = formValues.password;


        // return;

        // Start loader
        setIsLoading(true);

        await signIn('credentials', { redirect: false, email: email, password: password })
            .then((response) => {

                if (response?.error) {
                    setFormMessage('Invalid email or password');
                    // Close loader
                    setIsLoading(false);
                }

                if (response && !response.error && session) {
                    router.push('/');
                }
            })
            .catch((error) => {
                console.log({ error });
            })
    };

    useEffect(() => {
        if (formMessage) {
            // Close after 5 seconds
            setTimeout(() => {
                setFormMessage('');
            }, 5000);
        }
    }, [formMessage])

    useEffect(() => {
        if (status == 'authenticated') {
            router.push('/');
        }
    }, [status, session]);

    return (
        <main className='flex w-full h-full overflow-hidden gap-16'>

            <div className="flex-1 flex flex-col p-4 mt-14 overflow-y-auto">

                <form className='flex flex-col gap-6 w-[70%]' onSubmit={handleLogin}>
                    <div className='w-full'>
                        <h2 className='text-3xl font-bold text-mcNiff-gray-2'>Log in</h2>
                        <p className='text-mcNiff-gray-3 text-base'>Enter your details to access the admin console</p>
                    </div>

                    <div className="w-full">
                        <label htmlFor="email">
                            Email
                        </label>
                        <input type="text" name="email" id="" placeholder='Enter email address'
                            className='text-black !rounded-lg py-2 px-4' onChange={(e) => setFormValues({ ...formValues, email: e.target.value } as LoginRequest)} />
                    </div>

                    <div className="w-full">
                        <label htmlFor="password">
                            Password
                        </label>
                        <input type="text" name="email" id="" placeholder='Enter password'
                            className='text-black !rounded-lg py-2 px-4' onChange={(e) => setFormValues({ ...formValues, password: e.target.value } as LoginRequest)} />
                    </div>

                    {formMessage && <p className='text-mcNiff-red text-sm -mt-5'>{formMessage}</p>}

                    <button
                        type='submit'
                        disabled={isLoading}
                        className={`relative overflow-hidden text-sm ${isLoading ? "disabled" : ""}`}>
                        Continue
                    </button>
                </form>
            </div>
        </main>
    )
}

export default LoginPage