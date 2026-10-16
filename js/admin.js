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

// DOM Hooks
const loginPanel = document.getElementById('login-panel');
const dashboardPanel = document.getElementById('dashboard-panel');
const adminLoginForm = document.getElementById('admin-login-form');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const userPill = document.getElementById('user-pill');

// Tab Buttons & Panels
const tabBtnWrite = document.getElementById('tab-btn-write');
const tabBtnArticles = document.getElementById('tab-btn-articles');
const tabBtnEnquiries = document.getElementById('tab-btn-enquiries');
const tabWriteSection = document.getElementById('tab-write-section');
const tabArticlesSection = document.getElementById('tab-articles-section');
const tabEnquiriesSection = document.getElementById('tab-enquiries-section');

// Forms & Containers
const newArticleForm = document.getElementById('new-article-form');
const btnPublishArt = document.getElementById('btn-publish-art');
const articlesTableBody = document.getElementById('articles-table-body');
const enquiriesTableBody = document.getElementById('enquiries-table-body');
const countArticles = document.getElementById('count-articles');
const countEnquiries = document.getElementById('count-enquiries');

// Auth State Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginPanel.style.display = 'none';
    dashboardPanel.style.display = 'block';
    adminLogoutBtn.style.display = 'inline-block';
    userPill.textContent = user.email;
    loadDashboardData();
  } else {
    loginPanel.style.display = 'block';
    dashboardPanel.style.display = 'none';
    adminLogoutBtn.style.display = 'none';
    userPill.textContent = '';
  }
});

// Admin Log In
adminLoginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    adminLoginForm.reset();
  } catch (err) {
    alert("Authentication failed: " + err.message);
  }
});

// Admin Log Out
adminLogoutBtn.addEventListener('click', () => signOut(auth));

// Tab Navigation
function setTab(activeTabBtn, activeSection) {
  [tabBtnWrite, tabBtnArticles, tabBtnEnquiries].forEach(btn => btn.classList.remove('active'));
  [tabWriteSection, tabArticlesSection, tabEnquiriesSection].forEach(sec => sec.style.display = 'none');

  activeTabBtn.classList.add('active');
  activeSection.style.display = 'block';
}

tabBtnWrite.addEventListener('click', () => setTab(tabBtnWrite, tabWriteSection));
tabBtnArticles.addEventListener('click', () => {
  setTab(tabBtnArticles, tabArticlesSection);
  loadArticlesList();
});
tabBtnEnquiries.addEventListener('click', () => {
  setTab(tabBtnEnquiries, tabEnquiriesSection);
  loadEnquiriesList();
});

// TinyMCE Article Publishing
newArticleForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Extract TinyMCE WYSIWYG Content
  const richHtmlContent = tinymce.get('article-tinymce').getContent();
  if (!richHtmlContent.trim()) {
    alert("Please write your story content in the TinyMCE editor.");
    return;
  }

  btnPublishArt.disabled = true;
  btnPublishArt.textContent = 'Uploading to Firestore...';

  const newArticle = {
    title: document.getElementById('art-input-title').value.trim(),
    category: document.getElementById('art-input-category').value.trim(),
    author: document.getElementById('art-input-author').value.trim(),
    imageUrl: document.getElementById('art-input-image').value.trim(),
    excerpt: document.getElementById('art-input-excerpt').value.trim(),
    contentHtml: richHtmlContent,
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "articles"), newArticle);
    newArticleForm.reset();
    tinymce.get('article-tinymce').setContent('');
    alert("Travel article successfully published live!");
    loadDashboardData();
  } catch (err) {
    console.error(err);
    alert("Publishing error: " + err.message);
  } finally {
    btnPublishArt.disabled = false;
    btnPublishArt.textContent = 'Publish to Worldwide Feed';
  }
});

// Master Loader
async function loadDashboardData() {
  loadArticlesList();
  loadEnquiriesList();
}

// Fetch and Render Articles Table
async function loadArticlesList() {
  try {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    countArticles.textContent = snap.size;

    if (snap.empty) {
      articlesTableBody.innerHTML = '<tr><td colspan="4" style="color:var(--text-muted);">No stories published yet.</td></tr>';
      return;
    }

    articlesTableBody.innerHTML = '';
    snap.forEach(d => {
      const item = d.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.title}</strong></td>
        <td><span class="card-tag" style="position:static;">${item.category}</span></td>
        <td>${item.author}</td>
        <td><button class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" data-id="${d.id}">Delete</button></td>
      `;

      tr.querySelector('button').addEventListener('click', async () => {
        if (confirm(`Delete "${item.title}" permanently?`)) {
          await deleteDoc(doc(db, "articles", d.id));
          loadDashboardData();
        }
      });

      articlesTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

// Fetch and Render Enquiries Table
async function loadEnquiriesList() {
  try {
    const q = query(collection(db, "enquiries"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    countEnquiries.textContent = snap.size;

    if (snap.empty) {
      enquiriesTableBody.innerHTML = '<tr><td colspan="6" style="color:var(--text-muted);">No inquiries received yet.</td></tr>';
      return;
    }

    enquiriesTableBody.innerHTML = '';
    snap.forEach(d => {
      const item = d.data();
      const date = item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${date}</td>
        <td><strong>${item.name}</strong></td>
        <td><a href="mailto:${item.email}" style="color:var(--accent-gold);">${item.email}</a></td>
        <td>${item.destination}</td>
        <td style="max-width: 250px; font-size: 0.85rem; color: var(--text-muted);">${item.message}</td>
        <td><button class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" data-id="${d.id}">Remove</button></td>
      `;

      tr.querySelector('button').addEventListener('click', async () => {
        if (confirm(`Remove inquiry from ${item.name}?`)) {
          await deleteDoc(doc(db, "enquiries", d.id));
          loadEnquiriesList();
        }
      });

      enquiriesTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}
