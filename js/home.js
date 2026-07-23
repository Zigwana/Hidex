// =====================================================
// Hidex Home.js
// Part 1 - Imports, Authentication, Profile & Presence
// =====================================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    collection,
    query,
    where,
    onSnapshot,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =====================================================
// Global Variables
// =====================================================

let currentUser = null;

let homeStarted = false;

let groupsListener = null;

let notificationsListener = null;

let lastPresence = null;


// =====================================================
// Elements
// =====================================================

const profile =
document.getElementById("profile");

const logoutBtn =
document.getElementById("logout");

const groupsBox =
document.getElementById("groups");

const notifications =
document.getElementById("notifications");


// =====================================================
// Escape HTML
// =====================================================

function escapeHtml(text){

    if(text===null || text===undefined){

        return "";

    }

    return String(text)

        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


// =====================================================
// Authentication
// =====================================================

onAuthStateChanged(

    auth,

    async(firebaseUser)=>{

        if(!firebaseUser){

            localStorage.clear();

            location.replace("index.html");

            return;

        }

        if(homeStarted){

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

                await signOut(auth);

                location.replace("index.html");

                return;

            }

            currentUser = {

                uid:firebaseUser.uid,

                ...userSnap.data()

            };

            // Prevent suspended users
            if(currentUser.status==="suspended"){

                alert(

                    "Your Hidex account has been suspended."

                );

                await signOut(auth);

                location.replace("index.html");

                return;

            }

            localStorage.setItem(

                "hidexUser",

                JSON.stringify(currentUser)

            );

            homeStarted = true;

            console.log("Home Started");

            await updatePresence(true);

            loadProfile();

            startGroups();

            startNotifications();

            registerEvents();

        }

        catch(error){

            console.error(error);

            alert(

                "Unable to load Hidex."

            );

        }

    }

);


// =====================================================
// Load Profile
// =====================================================

function loadProfile(){

    if(!profile){

        return;

    }

    profile.innerHTML = `

<div class="profile-card">

<img

src="${currentUser.profileImage || "images/default.png"}"

class="user-image"

onerror="this.src='images/default.png'"

>

<h3>

${escapeHtml(currentUser.username)}

</h3>

<p>

${escapeHtml(currentUser.hidexId)}

</p>

</div>

`;

}


// =====================================================
// Presence
// =====================================================

async function updatePresence(isOnline){

    if(!currentUser){

        return;

    }

    // Prevent unnecessary Firestore writes
    if(lastPresence===isOnline){

        return;

    }

    lastPresence=isOnline;

    try{

        await updateDoc(

            doc(

                db,

                "users",

                currentUser.uid

            ),

            {

                online:isOnline,

                lastSeen:serverTimestamp()

            }

        );

    }

    catch(error){

        console.error(

            "Presence:",

            error

        );

    }

}

console.log("Home Part 1 Ready");


// =====================================================
// Hidex Home.js
// Part 2 - Groups
// =====================================================


// =====================================================
// Start Groups Listener
// =====================================================

function startGroups(){

    if(!groupsBox){

        return;

    }

    // Remove previous listener
    if(groupsListener){

        groupsListener();

        groupsListener = null;

    }

    groupsBox.innerHTML = `

<div class="user-card">

<h3>

Loading groups...

</h3>

</div>

`;

    const groupsQuery = query(

        collection(
            db,
            "groups"
        ),

        orderBy(
            "createdAt",
            "desc"
        )

    );

    groupsListener = onSnapshot(

        groupsQuery,

        (snapshot)=>{

            if(snapshot.empty){

                groupsBox.innerHTML = `

<div class="user-card">

<h3>

No groups available.

</h3>

</div>

`;

                return;

            }

            let html = "";

            snapshot.forEach((groupDoc)=>{

                const group = groupDoc.data();

                // Only show groups the user belongs to
                if(

                    Array.isArray(group.members)

                    &&

                    !group.members.includes(currentUser.uid)

                ){

                    return;

                }

                const memberCount =

                    Array.isArray(group.members)

                    ?

                    group.members.length

                    :

                    0;

                html += `

<div class="user-card">

<img

src="${group.image || "images/default.png"}"

class="user-image"

onerror="this.src='images/default.png'"

>

<h3>

${escapeHtml(group.name || "Unnamed Group")}

</h3>

<p>

${escapeHtml(group.description || "")}

</p>

<p>

${memberCount}

Member${memberCount===1?"":"s"}

</p>

<button

class="group-btn"

data-id="${groupDoc.id}"

>

Open Group

</button>

</div>

`;

            });

            if(html===""){

                groupsBox.innerHTML = `

<div class="user-card">

<h3>

You haven't joined any groups yet.

</h3>

</div>

`;

                return;

            }

            groupsBox.innerHTML = html;

            attachGroupButtons();

        },

        (error)=>{

            console.error(

                "Groups:",

                error

            );

            groupsBox.innerHTML = `

<div class="user-card">

Unable to load groups.

</div>

`;

        }

    );

}


// =====================================================
// Attach Buttons
// =====================================================

function attachGroupButtons(){

    document

    .querySelectorAll(".group-btn")

    .forEach((button)=>{

        button.onclick = ()=>{

            openGroup(

                button.dataset.id

            );

        };

    });

}


// =====================================================
// Open Group
// =====================================================

function openGroup(groupId){

    if(!groupId){

        return;

    }

    localStorage.setItem(

        "selectedGroup",

        groupId

    );

    const overlay =

    document.getElementById(

        "group-view-overlay"

    );

    if(overlay){

        overlay.style.display = "flex";

    }

    document.dispatchEvent(

        new CustomEvent(

            "open-group",

            {

                detail:{

                    groupId:groupId

                }

            }

        )

    );

}


// =====================================================
// Close Overlay
// =====================================================

window.closeGroupOverlay = function(){

    const overlay =

    document.getElementById(

        "group-view-overlay"

    );

    if(overlay){

        overlay.style.display = "none";

    }

};


// =====================================================
// Refresh Groups
// =====================================================

window.refreshGroups = function(){

    startGroups();

};

console.log("Home Part 2 Ready");

// =====================================================
// Hidex Home.js
// Part 3 - Notifications
// =====================================================


// =====================================================
// Start Notifications
// =====================================================

function startNotifications(){

    if(!notifications){

        return;

    }

    if(!currentUser){

        return;

    }

    // Remove previous listener
    if(notificationsListener){

        notificationsListener();

        notificationsListener = null;

    }

    notifications.innerHTML = `

<div class="user-card">

<h3>

Loading notifications...

</h3>

</div>

`;

    const notificationQuery = query(

        collection(
            db,
            "notifications"
        ),

        where(
            "userId",
            "==",
            currentUser.uid
        ),

        where(
            "read",
            "==",
            false
        ),

        orderBy(
            "createdAt",
            "desc"
        )

    );

    notificationsListener = onSnapshot(

        notificationQuery,

        (snapshot)=>{

            if(snapshot.empty){

                notifications.innerHTML = `

<div class="user-card">

<h3>

No new notifications

</h3>

</div>

`;

                return;

            }

            let html = "";

            snapshot.forEach((item)=>{

                const data = item.data();

                html += `

<div class="user-card">

<h3>

${escapeHtml(data.senderName || "Unknown User")}

</h3>

<p>

${escapeHtml(data.message || "")}

</p>

<button

class="reply-btn"

data-id="${item.id}"

data-friend="${data.chatFriendId || ""}"

data-name="${escapeHtml(data.chatFriend || "")}"

>

Reply

</button>

</div>

`;

            });

            notifications.innerHTML = html;

            attachReplyButtons();

        },

        (error)=>{

            console.error(

                "Notifications:",

                error

            );

            notifications.innerHTML = `

<div class="user-card">

Unable to load notifications.

</div>

`;

        }

    );

}


// =====================================================
// Reply Buttons
// =====================================================

function attachReplyButtons(){

    document

    .querySelectorAll(".reply-btn")

    .forEach((button)=>{

        button.onclick = async()=>{

            button.disabled = true;

            localStorage.setItem(

                "chatFriendId",

                button.dataset.friend

            );

            localStorage.setItem(

                "chatFriend",

                button.dataset.name

            );

            try{

                await updateDoc(

                    doc(

                        db,

                        "notifications",

                        button.dataset.id

                    ),

                    {

                        read:true

                    }

                );

            }

            catch(error){

                console.error(

                    "Notification Update:",

                    error

                );

            }

            location.href = "chat.html";

        };

    });

}


// =====================================================
// Refresh Notifications
// =====================================================

window.refreshNotifications = function(){

    startNotifications();

};

console.log("Home Part 3 Ready");

// =====================================================
// Hidex Home.js
// Part 4 - Logout, Events, Cleanup & Helpers
// =====================================================


// =====================================================
// Logout
// =====================================================

async function logout(){

    try{

        await updatePresence(false);

    }

    catch(error){

        console.error(error);

    }

    // Stop Firestore listeners

    if(groupsListener){

        groupsListener();

        groupsListener = null;

    }

    if(notificationsListener){

        notificationsListener();

        notificationsListener = null;

    }

    try{

        await signOut(auth);

    }

    catch(error){

        console.error(error);

    }

    localStorage.clear();

    location.replace("index.html");

}


// =====================================================
// Logout Button
// =====================================================

if(logoutBtn){

    logoutBtn.onclick = async(event)=>{

        event.preventDefault();

        logout();

    };

}


// =====================================================
// Register Events
// =====================================================

function registerEvents(){

    window.addEventListener(

        "focus",

        ()=>{

            updatePresence(true);

        }

    );

    window.addEventListener(

        "blur",

        ()=>{

            updatePresence(false);

        }

    );

    document.addEventListener(

        "visibilitychange",

        ()=>{

            if(document.hidden){

                updatePresence(false);

            }

            else{

                updatePresence(true);

            }

        }

    );

}


// =====================================================
// Session Helper
// =====================================================

window.checkSession = function(){

    return auth.currentUser !== null;

};


// =====================================================
// Default Image
// =====================================================

window.defaultImage = function(image){

    image.src = "images/default.png";

};


// =====================================================
// Cleanup
// =====================================================

function cleanup(){

    updatePresence(false);

    if(groupsListener){

        groupsListener();

        groupsListener = null;

    }

    if(notificationsListener){

        notificationsListener();

        notificationsListener = null;

    }

}


window.addEventListener(

    "beforeunload",

    cleanup

);

window.addEventListener(

    "pagehide",

    cleanup

);


// =====================================================
// Back/Forward Cache Support
// =====================================================

window.addEventListener(

    "pageshow",

    ()=>{

        if(auth.currentUser){

            updatePresence(true);

        }

    }

);


// =====================================================
// Manual Refresh
// =====================================================

window.refreshHome = function(){

    startGroups();

    startNotifications();

};


// =====================================================
// Debug
// =====================================================

console.log("================================");

console.log("Hidex Home Ready");

console.log("User:",currentUser);

console.log("================================");