// Hidex Private Chat.js


import {db} from "./firebase.js";


import {

collection,
addDoc,
query,
orderBy,
onSnapshot,
serverTimestamp,
setDoc,
doc

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";





let currentUser = JSON.parse(

localStorage.getItem("hidexUser")

);





if(!currentUser){

location.href="index.html";

}





let friendId =

localStorage.getItem("chatFriendId");



let friendName =

localStorage.getItem("chatFriend");






if(!friendId){

location.href="users.html";

}






const friendTitle =

document.getElementById("friendName");



if(friendTitle){

friendTitle.innerHTML = friendName || "Chat";

}






// Create same chat ID for both users


let ids = [

currentUser.uid,

friendId

];



ids.sort();



let chatId = ids.join("_");





console.log("Chat ID:",chatId);








const messagesBox =

document.getElementById("messages");



const messageInput =

document.getElementById("message");



const sendButton =

document.getElementById("send");









// Load messages


const messageQuery = query(

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







onSnapshot(messageQuery,(snapshot)=>{


messagesBox.innerHTML="";





if(snapshot.empty){


messagesBox.innerHTML=

"<p>No messages yet</p>";


return;


}







snapshot.forEach((item)=>{


let msg=item.data();





let type =

msg.senderId === currentUser.uid

?

"sent"

:

"received";







messagesBox.innerHTML += `


<div class="message ${type}">


<p>

${msg.text}

</p>


<small>

${msg.sender}

</small>



</div>


`;



});






messagesBox.scrollTop =

messagesBox.scrollHeight;



});











// Send message


async function sendMessage(){



let text =

messageInput.value.trim();





if(text===""){

return;

}







await addDoc(

collection(

db,

"chats",

chatId,

"messages"

),

{


sender:

currentUser.username,


senderId:

currentUser.uid,


text:text,


time:

serverTimestamp()



}

);






// create/update conversation


await setDoc(

doc(

db,

"conversations",

chatId

),

{


users:[

currentUser.uid,

friendId

],



names:{


[currentUser.uid]:

currentUser.username,


[friendId]:

friendName


},



lastMessage:text,


updatedAt:

serverTimestamp()



},


{

merge:true

}

);







// CLEAR INPUT


messageInput.value="";


messageInput.focus();



}








// Send button


if(sendButton){


sendButton.onclick = sendMessage;


}







// Enter key send


if(messageInput){



messageInput.addEventListener(

"keydown",

(e)=>{


if(e.key==="Enter"){


sendMessage();


}


}

);



}