// Hidex Global Chat


import {db} from "./firebase.js";


import {

collection,
addDoc,
query,
orderBy,
onSnapshot,
serverTimestamp

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





const messagesBox =

document.getElementById("messages");





const messageInput =

document.getElementById("message");





const sendButton =

document.getElementById("send");







// Global chat collection


const globalMessages = collection(

db,

"globalChat"

);







// Load messages


const chatQuery = query(

globalMessages,

orderBy(

"time",

"asc"

)

);







onSnapshot(chatQuery,(snapshot)=>{


messagesBox.innerHTML="";





if(snapshot.empty){


messagesBox.innerHTML =

"<p>No messages yet. Start the conversation.</p>";

return;


}







snapshot.forEach((item)=>{


let msg = item.data();





let type =

msg.senderId === currentUser.uid

?

"sent"

:

"received";






messagesBox.innerHTML += `


<div class="message ${type}">


<p>

<b>

${msg.sender}

</b>

<br>

${msg.text}

</p>



<small>

${msg.time ? msg.time.toDate().toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit"

}) : ""}

</small>


</div>


`;



});





messagesBox.scrollTop =

messagesBox.scrollHeight;



});









// Send global message


async function sendMessage(){



let text =

messageInput.value.trim();





if(text === ""){

return;

}






await addDoc(

globalMessages,

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






messageInput.value="";



}








sendButton.onclick = sendMessage;






messageInput.addEventListener(

"keydown",

(e)=>{


if(e.key === "Enter"){


sendMessage();


}


}

);