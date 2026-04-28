const db = window.firebaseDb;

const reminderForm = document.getElementById('reminderForm');
const reminderList = document.getElementById('reminderList');
const popup = document.getElementById('reminderPopup');
const testSoundBtn = document.getElementById('testSoundBtn');

const currentUid = localStorage.getItem('medisync_uid');
const currentUsername = localStorage.getItem('medisync_username') || 'User';

const soundMap = {
    chime: document.getElementById('sound-chime'),
    alert: document.getElementById('sound-alert'),
    bell: document.getElementById('sound-bell'),
    soft1: document.getElementById('sound-soft1'),
    soft2: document.getElementById('sound-soft2'),
    soft3: document.getElementById('sound-soft3'),
    calm1: document.getElementById('sound-calm1'),
    calm2: document.getElementById('sound-calm2'),
    focus: document.getElementById('sound-focus'),
    strong: document.getElementById('sound-strong')
};

if (!currentUid) {
    alert("Please login first");
    window.location.href = "index.html";
}

// =========================
// POPUP
// =========================
function showPopup(msg, error = false) {
    popup.textContent = msg;
    popup.classList.toggle("error", error);
    popup.style.display = "block";

    setTimeout(() => popup.style.display = "none", 3000);
}

// =========================
// TIME FORMAT
// =========================
function formatTime(time) {
    const [h, m] = time.split(":");
    let hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
}

// =========================
// SAVE REMINDER
// =========================
function saveReminder(data) {
    return db.ref("users/" + currentUid + "/reminders").push(data);
}

// =========================
// LOAD REMINDERS
// =========================
function loadReminders() {
    db.ref("users/" + currentUid + "/reminders").on("value", (snap) => {
        reminderList.innerHTML = "";

        const data = snap.val();
        if (!data) {
            reminderList.innerHTML = "<p style='color:#9ca3af'>No reminders yet</p>";
            return;
        }

        Object.values(data).forEach(rem => {
            const div = document.createElement("div");
            div.className = "reminder-item";

            div.innerHTML = `
                <div class="reminder-name">${rem.name}</div>
                <div class="reminder-meta">
                    ${rem.date} | ${formatTime(rem.time)}
                </div>
                <div class="reminder-note">${rem.note || ""}</div>
            `;

            reminderList.appendChild(div);
        });
    });
}

// =========================
// SOUND
// =========================
function playSound(key) {
    const audio = soundMap[key] || soundMap.chime;
    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch(() => {});
}

// =========================
// NOTIFICATION (REAL)
// =========================
function sendNotification(rem) {
    if (Notification.permission === "granted") {
        new Notification("💊 Health Reminder", {
            body: rem.name + " - " + formatTime(rem.time),
            icon: "https://cdn-icons-png.flaticon.com/512/2966/2966485.png"
        });
    }
}

// =========================
// SMART CHECKER (FIXED)
// =========================
function checkReminders() {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentMin = now.getHours() * 60 + now.getMinutes();

    db.ref("users/" + currentUid + "/reminders").once("value", (snap) => {
        const data = snap.val();
        if (!data) return;

        Object.values(data).forEach(rem => {
            if (!rem.date || !rem.time) return;

            const [h, m] = rem.time.split(":");
            const remMin = parseInt(h) * 60 + parseInt(m);

            // allow 1 minute window (fix missed alerts)
            if (rem.date === today && Math.abs(remMin - currentMin) <= 1) {

                showPopup("⏰ " + rem.name);
                playSound(rem.sound);

                sendNotification(rem);
            }
        });
    });
}

// =========================
// FORM SUBMIT
// =========================
reminderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById("reminderName").value,
        date: document.getElementById("reminderDate").value,
        time: document.getElementById("reminderTime").value,
        note: document.getElementById("reminderNote").value,
        sound: document.getElementById("reminderSound").value,
        createdAt: Date.now()
    };

    saveReminder(data)
        .then(() => {
            showPopup("Reminder saved ✔");
            reminderForm.reset();
        })
        .catch(() => showPopup("Error saving reminder", true));
});

// =========================
// TEST SOUND
// =========================
testSoundBtn.addEventListener("click", () => {
    const key = document.getElementById("reminderSound").value;
    playSound(key);
});

// =========================
// START
// =========================
loadReminders();

// 🔥 FIX: runs every 15 seconds so no missed reminders
setInterval(checkReminders, 15000);
checkReminders();
