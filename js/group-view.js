import {db, auth} from "./firebase.js";


import {

doc,
getDoc,
collection,
addDoc,
serverTimestamp,
onSnapshot,
query,
orderBy

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


import {

onAuthStateChanged

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";




let user = null;


let groupId =
localStorage.getItem("selectedGroup");



if(!groupId){

location.href="home.html";

}





const groupBox =
document.getElementById("group");


const chatBox =
document.getElementById("chat");




onAuthStateChanged(auth,(currentUser)=>{


if(!currentUser){

location.href="index.html";

return;

}



user=currentUser;


loadGroup();


});









async function loadGroup(){



let snap =
await getDoc(

doc(db,"groups",groupId)

);



if(!snap.exists()){


groupBox.innerHTML =
"Group not found";


return;


}





let group =
snap.data();



let joined =
group.members?.includes(user.uid);






groupBox.innerHTML = `



<img

src="${group.image || 'images/default.png'}"

class="user-image"

>



<h2>

${group.name}

</h2>



<p>

${group.description || ""}

</p>



<p>

Members:
${group.members?.length || 0}

</p>




<button id="join">


${joined ? "Open Chat" : "Join Group"}


</button>



`;







document
.getElementById("join")
.onclick = async()=>{



if(joined){


openChat();


return;


}






await addDoc(

collection(db,"groupRequests"),

{


groupId:groupId,


userId:user.uid,


status:"pending",


createdAt:serverTimestamp()


}

);





alert("Join request sent");


};




}









function openChat(){



chatBox.innerHTML = `



<h3>

Group Chat

</h3>



<div id="messages">

Loading messages...

</div>




<input

id="messageText"

placeholder="Type a message..."

>



<button id="sendMessage">

Send

</button>



`;





document
.getElementById("sendMessage")
.onclick =
sendMessage;



loadMessages();



}









async function sendMessage(){



let input =
document.getElementById("messageText");



let text =
input.value.trim();





if(!text){

return;

}






await addDoc(

collection(

db,

"groups",

groupId,

"messages"

),


{


text:text,


sender:user.uid,


createdAt:serverTimestamp()



}

);






input.value="";



}









function loadMessages(){



let messagesBox =
document.getElementById("messages");




let q =
query(

collection(

db,

"groups",

groupId,

"messages"

),


orderBy(

"createdAt"

)

);






onSnapshot(q,async(snapshot)=>{



messagesBox.innerHTML="";






for(let item of snapshot.docs){



let message =
item.data();




let userSnap =
await getDoc(

doc(

db,

"users",

message.sender

)

);




let sender =
userSnap.exists()

?

userSnap.data()

:

{

username:"Unknown",

profileImage:"images/default.png"

};







messagesBox.innerHTML += `



<div class="message">



<img

src="${sender.profileImage || 'images/default.png'}"

class="user-image"

>



<b>

${sender.username || "User"}

</b>



<p>

${message.text}

</p>



</div>



`;



}



});



}