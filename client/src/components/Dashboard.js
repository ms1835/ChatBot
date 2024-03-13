import React, { useEffect, useRef, useState } from "react";
import Avatar from './../profile.jpg';
import { io } from 'socket.io-client';

const Dashboard = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:details')));
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState({});
    const [message, setMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const messageRef = useRef(null);
    console.log("Users: ",users);
    console.log("Messages: ", messages);
    console.log("Conversations: ",conversations);

    useEffect(() => {
        setSocket(io(process.env.REACT_APP_SERVER_URL));
    },[])

    useEffect(() => {
        socket?.emit('addUser', user?.id);
        socket?.on("getUsers", users => {
            console.log("ActiveUsers: ", users);
        })
        socket?.on("getMessage", data => {
            setMessages(prev => ({
                ...prev,
                messages: [...prev.messages, {user: data.user, message: data.message}]
            }))
        })
    },[socket])

    useEffect(() => {
        messageRef?.current?.scrollIntoView({behaviour: 'smooth'});
    }, [messages?.messages])

    const fetchMessages = async(conversationId, receiver) => {
        try{
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/message/${conversationId}?senderId=${user.id}&&receiverId=${receiver?.receiverId}`, {
                method: "GET",
                headers: {
                    'Content-Type': "Application/json"
                }
            });
            const resData = await res.json();
            setMessages({messages: resData, receiver, conversationId});
            // console.log("Messages: ",messages);
            await fetchConversations();
        } catch(error){
            console.log(error);
        }
    }

    const sendMessage = async(e) => {
        socket?.emit("sendMessage", {
            conversationId: messages?.conversationId,
            senderId: user?.id,
            receiverId: messages?.receiver?.receiverId,
            message
        })
        e.preventDefault();
        console.log("Send message: ",message, messages?.conversationId, user?.id, messages?.receiver?.receiverId)
        try{
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/message`, {
                method: "POST",
                headers: {
                    'Content-Type': "Application/json"
                },
                body: JSON.stringify({
                    conversationId: messages?.conversationId,
                    senderId: user?.id,
                    receiverId: messages?.receiver?.receiverId,
                    message
                })
            });
            const resData = await res.json();
            setMessage('');
        } catch(error){
            console.log(error);
        }
    }

    
    const fetchConversations = async() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user:details'));
        console.log("User: ",loggedInUser);

        const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/conversations/${loggedInUser.id}`, {
            method: "GET",
            headers: {
                'Content-Type': "Application/json"
            }
        });
        const resData = await res.json();
        setConversations(resData);
        console.log("Conversations: ",conversations);
    }

    useEffect(() => {
        fetchConversations();
    },[socket])

    useEffect(() => {
        const fetchUsers = async() => {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/users/${user.id}`, {
                method: "GET",
                headers: {
                    'Content-Type': "Application/json"
                }
            });
            const resData = await res.json();
            setUsers(resData);
        }
        fetchUsers();
    },[]);

    return (
        <div className="flex h-screen w-screen">
            <div className="w-[25%] bg-red-300">
                <div className="flex items-center my-8 mx-14">
                    <img width={75} height={75} className="rounded-full p-[2px] border border-gray-800 w-[65px] h-[65px]" src={Avatar}></img>
                    <div className="ml-8">
                        <h1 className="text-2xl">{user?.name}</h1>
                        <p className="text-lg font-light">{user?.email}</p>
                    </div>
                </div>
                <hr />
                <div className="mx-14 mt-10">
                    <div className="text-lg text-blue-500">Messages</div>
                    {
                        conversations.length > 0 ?
                        conversations.map(({ conversationId, user}) => {
                            return (
                                <div className="flex items-center py-8 border-b border-b-gray-500">
                                    <div className="cursor-pointer flex items-center" onClick={() => fetchMessages(conversationId, user)}>
                                        <img width={60} height={60} className="rounded-full p-[2px] border border-gray-800 w-[55px] h-[55px]" src={Avatar}></img>
                                        <div className="ml-6">
                                            <h1 className="text-lg font-semibold">{user?.name}</h1>
                                            <p className="text-sm font-light text-gray-600">{user?.email}</p>
                                        </div>
                                    </div>

                                </div>
                            )
                        }) : 
                        <div className="text-center text-lg font-semibold mt-24"> No Conversations</div>
                    }

                </div>
            </div>
            <div className="w-[50%] flex flex-col items-center">
                {
                    messages?.receiver?.name &&
                    <div className="w-[75%] h-[80px] my-14 bg-yellow-400 rounded-full flex items-center px-14">
                        <div className="cursor-pointer">
                            <img src={Avatar} width={60} height={60} className="rounded-full w-[45px] h-[45px]" />
                        </div>
                        <div className="ml-6 mr-auto">
                            <h2 className="text-lg">{messages?.receiver?.name}</h2>
                            <p className="text-sm text-gray-600">{messages?.receiver?.email}</p>
                        </div>
                        <div className="cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 3.75v4.5m0-4.5h-4.5m4.5 0-6 6m3 12c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
                            </svg>

                        </div>
                    </div>
                }
                <div className="h-[75%] w-full overflow-scroll shadow-sm">
                    <div className="p-14">
                        {/* <div className="max-w-[40%] bg-teal-400 rounded-b-xl rounded-tr-xl p-4 mb-6">
                            Recieved Messages appears to thr left of the screen
                        </div>
                        <div className="max-w-[40%] bg-green-800 text-white rounded-b-xl ml-auto rounded-tl-xl p-4 mb-6">
                            Messages sent by user appears to the right of the screen
                        </div> */}
                        {
                            messages?.messages?.length > 0 ?
                            messages?.messages?.map(({message, user: {id} = {}}) => {
                                return (
                                    <>
                                    <div className={`max-w-[40%] ${id === user?.id ? "bg-green-800 text-white rounded-b-xl ml-auto rounded-tl-xl" : "bg-teal-400 rounded-b-xl rounded-tr-xl"} p-4 mb-6`}>
                                        {message}
                                    </div>
                                    <div ref={messageRef}></div>
                                    </>
                                )
                            }) : <div className="text-center text-lg font-semibold mt-24"> No messages</div>
                        }
                    </div>
                </div>
                { messages?.receiver?.name &&
                    <div className="p-14 w-full flex items-center bg-cyan-500">
                        <input className="rounded-lg shadow-md w-[75%] py-3 focus:ring-0 outline-none px-4 text-lg" type="text" name="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tpe a message..." required></input>
                        <div className={`ml-4 p-2 cursor-pointer rounded-full ${!message && "pointer-events-none"} `} onClick={sendMessage}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                        </div>
                        <div className="ml-4 p-2 cursor-pointer rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                    </div>
                }
            </div>
            <div className="w-[25%] bg-orange-300 px-8 py-16">
                <div className="text-lg text-blue-500">People</div>
                {
                        users.length > 0 ?
                        users.map(({ userId, user}) => {
                            return (
                                <div className="flex items-center py-8 border-b border-b-gray-500">
                                    <div className="cursor-pointer flex items-center" onClick={() => fetchMessages('new', user)}>
                                        <img width={60} height={80} className="rounded-full p-[2px] border border-gray-800 w-[55px] h-[55px]" src={Avatar}></img>
                                        <div className="ml-6">
                                            <h1 className="text-lg font-semibold">{user?.name}</h1>
                                            <p className="text-sm font-light text-gray-600">{user?.email}</p>
                                        </div>
                                    </div>

                                </div>
                            )
                        }) : 
                        <div className="text-center text-lg font-semibold mt-24"> No Users</div>
                    }
            </div>
        </div>
    )
}

export default Dashboard;