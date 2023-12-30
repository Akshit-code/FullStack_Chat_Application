declare var io: any;
// let socket = io();
// console.log(socket);
let connected:boolean = false;
function connectToSocket() {
    const socket = io('http://localhost:3000');

    if(!connected) {
        socket.on('connect', () => {
            console.log('Connected to Socket.IO server');
        });
        connected = true;
    };

    function createPrivateRoom(senderId:string) {
        socket.emit('createPrivateRoom', senderId);
    }
   
    function sendPrivatemessage(senderId:string, receiverId:string, message:string) {
        socket.emit("sendPrivateMessage", {senderId, receiverId, message});
    }
    
    function joinOrCreateGroupRoom(groupId:string) {
        socket.emit('joinGroupChat', groupId);
    };

    function sendGroupSocketMessage(currentUser:string, groupId:string, message:string) {
        socket.emit('sendGroupMessage', {currentUser, groupId, message} );
    };
    
    socket.on("newPrivateMessage", (data: {senderId:string, receiverId:string, message:string} ) => {
        displayReceviedMessage(data.message);
    });

    socket.on("joinedPrivateRoom", (data: {receiverId:string} ) => {
        console.log("User Joined  private Room",data.receiverId);
    })
    socket.on('receiveGroupMessage', (data: {currentUser:string,sender: string, message: string }) => {
        if(currentUser.id !== data.currentUser) {
            displayReceviedMessage(data.message);
        };
    });

    return {
        createPrivateRoom,
        sendPrivatemessage,
        joinOrCreateGroupRoom,
        sendGroupSocketMessage
    };
}