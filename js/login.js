// Hidex Login


import {auth, db} from "./firebase.js";


import {

signInWithEmailAndPassword

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


import {

doc,
getDoc,
updateDoc,
serverTimestamp

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";







const loginBtn =

document.getElementById("loginBtn");







loginBtn.onclick = async()=>{



const emailInput =

document.getElementById("email");



const passwordInput =

document.getElementById("password");



const message =

document.getElementById("message");





let email =

emailInput.value.trim();



let password =

passwordInput.value;







if(email==="" || password===""){


message.innerHTML =

"Enter email and password";


return;


}






// Loading state


loginBtn.disabled = true;


loginBtn.innerHTML =

"Logging in...";


message.innerHTML = "";









try{



// Firebase login


let result =

await signInWithEmailAndPassword(

auth,

email,

password

);







let uid =

result.user.uid;







// Get profile


let userDoc =

await getDoc(

doc(

db,

"users",

uid

)

);








if(!userDoc.exists()){



message.innerHTML =

"Account profile not found";


emailInput.value="";

passwordInput.value="";


return;


}







let user = userDoc.data();







// Update online status


await updateDoc(

doc(

db,

"users",

uid

),

{


online:true,


lastSeen:

serverTimestamp()



}

);









// Save user session


localStorage.setItem(

"hidexUser",

JSON.stringify({

uid:user.uid,

username:user.username,

email:user.email,

hidexId:user.hidexId,

profileImage:user.profileImage || ""

})

);








location.href="home.html";







}

catch(error){





message.innerHTML =

"Account not found or wrong password";





emailInput.value="";

passwordInput.value="";





}





finally{



loginBtn.disabled=false;


loginBtn.innerHTML="Login";



}



};