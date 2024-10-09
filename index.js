// Firebase configuration and initialization (Start)
const firebaseConfig = {
    apiKey: "AIzaSyDnOPUB_2u93a9XyIa3ifLyc7Pq8gD0JzE",
    authDomain: "kiwidiabetics.firebaseapp.com",
    projectId: "kiwidiabetics",
    storageBucket: "kiwidiabetics.appspot.com",
    messagingSenderId: "590676523026",
    appId: "1:590676523026:web:ac1dff738628b2202bc0cb",
    measurementId: "G-KDCWBZQY08"
};

// Initialize Firebase using the global Firebase object (Start)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();


// Initialize Firebase using the global Firebase object (End)
// Firebase configuration and initialization (End)

// Service Worker Registration (Start)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
        registration.onupdatefound = () => {
            const newWorker = registration.installing;
            newWorker.onstatechange = () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Prompt user for an update
                    if (confirm('New version available. Would you like to update?')) {
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                    }
                }
            };
        };
    });
}

// Listen for messages from the service worker
navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.type === 'NEW_VERSION') {
        if (confirm(event.data.message)) {
            window.location.reload();
        }
    }
});

// Service Worker Registration (End)


// Toggle between login and sign-up forms (Start)
document.getElementById('toggleSignUp').addEventListener('click', function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signUpForm').style.display = 'block';
});
// Toggle between login and sign-up forms (End)

// Handle user sign-up (Start)
const signUpForm = document.getElementById('signUp');
signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User signed up:', userCredential.user);
            alert('Account created successfully! Please log in.');
            document.getElementById('signUpForm').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
        })
        .catch((error) => {
            document.getElementById('signUpError').innerText = error.message;
        });
});
// Handle user sign-up (End)

// Check if a user is already signed in (Start)
auth.onAuthStateChanged((user) => {
    const loginContainer = document.getElementById('loginContainer');
    const trackerContent = document.getElementById('trackerContent');
    const signOutTab = document.getElementById('signOutTab'); // Get the Sign Out tab

    if (user) {
        loginContainer.style.display = 'none';
        trackerContent.style.display = 'block';
        signOutTab.style.display = 'inline'; // Show the Sign Out tab when logged in
    } else {
        loginContainer.style.display = 'block';
        trackerContent.style.display = 'none';
        signOutTab.style.display = 'none'; // Hide the Sign Out tab when not logged in
    }
});

// Handle user sign-out functionality
document.getElementById("signOutTab").addEventListener("click", () => {
    auth.signOut().then(() => {
        alert("You have successfully signed out.");
        // Toggle UI elements
        document.getElementById("loginContainer").style.display = "block";
        document.getElementById("trackerContent").style.display = "none";
        document.getElementById("signOutTab").style.display = "none";
    }).catch((error) => {
        console.error("Error signing out: ", error);
    });
});
// Check if a user is already signed in (End)

// Handle login form submission (Start)
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User signed in:', userCredential.user);
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('trackerContent').style.display = 'block'; // Show tracker after login
        })
        .catch((error) => {
            document.getElementById('error-message').innerText = error.message;
        });
});
// Handle login form submission (End)