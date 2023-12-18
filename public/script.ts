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
    firstName:string;
    lastName:string;
    email:string;
    phoneNo:number;
    token:string;
}

// Get elements with stricter types
const topNav: HTMLDivElement | null = document.getElementById("myTopnav") as HTMLDivElement | null;
const icon: HTMLElement | null = document.querySelector(".icon");
const closeSpans: NodeListOf<Element> = document.querySelectorAll(".close");
const modals: NodeListOf<ModalElement> = document.querySelectorAll(".modal");

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
    loginBtn.addEventListener("click", ()=> {
        if(loginDiv) {
            loginDiv.style.display="block";
        };
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
            console.log(formData);
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
        } else if (response.status === 200) {
            console.log("User Already Exits");
            alert("User with the same email ID already exists!");
        }
    } catch (error) {
        console.error(error);
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
            console.log(data);
            if(loginDiv) {
                loginDiv.style.display = "none";
            };
        };
    } catch(error) {
        console.error(error);
    }
}