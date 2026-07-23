// =====================================================
// Hidex Group View v2
// Part 1/4
// Authentication & Initialization
// =====================================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =====================================================
// Global Variables
// =====================================================

let currentUser = null;

let currentGroup = null;

let currentGroupId = null;

let unsubscribeMessages = null;

let initialized = false;


// =====================================================
// Elements
// =====================================================

const overlay =
document.getElementById("group-view-overlay");

const groupImage =
document.getElementById("groupImage");

const groupName =
document.getElementById("groupName");

const groupCount =
document.getElementById("groupCount");

const groupDescription =
document.getElementById("groupDescription");

const membersBox =
document.getElementById("members");

const chatBox =
document.getElementById("chat");

const toggleMembers =
document.getElementById("toggleMembers");

const messageInput =
document.getElementById("messageText");

const sendButton =
document.getElementById("sendMessage");


// =====================================================
// Open Group Event
// =====================================================

document.addEventListener(

    "open-group",

    async(event)=>{

        if(!event.detail) return;

        currentGroupId =
        event.detail.groupId;

        if(!currentGroupId) return;

        overlay.style.display = "flex";

        if(currentUser){

            await loadGroup();

        }

    }

);


// =====================================================
// Authentication
// =====================================================

onAuthStateChanged(

    auth,

    async(user)=>{

        if(!user) return;

        if(initialized) return;

        try{

            const snap =
            await getDoc(

                doc(
                    db,
                    "users",
                    user.uid
                )

            );

            if(!snap.exists()){

                console.error(
                    "User profile missing."
                );

                return;

            }

            currentUser = {

                uid:user.uid,

                ...snap.data()

            };

            initialized = true;

            console.log(
                "Group View Ready"
            );

            const savedGroup =
            localStorage.getItem(
                "selectedGroup"
            );

            if(savedGroup){

                currentGroupId =
                savedGroup;

                loadGroup();

            }

        }

        catch(error){

            console.error(
                error
            );

        }

    }

);

console.log(
    "Group View Part 1 Loaded"
);

// =====================================================
// Part 2/4
// Load Group
// =====================================================

async function loadGroup(){

    if(!currentGroupId) return;

    if(!currentUser) return;

    try{

        const groupSnap = await getDoc(

            doc(
                db,
                "groups",
                currentGroupId
            )

        );

        if(!groupSnap.exists()){

            alert("Group not found.");

            return;

        }

        currentGroup = {

            id:currentGroupId,

            ...groupSnap.data()

        };

        const members =

            Array.isArray(currentGroup.members)

            ?

            currentGroup.members

            :

            [];

        const joined =

            members.includes(currentUser.uid);

        // ==========================
        // Header
        // ==========================

        groupImage.src =

            currentGroup.image ||

            "images/default.png";

        groupName.textContent =

            currentGroup.name ||

            "Unnamed Group";

        groupDescription.textContent =

            currentGroup.description ||

            "No description";

        groupCount.textContent =

            members.length +

            " Members";

        // ==========================
        // Members
        // ==========================

        loadMembers();

        membersBox.style.display="none";

        toggleMembers.textContent=

        `Members (${members.length}) ▼`;

        toggleMembers.onclick=()=>{

            const opened=

            membersBox.style.display==="block";

            membersBox.style.display=

            opened

            ?

            "none"

            :

            "block";

            toggleMembers.textContent=

            opened

            ?

            `Members (${members.length}) ▼`

            :

            `Members (${members.length}) ▲`;

        };

        // ==========================
        // Chat
        // ==========================

        if(joined){

            openChat();

        }

        else{

            chatBox.innerHTML=`

                <div class="user-card">

                    <h3>

                        Join this group

                    </h3>

                    <p>

                        Join to participate
                        in the conversation.

                    </p>

                    <button id="joinGroup">

                        Join Group

                    </button>

                </div>

            `;

            const button=

            document.getElementById("joinGroup");

            button.onclick=sendJoinRequest;

        }

    }

    catch(error){

        console.error(

            "Load Group Error:",

            error

        );

        alert(

            "Unable to load group."

        );

    }

}


// =====================================================
// Send Join Request
// =====================================================

async function sendJoinRequest(){

    try{

        await addDoc(

            collection(

                db,

                "groupRequests"

            ),

            {

                groupId:currentGroupId,

                userId:currentUser.uid,

                username:currentUser.username,

                status:"pending",

                createdAt:serverTimestamp()

            }

        );

        alert(

            "Join request sent."

        );

    }

    catch(error){

        console.error(error);

        alert(

            "Unable to send request."

        );

    }

}

console.log(
    "Group View Part 2 Loaded"
);

// =====================================================
// Part 3/4
// Chat
// =====================================================


// -----------------------------------------------------
// Open Chat
// -----------------------------------------------------

function openChat(){

    chatBox.innerHTML = `

        <div
            id="groupMessages"
            class="group-chat"
        >

            Loading messages...

        </div>

    `;

    if(sendButton){

        sendButton.onclick = sendMessage;

    }

    if(messageInput){

        messageInput.onkeydown = (event)=>{

            if(event.key==="Enter"){

                event.preventDefault();

                sendMessage();

            }

        };

    }

    loadMessages();

}



// -----------------------------------------------------
// Send Message
// -----------------------------------------------------

async function sendMessage(){

    const text =
    messageInput.value.trim();

    if(text===""){

        return;

    }

    sendButton.disabled=true;

    try{

        await addDoc(

            collection(

                db,

                "groups",

                currentGroupId,

                "messages"

            ),

            {

                sender:currentUser.uid,

                senderName:currentUser.username,

                text:text,

                createdAt:serverTimestamp()

            }

        );

        messageInput.value="";

        messageInput.focus();

    }

    catch(error){

        console.error(error);

        alert(

            "Unable to send message."

        );

    }

    finally{

        sendButton.disabled=false;

    }

}



// -----------------------------------------------------
// Load Messages
// -----------------------------------------------------

function loadMessages(){

    const messagesBox =

    document.getElementById(

        "groupMessages"

    );

    if(!messagesBox){

        return;

    }

    if(unsubscribeMessages){

        unsubscribeMessages();

    }

    const messagesQuery = query(

        collection(

            db,

            "groups",

            currentGroupId,

            "messages"

        ),

        orderBy(

            "createdAt",

            "asc"

        )

    );

    unsubscribeMessages = onSnapshot(

        messagesQuery,

        (snapshot)=>{

            if(snapshot.empty){

                messagesBox.innerHTML =

                `

                <div class="user-card">

                    No messages yet.

                </div>

                `;

                return;

            }

            let html="";

            snapshot.forEach((docSnap)=>{

                const message =

                docSnap.data();

                const mine =

                message.sender===

                currentUser.uid;

                html += `

<div class="message ${mine ? "sent" : "received"}">

<p>

${escapeHtml(message.text)}

</p>

<small>

${escapeHtml(message.senderName)}

</small>

</div>

`;

            });

            messagesBox.innerHTML = html;

            messagesBox.scrollTop =

            messagesBox.scrollHeight;

        },

        (error)=>{

            console.error(error);

            messagesBox.innerHTML=

            `

            <div class="user-card">

                Unable to load messages.

            </div>

            `;

        }

    );

}

console.log("Group View Part 3 Loaded");

// =====================================================
// Part 4/4
// Members, Overlay & Cleanup
// =====================================================

import {
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// -----------------------------------------------------
// Load Members
// -----------------------------------------------------

async function loadMembers(){

    if(!membersBox){

        return;

    }

    membersBox.innerHTML="";

    if(!currentGroup){

        return;

    }

    const members =

    Array.isArray(currentGroup.members)

    ?

    currentGroup.members

    :

    [];

    if(members.length===0){

        membersBox.innerHTML=`

        <div class="user-card">

            No members yet.

        </div>

        `;

        return;

    }

    let html="";

    for(const uid of members){

        try{

            const snap = await getDoc(

                doc(
                    db,
                    "users",
                    uid
                )

            );

            if(!snap.exists()){

                continue;

            }

            const user = snap.data();

            html += `

            <div class="user-card">

                <img

                    src="${
                        user.photo ||
                        "images/default.png"
                    }"

                    class="user-image"

                    onerror="this.src='images/default.png'"

                >

                <h3>

                    ${escapeHtml(
                        user.username ||
                        "Unknown User"
                    )}

                </h3>

            </div>

            `;

        }

        catch(error){

            console.error(error);

        }

    }

    membersBox.innerHTML = html;

}



// -----------------------------------------------------
// Escape HTML
// -----------------------------------------------------

function escapeHtml(text){

    return String(text)

    .replace(/&/g,"&amp;")

    .replace(/</g,"&lt;")

    .replace(/>/g,"&gt;")

    .replace(/"/g,"&quot;")

    .replace(/'/g,"&#039;");

}



// -----------------------------------------------------
// Close Overlay
// -----------------------------------------------------

window.closeGroupOverlay=function(){

    if(unsubscribeMessages){

        unsubscribeMessages();

        unsubscribeMessages=null;

    }

    overlay.style.display="none";

    chatBox.innerHTML="";

    membersBox.style.display="none";

    localStorage.removeItem(

        "selectedGroup"

    );

    currentGroup=null;

    currentGroupId=null;

};



// -----------------------------------------------------
// Refresh
// -----------------------------------------------------

window.refreshGroup=function(){

    if(currentGroupId){

        loadGroup();

    }

};

window.refreshGroupChat=function(){

    if(currentGroupId){

        loadMessages();

    }

};



// -----------------------------------------------------
// Session
// -----------------------------------------------------

window.checkGroupSession=function(){

    return !!auth.currentUser;

};



// -----------------------------------------------------
// Cleanup
// -----------------------------------------------------

function cleanup(){

    if(unsubscribeMessages){

        unsubscribeMessages();

        unsubscribeMessages=null;

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

console.log(
    "Group View Ready"
);