// =====================================================
// Hidex Friends.js
// Part 1/4
// Authentication & Initialization
// =====================================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
}
from
"https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    addDoc,
    doc,
    updateDoc,
    setDoc,
    getDoc,
    serverTimestamp
}
from
"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =====================================================
// Globals
// =====================================================

let currentUser = null;

let requestsListener = null;
let friendsListener = null;

let initialized = false;


// =====================================================
// Elements
// =====================================================

const searchInput =
document.getElementById("search");

const searchButton =
document.getElementById("searchBtn");

const searchResult =
document.getElementById("searchResult");

const requestsBox =
document.getElementById("requests");

const friendsBox =
document.getElementById("friends");


// =====================================================
// Authentication
// =====================================================

onAuthStateChanged(

    auth,

    async(firebaseUser)=>{

        if(!firebaseUser){

            localStorage.removeItem(
                "hidexUser"
            );

            location.href="index.html";

            return;

        }

        if(initialized){

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

                location.href="index.html";

                return;

            }

            currentUser = {

                uid:firebaseUser.uid,

                ...userSnap.data()

            };

            localStorage.setItem(

                "hidexUser",

                JSON.stringify(currentUser)

            );

            initialized = true;

            initializeFriends();

        }

        catch(error){

            console.error(error);

            alert(

                "Unable to load friends."

            );

        }

    }

);


// =====================================================
// Initialize
// =====================================================

function initializeFriends(){

    if(searchButton){

        searchButton.onclick =

        searchUsers;

    }

    if(searchInput){

        searchInput.addEventListener(

            "keydown",

            (event)=>{

                if(event.key==="Enter"){

                    event.preventDefault();

                    searchUsers();

                }

            }

        );

    }

    loadRequests();

    loadFriends();

    console.log(

        "Friends Ready"

    );

}

// =====================================================
// Hidex Friends.js
// Part 2/4
// Search Users & Send Friend Requests
// =====================================================


// =====================================================
// Search Users
// =====================================================

async function searchUsers(){

    const value =

    searchInput.value.trim();

    if(value===""){

        return;

    }

    searchResult.innerHTML =

    "<p>Searching...</p>";

    try{

        let foundUser = null;

        // Search username

        let usernameQuery = query(

            collection(
                db,
                "users"
            ),

            where(
                "username",
                "==",
                value
            )

        );

        let usernameSnap =

        await getDocs(

            usernameQuery

        );

        if(!usernameSnap.empty){

            foundUser = {

                uid:
                usernameSnap.docs[0].id,

                ...usernameSnap.docs[0].data()

            };

        }

        // Search Hidex ID

        if(!foundUser){

            let hidexQuery = query(

                collection(
                    db,
                    "users"
                ),

                where(
                    "hidexId",
                    "==",
                    value
                )

            );

            let hidexSnap =

            await getDocs(

                hidexQuery

            );

            if(!hidexSnap.empty){

                foundUser = {

                    uid:
                    hidexSnap.docs[0].id,

                    ...hidexSnap.docs[0].data()

                };

            }

        }

        if(!foundUser){

            searchResult.innerHTML =

            "<p>User not found.</p>";

            return;

        }

        if(foundUser.uid===currentUser.uid){

            searchResult.innerHTML = `

<div class="user-card">

    <h3>

        ${escapeHtml(foundUser.username)}

    </h3>

    <p>

        This is your account.

    </p>

</div>

`;

            return;

        }

        // Already friends?

        const friendSnap =

        await getDoc(

            doc(

                db,

                "friends",

                currentUser.uid +

                "_" +

                foundUser.uid

            )

        );

        if(friendSnap.exists()){

            searchResult.innerHTML = `

<div class="user-card">

    <h3>

        ${escapeHtml(foundUser.username)}

    </h3>

    <p>

        Already friends.

    </p>

</div>

`;

            return;

        }

        searchResult.innerHTML = `

<div class="user-card">

<img

src="${

foundUser.profileImage ||

"images/default.png"

}"

class="user-image"

onerror="this.src='images/default.png'"

>

<h3>

${escapeHtml(foundUser.username)}

</h3>

<p>

${escapeHtml(foundUser.hidexId)}

</p>

<button

id="sendFriendRequest"

>

Send Friend Request

</button>

</div>

`;

        document

        .getElementById(

            "sendFriendRequest"

        )

        .onclick = ()=>{

            sendFriendRequest(

                foundUser

            );

        };

    }

    catch(error){

        console.error(error);

        searchResult.innerHTML =

        "<p>Search failed.</p>";

    }

}


// =====================================================
// Send Friend Request
// =====================================================

async function sendFriendRequest(user){

    try{

        // Prevent duplicate requests

        const pending = query(

            collection(

                db,

                "friend_requests"

            ),

            where(

                "from",

                "==",

                currentUser.uid

            ),

            where(

                "to",

                "==",

                user.uid

            ),

            where(

                "status",

                "==",

                "pending"

            )

        );

        const pendingSnap =

        await getDocs(

            pending

        );

        if(!pendingSnap.empty){

            alert(

                "Friend request already sent."

            );

            return;

        }

        await addDoc(

            collection(

                db,

                "friend_requests"

            ),

            {

                from:

                currentUser.uid,

                to:

                user.uid,

                fromName:

                currentUser.username,

                fromImage:

                currentUser.profileImage ||

                "",

                status:

                "pending",

                createdAt:

                serverTimestamp()

            }

        );

        alert(

            "Friend request sent."

        );

    }

    catch(error){

        console.error(error);

        alert(

            "Unable to send request."

        );

    }

}


// =====================================================
// Escape HTML
// =====================================================

function escapeHtml(text){

    return String(text || "")

        .replace(/&/g,"&amp;")

        .replace(/</g,"&lt;")

        .replace(/>/g,"&gt;")

        .replace(/"/g,"&quot;")

        .replace(/'/g,"&#039;");

}

console.log("Friends Part 2 Ready");

// =====================================================
// Hidex Friends.js
// Part 3/4
// Friend Requests
// =====================================================


// =====================================================
// Load Friend Requests
// =====================================================

function loadRequests(){

    if(requestsListener){

        requestsListener();

        requestsListener = null;

    }

    requestsBox.innerHTML = `

        <p>

            Loading requests...

        </p>

    `;

    const requestsQuery = query(

        collection(
            db,
            "friend_requests"
        ),

        where(
            "to",
            "==",
            currentUser.uid
        ),

        where(
            "status",
            "==",
            "pending"
        )

    );

    requestsListener = onSnapshot(

        requestsQuery,

        (snapshot)=>{

            if(snapshot.empty){

                requestsBox.innerHTML = `

                    <p>

                        No friend requests.

                    </p>

                `;

                return;

            }

            let html = "";

            snapshot.forEach((request)=>{

                const data = request.data();

                html += `

<div class="user-card">

<img

src="${

data.fromImage ||

"images/default.png"

}"

class="user-image"

onerror="this.src='images/default.png'"

>

<h3>

${escapeHtml(

data.fromName ||

"Unknown User"

)}

</h3>

<div class="request-buttons">

<button

class="accept-request"

data-id="${request.id}"

data-user="${data.from}"

>

Accept

</button>

<button

class="decline-request"

data-id="${request.id}"

>

Decline

</button>

</div>

</div>

`;

            });

            requestsBox.innerHTML = html;

            attachRequestButtons();

        },

        (error)=>{

            console.error(

                error

            );

            requestsBox.innerHTML =

            "<p>Unable to load requests.</p>";

        }

    );

}


// =====================================================
// Attach Buttons
// =====================================================

function attachRequestButtons(){

    document

    .querySelectorAll(

        ".accept-request"

    )

    .forEach((button)=>{

        button.onclick = ()=>{

            acceptRequest(

                button.dataset.id,

                button.dataset.user

            );

        };

    });

    document

    .querySelectorAll(

        ".decline-request"

    )

    .forEach((button)=>{

        button.onclick = ()=>{

            declineRequest(

                button.dataset.id

            );

        };

    });

}


// =====================================================
// Accept Request
// =====================================================

async function acceptRequest(

    requestId,

    friendId

){

    try{

        await setDoc(

            doc(

                db,

                "friends",

                currentUser.uid +

                "_" +

                friendId

            ),

            {

                user1:

                currentUser.uid,

                user2:

                friendId,

                createdAt:

                serverTimestamp()

            }

        );

        await setDoc(

            doc(

                db,

                "friends",

                friendId +

                "_" +

                currentUser.uid

            ),

            {

                user1:

                friendId,

                user2:

                currentUser.uid,

                createdAt:

                serverTimestamp()

            }

        );

        await updateDoc(

            doc(

                db,

                "friend_requests",

                requestId

            ),

            {

                status:

                "accepted"

            }

        );

    }

    catch(error){

        console.error(error);

        alert(

            "Unable to accept request."

        );

    }

}


// =====================================================
// Decline Request
// =====================================================

async function declineRequest(

    requestId

){

    try{

        await updateDoc(

            doc(

                db,

                "friend_requests",

                requestId

            ),

            {

                status:

                "declined"

            }

        );

    }

    catch(error){

        console.error(error);

        alert(

            "Unable to decline request."

        );

    }

}

console.log("Friends Part 3 Ready");

// =====================================================
// Hidex Friends.js
// Part 4/4
// Friends List, Chat & Cleanup
// =====================================================


// =====================================================
// Load Friends
// =====================================================

function loadFriends(){

    if(friendsListener){

        friendsListener();

        friendsListener = null;

    }

    friendsBox.innerHTML = `

        <p>

            Loading friends...

        </p>

    `;

    const friendsQuery = query(

        collection(
            db,
            "friends"
        ),

        where(
            "user1",
            "==",
            currentUser.uid
        )

    );

    friendsListener = onSnapshot(

        friendsQuery,

        async(snapshot)=>{

            if(snapshot.empty){

                friendsBox.innerHTML = `

                    <p>

                        No friends yet.

                    </p>

                `;

                return;

            }

            let html = "";

            for(const item of snapshot.docs){

                const friendId =

                    item.data().user2;

                try{

                    const friendSnap =

                    await getDoc(

                        doc(

                            db,

                            "users",

                            friendId

                        )

                    );

                    if(!friendSnap.exists()){

                        continue;

                    }

                    const friend =

                    friendSnap.data();

                    html += `

<div class="user-card">

<img

src="${

friend.profileImage ||

"images/default.png"

}"

class="user-image"

onerror="this.src='images/default.png'"

>

<h3>

${escapeHtml(

friend.username ||

"Unknown User"

)}

</h3>

<p>

${escapeHtml(

friend.hidexId ||

""

)}

</p>

<button

class="chat-button"

data-id="${friendId}"

data-name="${friend.username}"

>

Chat

</button>

</div>

`;

                }

                catch(error){

                    console.error(error);

                }

            }

            friendsBox.innerHTML = html;

            attachChatButtons();

        },

        (error)=>{

            console.error(error);

            friendsBox.innerHTML =

            "<p>Unable to load friends.</p>";

        }

    );

}


// =====================================================
// Chat Buttons
// =====================================================

function attachChatButtons(){

    document

    .querySelectorAll(

        ".chat-button"

    )

    .forEach((button)=>{

        button.onclick = ()=>{

            openChat(

                button.dataset.id,

                button.dataset.name

            );

        };

    });

}


// =====================================================
// Open Chat
// =====================================================

function openChat(

    friendId,

    friendName

){

    localStorage.setItem(

        "chatFriendId",

        friendId

    );

    localStorage.setItem(

        "chatFriend",

        friendName

    );

    location.href =

    "chat.html";

}


// =====================================================
// Manual Refresh
// =====================================================

window.refreshFriends = ()=>{

    loadRequests();

    loadFriends();

};


// =====================================================
// Session Check
// =====================================================

window.checkFriendsSession = ()=>{

    if(!auth.currentUser){

        location.href="index.html";

        return false;

    }

    return true;

};


// =====================================================
// Cleanup
// =====================================================

function cleanup(){

    if(requestsListener){

        requestsListener();

        requestsListener = null;

    }

    if(friendsListener){

        friendsListener();

        friendsListener = null;

    }

}


window.addEventListener(

    "pagehide",

    cleanup

);


window.addEventListener(

    "beforeunload",

    cleanup

);


// =====================================================
// Visibility Refresh
// =====================================================

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(

            !document.hidden &&

            currentUser

        ){

            loadRequests();

            loadFriends();

        }

    }

);


// =====================================================
// Default Image
// =====================================================

window.defaultImage = (img)=>{

    img.src =

    "images/default.png";

};


// =====================================================
// Ready
// =====================================================

console.log("================================");

console.log("Hidex Friends Ready");

console.log(

    "Current User:",

    currentUser

);

console.log("================================");