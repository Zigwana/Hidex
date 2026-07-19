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



let email =

document
.getElementById("email")
.value
.trim();




let password =

document
.getElementById("password")
.value;




let message =

document
.getElementById("message");






if(email==="" || password===""){


message.innerHTML =
"Enter email and password";


return;


}






try{



// Login Firebase


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
"Profile not found";


return;


}







let user =

userDoc.data();







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








// Save session


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

"Wrong email or password";



}



};