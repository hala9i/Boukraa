// main.js – Barber App Logic

// ✅ تفعيل الوضع الليلي (مثال تجميلي)
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark-mode');
}

// ✅ Firebase configuration (مثال فقط، قم بالتعديل على بيانات مشروعك)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ✅ تسجيل الدخول بحساب جوجل
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      console.log("✅ تم تسجيل الدخول بنجاح");
      window.location.href = 'dashboard.html';
    })
    .catch(error => alert("❌ خطأ: " + error.message));
}

// ✅ تسجيل الدخول بالبريد وكلمة المرور
function emailLogin(email, password) {
  auth.signInWithEmailAndPassword(email, password)
    .then(user => {
      console.log("✅ تسجيل الدخول ناجح");
      window.location.href = 'dashboard.html';
    })
    .catch(err => alert("❌ " + err.message));
}

// ✅ إنشاء حساب جديد
function registerNewUser(name, email, password) {
  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      return db.collection('users').doc(cred.user.uid).set({
        name: name,
        email: email,
        lastHaircut: null,
        points: 0
      });
    })
    .then(() => {
      alert("✅ تم إنشاء الحساب بنجاح");
      window.location.href = 'dashboard.html';
    })
    .catch(error => alert("❌ " + error.message));
}

// ✅ حفظ تاريخ آخر حلاقة
function saveHaircutDate(userId, date) {
  db.collection('users').doc(userId).update({
    lastHaircut: date
  })
    .then(() => console.log("📅 تم تحديث تاريخ الحلاقة"))
    .catch(err => console.error("❌ خطأ", err));
}

// ✅ إشعار بالموعد القادم
function scheduleNotification(date) {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();

  if (diff > 0) {
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification("💈 موعد الحلاقة يقترب!", {
          body: "لا تنسَ تأكيد حجزك أو التواصل مع الحلاق.",
          icon: "icons/icon-192.png"
        });
      }
    }, diff);
  }
}

// ✅ تفعيل الإشعارات
function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log("🔔 الإشعارات مفعلة");
      }
    });
  }
}

// ✅ تقييم الخدمة
function submitRating(userId, rating, comment) {
  db.collection('ratings').add({
    userId,
    rating,
    comment,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
    .then(() => alert("✅ شكراً لتقييمك!"))
    .catch(err => alert("❌ خطأ أثناء إرسال التقييم"));
}

// ✅ استرجاع قائمة الأسعار
function fetchPriceList() {
  db.collection('prices').get()
    .then(snapshot => {
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const item = document.createElement('li');
        item.textContent = `${data.service} - ${data.price} دج`;
        document.getElementById('price-list').appendChild(item);
      });
    })
    .catch(err => console.error("❌ تعذر تحميل الأسعار", err));
}

// ✅ الدردشة البسيطة (عرض آخر 10 رسائل)
function loadChatMessages() {
  db.collection('messages')
    .orderBy('timestamp', 'desc')
    .limit(10)
    .onSnapshot(snapshot => {
      const chatBox = document.getElementById('chat-box');
      chatBox.innerHTML = '';
      snapshot.docs.reverse().forEach(doc => {
        const data = doc.data();
        const msg = document.createElement('p');
        msg.textContent = `${data.sender}: ${data.text}`;
        chatBox.appendChild(msg);
      });
    });
}

// ✅ إرسال رسالة جديدة في الدردشة
function sendMessage(sender, text) {
  db.collection('messages').add({
    sender,
    text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
    .then(() => console.log("💬 رسالة مرسلة"))
    .catch(err => console.error("❌ فشل في إرسال الرسالة", err));
}

// ✅ نظام النقاط: إضافة نقاط بعد تأكيد الحلاقة
function addLoyaltyPoints(userId, points = 5) {
  const userRef = db.collection('users').doc(userId);
  userRef.get().then(doc => {
    if (doc.exists) {
      const current = doc.data().points || 0;
      userRef.update({ points: current + points });
    }
  });
}

// ✅ تسجيل خروج
function logoutUser() {
  auth.signOut()
    .then(() => {
      window.location.href = 'index.html';
    })
    .catch(err => alert("❌ فشل تسجيل الخروج"));
}

// ✅ تنفيذ الوظائف عند تحميل الصفحة
window.addEventListener('load', () => {
  requestNotificationPermission();
  fetchPriceList();
});
