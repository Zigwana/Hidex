// Hidex Chat.js


import {db} from "./firebase.js";


import {

collection,
addDoc,
query,
orderBy,
onSnapshot,
serverTimestamp,
setDoc,
doc,
getDoc

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";





let currentUser =

JSON.parse(

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






// Show friend name

document

.getElementById("friendName")

.innerHTML = friendName || "Chat";









// Create unique chat ID

let ids = [

currentUser.uid,

friendId

];



ids.sort();



let chatId = ids.join("_");




console.log("Current user:", currentUser);

console.log("Friend ID:", friendId);

console.log("Chat ID:", chatId);









const messagesBox =

document.getElementById("messages");







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


console.log("Messages found:", snapshot.size);



messagesBox.innerHTML="";






if(snapshot.empty){


messagesBox.innerHTML =

"<p>No messages yet</p>";


return;


}







snapshot.forEach((item)=>{


let msg = item.data();



console.log("Message:",msg);





let bubble =

msg.senderId === currentUser.uid

?

"sent"

:

"received";







let time="";



if(msg.time){


time =

msg.time.toDate()

.toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit"

});


}








messagesBox.innerHTML += `


<div class="message ${bubble}">


<p>

${msg.text}

</p>


<small>

${time}

${bubble==="sent" ? " ✓✓" : ""}

</small>


</div>


`;



});





messagesBox.scrollTop =

messagesBox.scrollHeight;



});











// Send message


async function sendMessage(){



let input =

document.getElementById("message");



let text =

input.value.trim();






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






// Save conversation


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







input.value="";



}









// Button send


document

.getElementById("send")

.onclick = sendMessage;








// Enter send


document

.getElementById("message")

.addEventListener(

"keydown",

(e)=>{


if(e.key==="Enter"){


sendMessage();


}


}

);