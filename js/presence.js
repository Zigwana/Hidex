import {db,auth} from "./firebase.js";


import {

doc,
updateDoc,
serverTimestamp

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


import {

onAuthStateChanged

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";







onAuthStateChanged(auth,async(user)=>{



if(!user){

return;

}






let userRef =

doc(

db,

"users",

user.uid

);







// Set online


await updateDoc(

userRef,

{


online:true,


lastSeen:

serverTimestamp()


}

);







// When page closes


window.addEventListener(

"beforeunload",

async()=>{


await updateDoc(

userRef,

{


online:false,


lastSeen:

serverTimestamp()


}

);



}

);



});