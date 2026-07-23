// =====================================================
// Hidex Firebase.js
// =====================================================

import {
    initializeApp,
    getApps,
    getApp
}
from
"https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getAuth
}
from
"https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    getFirestore
}
from
"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {

    apiKey: "AIzaSyAugA_Z6ujDv1QCT3PgrDfpPTI9G06Zbeo",

    authDomain: "hidex-5577e.firebaseapp.com",

    projectId: "hidex-5577e",

    storageBucket: "hidex-5577e.firebasestorage.app",

    messagingSenderId: "407768471644",

    appId: "1:407768471644:web:a6c4651d733bc0ae40ee99"

};

// Initialize only once
const app =

getApps().length

?

getApp()

:

initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

console.log("Firebase Ready");