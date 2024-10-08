// app.js

// Initialize Firebase using the global Firebase object provided by the Firebase script tags.
const firebaseConfig = {
    apiKey: "AIzaSyDnOPUB_2u93a9XyIa3ifLyc7Pq8gD0JzE",
    authDomain: "kiwidiabetics.firebaseapp.com",
    projectId: "kiwidiabetics",
    storageBucket: "kiwidiabetics.appspot.com",
    messagingSenderId: "590676523026",
    appId: "1:590676523026:web:ac1dff738628b2202bc0cb",
    measurementId: "G-KDCWBZQY08"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Sign in anonymously
auth.signInAnonymously()
    .then(() => {
        console.log('Signed in anonymously');
        if (document.getElementById('historyContainer')) {
            loadHistory(); // Load history if on history.html
        }
    })
    .catch((error) => {
        console.error('Error signing in anonymously:', error);
    });

// Setup data saving for index.html
function setupDataSaving() {
    document.getElementById('saveDataBtn').addEventListener('click', async function () {
        const date = document.getElementById('date').value || "N/A";
        const insulinDose = document.getElementById('insulinDose').value || "N/A";
        const mealCarbs = document.getElementById('mealCarbs').value || "N/A";
        const exerciseDuration = document.getElementById('exerciseDuration').value || "N/A";
        const userId = auth.currentUser ? auth.currentUser.uid : null;

        const dataEntry = {
            date: date,
            insulinDose: insulinDose,
            mealCarbs: mealCarbs,
            exerciseDuration: exerciseDuration,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: userId
        };

        try {
            const docRef = await db.collection('diabetesData').add(dataEntry);
            console.log("Document written with ID: ", docRef.id);
            clearForm();
            document.getElementById('dataOutput').innerHTML = `<p>Data saved successfully!</p>`;
        } catch (error) {
            console.error("Error adding document: ", error);
            alert('An error occurred while saving data.');
        }
    });
}

// Pre-fill current date and time with correct local time
function prefillDateTime() {
    const now = new Date();
    const datetimeInput = document.getElementById('date');
    if (datetimeInput) {
        datetimeInput.value = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    }
}

// Quick set buttons for Insulin Dose and Exercise Duration
function setInsulinDose(dose) {
    const insulinInput = document.getElementById('insulinDose');
    if (insulinInput) {
        insulinInput.value = dose;
    }
}

function setExerciseDuration(duration) {
    const exerciseInput = document.getElementById('exerciseDuration');
    if (exerciseInput) {
        exerciseInput.value = duration;
    }
}

// Function to clear form fields after saving data
function clearForm() {
    document.getElementById('date').value = '';
    document.getElementById('insulinDose').value = '';
    document.getElementById('mealCarbs').value = '';
    document.getElementById('exerciseDuration').value = '';
    prefillDateTime(); // Reset the date to the current time after clearing
}

// Load history and calculate insulin on board for history.html
async function loadHistory() {
    const userId = auth.currentUser ? auth.currentUser.uid : null;

    const q = db.collection('diabetesData')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc');
    try {
        const querySnapshot = await q.get();
        const savedData = [];
        querySnapshot.forEach((doc) => {
            savedData.push({ id: doc.id, ...doc.data() });
        });
        displayHistory(savedData);
    } catch (error) {
        console.error("Error getting documents: ", error);
        document.getElementById('historyContainer').innerHTML = '<p>Error loading data.</p>';
    }
}

// Display the history entries on history.html
function displayHistory(savedData) {
    const historyContainer = document.getElementById('historyContainer');
    if (historyContainer) {
        historyContainer.innerHTML = ''; // Clear previous entries
        savedData.forEach((entry) => {
            const entryElement = document.createElement('div');
            entryElement.className = 'history-entry';
            entryElement.textContent = `Date: ${entry.date}, Insulin: ${entry.insulinDose} units, Carbs: ${entry.mealCarbs} g, Exercise: ${entry.exerciseDuration} min`;
            historyContainer.appendChild(entryElement);
        });
        updateInsulinOnBoard(savedData);
        createChart(savedData.map(e => e.date), savedData.map(e => e.insulinDose));
    }
}

// Update total insulin on board for history.html
function updateInsulinOnBoard(savedData) {
    let totalInsulin = savedData.reduce((sum, entry) => {
        return sum + (parseFloat(entry.insulinDose) || 0);
    }, 0);

    const totalInsulinElement = document.getElementById('totalInsulin');
    if (totalInsulinElement) {
        totalInsulinElement.textContent = totalInsulin.toFixed(1);
    }
}

// Create a chart of insulin doses over time using Chart.js
function createChart(dates, insulinDoses) {
    const ctx = document.getElementById('historyChart')?.getContext('2d');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Insulin Doses Over Time',
                    data: insulinDoses,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Initialize functionality based on the page
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('saveDataBtn')) {
        setupDataSaving();
        prefillDateTime();
    }
    if (document.getElementById('historyContainer')) {
        loadHistory();
    }
});
