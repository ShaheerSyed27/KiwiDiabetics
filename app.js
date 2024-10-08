// app.js

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

    if (!userId) {
        console.error("User not authenticated.");
        return;
    }

    const q = db.collection('diabetesData')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc');
    try {
        const querySnapshot = await q.get();
        const savedData = [];
        querySnapshot.forEach((doc) => {
            savedData.push({ id: doc.id, ...doc.data() });
        });

        if (savedData.length === 0) {
            console.warn("No history data available.");
            document.getElementById('historyContainer').innerHTML = '<p>No data available.</p>';
            return;
        }

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
        savedData.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = 'history-entry';
            entryElement.innerHTML = `
                <div id="entryDisplay${index}">
                    <strong>Entry ${index + 1}</strong><br>
                    Date and Time: ${entry.date === "N/A" ? "N/A" : new Date(entry.date).toLocaleString()}<br>
                    Insulin Dose: ${entry.insulinDose !== "N/A" ? entry.insulinDose + ' units' : "N/A"}<br>
                    Meal Carbs: ${entry.mealCarbs !== "N/A" ? entry.mealCarbs + ' grams' : "N/A"}<br>
                    Exercise Duration: ${entry.exerciseDuration !== "N/A" ? entry.exerciseDuration + ' minutes' : "N/A"}
                </div>

                <!-- Editable Form Hidden Initially -->
                <div class="edit-form" id="editForm${index}" style="display:none;">
                    <label for="editDate${index}">Date and Time</label>
                    <input type="datetime-local" id="editDate${index}" value="${entry.date}" />
                    
                    <label for="editInsulinDose${index}">Insulin Dose (units)</label>
                    <input type="number" id="editInsulinDose${index}" value="${entry.insulinDose}" min="0" />
                    
                    <label for="editMealCarbs${index}">Meal Carbs (grams)</label>
                    <input type="number" id="editMealCarbs${index}" value="${entry.mealCarbs}" min="0" />
                    
                    <label for="editExerciseDuration${index}">Exercise Duration (minutes)</label>
                    <input type="number" id="editExerciseDuration${index}" value="${entry.exerciseDuration}" min="0" />
                </div>

                <button class="edit-button" onclick="toggleEdit(${index})">Edit</button>
                <button class="save-button" onclick="saveEntry(${index}, '${entry.id}')" id="saveButton${index}" style="display:none;" data-entry-id="${entry.id}">Save</button>
                <button class="cancel-button" onclick="toggleEdit(${index})" id="cancelButton${index}" style="display:none;">Cancel</button>
                <button class="delete-button" onclick="deleteEntry('${entry.id}')">Delete</button>
            `;
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

// Global variable to keep track of the chart instance
let insulinChart = null;

// Create a chart of insulin doses over time using Chart.js
function createChart(dates, insulinDoses) {
    if (dates.length === 0 || insulinDoses.length === 0) {
        console.warn("No data available to create the chart.");
        return;
    }

    const ctx = document.getElementById('historyChart')?.getContext('2d');
    
    if (ctx) {
        // Destroy the existing chart if it already exists
        if (insulinChart) {
            insulinChart.destroy();
        }

        // Create a new chart
        insulinChart = new Chart(ctx, {
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

// Variable to store the currently open entry index
let currentlyOpenIndex = null;

// Toggle edit mode for an entry
function toggleEdit(index) {
    const entryDisplay = document.getElementById(`entryDisplay${index}`);
    const editForm = document.getElementById(`editForm${index}`);
    const saveButton = document.getElementById(`saveButton${index}`);
    const cancelButton = document.getElementById(`cancelButton${index}`);
    const editButton = document.querySelector(`.edit-button[onclick="toggleEdit(${index})"]`);

    // Close any previously open edit form
    if (currentlyOpenIndex !== null && currentlyOpenIndex !== index) {
        // Close the previously open entry
        closeEdit(currentlyOpenIndex);
    }

    // Toggle the current entry
    if (editForm.style.display === "none") {
        entryDisplay.style.display = "none";
        editForm.style.display = "block";
        saveButton.style.display = "inline-block";
        cancelButton.style.display = "inline-block";
        editButton.style.display = "none";

        // Set the currently open entry index
        currentlyOpenIndex = index;
    } else {
        closeEdit(index);
    }
}

// Close edit mode for a specific entry
function closeEdit(index) {
    const entryDisplay = document.getElementById(`entryDisplay${index}`);
    const editForm = document.getElementById(`editForm${index}`);
    const saveButton = document.getElementById(`saveButton${index}`);
    const cancelButton = document.getElementById(`cancelButton${index}`);
    const editButton = document.querySelector(`.edit-button[onclick="toggleEdit(${index})"]`);

    // Close the form
    entryDisplay.style.display = "block";
    editForm.style.display = "none";
    saveButton.style.display = "none";
    cancelButton.style.display = "none";
    editButton.style.display = "inline-block";

    // Reset the currently open index
    currentlyOpenIndex = null;
}

// Save edited entry
async function saveEntry(index, entryId) {
    const date = document.getElementById(`editDate${index}`).value;
    const insulinDose = document.getElementById(`editInsulinDose${index}`).value;
    const mealCarbs = document.getElementById(`editMealCarbs${index}`).value;
    const exerciseDuration = document.getElementById(`editExerciseDuration${index}`).value;

    try {
        await db.collection('diabetesData').doc(entryId).update({
            date: date,
            insulinDose: insulinDose,
            mealCarbs: mealCarbs,
            exerciseDuration: exerciseDuration
        });
        loadHistory();  // Reload the history after saving
    } catch (error) {
        console.error("Error updating document: ", error);
    }
}

// Delete an entry
async function deleteEntry(entryId) {
    try {
        await db.collection('diabetesData').doc(entryId).delete();
        loadHistory();
    } catch (error) {
        console.error("Error deleting document: ", error);
    }
}

// Expose functions to the global scope
window.setInsulinDose = setInsulinDose;
window.setExerciseDuration = setExerciseDuration;
window.setupDataSaving = setupDataSaving;
window.toggleEdit = toggleEdit;
window.saveEntry = saveEntry;
window.deleteEntry = deleteEntry;

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
