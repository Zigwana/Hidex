// Hidex Home.js


import {auth,db} from "./firebase.js";


import {

signOut

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";



import {

doc,
collection,
query,
where,
onSnapshot,
updateDoc,
serverTimestamp,
getDocs

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";





let user = JSON.parse(

localStorage.getItem("hidexUser")

);





if(!user){

location.href="index.html";

}






// Elements


const profile =

document.getElementById("profile");



const notifications =

document.getElementById("notifications");



const groupsBox =

document.getElementById("groups");



const logoutBtn =

document.getElementById("logout");








// Show profile


if(profile){


profile.innerHTML = `



<img

src="${user.profileImage || 'images/default.png'}"

class="user-image"

onerror="this.src='images/default.png'"

>



<h3>

${user.username}

</h3>



<p>

Hidex ID:

<br>

${user.hidexId}

</p>



`;



}








// Update online status


try{


await updateDoc(

doc(

db,

"users",

user.uid

),

{

online:true,

lastSeen:serverTimestamp()

}

);


}

catch(error){


console.log(

"Online status error:",

error

);


}










// Load Hidex Groups


async function loadGroups(){


if(!groupsBox){

return;

}



groupsBox.innerHTML="";



try{



const snap =

await getDocs(

collection(

db,

"groups"

)

);





if(snap.empty){


groupsBox.innerHTML =

"No groups available";


return;


}







snap.forEach((item)=>{



let group =
item.data();





groupsBox.innerHTML += `



<div class="user-card">



<img

src="${group.image || 'images/default.png'}"

class="user-image"

onerror="this.src='images/default.png'"

>



<h3>

${group.name}

</h3>



<p>

${group.description || ""}

</p>



<p>

Members:
${group.members?.length || 0}

</p>



<button onclick="openGroup('${item.id}')">

Open Group

</button>



</div>



`;



});



}

catch(error){



console.log(
"Groups loading error:",
error
);



groupsBox.innerHTML =
"Failed to load groups";


}



}





window.openGroup=function(id){



localStorage.setItem(

"selectedGroup",

id

);



location.href="group-view.html";


};





loadGroups();









// Notifications


if(notifications){



const notificationQuery = query(

collection(

db,

"notifications"

),

where(

"userId",

"==",

user.uid

),

where(

"read",

"==",

false

)

);







onSnapshot(

notificationQuery,

(snapshot)=>{


notifications.innerHTML="";





if(snapshot.empty){


notifications.innerHTML=

"No new messages";


return;


}







snapshot.forEach((item)=>{


let data=item.data();





notifications.innerHTML += `



<div class="user-card">


<h3>

${data.senderName || "User"}

</h3>



<p>

${data.message || ""}

</p>



<button class="reply-btn">

Reply

</button>



</div>


`;







let button =

notifications.lastElementChild

.querySelector(".reply-btn");




button.onclick=()=>{



localStorage.setItem(

"chatFriendId",

data.chatFriendId

);



localStorage.setItem(

"chatFriend",

data.chatFriend

);



updateDoc(

doc(

db,

"notifications",

item.id

),

{

read:true

}

);



location.href="chat.html";



};





});



}

);



}









// Logout


if(logoutBtn){



logoutBtn.onclick = async()=>{



try{


await updateDoc(

doc(

db,

"users",

user.uid

),

{

online:false,

lastSeen:serverTimestamp()

}

);



}

catch(error){


console.log(error);


}





await signOut(auth);



localStorage.removeItem(

"hidexUser"

);



location.href="index.html";



};


}