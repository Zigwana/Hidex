import {db} from "./firebase.js";


import {

collection,
query,
where,
onSnapshot

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




let chatList =

document.getElementById("chatList");





let chatsQuery = query(

collection(

db,

"conversations"

),

where(

"users",

"array-contains",

currentUser.uid

)

);






onSnapshot(chatsQuery,(snapshot)=>{


chatList.innerHTML="";





if(snapshot.empty){


chatList.innerHTML=

"<p>No chats yet</p>";


return;


}






snapshot.forEach((doc)=>{


let chat = doc.data();



let otherUser;



if(chat.users[0] === currentUser.uid){

otherUser = chat.names[chat.users[1]];

}

else{

otherUser = chat.names[chat.users[0]];

}







chatList.innerHTML += `


<div class="chat-card">


<div class="chat-info">


<h3>

${otherUser}

</h3>


<p>

${chat.lastMessage || "No messages"}

</p>


</div>



<button onclick="openChat('${doc.id}','${otherUser}')">

Open

</button>


</div>


`;



});



});







window.openChat = function(id,name){



let ids = id.split("_");



let friendId =

ids[0] === currentUser.uid

?

ids[1]

:

ids[0];




localStorage.setItem(

"chatFriendId",

friendId

);



localStorage.setItem(

"chatFriend",

name

);



location.href="chat.html";


}