const chatsSideBar: HTMLDivElement | null = document.getElementById("chats-sidebar") as HTMLDivElement | null;
const chatsheaderDiv: HTMLDivElement | null = document.getElementById("chats-header-div") as HTMLDivElement | null;
const chatsMessagesDiv: HTMLDivElement | null = document.getElementById("chats-messages-div")as HTMLDivElement | null;
const composeDiv: HTMLDivElement |  null = document.getElementById("compose-div") as HTMLDivElement | null;

function displayContactCard(contacts: ContactDetails) {
    if (chatsSideBar) {
        const contactCard: HTMLDivElement | null = document.createElement("div");
        if (contactCard) {
            contactCard.classList.add("contact-card");

            const fullName = contacts.firstName + " " + contacts.lastName;
            const fullNameText = document.createTextNode(fullName);

            const p: HTMLParagraphElement | null = document.createElement("p");
            if (p) {
                p.appendChild(fullNameText);
                contactCard.appendChild(p);
            }

            contactCard.addEventListener("click" , ()=> {
                displayHeaders(contacts);
                // displayChats(contacts);
                composeChats(contacts);
            });
            // Append the contact card to the sidebar
            chatsSideBar.appendChild(contactCard);
        }
    }
}

// function displayChats(contacts: ContactDetails) {

// }

function displayHeaders(contacts: ContactDetails) {
    const headerName = contacts.firstName + " "  + contacts.lastName;
    const refreshButton = document.createElement("button");
    refreshButton.textContent= "refesh";
    refreshButton.style.float = "right";
    const headerTextNode = document.createTextNode(headerName);
    if(chatsheaderDiv) {
        chatsheaderDiv.style.textAlign = "center";
        chatsheaderDiv.appendChild(headerTextNode);
        chatsheaderDiv.appendChild(refreshButton);
    }
}

function composeChats(contacts: ContactDetails) {
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
    fileInput.style.display = "none";

    fileInput.addEventListener("change", () => {
        // Handle file selection or further actions here if needed
        const selectedFiles = (fileInput as HTMLInputElement).files;
        if (selectedFiles) {
            console.log("Selected Files:", selectedFiles);
        }
    });

    const sendBtn = document.createElement("button");
    sendBtn.classList.add("send-btn");
    sendBtn.textContent = "Send";
    sendBtn.addEventListener("click" , ()=> {
        const message = messageInput.value;
        console.log("Message Input : ",message);
        const selectedFiles = (fileInput as HTMLInputElement).files;
        console.log(selectedFiles);
    });

    console.log(contacts);
    if(composeDiv) {
        composeDiv.appendChild(messageInput);
        composeDiv.appendChild(fileInputBtn);
        composeDiv.appendChild(sendBtn);
        composeDiv.appendChild(fileInput);
    }
}
