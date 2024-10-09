// Firebase authentication
const auth = firebase.auth();
const db = firebase.firestore();
let insulinData = [];
let totalInsulin = 0;

// Protect the history page by checking if the user is signed in
auth.onAuthStateChanged((user) => {
    if (!user) {
        // Redirect to the login page if the user is not signed in
        window.location.href = '/index.html';
    } else {
        console.log('User is signed in:', user);
        loadHistoryEntries(user.uid);  // Load user-specific entries
    }
});

// Load history entries from Firestore for the signed-in user
function loadHistoryEntries(userId) {
    db.collection('diabetesData')
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .get()
        .then((querySnapshot) => {
            let entriesHTML = '';
            insulinData = [];  // Reset insulin data for the chart
            totalInsulin = 0;  // Reset total insulin on board

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                insulinData.push({ date: data.date, insulinDose: data.insulinDose });
                totalInsulin += parseInt(data.insulinDose);  // Accumulate total insulin
                entriesHTML += createHistoryEntryHTML(doc.id, data);
            });

            document.getElementById('historyContainer').innerHTML = entriesHTML;
            document.getElementById('totalInsulin').innerText = totalInsulin;
            updateChart();
            addEventListeners();  // Add edit and delete functionality
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}

// Create HTML for each history entry
function createHistoryEntryHTML(id, data) {
    return `
        <div class="history-entry" data-id="${id}">
            <h3>Date: ${data.date}</h3>
            <p>Insulin Dose: ${data.insulinDose} units</p>
            <p>Meal Carbs: ${data.mealCarbs} grams</p>
            <p>Exercise Duration: ${data.exerciseDuration} minutes</p>
            <button class="edit-entry">Edit</button>
            <button class="delete-entry">Delete</button>
        </div>
    `;
}

// Update the chart with insulin values
function updateChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');
    const chartData = {
        labels: insulinData.map(entry => entry.date),
        datasets: [{
            label: 'Insulin Dose (units)',
            data: insulinData.map(entry => entry.insulinDose),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Insulin Dose (units)'
                    }
                }
            }
        }
    });
}

// Add event listeners for edit and delete buttons
function addEventListeners() {
    document.querySelectorAll('.edit-entry').forEach(button => {
        button.addEventListener('click', (e) => {
            const entryId = e.target.closest('.history-entry').dataset.id;
            editEntry(entryId);
        });
    });

    document.querySelectorAll('.delete-entry').forEach(button => {
        button.addEventListener('click', (e) => {
            const entryId = e.target.closest('.history-entry').dataset.id;
            deleteEntry(entryId);
        });
    });
}

// Handle entry editing (for simplicity, we use prompt; you can create a form for better UX)
function editEntry(entryId) {
    const insulinDose = prompt("Enter new insulin dose:");
    const mealCarbs = prompt("Enter new meal carbs:");
    const exerciseDuration = prompt("Enter new exercise duration:");

    if (insulinDose && mealCarbs && exerciseDuration) {
        db.collection('diabetesData').doc(entryId).update({
            insulinDose: insulinDose,
            mealCarbs: mealCarbs,
            exerciseDuration: exerciseDuration
        })
        .then(() => {
            alert("Entry updated successfully.");
            loadHistoryEntries(auth.currentUser.uid);  // Reload entries after update
        })
        .catch((error) => {
            console.error("Error updating entry: ", error);
        });
    }
}

// Handle entry deletion
function deleteEntry(entryId) {
    if (confirm("Are you sure you want to delete this entry?")) {
        db.collection('diabetesData').doc(entryId).delete()
        .then(() => {
            alert("Entry deleted successfully.");
            loadHistoryEntries(auth.currentUser.uid);  // Reload entries after deletion
        })
        .catch((error) => {
            console.error("Error deleting entry: ", error);
        });
    }
}
