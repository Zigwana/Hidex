import {db} from "./firebase.js";

import {

collection,
query,
where,
getDocs

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


let currentUser =
JSON.parse(
localStorage.getItem("hidexUser")
);



let friendsBox =
document.getElementById("friends");



async function loadFriends(){


let q =
query(

collection(db,"friends"),

where(
"user1",
"==",
currentUser.uid
)

);



let snap =
await getDocs(q);



friendsBox.innerHTML="";



for(let item of snap.docs){


let friendId =
item.data().user2;



let userQuery =
query(

collection(db,"hidex_users"),

where(
"uid",
"==",
friendId
)

);



let userSnap =
await getDocs(userQuery);



userSnap.forEach(user=>{


let data=user.data();



friendsBox.innerHTML +=

`

<p>

${data.username}

<button onclick="openChat('${data.uid}','${data.username}')">

Chat

</button>

</p>

`;



});


}


}



window.openChat =
(friendId,name)=>{


let ids =
[

currentUser.uid,

friendId

];


ids.sort();



let chatId =
ids.join("_");



localStorage.setItem(
"chatId",
chatId
);



localStorage.setItem(
"chatFriend",
name
);



window.location="chat.html";


};



loadFriends();