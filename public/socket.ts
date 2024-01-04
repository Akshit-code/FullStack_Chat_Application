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
        const existingChats: Message[] = JSON.parse(localStorage.getItem("PrivateChats") || '[]');
        const time = new Date( Date.now() ).toISOString();
        const new_message: Message[] = [ {
            message: message,
            senderId: senderId,
            receiverId: receiverId,
            messageType: 'private',
            createdAt: time,
        } ];
        const updatedChats: Message[] = existingChats.concat(new_message);
        localStorage.setItem('PrivateChats', JSON.stringify(updatedChats));
    }
    
    function joinOrCreateGroupRoom(groupId:string) {
        socket.emit('joinGroupChat', groupId);
    };

    function sendGroupSocketMessage(currentUser:string, groupId:string, message:string) {
        socket.emit('sendGroupMessage', {currentUser, groupId, message} );

        const existingChats: Message[] = JSON.parse(localStorage.getItem("GroupChats") || '[]');
        const time = new Date( Date.now() ).toISOString();
        const new_message: Message[] = [ {
            message: message,
            senderId: currentUser,
            receiverId: groupId,
            messageType: 'group',
            createdAt: time,
        } ];
        const updatedChats: Message[] = existingChats.concat(new_message);
        localStorage.setItem('GroupChats', JSON.stringify(updatedChats));
    };
    
    socket.on("newPrivateMessage", (data: {senderId:string, receiverId:string, message:string} ) => {
        displayReceviedMessage(data.message);

        const existingChats: Message[] = JSON.parse(localStorage.getItem("PrivateChats") || '[]');
        const time = new Date( Date.now() ).toISOString();
        const new_message: Message[] = [ {
            message: data.message,
            senderId: data.senderId,
            receiverId: data.receiverId,
            messageType: 'private',
            createdAt: time,
        } ];
        const updatedChats: Message[] = existingChats.concat(new_message);
        localStorage.setItem('PrivateChats', JSON.stringify(updatedChats));
    });

    socket.on("joinedPrivateRoom", (data: {receiverId:string} ) => {
        console.log("User Joined  private Room",data.receiverId);
    });
    
    socket.on('receiveGroupMessage', (data: {senderId:string, receiverId: string, message: string }) => {
        if(currentUser.id !== data.senderId) {
            displayReceviedMessage(data.message);
        };

        const existingChats: Message[] = JSON.parse(localStorage.getItem("GroupChats") || '[]');
        const time = new Date( Date.now() ).toISOString();
        const new_message: Message[] = [ {
            message: data.message,
            senderId: data.senderId,
            receiverId: data.receiverId,
            messageType: 'group',
            createdAt: time,
        } ];
        const updatedChats: Message[] = existingChats.concat(new_message);
        localStorage.setItem('GroupChats', JSON.stringify(updatedChats));
    });

    return {
        createPrivateRoom,
        sendPrivatemessage,
        joinOrCreateGroupRoom,
        sendGroupSocketMessage
    };
}