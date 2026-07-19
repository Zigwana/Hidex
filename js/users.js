import {db} from "./firebase.js";


import {

collection,
getDocs

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






const userList =

document.getElementById("userList");


const searchBox =

document.getElementById("search");



let allUsers=[];








async function loadUsers(){



let snapshot =

await getDocs(

collection(

db,

"users"

)

);






allUsers=[];





snapshot.forEach((doc)=>{


let user = doc.data();



if(user.uid !== currentUser.uid){


allUsers.push(user);


}



});






displayUsers(allUsers);



}









function displayUsers(users){



userList.innerHTML="";






users.forEach((user)=>{



let lastSeen="";





if(!user.online && user.lastSeen){


let date =

user.lastSeen.toDate();



lastSeen =

"Last seen: " +

date.toLocaleString();



}







userList.innerHTML += `



<div class="user-card">



<img

src="${user.profileImage || 'images/default.png'}"

class="user-image"

>




<h3>

${user.username}

</h3>



<p>

${user.hidexId}

</p>




<p>

${user.online ? "🟢 Online" : "⚪ Offline"}

</p>



<p>

${lastSeen}

</p>





<button onclick="openChat(

'${user.uid}',

'${user.username}'

)">

Message

</button>



</div>



`;



});





if(users.length===0){


userList.innerHTML =
"No users found";


}



}








searchBox.oninput = ()=>{



let text =

searchBox.value

.toLowerCase()

.trim();






let filtered =

allUsers.filter(user=>


user.username

.toLowerCase()

.includes(text)



||



user.hidexId

.toLowerCase()

.includes(text)



);





displayUsers(filtered);



};






loadUsers();







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