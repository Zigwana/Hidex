import {db} from "./firebase.js";


import {

doc,
getDoc,
updateDoc

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







const profileView =

document.getElementById("profileView");



const imageUrl =

document.getElementById("imageUrl");



const message =

document.getElementById("message");








async function loadProfile(){



let userDoc =

await getDoc(

doc(

db,

"users",

user.uid

)

);





if(userDoc.exists()){


let data =

userDoc.data();





profileView.innerHTML = `



<img

src="${data.profileImage || 'images/default.png'}"

class="user-image"



>



<h3>

${data.username}

</h3>



<p>

Hidex ID:

<br>

${data.hidexId}

</p>



`;





imageUrl.value =

data.profileImage || "";



}



}






loadProfile();









document

.getElementById("saveProfile")

.onclick = async()=>{



let url =

imageUrl.value.trim();






await updateDoc(

doc(

db,

"users",

user.uid

),

{


profileImage:url



}

);







user.profileImage = url;



localStorage.setItem(

"hidexUser",

JSON.stringify(user)

);







message.innerHTML =

"Profile updated";





loadProfile();



};