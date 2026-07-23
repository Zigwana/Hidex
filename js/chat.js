// =====================================================
// Hidex Chat.js
// Part 1 - Authentication & Initialization
// =====================================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    setDoc,
    doc,
    deleteDoc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
// =====================================================
// Global Variables
// =====================================================

let currentUser = null;
let friendData = null;
let chatId = "";
let unsubscribeMessages = null;


// =====================================================
// Elements
// =====================================================

const messagesBox = document.getElementById("messages");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send");

const friendTitle = document.getElementById("friendName");
const friendImage = document.getElementById("friendImage");

const imageViewer = document.getElementById("imageViewer");
const fullImage = document.getElementById("fullImage");


// =====================================================
// Firebase Authentication
// =====================================================

onAuthStateChanged(auth, async(firebaseUser)=>{

    if(!firebaseUser){

        localStorage.removeItem("hidexUser");
        localStorage.removeItem("chatFriend");
        localStorage.removeItem("chatFriendId");

        location.href = "index.html";
        return;

    }

    try{

        const userSnap = await getDoc(
            doc(db,"users",firebaseUser.uid)
        );

        if(!userSnap.exists()){

            alert("Your account profile was not found.");

            location.href="index.html";
            return;

        }

        currentUser = {

            uid: firebaseUser.uid,

            username:
                userSnap.data().username || "",

            email:
                userSnap.data().email || "",

            hidexId:
                userSnap.data().hidexId || "",

            profileImage:
                userSnap.data().profileImage || "",

            ...userSnap.data()

        };

        localStorage.setItem(
            "hidexUser",
            JSON.stringify(currentUser)
        );

        await initializeChat();

    }

    catch(error){

    console.error("Chat initialization error:", error);

    alert(
        "Unable to start chat.\n\n" +
        error.message
    );

}

});


// =====================================================
// Initialize Chat
// =====================================================

async function initializeChat(){

    const friendId =
        localStorage.getItem("chatFriendId");

    if(!friendId){

        location.href = "users.html";
        return;

    }

    try{

        const friendSnap = await getDoc(
            doc(db,"users",friendId)
        );

        if(!friendSnap.exists()){

            alert("This user no longer exists.");

            location.href="users.html";
            return;

        }

        friendData = {

            uid: friendId,

            username:
                friendSnap.data().username || "Unknown User",

            profileImage:
                friendSnap.data().profileImage || "",

            ...friendSnap.data()

        };

    }

    catch(error){

        console.error(error);

        alert("Unable to load chat.");

        return;

    }

    if(friendTitle){

        friendTitle.textContent =
            friendData.username;

    }

    if(friendImage){

        friendImage.src =
            friendData.profileImage ||
            "images/default.png";

        friendImage.onerror = ()=>{

            friendImage.src =
                "images/default.png";

        };

    }

    const ids = [

        currentUser.uid,
        friendData.uid

    ];

    ids.sort();

    chatId = ids.join("_");

    setupImageViewer();

    loadMessages();

    updatePresence(true);

}

console.log("Hidex Chat Part 1 Ready");

// =====================================================
// Hidex Chat.js
// Part 2 - Image Viewer & Real-time Messages
// =====================================================


// -----------------------------------------------------
// Image Viewer
// -----------------------------------------------------

function setupImageViewer(){

    if(
        !friendImage ||
        !imageViewer ||
        !fullImage
    ){
        return;
    }

    friendImage.onclick = ()=>{

        fullImage.src = friendImage.src;

        imageViewer.style.display = "flex";

    };

    imageViewer.onclick = ()=>{

        imageViewer.style.display = "none";

    };

}


// -----------------------------------------------------
// Escape HTML
// -----------------------------------------------------

function escapeHtml(text){

    if(text===undefined || text===null){
        return "";
    }

    return String(text)

        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


// -----------------------------------------------------
// Format Time
// -----------------------------------------------------

function formatTime(timestamp){

    if(!timestamp){
        return "";
    }

    try{

        return timestamp
            .toDate()
            .toLocaleTimeString([],{

                hour:"2-digit",

                minute:"2-digit"

            });

    }

    catch{

        return "";

    }

}


// -----------------------------------------------------
// Load Messages
// -----------------------------------------------------

function loadMessages(){

    if(!messagesBox || !chatId){
        return;
    }

    if(unsubscribeMessages){

        unsubscribeMessages();
        unsubscribeMessages = null;

    }

    messagesBox.innerHTML =
    "<p>Loading chat...</p>";

    const q = query(

        collection(
            db,
            "chats",
            chatId,
            "messages"
        ),

        orderBy(
            "time",
            "asc"
        )

    );

    unsubscribeMessages = onSnapshot(

        q,

        (snapshot)=>{

            messagesBox.innerHTML = "";

            if(snapshot.empty){

                messagesBox.innerHTML =
                "<p>No messages yet</p>";

                return;

            }

            snapshot.forEach((messageDoc)=>{

                const msg = messageDoc.data();

                const mine =
                    msg.senderId === currentUser.uid;

                const senderName =
                    msg.sender ||
                    (mine
                        ? currentUser.username
                        : friendData.username) ||
                    "Unknown User";

                const time =
                    formatTime(msg.time);

                messagesBox.innerHTML += `

<div class="message ${mine ? "sent" : "received"}">

    <div class="message-text">

        ${escapeHtml(msg.text)}

    </div>

    <div class="message-footer">

        <span class="sender">

            ${escapeHtml(senderName)}

        </span>

        <span class="message-time">

            ${time}

        </span>

        ${
            mine
            ?

            `

<button
class="message-menu"
data-id="${messageDoc.id}">
⋮
</button>

`

            :

            ""

        }

    </div>

</div>

`;

            });

            scrollToBottom();

            attachMessageMenus();

        },

        (error)=>{

            console.error(
                "Message listener:",
                error
            );

            messagesBox.innerHTML =

            "<p>Unable to load messages.</p>";

        }

    );

}


// -----------------------------------------------------
// Attach Delete Menu
// -----------------------------------------------------

function attachMessageMenus(){

    document

    .querySelectorAll(".message-menu")

    .forEach((button)=>{

        button.onclick = ()=>{

            deleteMessage(

                button.dataset.id

            );

        };

    });

}


// -----------------------------------------------------
// Scroll To Bottom
// -----------------------------------------------------

function scrollToBottom(){

    if(messagesBox){

        messagesBox.scrollTop =

        messagesBox.scrollHeight;

    }

}

console.log("Hidex Chat Part 2 Ready");

// =====================================================
// Hidex Chat.js
// Part 3 - Send, Delete & Conversations
// =====================================================


// -----------------------------------------------------
// Send Message
// -----------------------------------------------------

async function sendMessage(){

    if(!currentUser){
        alert("User not loaded.");
        return;
    }

    if(!friendData){
        alert("Friend not loaded.");
        return;
    }

    if(!messageInput){
        return;
    }

    const text = messageInput.value.trim();

    if(text===""){
        return;
    }

    if(sendButton){
        sendButton.disabled = true;
    }

    try{

        // Always use Firestore values
        const senderId = currentUser.uid;

        const senderName =
            currentUser.username ||
            "Unknown User";

        const receiverName =
            friendData.username ||
            "Unknown User";


        // -----------------------------
        // Save Message
        // -----------------------------

        await addDoc(

            collection(
                db,
                "chats",
                chatId,
                "messages"
            ),

            {

                senderId: senderId,

                sender: senderName,

                text: text,

                time: serverTimestamp()

            }

        );


        // -----------------------------
        // Update Conversation
        // -----------------------------

        await setDoc(

            doc(
                db,
                "conversations",
                chatId
            ),

            {

                users:[
                    senderId,
                    friendData.uid
                ],

                names:{

                    [senderId]:
                    senderName,

                    [friendData.uid]:
                    receiverName

                },

                lastMessage:text,

                updatedAt:
                serverTimestamp()

            },

            {

                merge:true

            }

        );


        // -----------------------------
        // Create Notification
        // -----------------------------

        await addDoc(

            collection(
                db,
                "notifications"
            ),

            {

                userId:
                friendData.uid,

                senderName:
                senderName,

                chatFriendId:
                senderId,

                chatFriend:
                senderName,

                message:text,

                read:false,

                createdAt:
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

            "Unable to send message.\n\n" +

            error.message

        );

    }

    finally{

        if(sendButton){

            sendButton.disabled=false;

        }

    }

}



// -----------------------------------------------------
// Delete Message
// -----------------------------------------------------

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

                "chats",

                chatId,

                "messages",

                messageId

            )

        );

    }

    catch(error){

        console.error(error);

        alert(

            "Unable to delete message."

        );

    }

}



// -----------------------------------------------------
// Send Button
// -----------------------------------------------------

if(sendButton){

    sendButton.onclick = ()=>{

        sendMessage();

    };

}



// -----------------------------------------------------
// Enter Key
// -----------------------------------------------------

if(messageInput){

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

console.log("Hidex Chat Part 3 Ready");

// =====================================================
// Hidex Chat.js
// Part 4 - Presence, Cleanup & Helpers
// =====================================================


// -----------------------------------------------------
// Presence
// -----------------------------------------------------

let lastPresence = null;

async function updatePresence(isOnline){

    if(!currentUser){
        return;
    }

    // Prevent repeated writes
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
            "Presence Error:",
            error
        );

    }

}


// -----------------------------------------------------
// Presence Events
// -----------------------------------------------------

window.addEventListener(

    "focus",

    ()=>{

        updatePresence(true);

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

window.addEventListener(

    "pagehide",

    ()=>{

        updatePresence(false);

    }

);


// -----------------------------------------------------
// Refresh Chat
// -----------------------------------------------------

window.refreshChat=function(){

    if(chatId){

        loadMessages();

    }

};


// -----------------------------------------------------
// Session Check
// -----------------------------------------------------

window.checkChatSession=function(){

    if(!auth.currentUser){

        location.href="index.html";

        return false;

    }

    return true;

};


// -----------------------------------------------------
// Default Image
// -----------------------------------------------------

window.defaultImage=function(image){

    image.src="images/default.png";

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

    "beforeunload",

    cleanup

);

window.addEventListener(

    "pagehide",

    cleanup

);


// -----------------------------------------------------
// Auto Focus
// -----------------------------------------------------

window.addEventListener(

    "load",

    ()=>{

        if(messageInput){

            messageInput.focus();

        }

    }

);


// -----------------------------------------------------
// Debug
// -----------------------------------------------------

console.log("=================================");
console.log("Hidex Chat Ready");
console.log("Current User:",currentUser);
console.log("Friend:",friendData);
console.log("Chat ID:",chatId);
console.log("=================================");