// Hidex Global Chat


import {db} from "./firebase.js";


import {

collection,
addDoc,
query,
orderBy,
onSnapshot,
serverTimestamp,
doc,
deleteDoc

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";





let currentUser = JSON.parse(

localStorage.getItem("hidexUser")

);





if(!currentUser){

location.href="index.html";

}







const messagesBox =

document.getElementById("messages");

if(messagesBox){

messagesBox.innerHTML =

"<p>Loading global chat...</p>";

}

const messageInput =

document.getElementById("message");



const sendButton =

document.getElementById("send");







if(!messagesBox || !messageInput || !sendButton){

console.log("Global chat elements missing");

}








const globalMessages = collection(

db,

"globalChat"

);









// Load global messages


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

${msg.time ? 

msg.time.toDate().toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit"

})

:

""

}

</small>







${

msg.senderId === currentUser.uid

?

`

<button

class="delete-global-message"

data-id="${item.id}"

>

Delete

</button>

`

:

""

}



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





if(text===""){

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


messageInput.focus();



}








if(sendButton){


sendButton.onclick = sendMessage;


}







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









// Confirm delete


async function confirmDelete(messagePath){



let answer = confirm(

"Delete this message?"

);





if(!answer){

return;

}





await deleteDoc(messagePath);



}









// Delete global message


document.addEventListener(

"click",

async(e)=>{



if(

e.target.classList.contains(

"delete-global-message"

)

){



let messageId =

e.target.dataset.id;





await confirmDelete(

doc(

db,

"globalChat",

messageId

)

);



}



}

);