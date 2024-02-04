import Express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const port = 3000;
const secretKeyJWT = "it's a secret";

const app = Express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3001',
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.get("/", (req,res) => {
    res.send("Hello world!");
})

app.get("/login", (req, res) => {
    const token = jwt.sign({ _id: "whatsapp" }, secretKeyJWT);
  
    res
        .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
        .json({
            message: "Login Success",
    });
});
  
io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);
  
    const token = socket.request.cookies.token;
    if (!token) return next(new Error("Authentication Error"));
  
    const decoded = jwt.verify(token, secretKeyJWT);
        next();
    });
});

io.on("connection", (socket) => {
    console.log("Socket connected: ",socket.id);

    socket.on("message", ({room, message}) => {
        console.log({room, message});

        socket.to(room).emit("receive-message", message);
    })

    socket.on("join-room", (room) => {
        socket.join(room);
        console.log(`User joined room ${room}`);
    })

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
    })
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})