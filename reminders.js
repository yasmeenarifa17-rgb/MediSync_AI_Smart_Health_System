const auth = window.firebaseAuth;
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
    alert('Please log in to manage your reminders.');
    window.location.href = 'index.html';
}

function showPopup(message, isError = false) {
    popup.textContent = message;
    popup.classList.toggle('error', isError);
    popup.style.display = 'block';
    setTimeout(() => {
        popup.style.display = 'none';
    }, 3000);
}

function formatTimeToAmPm(time) {
    if (!time) return '-';
    const [hStr, mStr] = time.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
}

function saveReminder(name, date, time, note, soundKey) {
    const ref = db.ref('users/' + currentUid + '/reminders').push();
    return ref.set({
        name,
        date,
        time,
        note: note || '',
        sound: soundKey || 'chime',
        createdAt: Date.now()
    });
}

function loadReminders() {
    const ref = db.ref('users/' + currentUid + '/reminders').orderByChild('createdAt');

    ref.on('value', (snapshot) => {
        const data = snapshot.val();
        reminderList.innerHTML = '';

        if (!data) {
            reminderList.innerHTML = '<p style="font-size: 13px; color: #9ca3af; padding: 8px 10px;">No reminders yet. Add your first reminder above.</p>';
            return;
        }

        const reminders = Object.entries(data)
            .map(([id, value]) => ({ id, ...value }))
            .sort((a, b) => a.createdAt - b.createdAt);

        reminders.forEach(rem => {
            const item = document.createElement('div');
            item.className = 'reminder-item';

            const timeFormatted = formatTimeToAmPm(rem.time);

            item.innerHTML = `
                <div class="reminder-name">${rem.name}</div>
                <div class="reminder-meta">
                    Date: ${rem.date || '-'} &nbsp; | &nbsp; Time: ${timeFormatted}
                </div>
                ${rem.note ? `<div class="reminder-note">Note: ${rem.note}</div>` : ''}
            `;
            reminderList.appendChild(item);
        });
    });
}

function playReminderSound(soundKey) {
    const audio = soundMap[soundKey] || soundMap['chime'];
    if (!audio) return;
    try {
        audio.currentTime = 0;
        audio.play();
    } catch (e) {
        console.warn('Sound play blocked until user interacts.', e);
    }
}

function startReminderWatcher() {
    const ref = db.ref('users/' + currentUid + '/reminders');

    ref.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const now = new Date();
        const nowDateStr = now.toISOString().slice(0, 10);
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        Object.values(data).forEach(rem => {
            if (!rem.date || !rem.time) return;

            const [hStr, mStr] = rem.time.split(':');
            const remMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);

            if (rem.date === nowDateStr && remMinutes === nowMinutes) {
                const msg = `Reminder: ${rem.name} (${formatTimeToAmPm(rem.time)})`;
                showPopup(msg);
                playReminderSound(rem.sound || 'chime');
            }
        });
    });
}

reminderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('reminderName').value.trim();
    const date = document.getElementById('reminderDate').value;
    const time = document.getElementById('reminderTime').value;
    const note = document.getElementById('reminderNote').value.trim();
    const soundKey = document.getElementById('reminderSound').value;

    if (!name || !date || !time) {
        showPopup('Please fill reminder name, date, and time.', true);
        return;
    }

    saveReminder(name, date, time, note, soundKey)
        .then(() => {
            showPopup('Reminder added for ' + currentUsername + '!');
            reminderForm.reset();
        })
        .catch((err) => {
            console.error(err);
            showPopup('Failed to save reminder.', true);
        });
});

testSoundBtn.addEventListener('click', () => {
    const soundKey = document.getElementById('reminderSound').value;
    playReminderSound(soundKey);
});

loadReminders();
startReminderWatcher();