// =====================================================
// Hidex Signup.js
// Stable Version
// =====================================================

import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
}
from
"https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
}
from
"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =====================================================
// Elements
// =====================================================

const signupBtn =
document.getElementById("signupBtn");

const usernameInput =
document.getElementById("username");

const emailInput =
document.getElementById("email");

const passwordInput =
document.getElementById("password");

const message =
document.getElementById("message");


// =====================================================
// Generate Hidex ID
// =====================================================

function generateHidexId(){

    return "HX" +

    Math.floor(
        100000 +
        Math.random()*900000
    );

}


// =====================================================
// Signup
// =====================================================

async function signup(){

    if(signupBtn.disabled){
        return;
    }

    const username =
    usernameInput.value.trim();

    const email =
    emailInput.value.trim().toLowerCase();

    const password =
    passwordInput.value;

    if(
        username==="" ||
        email==="" ||
        password===""

    ){

        message.textContent =
        "Please fill in all fields.";

        return;

    }

    signupBtn.disabled=true;
    signupBtn.textContent="Creating account...";
    message.textContent="";

    try{

        // --------------------------
        // Create Firebase Account
        // --------------------------

        const credential =
        await createUserWithEmailAndPassword(

            auth,
            email,
            password

        );

        const uid =
        credential.user.uid;

        // --------------------------
        // User Data
        // --------------------------

        const userData={

            uid:uid,

            username:username,

            email:email,

            hidexId:generateHidexId(),

            profileImage:"",

            role:"user",

            online:true,

            lastSeen:serverTimestamp()

        };

        // --------------------------
        // Save Firestore Profile
        // --------------------------

        await setDoc(

            doc(db,"users",uid),

            userData

        );

        // --------------------------
        // Save Session
        // --------------------------

        localStorage.setItem(

            "hidexUser",

            JSON.stringify({

                uid:userData.uid,

                username:userData.username,

                email:userData.email,

                hidexId:userData.hidexId,

                profileImage:userData.profileImage,

                role:userData.role

            })

        );

        message.textContent=
        "Account created successfully.";

        // Small delay ensures Firestore sync
        await new Promise(resolve=>setTimeout(resolve,300));

        location.href="home.html";

    }

    catch(error){

        console.error("Signup Error:",error);

        switch(error.code){

            case "auth/email-already-in-use":

                message.textContent=
                "This email is already registered.";
                break;

            case "auth/invalid-email":

                message.textContent=
                "Invalid email address.";
                break;

            case "auth/weak-password":

                message.textContent=
                "Password must be at least 6 characters.";
                break;

            case "auth/network-request-failed":

                message.textContent=
                "Check your internet connection.";
                break;

            default:

                message.textContent=
                error.message;

        }

        passwordInput.value="";

    }

    finally{

        signupBtn.disabled=false;
        signupBtn.textContent="Sign Up";

    }

}


// =====================================================
// Events
// =====================================================

if(signupBtn){

    signupBtn.onclick=signup;

}

[
    usernameInput,
    emailInput,
    passwordInput
].forEach(input=>{

    input.addEventListener(

        "keydown",

        (event)=>{

            if(event.key==="Enter"){

                event.preventDefault();

                signup();

            }

        }

    );

});


// =====================================================
// Ready
// =====================================================

console.log("Hidex Signup Ready");