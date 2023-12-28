

async function registerUser(user: SignUpForm): Promise<void> {
    try {
        const response:Response = await fetch('/user/register', {
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify ( {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
                phoneNo: user.phoneNo
            }),
        });

        if(response.status === 201) {
            console.log("New User Added");
            if(signUpDiv) {
                signUpDiv.style.display = "none";
            }
        } else if (response.status === 409) {
            console.log("User Already Exits");
            alert("User with the same Phone Number already exists!");
        } else {
            console.log(`Error: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error in fetching register user",error);
    }
}


async function loginUser(user: LoginForm): Promise<void> {
    try {
        const response: Response = await fetch ('user/login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( {
                phoneNo: user.phoneNo,
                password: user.password
            } ),
        });
        
        if(response.status === 200) {
            const data:UserDetails = await response.json();
            localStorage.setItem('token', data.token);
            console.log(`User ${data.firstName} ${data.lastName} have Logged In`);
            if(loginDiv) {
                loginDiv.style.display = "none";
            };
            window.location.href = "/chats";
            getAllContacts();
        } else if(response.status === 401) {
            console.log("Incorrect Password");
            alert("Incorrect Phone Number or password");
        } else if(response.status === 404) {
            console.log("User Not FOund");
            alert("No user Found with this phone number, Kidly signUp first");
        } else {
            console.log(`Error: ${response.statusText}`);
        }
    } catch(error) {
        console.error( "Error in fetching Login User", error);
    }
}

async function logoutuser() {
    try {
        const token = localStorage.getItem("token") || '';
        const response:Response = await fetch('/chats/logoutUser', {
            method:"GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if(response.status === 201) {
            console.log("User Have Logged Out");
        } else if(response.status === 404) {
            console.log("User Not FOund");
        } else {
            console.log(`Error: ${response.statusText}`);
        }
    } catch (error) {
        console.error( "Error in fetching LogOut Requestr", error);
    }
}
let currentUser:UserDetails;
async function getCurrentUserDetails():Promise<void> {
    try {
        const token = localStorage.getItem("token") || '';
        const response:Response = await fetch('/chats/getCurrentUserDetails', {
            method:"GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if(response.status === 200) {
            const data:UserDetails = await response.json();
            data.token = token;
            currentUser = data;
            console.log("Successfully fetched current User details");
        } else if (response.status === 401 || 403) {
            console.log("Unauthorized User");
        } else if( response.status === 404) {
            console.log("User Details not Found");
        } else {
            console.log(`Error: ${response.statusText}`);
        }
    } catch(error) {
        console.error("Error in fetching Current User Details",error);
    }
}

async function addContact(contact:ContactDetailsForn):Promise<void> {
    try {
        const token = localStorage.getItem("token") || '';
        const response = await fetch('/chats/addContact', {
            method:'POST',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify( {
                firstName: contact.firstName,
                lastName: contact.lastName,
                phoneNo: contact.phoneNo
            } )
        });

        if(response.status === 201) {
            const responseData = await response.json();
            console.log(`${responseData.firstName} ${responseData.lastName} have been Added in Contacts`);
        } else if (response.status === 401 || 403) {
            console.log("Unauthorized User");
        } else if (response.status === 404) {
            console.log("Added Contact User Not found");
        }  
    } catch (error) {
        console.error(error);
    }
}

async function addGroup(selectedUsers: any[], groupName:string) {
    try {
        const token = localStorage.getItem("token") || '';
        const response = await fetch('/chats/addGroup', {
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify ( {
                groupName: groupName,
                groupMembers: selectedUsers,
            } )
        });

        if(response.status === 201) {
            const data =  await response.json();
            console.log(data);
            console.log("Added New Group");
            // displayGroupCard(data);
        } else if (response.status === 401 || 403) {
            console.log("Unauthorized User");
        } else {
            console.log(`Error: ${response.statusText}`);
        }

    } catch (error) {
        console.log("Error in fetching Add group ", error);
    }
}

let allContacts:ContactDetails[];
async function getAllContacts():Promise<void> {
    try {
        const token = localStorage.getItem("token") || '';
        const response:Response = await fetch('/chats/getAllContacts', {
            method:"GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if(response.status === 200) {
            const data = await response.json();
            allContacts = data;
            tableBody(allContacts);
            allContacts.forEach( (contact)=> {
                displayContactCard(contact);
            });
            console.log("Fetched sucessfully Users all contacts details");
        } else if (response.status === 401 || 403) {
            console.log("Unauthorized User");
        } else if( response.status === 404) {
            console.log("User Details not Found");
        } else {
            console.log(`Error: ${response.statusText}`);
        }
    } catch(error) {
        console.error("Error in fetching User all contact Details",error);
    }
}

let allGroups:GroupDetails[];
async function getAllGroups():Promise<void> {
    try {
        const token = localStorage.getItem("token") || '';
        const response:Response = await fetch('/chats/getAllGroups', {
            method:"GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if(response.status === 200) {
            const data:[] = await response.json();
            allGroups = data;
            console.log("ALL GROUP DATA => ", allGroups);
            allGroups.forEach( group=> {
                displayGroupCard(group);
            });
            console.log("Fetched sucessfully Users all groups details");
        } else if (response.status === 401 || 403) {
            console.log("Unauthorized User");
        } else if( response.status === 404) {
            console.log("User Details not Found");
        } else {
            console.log(`Error: ${response.statusText}`);
        }
    } catch(error) {
        console.error("Error in fetching All groups Details",error);
    }
}