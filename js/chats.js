import {db} from "./firebase.js";


import {

collection,
query,
where,
onSnapshot,
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





const chatList =

document.getElementById("chatList");








const q = query(

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









onSnapshot(q,async(snapshot)=>{


chatList.innerHTML="";





if(snapshot.empty){


chatList.innerHTML =
"No chats yet";


return;


}







let chats=[];





snapshot.forEach(doc=>{


chats.push({

id:doc.id,

...doc.data()

});



});








// newest first


chats.sort((a,b)=>{


if(!a.updatedAt || !b.updatedAt){

return 0;

}


return b.updatedAt.seconds -

a.updatedAt.seconds;


});









for(let chat of chats){



let otherUser =

chat.users.find(

id=>id !== currentUser.uid

);






let name =

chat.names[otherUser];





let image =

"images/default.png";





let userDoc =

await getDoc(

doc(

db,

"users",

otherUser

)

);



if(userDoc.exists()){


image =

userDoc.data().profileImage ||

image;


}






chatList.innerHTML += `



<div class="chat-card">



<img

src="${image}"

class="user-image"


>




<div class="chat-info">


<h3>

${name}

</h3>



<p>

${chat.lastMessage || ""}

</p>



</div>




<button onclick="openChat(

'${otherUser}',

'${name}'

)">

Open

</button>



</div>



`;



}



});









window.openChat=function(id,name){



localStorage.setItem(

"chatFriendId",

id

);



localStorage.setItem(

"chatFriend",

name

);




location.href="chat.html";


};