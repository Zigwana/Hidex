import {db} from "./firebase.js";


import {

collection,
query,
where,
getDocs,
addDoc,
doc,
setDoc,
updateDoc

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



let currentUser =
JSON.parse(localStorage.getItem("hidexUser"));



if(!currentUser){

location.href="index.html";

}



const searchInput =
document.getElementById("search");


const searchResult =
document.getElementById("searchResult");


const requestsBox =
document.getElementById("requests");


const friendsBox =
document.getElementById("friends");





// SEARCH USERS

document
.getElementById("searchBtn")
.onclick = async()=>{


let value =
searchInput.value.trim();



if(!value)return;



let users=[];



let usernameQuery =
query(

collection(db,"hidex_users"),

where("username","==",value)

);



let idQuery =
query(

collection(db,"hidex_users"),

where("hidexId","==",value)

);



let a=await getDocs(usernameQuery);

let b=await getDocs(idQuery);



a.forEach(x=>users.push(x.data()));

b.forEach(x=>users.push(x.data()));



if(users.length===0){

searchResult.innerHTML="User not found";

return;

}



let user=users[0];



searchResult.innerHTML=

`

<p>

<b>${user.username}</b>

<br>

${user.hidexId}

</p>


<button id="sendRequest">

Send Request

</button>

`;





document
.getElementById("sendRequest")
.onclick=async()=>{


await addDoc(

collection(db,"friend_requests"),

{

from:currentUser.uid,

to:user.uid,

fromName:currentUser.username,

status:"pending",

createdAt:new Date()

}

);



alert("Request sent");

};


};






// REQUESTS

async function loadRequests(){


let q=

query(

collection(db,"friend_requests"),

where("to","==",currentUser.uid),

where("status","==","pending")

);



let snap=await getDocs(q);



requestsBox.innerHTML="";



snap.forEach(item=>{


let data=item.data();



requestsBox.innerHTML +=


`

<p>

${data.fromName}


<button onclick="accept('${item.id}','${data.from}')">

Accept

</button>


</p>

`;

});


}




window.accept=async(id,friendId)=>{


await setDoc(

doc(

db,

"friends",

currentUser.uid+"_"+friendId

),

{

user1:currentUser.uid,

user2:friendId,

createdAt:new Date()

}

);



await setDoc(

doc(

db,

"friends",

friendId+"_"+currentUser.uid

),

{

user1:friendId,

user2:currentUser.uid,

createdAt:new Date()

}

);



await updateDoc(

doc(db,"friend_requests",id),

{

status:"accepted"

}

);



loadRequests();

loadFriends();


};







// FRIEND LIST

async function loadFriends(){


let q=

query(

collection(db,"friends"),

where("user1","==",currentUser.uid)

);



let snap=await getDocs(q);



friendsBox.innerHTML="";



for(let item of snap.docs){


let friendId=item.data().user2;



let userQuery=

query(

collection(db,"hidex_users"),

where("uid","==",friendId)

);



let users=

await getDocs(userQuery);



users.forEach(friend=>{


let data=friend.data();



friendsBox.innerHTML +=


`

<p>

<b>${data.username}</b>


<br>


${data.hidexId}



<button onclick="openChat('${data.uid}','${data.username}')">

Chat

</button>


</p>


`;



});


}



}






window.openChat=(id,name)=>{


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





loadRequests();

loadFriends();