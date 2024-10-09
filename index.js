// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase using the global Firebase object
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Toggle between login and sign-up forms
document.getElementById('toggleSignUp').addEventListener('click', function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signUpForm').style.display = 'block';
});

// Handle user sign-up
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

// Check if a user is already signed in
auth.onAuthStateChanged((user) => {
    const loginContainer = document.getElementById('loginContainer');
    const trackerContent = document.getElementById('trackerContent');
    if (user) {
        loginContainer.style.display = 'none';
        trackerContent.style.display = 'block'; // Show tracker after login
    } else {
        loginContainer.style.display = 'block';
        trackerContent.style.display = 'none'; // Show login form if not logged in
    }
});

// Handle login form submission
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
