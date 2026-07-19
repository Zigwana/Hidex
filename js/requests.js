import {db} from "./firebase.js";


import {

collection,
query,
where,
getDocs,
doc,
setDoc

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



let currentUser =
JSON.parse(
localStorage.getItem("hidexUser")
);



let requestsBox =
document.getElementById("requests");


let friendsBox =
document.getElementById("friends");





async function loadRequests(){


let q =
query(

collection(db,"friend_requests"),

where(
"to",
"==",
currentUser.uid
),

where(
"status",
"==",
"pending"
)

);



let snap =
await getDocs(q);



requestsBox.innerHTML="";



snap.forEach(item=>{


let r=item.data();



requestsBox.innerHTML +=

`

<p>

${r.fromName}

<button onclick="accept('${item.id}','${r.from}')">

Accept

</button>

</p>

`;



});


}





window.accept = async(id,friendId)=>{


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



alert("Friend added");


loadRequests();


};





loadRequests();