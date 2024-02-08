import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";

const port = 8080;
const secretKeyJWT = "it's a secret";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(cors());

app.get("/", (req,res) => {
    res.send("Hello world!");
})

// app.get("/login", (req, res) => {
//     const token = jwt.sign({ _id: "whatsapp" }, secretKeyJWT);
  
//     res
//         .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
//         .json({
//             message: "Login Success",
//     });
// });
  
// io.use((socket, next) => {
//     cookieParser()(socket.request, socket.request.res, (err) => {
//     if (err) return next(err);
  
//     const token = socket.request.cookies.token;
//     if (!token) return next(new Error("Authentication Error"));
  
//     const decoded = jwt.verify(token, secretKeyJWT);
//         next();
//     });
// });

let users = [];

io.on("connection", (socket) => {
    console.log("Socket connected: ",socket.id);

    socket.on("joined", ({user}) => {
        users[socket.id] = user;
        console.log(`${user} has joined`);
        socket.broadcast.emit("userJoined", {user: "Admin", message: `${users[socket.id]} has joined.`});
        socket.emit("welcome", {user:"Admin", message: `Welcome to the chat, ${users[socket.id]}`});
        console.log("Users: ",users);
    })

    socket.on("message", ({message, id}) => {
        console.log(`message: ${message}, user: ${users[id]}, id: ${id}`);
        io.emit("sendMessage", {user: users[id], message, id});
    })

    socket.on("join-room", (room) => {
        socket.join(room);
        console.log(`User joined room ${room}`);
    })

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
        socket.broadcast.emit("left", {user:"Admin", message: `${users[socket.id]} has left.`});
    })
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})