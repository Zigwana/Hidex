import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ----------------------------
// Current User
// ----------------------------

const user = JSON.parse(localStorage.getItem("hidexUser"));

if (!user) {
    location.href = "index.html";
}

// ----------------------------
// Elements
// ----------------------------

const profileView = document.getElementById("profileView");
const imageUrl = document.getElementById("imageUrl");
const saveBtn = document.getElementById("saveProfile");
const message = document.getElementById("message");

// ----------------------------
// Escape HTML
// ----------------------------

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

// ----------------------------
// Load Profile
// ----------------------------

async function loadProfile() {

    try {

        profileView.innerHTML = "<p>Loading profile...</p>";

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            profileView.innerHTML = "<p>User not found.</p>";
            return;

        }

        const data = userSnap.data();

        const username = escapeHtml(data.username || "Unknown User");
        const hidexId = escapeHtml(data.hidexId || "Not Set");

        const profileImage =
            data.profileImage && data.profileImage.trim() !== ""
                ? data.profileImage
                : "images/default.png";

        profileView.innerHTML = `
            <div class="profile-preview">

                <div class="profile-avatar">
                    <img
                        src="${profileImage}"
                        alt="Profile Picture"
                        class="user-image"
                        onerror="this.src='images/default.png'">
                </div>

                <h2>${username}</h2>

                <p class="profile-id">
                    <strong>Hidex ID</strong><br>
                    ${hidexId}
                </p>

            </div>
        `;

        imageUrl.value = data.profileImage || "";

    } catch (error) {

        console.error(error);

        profileView.innerHTML =
            "<p>Failed to load profile.</p>";

    }

}

// ----------------------------
// Save Profile
// ----------------------------

saveBtn.addEventListener("click", async () => {

    const url = imageUrl.value.trim();

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    message.textContent = "";

    try {

        await updateDoc(
            doc(db, "users", user.uid),
            {
                profileImage: url
            }
        );

        user.profileImage = url;

        localStorage.setItem(
            "hidexUser",
            JSON.stringify(user)
        );

        message.style.color = "#2E7D32";
        message.textContent = "Profile updated successfully.";

        await loadProfile();

    } catch (error) {

        console.error(error);

        message.style.color = "#a31621";
        message.textContent = "Failed to update profile.";

    }

    saveBtn.disabled = false;
    saveBtn.textContent = "Save Profile";

});

// ----------------------------
// Initial Load
// ----------------------------

loadProfile();