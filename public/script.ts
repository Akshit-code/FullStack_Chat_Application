const topNav: HTMLDivElement | null = document.getElementById("myTopnav") as HTMLDivElement | null;
const icon: HTMLElement | null = document.querySelector(".icon");
const closeSpans: NodeListOf<Element> = document.querySelectorAll(".close");
const modals: NodeListOf<ModalElement> = document.querySelectorAll(".modal");
const myContactsNavBtn: HTMLButtonElement | null = document.getElementById("myContacts") as HTMLButtonElement | null;
const tableDiv: HTMLDivElement | null = document.getElementById("tableContainerDiv") as HTMLDivElement | null;

const signUpDiv: HTMLDivElement | null = document.getElementById("signup-form-div") as HTMLDivElement | null;
const signUpBtn: HTMLButtonElement | null = document.getElementById("signUp-btn") as HTMLButtonElement | null;
const signUpSubmitBtn: HTMLButtonElement | null = document.getElementById("signUp-Submit-Btn") as HTMLButtonElement | null;
const signUpForm: HTMLFormElement | null = document.getElementById("signup-form") as HTMLFormElement | null;
const newPassword: FormElement | null = document.getElementById("newPassword") as FormElement | null;
const confirmPassword: FormElement | null = document.getElementById("confirmPassword") as FormElement | null;
const firstName: FormElement | null = document.getElementById("firstName") as FormElement | null;
const lastName: FormElement | null = document.getElementById("lastName") as FormElement | null;
const email: FormElement | null = document.getElementById("email") as FormElement | null;
const phoneNo: FormElement | null = document.getElementById("phoneNo") as FormElement | null;

const loginDiv: HTMLDivElement | null = document.getElementById("login-form-div") as HTMLDivElement | null;
const loginBtn: HTMLButtonElement | null = document.getElementById("login-btn") as HTMLButtonElement | null;
const loginForm: HTMLFormElement | null = document.getElementById("login-form") as HTMLFormElement | null;
const loginPhoneNo: FormElement | null = document.getElementById("login-phoneNo") as FormElement | null;
const loginPassword: FormElement | null = document.getElementById("login-password") as FormElement | null;
const logoutBtn: HTMLButtonElement | null = document.getElementById("logout-btn") as HTMLButtonElement | null;

const profileDiv: HTMLDivElement | null = document.getElementById("profile-div") as HTMLDivElement | null;
const profileBtn: HTMLButtonElement | null  = document.getElementById("profile-btn") as HTMLButtonElement | null;

const addContactDiv:HTMLDivElement | null = document.getElementById("addContactDiv") as HTMLDivElement | null;
const addContactBtn: HTMLButtonElement | null = document.getElementById("addContact-btn") as HTMLButtonElement | null;
const addContactForm:HTMLFormElement | null = document.getElementById("addContactForm") as HTMLFormElement | null;
const contactFirstName:FormElement | null = document.getElementById("contactFirstName") as FormElement | null;
const contactLastName:FormElement | null = document.getElementById("contactLastName") as FormElement | null;
const contactPhoneNo:FormElement |null = document.getElementById("contactPhoneNo") as FormElement |null;

const chatsSectionDiv:HTMLDivElement | null = document.getElementById("chatsSectionDiv") as HTMLDivElement | null;
const myChatsNavBtn:HTMLButtonElement | null = document.getElementById("myChats") as HTMLButtonElement | null;

// Define interfaces for elements
interface FormElement extends HTMLInputElement {
    value: string;
}

interface ModalElement extends HTMLElement {
    style: CSSStyleDeclaration;
}

interface SignUpForm {
    firstName:string;
    lastName:string;
    email:string;
    password:string;
    phoneNo:number;
}

interface LoginForm {
    phoneNo:number
    password:string;
}

interface UserDetails {
    id:string;
    firstName:string;
    lastName:string;
    email:string;
    phoneNo:number;
    token:string;
}

interface ContactDetailsForn {
    firstName: string;
    lastName: string;
    phoneNo: number;
}

interface ContactDetails {
    firstName: string;
    lastName: string;
    phoneNo: number;
    contactId: string;
}

// Toggle navigation
function toggleNav(): void {
    if (topNav) {
        topNav.classList.toggle("responsive");
    }
}

// Close modals
function closeModal(): void {
    modals.forEach((modal: ModalElement) => {
        modal.style.display = "none";
    });
}

// Add event listeners
if (icon) {
    icon.addEventListener("click", (e) => {
        e.preventDefault();
        toggleNav();
    });
}

if (window) {
    window.onclick = (event) => {
        modals.forEach((modal: ModalElement) => {
            if (event.target === modal) {
                if (signUpDiv) {
                    signUpDiv.style.display = "none";
                }
                if (loginDiv) {
                    loginDiv.style.display = "none";
                }
                if (profileDiv) {
                    profileDiv.style.display = "none"
                }
                if(addContactDiv) {
                    addContactDiv.style.display ="none";
                }
            }
        });
    };
}

if (closeSpans) {
    closeSpans.forEach((closeSpan) => {
        closeSpan.addEventListener("click", () => {
            closeModal();
        });
    });
}

if (signUpBtn) {
    signUpBtn.addEventListener("click", () => {
        if (signUpDiv) {
            signUpDiv.style.display = "block";
        }
    });
}

if(loginBtn) {
    loginBtn.addEventListener ("click", ()=> {
        if(loginDiv) {
            loginDiv.style.display="block";
        };
    });
}

if(profileBtn) {
    profileBtn.addEventListener("click", () => {
        if(profileDiv) {
            profileDiv.style.display="block";
        }
    })
}

if(addContactBtn) {
    addContactBtn.addEventListener("click", ()=> {
        if(addContactDiv) {
            addContactDiv.style.display="block";
        }
    })
}

if(logoutBtn) {
    logoutBtn.addEventListener("click", async ()=> {
        await logoutuser();
        window.location.href = "../";
        localStorage.removeItem("token");
    });
}

function signUpFormValidation(): void {
    if (newPassword && confirmPassword && signUpSubmitBtn) {
        signUpSubmitBtn.disabled = !(newPassword.value.trim() !== '' && confirmPassword.value.trim() !== '' && newPassword.value === confirmPassword.value);
    }
}

if (newPassword) {
    newPassword.addEventListener("input", signUpFormValidation);
}

if (confirmPassword) {
    confirmPassword.addEventListener("input", signUpFormValidation);
}

if (signUpForm) {
    signUpForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (firstName && lastName && email && newPassword && phoneNo) {
            const formData:SignUpForm = {
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                password: newPassword.value,
                phoneNo: parseInt( phoneNo.value)
            };
            registerUser(formData);
        }
    });
}

if(loginForm) {
    loginForm.addEventListener("submit", (e)=> {
        e.preventDefault();
        if(loginPhoneNo && loginPassword) {
            const formData:LoginForm = {
                phoneNo: parseInt(loginPhoneNo.value),
                password: loginPassword.value
            };
            loginUser(formData);
        };
    })
}

if(addContactForm) {
    addContactForm.addEventListener("submit", (e)=> {
        e.preventDefault();
        if(contactFirstName && contactLastName && contactPhoneNo) {
            const formData:ContactDetailsForn = {
                firstName: contactFirstName.value,
                lastName: contactLastName.value,
                phoneNo: parseInt(contactPhoneNo.value)
            }
            addContact(formData);
        }
    })
}

window.addEventListener("load", async ()=> {
    const token = localStorage.getItem("token") || '';
    if(!token) {
        console.log("No token Found");
        return;
    } else {
        await getCurrentUserDetails();
        await getAllContacts();
    }
});


function openNav() {
    const sidepanel = document.getElementById("sidepanel");
    const mainContent = document.getElementsByClassName("main-content")[0] as HTMLElement;
  
    if (sidepanel && mainContent) {
      sidepanel.style.width = "250px";
      mainContent.style.marginLeft = "250px";
    }
  }
  
function closeNav() {
    const sidepanel = document.getElementById("sidepanel");
    const mainContent = document.getElementsByClassName("main-content")[0] as HTMLElement;
    if (sidepanel && mainContent) {
        sidepanel.style.width = "0";
        mainContent.style.marginLeft = "0";
    }
}

document.getElementById("openBtn")?.addEventListener("click", openNav);
document.getElementById("closeBtn")?.addEventListener("click", closeNav);

function createContactRow(contact:ContactDetails): HTMLTableRowElement {
  const row = document.createElement('tr');

  const firstNameCell = document.createElement('td');
  firstNameCell.textContent = contact.firstName;
  row.appendChild(firstNameCell);

  const lastNameCell = document.createElement('td');
  lastNameCell.textContent = contact.lastName;
  row.appendChild(lastNameCell);

  const phoneNumberCell = document.createElement('td');
  phoneNumberCell.textContent = contact.phoneNo.toString();
  row.appendChild(phoneNumberCell);

  const actionsCell = document.createElement('td');
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  actionsCell.appendChild(editBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  actionsCell.appendChild(deleteBtn);

  const viewChatsBtn = document.createElement('button');
  viewChatsBtn.textContent = 'View Chats';
  actionsCell.appendChild(viewChatsBtn);

  row.appendChild(actionsCell);

  return row;
}

if(myContactsNavBtn) {
    myContactsNavBtn.addEventListener("click", ()=> {
        if(tableDiv && chatsSectionDiv) {
            tableDiv.style.display = "block";
            chatsSectionDiv.style.display="none";
        }
    })
}

if(myChatsNavBtn) {
    myChatsNavBtn.addEventListener("click", ()=> {
        if(tableDiv && chatsSectionDiv) {
            tableDiv.style.display = "none";
            chatsSectionDiv.style.display="block";
        }
    })
}

function tableBody(contacts:ContactDetails[]) {
    const tableBody = document.querySelector('#contactTable tbody');
    if (tableBody) {
        contacts.forEach(contact => {
          const row = createContactRow(contact);
          tableBody.appendChild(row);
        });
    }
}
