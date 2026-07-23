// =====================================================
// Hidex Auth Check.js
// Fixed Version
// =====================================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =====================================================
// Authentication Listener
// =====================================================

onAuthStateChanged(auth, async (firebaseUser) => {

    // ----------------------------
    // Not Signed In
    // ----------------------------

    if (!firebaseUser) {

        localStorage.removeItem("hidexUser");

        const page =
            location.pathname.split("/").pop();

        if (page !== "index.html" && page !== "") {

            location.replace("index.html");

        }

        return;

    }

    try {

        const userRef = doc(
            db,
            "users",
            firebaseUser.uid
        );

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            console.error(
                "User profile not found."
            );

            localStorage.removeItem(
                "hidexUser"
            );

            location.replace("index.html");

            return;

        }

        const data = userSnap.data();

        const session = {

            uid: firebaseUser.uid,

            username:
                data.username || "Unknown User",

            email:
                data.email ||
                firebaseUser.email ||
                "",

            hidexId:
                data.hidexId || "",

            profileImage:
                data.profileImage || "",

            role:
                data.role || "user"

        };

        localStorage.setItem(
            "hidexUser",
            JSON.stringify(session)
        );

        console.log(
            "Authenticated:",
            session.username
        );

    }

    catch (error) {

        console.error(
            "Authentication failed:",
            error
        );

    }

});


// =====================================================
// Helper
// =====================================================

window.getCurrentUser = function () {

    try {

        const user =
            JSON.parse(
                localStorage.getItem(
                    "hidexUser"
                )
            );

        return user || null;

    }

    catch {

        return null;

    }

};


// =====================================================
// Ready
// =====================================================

console.log("Hidex Auth Ready");