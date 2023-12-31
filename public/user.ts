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
            };
            if(loginDiv) {
                loginDiv.style.display = "block";
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

let isloggedIn: boolean = false;
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
            isloggedIn =true;
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
            localStorage.clear();
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
            await response.json();
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

async function getAllGroupMembers(group: GroupDetails) {
    const token = localStorage.getItem("token") || '';
    try {
        const response = await fetch (`chats/getAllMembers/${group.GroupId}`, {
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if(response.status === 200) {
            const data:[] = await response.json();
           
            const allGroupsMembers = generateContactList(data);

            if(groupMemberListDiv) {
                groupMemberListDiv.appendChild(allGroupsMembers);
            };

            if(addAdminDivListDiv) {
                addAdminDivListDiv.appendChild(allGroupsMembers);
            }
           
            const nonGroupMembersList:ContactDetails[] = [];

            allContacts.forEach((contact: ContactDetails) => {
                if (!data.some((member: ContactDetails) => member.contactId === contact.contactId)) {
                    nonGroupMembersList.push(contact);
                }
            });
            const nonMembers = generateContactList(nonGroupMembersList);
            if(addGroupMemberListDiv) {
                addGroupMemberListDiv.appendChild(nonMembers);
            };


            console.log("Fetched sucessfully all group members details");
        } else if (response.status === 401 || 403) {
            console.log("Unauthorized User");
        } else if( response.status === 404) {
            console.log("User Details not Found");
        } else {
            console.log(`Error: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error in fetching all Group Members Details",error);
    }
}

async function getAllAdmins(group: GroupDetails) {
    const token = localStorage.getItem("token") || '';
    try {
        const response = await fetch(`chats/getAllAdmins/${group.GroupId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if(response.status === 200) {
            const data:any[] = await response.json();
            
            data.forEach( (admin:any) => {
                admin.contactId = admin.id;
            } );
            const groupAdminslist= generateContactList(data);
            if(removeAdminListDIv) {
                removeAdminListDIv.appendChild(groupAdminslist);
            };
            console.log("Fetched sucessfully all group admins details");
        } else if (response.status === 401 || 403) {
            console.log("Unauthorized User");
        } else if( response.status === 404) {
            console.log("User Details not Found");
        } else {
            console.log(`Error: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error in fetching all Group Admins Details",error);
    }
}

async function adminOperations(selectedUsers: any[], groupName:string, opsType:string) {
    try {
        const token = localStorage.getItem("token") || '';
        const response = await fetch('/chats/adminOps', {
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify ( {
                groupName: groupName,
                selectedMembers: selectedUsers,
                opsType: opsType,
                groupId: currentGroup.GroupId
            } )
        });

        if(response.status === 201) {
            await response.json();
            console.log("Admin Operation Done successfully");
            // displayGroupCard(data);
        } else if (response.status === 401 || 403) {
            console.log("Unauthorized User");
        } else {
            console.log(`Error: ${response.statusText}`);
        }

    } catch (error) {
        console.log("Error in fetching Admin operation request ", error);
    }
}

async function getAllInvites() {
    try {
        const token = localStorage.getItem("token") || '';
        const response = await fetch('chats/getAllInvites', {
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if(response.status === 200) {
            const data:[] = await response.json();
            console.log("Got all invites");
            console.log(data);
            data.forEach( (invite)=> {
                displayInvites(invite);
            } );
        } else if (response.status === 401 || 403) {
            console.log("Unauthorized User");
        } else {
            console.log(`Error: ${response.statusText}`);
        }
    } catch (error) {
        console.log("Error in fetching get All invites request ", error);
    }
}

async function respondInvites(invite: InvitiesDetails) {
    try {
        const token = localStorage.getItem("token") || '';
        const response = await fetch('chats/responseInvites', {
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body :JSON.stringify( {
                invite: invite
            } )
        });

        if(response.status === 201) {
            const data = await response.json();
            console.log("Got all invies");
            console.log(data);
            
            // displayGroupCard(data);
        } else if (response.status === 401 || 403) {
            console.log("Unauthorized User");
        } else {
            console.log(`Error: ${response.statusText}`);
        }
    } catch (error) {
        console.log("Error in fetching respond invites request ", error);
    }
}