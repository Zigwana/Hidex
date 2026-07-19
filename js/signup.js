// Hidex Signup


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



const usernameInput =

document.getElementById("username");



const emailInput =

document.getElementById("email");



const passwordInput =

document.getElementById("password");



const message =

document.getElementById("message");








let username =

usernameInput.value.trim();



let email =

emailInput.value.trim();



let password =

passwordInput.value;








if(

username === "" ||

email === "" ||

password === ""

){



message.innerHTML =

"Fill all fields";



return;


}







// Loading state


signupBtn.disabled = true;


signupBtn.innerHTML =

"Creating account...";


message.innerHTML="";









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





// Clear entered data


usernameInput.value="";

emailInput.value="";

passwordInput.value="";





}






finally{



signupBtn.disabled=false;


signupBtn.innerHTML="Sign Up";



}



};