// =====================================================
// Hidex Users.js
// Part 1 - Authentication & Initialization
// =====================================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =====================================================
// Variables
// =====================================================

let currentUser = null;

let allUsers = [];

let unsubscribeUsers = null;


// =====================================================
// Elements
// =====================================================

const userList = document.getElementById("userList");

const searchBox = document.getElementById("search");


// =====================================================
// Wait For Authentication
// =====================================================

onAuthStateChanged(auth, async(firebaseUser)=>{

    if(!firebaseUser){

        localStorage.clear();

        location.href = "index.html";

        return;

    }

    try{

        const userSnap = await getDoc(

            doc(
                db,
                "users",
                firebaseUser.uid
            )

        );

        if(!userSnap.exists()){

            alert("User profile not found.");

            location.href = "index.html";

            return;

        }

        currentUser = userSnap.data();

        localStorage.setItem(

            "hidexUser",

            JSON.stringify(currentUser)

        );

        initializeUsers();

    }

    catch(error){

        console.error(
            "Initialization failed:",
            error
        );

        userList.innerHTML = `

            <div class="user-card">

                <h3>

                    Unable to load users

                </h3>

            </div>

        `;

    }

});


// =====================================================
// Initialize
// =====================================================

function initializeUsers(){

    loadUsers();

}


// =====================================================
// Load Users
// =====================================================

function loadUsers(){

    if(!userList){
        return;
    }

    if(unsubscribeUsers){

        unsubscribeUsers();

        unsubscribeUsers = null;

    }

    userList.innerHTML = `

        <div class="user-card">

            <h3>

                Loading users...

            </h3>

        </div>

    `;

    const usersQuery = query(

        collection(
            db,
            "users"
        ),

        orderBy(
            "username"
        )

    );

    unsubscribeUsers = onSnapshot(

        usersQuery,

        (snapshot)=>{

            allUsers = [];

            snapshot.forEach((userDoc)=>{

                const user = userDoc.data();

                if(user.uid !== currentUser.uid){

                    allUsers.push(user);

                }

            });

            displayUsers(allUsers);

        },

        (error)=>{

            console.error(
                "Users listener failed:",
                error
            );

            userList.innerHTML = `

                <div class="user-card">

                    <h3>

                        Unable to load users

                    </h3>

                    <p>

                        ${error.message}

                    </p>

                </div>

            `;

        }

    );

}

// =====================================================
// Part 2 - Display, Search & Chat
// =====================================================


// ------------------------------
// Display Users
// ------------------------------

function displayUsers(users){

    if(!userList){
        return;
    }

    if(users.length === 0){

        userList.innerHTML = `

            <div class="user-card">

                <h3>No users found</h3>

            </div>

        `;

        return;

    }

    let html = "";

    users.forEach((user)=>{

        let lastSeen = "";

        if(!user.online && user.lastSeen){

            try{

                lastSeen =
                "Last seen: " +
                user.lastSeen
                .toDate()
                .toLocaleString();

            }catch(e){

                lastSeen = "";

            }

        }

        html += `

            <div class="user-card">

                <img

                    src="${user.profileImage || "images/default.png"}"

                    class="user-image"

                    onerror="this.src='images/default.png'"

                >

                <h3>

                    ${user.username || "Unknown User"}

                </h3>

                <p>

                    ${user.hidexId || ""}

                </p>

                <p>

                    ${user.online ? "🟢 Online" : "⚪ Offline"}

                </p>

                <p>

                    ${lastSeen}

                </p>

                <button

                    class="message-user"

                    data-id="${user.uid}"

                    data-name="${user.username}"

                >

                    Message

                </button>

            </div>

        `;

    });

    userList.innerHTML = html;

    attachButtons();

}



// ------------------------------
// Message Buttons
// ------------------------------

function attachButtons(){

    document

    .querySelectorAll(".message-user")

    .forEach((button)=>{

        button.onclick = ()=>{

            localStorage.setItem(

                "chatFriendId",

                button.dataset.id

            );

            localStorage.setItem(

                "chatFriend",

                button.dataset.name

            );

            location.href="chat.html";

        };

    });

}



// ------------------------------
// Search
// ------------------------------

if(searchBox){

    searchBox.addEventListener(

        "input",

        ()=>{

            const text =

            searchBox.value

            .trim()

            .toLowerCase();

            if(text === ""){

                displayUsers(allUsers);

                return;

            }

            const filtered =

            allUsers.filter((user)=>{

                return (

                    (user.username || "")

                    .toLowerCase()

                    .includes(text)

                    ||

                    (user.hidexId || "")

                    .toLowerCase()

                    .includes(text)

                );

            });

            displayUsers(filtered);

        }

    );

}



// ------------------------------
// Cleanup
// ------------------------------

window.addEventListener(

    "beforeunload",

    ()=>{

        if(unsubscribeUsers){

            unsubscribeUsers();

        }

    }

);



// ------------------------------
// Manual Refresh
// ------------------------------

window.refreshUsers = ()=>{

    loadUsers();

};



// ------------------------------
// Session Check
// ------------------------------

window.checkUsersSession = ()=>{

    if(!auth.currentUser){

        location.href="index.html";

        return false;

    }

    return true;

};



// ------------------------------
// Ready
// ------------------------------

console.log("Hidex Users Ready");