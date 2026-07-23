// =====================================================
// Hidex Login.js
// =====================================================

import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =====================================================
// Elements
// =====================================================

const loginBtn = document.getElementById("loginBtn");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const message = document.getElementById("message");


// =====================================================
// Login
// =====================================================

async function login(){

    const email = emailInput.value.trim();

    const password = passwordInput.value;

    if(email === "" || password === ""){

        message.textContent = "Enter your email and password.";

        return;

    }

    loginBtn.disabled = true;

    loginBtn.textContent = "Logging in...";

    message.textContent = "";

    try{

        // Firebase Authentication
        const result = await signInWithEmailAndPassword(

            auth,

            email,

            password

        );

        const uid = result.user.uid;

        // Load user profile
        const userSnap = await getDoc(

            doc(
                db,
                "users",
                uid
            )

        );

        if(!userSnap.exists()){

            throw new Error(
                "Profile not found."
            );

        }

        const user = userSnap.data();

        // Update presence
        await setDoc(

            doc(
                db,
                "users",
                uid
            ),

            {

                online:true,

                lastSeen:serverTimestamp()

            },

            {

                merge:true

            }

        );

        // Save session
        localStorage.setItem(

            "hidexUser",

            JSON.stringify({

                uid:user.uid,

                username:user.username,

                email:user.email,

                hidexId:user.hidexId,

                profileImage:user.profileImage || "",

                role:user.role || "user"

            })

        );

        location.href = "home.html";

    }

    catch(error){

        console.error(error);

        switch(error.code){

            case "auth/invalid-email":

                message.textContent = "Invalid email address.";

                break;

            case "auth/invalid-credential":

            case "auth/wrong-password":

            case "auth/user-not-found":

                message.textContent = "Incorrect email or password.";

                break;

            case "auth/too-many-requests":

                message.textContent =
                "Too many login attempts. Please try again later.";

                break;

            default:

                message.textContent =
                error.message || "Login failed.";

        }

        passwordInput.value = "";

    }

    finally{

        loginBtn.disabled = false;

        loginBtn.textContent = "Login";

    }

}


// =====================================================
// Events
// =====================================================

loginBtn.onclick = login;

passwordInput.addEventListener(

    "keydown",

    (event)=>{

        if(event.key === "Enter"){

            event.preventDefault();

            login();

        }

    }

);


// =====================================================
// Ready
// =====================================================

console.log("Hidex Login Ready");