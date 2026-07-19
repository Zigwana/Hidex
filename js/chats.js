// Hidex Chats.js


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






const chatsQuery = query(

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








onSnapshot(chatsQuery, async(snapshot)=>{



console.log(

"Chats found:",

snapshot.size

);




chatList.innerHTML="";






if(snapshot.empty){


chatList.innerHTML =

"<p>No chats yet</p>";

return;


}







let chats=[];





snapshot.forEach((item)=>{


console.log(

"CHAT DATA:",

item.data()

);



chats.push({

id:item.id,

...item.data()

});


});







// Sort newest first


chats.sort((a,b)=>{


if(!a.updatedAt || !b.updatedAt){

return 0;

}



return (

b.updatedAt.seconds || 0

)

-

(

a.updatedAt.seconds || 0

);



});







for(let chat of chats){



let otherUser =

chat.users.find(

id => id !== currentUser.uid

);





if(!otherUser){

continue;

}






let name =

"Unknown User";





if(chat.names && chat.names[otherUser]){


name = chat.names[otherUser];


}






let image =

"";







// Try new users collection


let userDoc = await getDoc(

doc(

db,

"users",

otherUser

)

);






// Try old collection if not found


if(!userDoc.exists()){


userDoc = await getDoc(

doc(

db,

"hidex_users",

otherUser

)

);


}






if(userDoc.exists()){


let data = userDoc.data();


image =

data.profileImage ||

"";



}







chatList.innerHTML += `


<div class="chat-card">


<img

src="${image}"

class="user-image"

onerror="this.style.display='none'"

>



<div class="chat-info">


<h3>

${name}

</h3>



<p>

${chat.lastMessage || "No messages"}

</p>


</div>




<button class="open-chat">

Open

</button>



</div>


`;







let buttons =

document.querySelectorAll(".open-chat");



buttons[buttons.length-1]

.onclick = ()=>{


localStorage.setItem(

"chatFriendId",

otherUser

);



localStorage.setItem(

"chatFriend",

name

);



location.href="chat.html";


};



}





});