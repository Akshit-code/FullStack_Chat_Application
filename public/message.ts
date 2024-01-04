const chatsSideBar: HTMLDivElement | null = document.getElementById("chats-sidebar") as HTMLDivElement | null;
const chatsheaderDiv: HTMLDivElement | null = document.getElementById("chats-header-div") as HTMLDivElement | null;
const chatsMessagesDiv: HTMLDivElement | null = document.getElementById("chats-messages-div")as HTMLDivElement | null;
const composeDiv: HTMLDivElement |  null = document.getElementById("compose-div") as HTMLDivElement | null;
const personalTabBtn: HTMLButtonElement | null = document.getElementById("PersonalTab") as HTMLButtonElement | null;
const groupTab: HTMLButtonElement | null = document.getElementById("groupTab") as HTMLButtonElement | null;

function resetChatDisplay() {
    [chatsSideBar, chatsMessagesDiv, chatsheaderDiv, composeDiv].forEach((element) => {
        if (element) {
            element.innerHTML = '';
        };
    });
}

if (personalTabBtn && groupTab) {
    personalTabBtn.addEventListener("click", () => {
        resetChatDisplay();
        handleTabClick(true);
    });

    groupTab.addEventListener("click", () => {
        resetChatDisplay();
        handleTabClick(false);
    });
}

function handleTabClick(isPersonal: boolean) {
    if (chatsSectionDiv) {
        chatsSectionDiv.style.display = "block";
        if (chatsSideBar) {
            chatsSideBar.innerHTML = '';
            isPersonal ? getAllContacts() : getAllGroups();
        };
    };
}

function createCard(_type: string, text: string, clickHandler: Function) {
    const card: HTMLDivElement | null = document.createElement("div");
    if (card) {
        card.classList.add("contact-card");

        const textNode = document.createTextNode(text);
        const paragraph: HTMLParagraphElement | null = document.createElement("p");
        if (paragraph) {
            paragraph.appendChild(textNode);
            card.appendChild(paragraph);
        };

        card.addEventListener("click", () => {
            clickHandler();
        });

        chatsSideBar?.appendChild(card);
    };
}

function displayContactCard(contact: ContactDetails) {
    console.log(contact.contactId);
    createCard(
        "contact",
        `${contact.firstName} ${contact.lastName}`,
        () => {
            displayHeaeders(contact);
            composeChats(contact);
            getPrivateChats(contact);
            socketFunctions.createPrivateRoom(currentUser.id);
        }
    );
}

function displayGroupCard(group: GroupDetails) {
    createCard(
        "group",
        group.groupName,
        () => {
            displayGroupHeader(group);
            composeGroupChats(group);
            getGroupChats(group);
            if(group.isAdmin === true) {
                getAllGroupMembers(group);
            }
            socketFunctions.joinOrCreateGroupRoom(group.GroupId);
        }
    );
}

function getPrivateChats(contact:ContactDetails) {
    const storedMessagesRaw = localStorage.getItem("PrivateChats");
    const storedMessages: Message[] = storedMessagesRaw ? JSON.parse(storedMessagesRaw) : [];
    if(chatsMessagesDiv ){
        chatsMessagesDiv.innerHTML = '';
    };
    storedMessages.forEach( (message:Message)=> {
        if (message.senderId === currentUser.id && message.receiverId === contact.contactId) {
            displaySendMessage(message.message);
        } else if (message.receiverId === currentUser.id && message.senderId === contact.contactId) {
            displayReceviedMessage(message.message);
        };
    } );
}

function getGroupChats(group: GroupDetails) {
    const storedMessagesRaw = localStorage.getItem("GroupChats");
    const storedMessages: Message[] = storedMessagesRaw ? JSON.parse(storedMessagesRaw) : [];
    if(chatsMessagesDiv ){
        chatsMessagesDiv.innerHTML = '';
    };
    storedMessages.forEach( (message:Message)=> {
        if (message.senderId === currentUser.id && message.receiverId === group.GroupId) {
            displaySendMessage(message.message);
        } else if (message.receiverId === group.GroupId) {
            displayReceviedMessage(message.message);
        };
    } );
}

function displayHeaeders(contact: ContactDetails) {
    if(chatsheaderDiv) {
        chatsheaderDiv.innerHTML = '';
        const headerName = contact.firstName + " "  + contact.lastName;
        const headerTextNode = document.createTextNode(headerName);
        chatsheaderDiv.style.textAlign = "center";
        chatsheaderDiv.appendChild(headerTextNode);
    };
}
let currentGroup:GroupDetails;
function displayGroupHeader(group:GroupDetails) {
    currentGroup = group;
    if(chatsheaderDiv) {
        chatsheaderDiv.innerHTML = '';
        const headerName = group.groupName;
        if(group.isAdmin) {
            const editGroupBtn = document.createElement("button");
            editGroupBtn.classList.add("reg");
            editGroupBtn.addEventListener("click",()=> {
                if(editGroupDiv) {
                    editGroupDiv.style.display = "block";
                };
            });
            editGroupBtn.innerText = "Edit Group";
            editGroupBtn.style.float= "right";
            chatsheaderDiv.appendChild(editGroupBtn);
        } else {
            const leaveGroupBtn = document.createElement("button");
            leaveGroupBtn.classList.add("log");
            leaveGroupBtn.innerText = "Leave Group";
            leaveGroupBtn.style.float= "right";
            chatsheaderDiv.appendChild(leaveGroupBtn);
        }
        const headerTextNode = document.createTextNode(headerName);
        chatsheaderDiv.style.textAlign = "center";
        chatsheaderDiv.appendChild(headerTextNode);
    };
};

function composeChats(contact: ContactDetails) {
    const messageInput = document.createElement("input");
    messageInput.setAttribute("type", "text");
    messageInput.placeholder = "Type a Message";

    const fileInputBtn = document.createElement("button");
    fileInputBtn.textContent = "+";
    fileInputBtn.addEventListener("click", ()=> {
        fileInput.click();
    });

    const fileInput =  document.createElement("input");
    fileInput.setAttribute("type", "file");
    fileInput.setAttribute("multiple", "false");
    fileInput.style.display = "none";

    fileInput.addEventListener("change", () => {
        const selectedFile = (fileInput as HTMLInputElement).files?.[0];
        if (selectedFile) {
            console.log("Selected Files:", selectedFile);
        };
    });

    const sendBtn = document.createElement("button");
    sendBtn.classList.add("send-btn");
    sendBtn.textContent = "Send";
    sendBtn.addEventListener("click" , ()=> {
        const message = messageInput.value;
        const selectedFile = (fileInput as HTMLInputElement).files?.[0];

        if(selectedFile) {
            sendMultiMediaMessage(selectedFile, contact.contactId, 'private');
        } else {
            sendMessage(message, contact.contactId, 'private');
            socketFunctions.sendPrivatemessage(currentUser.id, contact.contactId, message);
            displaySendMessage(message);
        }
        messageInput.value = '';
    });

    if(composeDiv) {
        composeDiv.innerHTML = '';
        composeDiv.appendChild(fileInputBtn);
        composeDiv.appendChild(fileInput);
        composeDiv.appendChild(messageInput);
        composeDiv.appendChild(sendBtn);
    };
}

function composeGroupChats(group: GroupDetails) {
    const messageInput = document.createElement("input");
    messageInput.setAttribute("type", "text");
    messageInput.placeholder = "Type a Message";

    const fileInputBtn = document.createElement("button");
    fileInputBtn.textContent = "+";
    fileInputBtn.addEventListener("click", ()=> {
        fileInput.click();
    });

    const fileInput =  document.createElement("input");
    fileInput.setAttribute("type", "file");
    fileInput.setAttribute("multiple", "false");
    fileInput.style.display = "none";

    fileInput.addEventListener("change", () => {
        const selectedFile = (fileInput as HTMLInputElement).files?.[0];
        if (selectedFile) {
            console.log("Selected Files:", selectedFile);
        }
    });
    const sendBtn = document.createElement("button");
    sendBtn.classList.add("send-btn");
    sendBtn.textContent = "Send";
    sendBtn.addEventListener("click" , ()=> {
        const message = currentUser.firstName + " " + currentUser.lastName + " : " +  messageInput.value;
        const selectedFile = (fileInput as HTMLInputElement).files?.[0];
        if(selectedFile) {
            sendMultiMediaMessage(selectedFile, group.GroupId, 'group');
        } else {
            connectToSocket().sendGroupSocketMessage(currentUser.id,group.GroupId,message);
            sendMessage(message, group.GroupId, 'group');
            displaySendMessage(message);
        }
        messageInput.value = '';
    });
    if(composeDiv) {
        composeDiv.innerHTML = '';
        composeDiv.appendChild(fileInputBtn);
        composeDiv.appendChild(fileInput);
        composeDiv.appendChild(messageInput);
        composeDiv.appendChild(sendBtn);
    };
}

function displayReceviedMessage(message:string) {
    if(chatsMessagesDiv) {
        const receivedMessageDiv = document.createElement("div");
        receivedMessageDiv.classList.add("message-container", "received");
        const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
        const isURL = urlPattern.test(message);
        if (isURL) { 
            const link = document.createElement("a");
            link.href = message;
            link.textContent = "Download File"; 
            link.setAttribute("download", "true"); 
            receivedMessageDiv.appendChild(link);
        } else {
            const p = document.createElement("p");
            const messageNode = document.createTextNode(message);
            p.appendChild(messageNode);
            receivedMessageDiv.appendChild(p);
        };
        chatsMessagesDiv.appendChild(receivedMessageDiv);
    };
}

function displaySendMessage(message: string) {
    if(chatsMessagesDiv) {
        const sendMessageDiv = document.createElement("div");
        sendMessageDiv.classList.add("message-container", "send");

        const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
        const isURL = urlPattern.test(message);
        if (isURL) {
            const link = document.createElement("a");
            link.href = message;
            link.textContent = "Download File"; 
            link.setAttribute("download", "true"); 
            sendMessageDiv.appendChild(link);
        } else {
            const p = document.createElement("p");
            const messageNode = document.createTextNode(message);
            p.appendChild(messageNode);
            sendMessageDiv.appendChild(p);
        };
        chatsMessagesDiv.appendChild(sendMessageDiv);
    };
}

async function sendMessage(message:string, id:string, messageType:string) {
    try {
        const token = localStorage.getItem("token") || '';
        const response:Response = await fetch('/chats/sendMessage', {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify ( {
                message: message,
                receiverId: id,
                messageType: messageType
            })
        });

        if(response.status === 201) {
            const data = await response.json();
            console.log(data);
            const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
            const isURL = urlPattern.test(data.message);

            if(isURL) {
                displaySendMessage(data.message);
            }
            console.log("Fetched sucessfully send Message request");
        } else if (response.status === 401 || 403) {
            console.log("Unauthorized User");
        } else if( response.status === 404) {
            console.log("User Details not Found");
        } else {
            console.log(`Error: ${response.statusText}`);
        };
    } catch (error) {
        console.error("Error in fetching Private sending message",error);
    };
}

async function sendMultiMediaMessage(selectedFile: File, id: string, messageType: string) {
    try {
        console.log("From SendMulti media file",selectedFile);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('receiverId', id);
        formData.append('messageType', messageType);

        console.log(formData);
        const token = localStorage.getItem("token") || '';
        const response:Response = await fetch('/chats/sendMediaMessage', {
            method:"POST",
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData 
        });

        if(response.status === 200) {
            const data = await response.json();
            console.log("From Send Message Mutlimedia", data);
            // Send to Display Message
            console.log("Fetched sucessfully send MultiMedia request");
        } else if (response.status === 401 || 403) {
            console.log("Unauthorized User");
        } else if( response.status === 404) {
            console.log("User Details not Found");
        } else {
            console.log(`Error: ${response.statusText}`);
        };
    } catch (error) {
        console.error("Error in fetching Send media file request",error);
    };
}

async function getAllPrivateMessages() {
    try {
        const token = localStorage.getItem("token") || '';
        const response = await fetch('/chats/getAllPrivateMessages', {
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if(response.status === 200) {
            const data = await response.json();
            console.log("Fetched sucessfully get All Private Message request");
            localStorage.setItem("PrivateChats", JSON.stringify(data));

        } else if (response.status === 401 || 403) {
            console.log("Unauthorized User");
        } else if( response.status === 404) {
            console.log("User Details not Found");
        } else {
            console.log(`Error: ${response.statusText}`);
        };
    } catch (error) {
        console.error("Error in fetching all private message", error);
    }
}

async function getAllGroupMessages() {

    const allGroupsId:string[] = allGroups.map( group => group.GroupId);
    console.log(allGroupsId);
    try {
        const token = localStorage.getItem("token") || '';
        const response = await fetch('/chats/getAllGroupMessages', {
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify ( {
                allGroupsId: allGroupsId   
            } )
        });

        if(response.status === 200) {
            const data = await response.json();
            console.log("Fetched sucessfully get All Group Message request");
            localStorage.setItem("GroupChats", JSON.stringify(data));
        } else if (response.status === 401 || 403) {
            console.log("Unauthorized User");
        } else if( response.status === 404) {
            console.log("User Details not Found");
        } else {
            console.log(`Error: ${response.statusText}`);
        };
    } catch (error) {
        console.error("Error in fetching all group message", error);
    };
}