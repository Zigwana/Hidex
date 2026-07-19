import {db} from "./firebase.js";


import {

collection,
getDocs,
doc,
setDoc

}

from

"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";





const button =

document.getElementById("start");



const result =

document.getElementById("result");







button.onclick = async()=>{



try{



let oldUsers =

await getDocs(

collection(

db,

"hidex_users"

)

);






let count = 0;





for(let old of oldUsers.docs){



let user = old.data();






await setDoc(

doc(

db,

"users",

old.id

),

{


uid:old.id,


username:user.username || "",


email:user.email || "",


hidexId:user.hidexId || 
("HX" + Date.now()),


profileImage:user.profileImage || "",


online:false,


lastSeen:null



}



);





count++;




}







result.innerHTML =

"Migration complete: " + count + " users";



}

catch(error){


result.innerHTML = error.message;


}



};