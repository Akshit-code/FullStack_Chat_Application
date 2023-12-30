import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import http from 'http';
import {Server} from 'socket.io';

import sequelize from './utils/database';
import router from './routes/routes';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.use(cors());
app.use(helmet());
app.use(bodyParser.urlencoded( {extended:true} ));
app.use(express.json());
dotenv.config();
app.use(express.static(path.join(__dirname, 'public')));

app.use('/socket.io', function(_req, res, next) {
    res.header('Content-Type', 'text/javascript');
    next();
}, express.static(__dirname + '/node_modules/socket.io/client-dist'));

app.use("/user", router);
app.use("/chats", router);
app.use("/chats" , (_req: Request, res: Response, _next: NextFunction) => {
    res.sendFile(path.join(__dirname, 'views', 'chats.html'));
});

app.use("/" , (_req: Request, res: Response, _next: NextFunction) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('createPrivateRoom', (senderId:string) => {
        socket.join(senderId);
    });

    socket.on('sendPrivateMessage', ( data:{senderId:string, receiverId:string, message:string} ) => {
        const { senderId, receiverId, message } = data;
        socket.to(receiverId).emit('newPrivateMessage', { senderId, message });
    });

    socket.on("joinGroupChat", (groupId:string) => {
        socket.join(groupId);
    });

    socket.on("sendGroupMessage", (data: {currentUser:string,groupId:string, message:string})=> {
        socket.to(data.groupId).emit("receiveGroupMessage",{
            currentUser: data.currentUser,
            sender: socket.id,
            message:data.message
        });
    });
    
    socket.on('joinPrivateRoom', (data: {senderId:string, receiverId:string}) => {
        const allRooms = Object.keys( socket.rooms);
        if(allRooms.includes(data.receiverId)) {
            socket.join(data.receiverId);
            console.log("Joint Receiver Room");
        } else {
            socket.join(data.senderId);
            console.log("Created sender Room");
        }
    });
    
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

sequelize.sync().then( () => {
    const port: number = parseInt(process.env.PORT || '3000');
    httpServer.listen(port, ()=> console.log(`Server is running at port: ${port}`));
}).catch(err => console.log(err));