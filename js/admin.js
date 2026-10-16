import { 
  db, 
  auth, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from './firebase-config.js';

const authPanel = document.getElementById('auth-panel');
const dashboardPanel = document.getElementById('dashboard-panel');
const loginForm = document.getElementById('login-form');
const postForm = document.getElementById('post-form');
const postsList = document.getElementById('posts-list');
const btnLogout = document.getElementById('btn-logout');
const userDisplay = document.getElementById('user-display');
const submitBtn = document.getElementById('submit-btn');

// Observe Session
onAuthStateChanged(auth, (user) => {
  if (user) {
    authPanel.style.display = 'none';
    dashboardPanel.style.display = 'block';
    btnLogout.style.display = 'inline-flex';
    userDisplay.textContent = user.email;
    loadAdminArticles();
  } else {
    authPanel.style.display = 'block';
    dashboardPanel.style.display = 'none';
    btnLogout.style.display = 'none';
    userDisplay.textContent = '';
  }
});

// Authenticate Admin
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginForm.reset();
  } catch (err) {
    alert("Authentication failed: " + err.message);
  }
});

// Logout
btnLogout.addEventListener('click', () => signOut(auth));

// Handle Article Publishing
postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Publishing...';

  const newPost = {
    title: document.getElementById('post-title').value.trim(),
    category: document.getElementById('post-category').value.trim(),
    author: document.getElementById('post-author').value.trim(),
    imageUrl: document.getElementById('post-img').value.trim(),
    excerpt: document.getElementById('post-excerpt').value.trim(),
    content: document.getElementById('post-content').value.trim(),
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "articles"), newPost);
    postForm.reset();
    loadAdminArticles();
    alert("Travel article successfully published!");
  } catch (err) {
    console.error("Publishing error:", err);
    alert("Error publishing: " + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Publish Globally';
  }
});

// Render dynamic article list with delete controls
async function loadAdminArticles() {
  postsList.innerHTML = `<p style="color: var(--text-muted);">Syncing catalog...</p>`;
  try {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      postsList.innerHTML = `<p style="color: var(--text-muted);">No entries found. Write your first post!</p>`;
      return;
    }

    postsList.innerHTML = '';
    snapshot.forEach((snapDoc) => {
      const data = snapDoc.data();
      const item = document.createElement('div');
      item.className = 'admin-list-item';
      item.innerHTML = `
        <div>
          <strong style="display:block; margin-bottom: 0.2rem;">${data.title}</strong>
          <small style="color: var(--text-muted);">${data.category || 'Article'} • ${data.author || 'Staff'}</small>
        </div>
        <button class="btn btn-danger" style="padding: 0.35rem 0.8rem; font-size: 0.8rem;" data-id="${snapDoc.id}">Delete</button>
      `;

      item.querySelector('button').addEventListener('click', async () => {
        if (confirm(`Permanently remove "${data.title}"?`)) {
          await deleteDoc(doc(db, "articles", snapDoc.id));
          loadAdminArticles();
        }
      });

      postsList.appendChild(item);
    });
  } catch (err) {
    postsList.innerHTML = `<p style="color: #ef4444;">Could not load entries: ${err.message}</p>`;
  }
}
