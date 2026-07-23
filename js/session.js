// =====================================================
// Hidex Session Manager
// =====================================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// Wait until Firebase Auth is ready
export function requireUser(callback){

    onAuthStateChanged(auth, async(firebaseUser)=>{

        if(!firebaseUser){

            localStorage.clear();

            location.href="index.html";

            return;

        }

        try{

            const userSnap = await getDoc(
                doc(db,"users",firebaseUser.uid)
            );

            if(!userSnap.exists()){

                alert("User account not found.");

                return;

            }

            const user = userSnap.data();

            localStorage.setItem(
                "hidexUser",
                JSON.stringify(user)
            );

            callback(user);

        }

        catch(error){

            console.error(error);

            alert("Unable to load your account.");

        }

    });

}