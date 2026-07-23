// =====================================================
// Hidex Global.js
// Part 1/4
// Authentication & Initialization
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
    addDoc,
    serverTimestamp,
    doc,
    deleteDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =====================================================
// Globals
// =====================================================

let currentUser = null;

let unsubscribeMessages = null;

let initialized = false;


// =====================================================
// Elements
// =====================================================

const messagesBox =
document.getElementById("messages");

const messageInput =
document.getElementById("message");

const sendButton =
document.getElementById("send");


// =====================================================
// Check Required Elements
// =====================================================

if(
    !messagesBox ||
    !messageInput ||
    !sendButton
){

    console.error(
        "Global chat elements missing."
    );

}


// =====================================================
// Wait For Authentication
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

            initializeGlobalChat();

        }

        catch(error){

            console.error(

                "Authentication failed:",

                error

            );

            alert(

                "Unable to load Global Chat."

            );

        }

    }

);


// =====================================================
// Initialize
// =====================================================

function initializeGlobalChat(){

    messagesBox.innerHTML = `

        <p>

            Loading global chat...

        </p>

    `;

    registerEvents();

    loadMessages();

    console.log(

        "Global Chat Ready"

    );

}


// =====================================================
// Register Events
// =====================================================

function registerEvents(){

    sendButton.onclick = ()=>{

        sendMessage();

    };

    messageInput.addEventListener(

        "keydown",

        (event)=>{

            if(event.key==="Enter"){

                event.preventDefault();

                sendMessage();

            }

        }

    );

}

console.log("Global Part 1 Ready");

// =====================================================
// Hidex Global.js
// Part 2/4
// Real-time Messages
// =====================================================


// =====================================================
// Load Messages
// =====================================================

function loadMessages(){

    if(unsubscribeMessages){

        unsubscribeMessages();

        unsubscribeMessages = null;

    }

    const chatQuery = query(

        collection(
            db,
            "globalChat"
        ),

        orderBy(
            "time",
            "asc"
        )

    );

    unsubscribeMessages = onSnapshot(

        chatQuery,

        (snapshot)=>{

            if(snapshot.empty){

                messagesBox.innerHTML = `

                    <p>

                        No messages yet.

                        Start the conversation.

                    </p>

                `;

                return;

            }

            const shouldScroll =

                messagesBox.scrollHeight
                -
                messagesBox.scrollTop
                -
                messagesBox.clientHeight

                <

                120;

            let html = "";

            snapshot.forEach((messageDoc)=>{

                const msg = messageDoc.data();

                const mine =

                    msg.senderId ===
                    currentUser.uid;

                let time = "";

                if(msg.time){

                    try{

                        time =

                        msg.time

                        .toDate()

                        .toLocaleTimeString([],{

                            hour:"2-digit",

                            minute:"2-digit"

                        });

                    }

                    catch{

                        time = "";

                    }

                }

                html += `

<div class="message ${mine ? "sent" : "received"}">

    <div class="message-text">

        ${escapeHtml(msg.text || "")}

    </div>

    <div class="message-footer">

        <small>

            ${escapeHtml(

                msg.sender ||

                "Unknown User"

            )}

        </small>

        <span class="message-time">

            ${time}

        </span>

        ${

            mine

            ?

            `

<button

class="delete-global-message"

data-id="${messageDoc.id}"

>

Delete

</button>

`

            :

            ""

        }

    </div>

</div>

`;

            });

            messagesBox.innerHTML = html;

            if(shouldScroll){

                messagesBox.scrollTop =

                messagesBox.scrollHeight;

            }

            attachDeleteButtons();

        },

        (error)=>{

            console.error(

                "Global Chat:",

                error

            );

            messagesBox.innerHTML = `

<p>

Unable to load messages.

</p>

`;

        }

    );

}


// =====================================================
// Delete Buttons
// =====================================================

function attachDeleteButtons(){

    document

    .querySelectorAll(

        ".delete-global-message"

    )

    .forEach((button)=>{

        button.onclick = ()=>{

            deleteMessage(

                button.dataset.id

            );

        };

    });

}


// =====================================================
// Scroll Helper
// =====================================================

function scrollToBottom(){

    messagesBox.scrollTop =

    messagesBox.scrollHeight;

}

console.log("Global Part 2 Ready");

// =====================================================
// Hidex Global.js
// Part 3/4
// Send & Delete Messages
// =====================================================


// =====================================================
// Send Message
// =====================================================

async function sendMessage(){

    if(!currentUser){

        return;

    }

    const text =

    messageInput.value.trim();

    if(text===""){

        return;

    }

    if(text.length>1000){

        alert(

            "Messages cannot exceed 1000 characters."

        );

        return;

    }

    sendButton.disabled = true;

    sendButton.textContent = "...";

    try{

        await addDoc(

            collection(

                db,

                "globalChat"

            ),

            {

                senderId:

                currentUser.uid,

                sender:

                currentUser.username ||

                "Unknown User",

                text:text,

                time:

                serverTimestamp()

            }

        );

        messageInput.value="";

        messageInput.focus();

    }

    catch(error){

        console.error(

            "Send Error:",

            error

        );

        alert(

            "Unable to send message.\n\n"

            +

            error.message

        );

    }

    finally{

        sendButton.disabled = false;

        sendButton.textContent = "➤";

    }

}


// =====================================================
// Delete Message
// =====================================================

async function deleteMessage(messageId){

    if(!messageId){

        return;

    }

    const answer = confirm(

        "Delete this message?"

    );

    if(!answer){

        return;

    }

    try{

        await deleteDoc(

            doc(

                db,

                "globalChat",

                messageId

            )

        );

    }

    catch(error){

        console.error(

            "Delete Error:",

            error

        );

        alert(

            "Unable to delete message.\n\n"

            +

            error.message

        );

    }

}


// =====================================================
// Manual Refresh
// =====================================================

window.refreshGlobalChat = ()=>{

    loadMessages();

};


// =====================================================
// Session Checker
// =====================================================

window.checkGlobalSession = ()=>{

    if(!auth.currentUser){

        location.href="index.html";

        return false;

    }

    return true;

};

console.log("Global Part 3 Ready");

// =====================================================
// Hidex Global.js
// Part 4/4
// Helpers, Cleanup & Ready
// =====================================================


// =====================================================
// Escape HTML
// =====================================================

function escapeHtml(text){

    return String(text)

        .replace(/&/g,"&amp;")

        .replace(/</g,"&lt;")

        .replace(/>/g,"&gt;")

        .replace(/"/g,"&quot;")

        .replace(/'/g,"&#039;");

}


// =====================================================
// Default Image
// =====================================================

window.defaultImage = (img)=>{

    img.src = "images/default.png";

};


// =====================================================
// Cleanup
// =====================================================

function cleanup(){

    if(unsubscribeMessages){

        unsubscribeMessages();

        unsubscribeMessages = null;

    }

}


// =====================================================
// Page Events
// =====================================================

window.addEventListener(

    "pagehide",

    cleanup

);


window.addEventListener(

    "beforeunload",

    cleanup

);


// =====================================================
// Visibility
// =====================================================

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(

            !document.hidden &&

            currentUser

        ){

            loadMessages();

        }

    }

);


// =====================================================
// Back Button
// =====================================================

window.goBack = ()=>{

    cleanup();

    history.back();

};


// =====================================================
// Ready
// =====================================================

console.log("================================");

console.log("Hidex Global Chat Ready");

console.log("Current User:", currentUser);

console.log("================================");