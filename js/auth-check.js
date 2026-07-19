import {auth} from "./firebase.js";


import {

onAuthStateChanged

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";





onAuthStateChanged(auth,(user)=>{


if(user){


console.log(

"Logged in:",

user.uid

);



}

else{


console.log(

"No Firebase user"

);



}



});