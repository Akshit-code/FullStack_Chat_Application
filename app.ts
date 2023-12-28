import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import sequelize from './utils/database';
import router from './routes/routes';

const app = express();
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

sequelize.sync().then( () => {
    const port: number = parseInt(process.env.PORT || '3000');
    app.listen(port, ()=> console.log(`Server is running at port: ${port}`));
}).catch(err => console.log(err));