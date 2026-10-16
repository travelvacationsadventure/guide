import { db, collection, getDocs, addDoc, query, orderBy, serverTimestamp } from './firebase-config.js';

const homepageGrid = document.getElementById('homepage-grid');
const blogGrid = document.getElementById('blog-grid');
const liveSearch = document.getElementById('live-search');
const filterBar = document.getElementById('filter-bar');
const enquiryForm = document.getElementById('enquiry-form');

let cachedArticles = [];
let activeCategory = 'ALL';

function generateCard(id, doc) {
  const defaultImg = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
  const dateStr = doc.createdAt ? new Date(doc.createdAt.seconds * 1000).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }) : 'Recently Published';

  return `
    <article class="article-card reveal">
      <div class="card-media">
        <span class="card-tag">${doc.category || 'Global'}</span>
        <img src="${doc.imageUrl || defaultImg}" alt="${doc.title}" loading="lazy">
      </div>
      <div class="card-body">
        <h3 class="card-title">${doc.title}</h3>
        <p class="card-excerpt">${doc.excerpt || ''}</p>
        <div class="card-meta">
          <span>By ${doc.author || 'Editorial'}</span>
          <span>${dateStr}</span>
        </div>
        <a href="article.html?id=${id}" class="btn btn-outline" style="margin-top: 1.25rem; width:100%;">Read Story &rarr;</a>
      </div>
    </article>
  `;
}

async function fetchArticles() {
  try {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    
    cachedArticles = [];
    snap.forEach((d) => cachedArticles.push({ id: d.id, ...d.data() }));

    if (homepageGrid) {
      renderFeed(homepageGrid, cachedArticles.slice(0, 6));
    }
    if (blogGrid) {
      filterAndRender();
    }
  } catch (err) {
    console.error("Firestore read error:", err);
    const msg = `<p style="color:var(--text-muted); grid-column:1/-1;">Check Firestore rules in Firebase Console. Database currently restricted or unpopulated.</p>`;
    if (homepageGrid) homepageGrid.innerHTML = msg;
    if (blogGrid) blogGrid.innerHTML = msg;
  }
}

function renderFeed(target, items) {
  if (!target) return;
  if (items.length === 0) {
    target.innerHTML = `<p style="color:var(--text-muted); grid-column:1/-1;">No travel guides match the selection.</p>`;
    return;
  }
  target.innerHTML = items.map(a => generateCard(a.id, a)).join('');
}

function filterAndRender() {
  const searchTerm = liveSearch ? liveSearch.value.toLowerCase().trim() : '';
  
  const filtered = cachedArticles.filter(art => {
    const matchesSearch = 
      art.title?.toLowerCase().includes(searchTerm) ||
      art.category?.toLowerCase().includes(searchTerm) ||
      art.excerpt?.toLowerCase().includes(searchTerm);

    const matchesCat = (activeCategory === 'ALL') || 
      (art.category?.toLowerCase() === activeCategory.toLowerCase());

    return matchesSearch && matchesCat;
  });

  renderFeed(blogGrid, filtered);
}

// Live Search Listener
if (liveSearch) {
  liveSearch.addEventListener('input', filterAndRender);
}

// Category Tabs Listener
if (filterBar) {
  filterBar.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      filterBar.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.dataset.category;
      filterAndRender();
    }
  });
}

// Handle Direct Client Enquiry
if (enquiryForm) {
  enquiryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('enq-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting Request...';

    const payload = {
      name: document.getElementById('enq-name').value.trim(),
      email: document.getElementById('enq-email').value.trim(),
      destination: document.getElementById('enq-dest').value.trim(),
      message: document.getElementById('enq-message').value.trim(),
      status: 'New',
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "enquiries"), payload);
      enquiryForm.reset();
      alert("Your inquiry has been successfully sent to our expedition desk!");
    } catch (err) {
      console.error(err);
      alert("Submission error: " + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Inquiry →';
    }
  });
}

document.addEventListener('DOMContentLoaded', fetchArticles);
