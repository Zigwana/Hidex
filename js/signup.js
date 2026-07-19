import {auth, db} from "./firebase.js";


import {

createUserWithEmailAndPassword

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


import {

doc,
setDoc

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";






const signupBtn =

document.getElementById("signupBtn");



signupBtn.onclick = async()=>{



let username =

document
.getElementById("username")
.value
.trim();



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






if(

username === "" ||

email === "" ||

password === ""

){


message.innerHTML =
"Fill all fields";


return;


}






try{



// Create Firebase account


let result =

await createUserWithEmailAndPassword(

auth,

email,

password

);






let uid =

result.user.uid;








// Generate Hidex ID


let hidexId =

"HX" +

Math.floor(

100000 +

Math.random()*900000

);







// Save user profile


await setDoc(

doc(

db,

"users",

uid

),

{


uid:uid,


username:username,


email:email,


hidexId:hidexId,


profileImage:"",


online:true,


lastSeen:new Date()




}

);







// Save session


localStorage.setItem(

"hidexUser",

JSON.stringify({

uid:uid,

username:username,

email:email,

hidexId:hidexId,

profileImage:""

})

);








location.href="home.html";



}

catch(error){



message.innerHTML =

error.message;



}



};