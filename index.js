// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyDnOPUB_2u93a9XyIa3ifLyc7Pq8gD0JzE",
    authDomain: "kiwidiabetics.firebaseapp.com",
    projectId: "kiwidiabetics",
    storageBucket: "kiwidiabetics.appspot.com",
    messagingSenderId: "590676523026",
    appId: "1:590676523026:web:ac1dff738628b2202bc0cb",
    measurementId: "G-KDCWBZQY08"
  };

// Initialize Firebase using the global Firebase object
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const analytics = getAnalytics(app);

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
