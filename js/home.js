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
serverTimestamp

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";





let user =

JSON.parse(

localStorage.getItem("hidexUser")

);





if(!user){

location.href="index.html";

}





const profile =

document.getElementById("profile");


const notifications =

document.getElementById("notifications");






// Show profile


profile.innerHTML = `



<img

src="${user.profileImage || 'images/default.png'}"

class="user-image"


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









// Online status


await updateDoc(

doc(

db,

"users",

user.uid

),

{

online:true,

lastSeen:

serverTimestamp()

}

);









// Load unread messages


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


notifications.innerHTML =

"No new messages";


return;


}






snapshot.forEach((item)=>{



let data = item.data();





notifications.innerHTML += `



<div class="user-card">



<h3>

${data.senderName}

</h3>



<p>

${data.message}

</p>



<button onclick="openChat(
'${data.chatFriendId}',
'${data.chatFriend}',
'${item.id}'
)">
Reply
</button>



</div>



`;



});



}

);











// Open chat


window.openChat=function(

id,

name,

notificationId

){



localStorage.setItem(

"chatFriendId",

id

);



localStorage.setItem(

"chatFriend",

name

);





// Mark notification read


updateDoc(

doc(

db,

"notifications",

notificationId

),

{

read:true

}

);






location.href="chat.html";



};








// Logout


document

.getElementById("logout")

.onclick = async()=>{



await updateDoc(

doc(

db,

"users",

user.uid

),

{

online:false,

lastSeen:

serverTimestamp()

}

);





await signOut(auth);





localStorage.removeItem(

"hidexUser"

);





location.href="index.html";


};