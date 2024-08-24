import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from 'dotenv';
import Users from "./models/Users.js";
import bcrypt from 'bcrypt';
import mongoose from "mongoose";
import Conversation from "./models/Conversation.js";
import Message from "./models/Messages.js";

dotenv.config();

mongoose.connect(process.env.DB_URL, {
   
})
.then(() => {
    console.log("Connected to Database")
}).catch(error => {
    console.log(error);
})

const port = process.env.PORT;
const secretKeyJWT = process.env.SECRET_KEY;

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors({
    origin: process.env.FRONTEND_URI,
    methods: ["GET", "POST"],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URI
    }
});

app.get("/", (req,res) => {
    res.send("Hello world!");
})

app.post('/api/register', async(req,res) => {
    try {
        const { name, email, password } = req.body;

        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "Please fill the required details"
            })
        }
        const userExist = await Users.findOne({email});
        if(userExist){
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }
        const newUser = new Users({name, email});
        bcrypt.hash(password,10, async(err, hashedPassword) => {
            newUser.set('password', hashedPassword);
            await newUser.save();
        })
        return res.status(200).json({
            success: true,
            message: "User registered successfullly"
        })
    } catch(error) {
        console.log(error);
    }
});

app.post('/api/login', async(req,res,next) => {
    try {
        const { email, password } = req.body;

        if( !email || !password){
            res.status(400).json({
                success: false,
                message: "Please fill the required details"
            })
        }
        else{
            const user = await Users.findOne({email});
            if(!user){
                res.status(400).json({
                    success: false,
                    message: "Incorrect username or password"
                })
            }
            else{
                const validateUser = await bcrypt.compare(password, user.password);
                if(!validateUser){
                    res.status(400).json({
                        success: false,
                        message: "Incorrect username or password"
                    })
                }
                else{
                    const payload = {
                        userId: user._id,
                        email: user.email
                    }
                    jwt.sign(payload, secretKeyJWT, {expiresIn: 84600}, async(err, token) => {
                        await Users.updateOne({_id: user._id}, {
                            $set: {token}
                        })
                        user.save();
                        res.status(200).json({
                            success: true,
                            message: "User logged in successfullly",
                            user: {
                                id: user._id, email: user.email, name: user.name
                            },
                            token
                        })
                    })
                }
            }
        }
        
    } catch(error) {
        console.log(error);
    }
});

app.post('/api/conversation', async(req,res) => {
    try{
        const {senderId, receiverId} = req.body;
        const conversation = new Conversation({members: [senderId, receiverId]});
        await conversation.save();
        res.status(200).json({
            success: true, message: "Conversation created successfully"
        })
    } catch(error){
        console.log(error);
    }
});

app.get('/api/conversations/:userId', async(req,res) => {
    try{
        const userId = req.params.userId;
        const conversations = await Conversation.find({members: {$in: [userId]}});
        const conversationUserData = Promise.all(conversations.map(async conversation => {
            const receiverId = conversation.members.find(member => member !== userId);
            const user = await Users.findById(receiverId);
            return {user: {receiverId: user._id, email: user.email, name: user.name}, conversationId: conversation._id}
        }))
        // console.log(await conversationUserData)
        res.status(200).json(await conversationUserData);
    } catch(error){
        console.log(error);
    }
});

app.post('/api/message', async(req,res) => {
    try{
        const {conversationId, senderId, message, receiverId=''} = req.body;
        if(!senderId || !message){
            return res.status(400).json({
                success: false,
                message: "Please fill the required fields"
            })
        }
        if(conversationId === 'new' && receiverId){
            const newConversation = new Conversation({members: [senderId, receiverId]});
            await newConversation.save();
            const newMessage = new Message({conversationId: newConversation._id, senderId, message});
            await newMessage.save();
            return res.status(200).json({
                success: true,
                message: "Message sent successfully"
            })
        }
        const newMessage = new Message({conversationId, senderId, message});
        await newMessage.save();
        res.status(200).json({
            success: true,
            message: "Message sent successfully"
        })
    } catch(error){
        console.log(error);
    }
});

app.get('/api/message/:conversationId', async(req,res) => {
    try{
        const checkMessages = async(conversationId) => {
            const messages = await Message.find({conversationId});
            const messageData = Promise.all(messages.map(async message => {
                const user = await Users.findById(message.senderId);
                return {user: {id: user._id, email: user.email, name: user.name}, message: message.message};
            }))
            res.status(200).json(await messageData);
        }
        const conversationId = req.params.conversationId;
        if(conversationId === 'new'){
            const checkConversation = await Conversation.find({members: {$all: [req.query.senderId, req.query.receiverId]}});
            if(checkConversation.length> 0){
                checkMessages(checkConversation[0]._id);
            }
            else{
                return res.status(200).json([]);
            }
        }
        else{
            checkMessages(conversationId);
        }
        
    } catch(error){
        console.log(error);
    }
});

app.get('/api/users/:userId', async(req,res) => {
    try{
        const userId = req.params.userId;
        const users = await Users.find({_id: {$ne: userId}});
        const userData = Promise.all(users.map(async (user) => {
            return {user: {name: user.name, email: user.email, receiverId: user._id}};
        }))
        res.status(200).json(await userData);
    } catch(error){
        console.log(error);
    }
})

let users = [];

io.on('connection', socket => {
    console.log("User connected: ",socket.id);
    socket.on('addUser', userId => {
        const ifUserExist = users.find(user => user.userId === userId);
        if(!ifUserExist){
            const user = {userId, socketId: socket.id};
            users.push(user);
            io.emit('getUsers', users);
        }
    })

    socket.on("sendMessage", async({senderId, receiverId, message, conversationId}) => {
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        const user = await Users.findById(senderId);
        if(receiver){
            io.to(receiver.socketId).to(sender.socketId).emit("getMessage", {
                senderId,
                message,
                receiverId,
                conversationId,
                user: {id: user._id, name: user.name, email: user.email}
            })
        }
        else{
            io.to(sender.socketId).emit("getMessage", {
                senderId,
                message,
                receiverId,
                conversationId,
                user: {id: user._id, name: user.name, email: user.email}
            }) 
        }
    })

    socket.on("disconnect", () => {
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    })
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})