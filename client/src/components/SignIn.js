import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({email: '', password:''});

    const handleChange = (event) => {
        const {name, value} = event.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        try{
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/login`, {
                method: "POST",
                headers: {
                    'Content-Type': "Application/json"
                },
                body: JSON.stringify(formData)
            });
            const resData = await res.json();
            if(resData.token){
                localStorage.setItem('user:token', resData.token);
                localStorage.setItem('user:details', JSON.stringify(resData.user));
                navigate('/');
            }
        } catch(error){
            console.log(error);
        }
    }

    return (
        <div className="h-screen flex items-center justify-center bg-neutral-200">
            <div className="bg-slate-200 border border-2 border-slate-400 rounded-lg p-24 w-full sm:w-1/2 lg:w-1/3 m-2 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-3xl font-medium">Log in to Chit-Chat</h1>
                    {/* <p className="text-lg">to continue to Chit-Chat</p> */}
                </div>
                <form className="" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2 mb-3">
                        <label className="text-lg font-semibold">Email</label>
                        <input className="rounded-lg py-3 focus:ring-0 outline-none px-4 text-lg" type="email" name="email" value={formData.email} onChange={handleChange} required></input>
                    </div>
                    <div className="flex flex-col gap-2 mb-3">
                        <label className="text-lg font-semibold">Password</label>
                        <input className="rounded-lg py-3 focus:ring-0 outline-none px-4 text-lg" type="password" name="password" value={formData.password} onChange={handleChange} required></input>
                    </div>
                    <div className="flex flex-row justify-center mt-8 mb-2">
                        <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded">Submit</button>
                    </div>
                    <div className="flex justify-center">
                        <p className="text-sm">Don't have an account?</p>
                        <span className="text-sm ml-2 text-blue-800 underline cursor-pointer" onClick={() => navigate('/api/register')}>Sign Up</span>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SignIn;