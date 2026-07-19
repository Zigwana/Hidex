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
deleteDoc,
getDoc

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







// Elements


const messagesBox =

document.getElementById("messages");



const messageInput =

document.getElementById("message");



const sendButton =

document.getElementById("send");



const friendTitle =

document.getElementById("friendName");



const friendImage =

document.getElementById("friendImage");







if(friendTitle){

friendTitle.textContent = friendName;

}







// Chat ID


let ids = [

currentUser.uid,

friendId

];


ids.sort();


let chatId = ids.join("_");









// Load friend image


if(friendImage){



let userDoc = await getDoc(

doc(

db,

"users",

friendId

)

);



if(userDoc.exists()){


friendImage.src =

userDoc.data().profileImage ||

"images/default.png";


}


}









// Profile image viewer


const imageViewer =

document.getElementById("imageViewer");



const fullImage =

document.getElementById("fullImage");




if(friendImage && imageViewer){



friendImage.onclick=()=>{


fullImage.src = friendImage.src;


imageViewer.style.display="flex";


};


}





if(imageViewer){


imageViewer.onclick=()=>{


imageViewer.style.display="none";


};


}









// Display messages


const messagesQuery = query(

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







onSnapshot(

messagesQuery,

(snapshot)=>{


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



${

msg.senderId === currentUser.uid

?

`

<button

class="message-menu"

data-id="${item.id}"

>

⋮

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



}


);











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






messageInput.value="";


messageInput.focus();



}








if(sendButton){


sendButton.onclick=

sendMessage;


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









// Delete message


document.addEventListener(

"click",

async(e)=>{



if(

e.target.classList.contains(

"delete-message"

)

){



let id =

e.target.dataset.id;





await deleteDoc(

doc(

db,

"chats",

chatId,

"messages",

id

)

);



}



}

);


let selectedMessage = null;


document.addEventListener(

"click",

async(e)=>{



if(e.target.classList.contains("message-menu")){


selectedMessage = e.target.dataset.id;



let confirmDelete = confirm(

"Delete this message?"

);



if(confirmDelete){



await deleteDoc(

doc(

db,

"chats",

chatId,

"messages",

selectedMessage

)

);



}



}



}

);