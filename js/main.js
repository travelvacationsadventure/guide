import { db, collection, getDocs, query, orderBy } from './firebase-config.js';

const articlesGrid = document.getElementById('articles-grid');
const blogGrid = document.getElementById('blog-grid');
const searchInput = document.getElementById('search-input');

let globalArticles = [];

// Reusable card template generator
function createArticleCard(id, post) {
  const defaultImage = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80";
  const dateFormatted = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  }) : "Recent";

  return `
    <article class="article-card">
      <img src="${post.imageUrl || defaultImage}" alt="${post.title}" class="card-img" loading="lazy">
      <div class="card-body">
        <span class="category-tag">${post.category || 'Expedition'}</span>
        <h3 class="card-title">${post.title}</h3>
        <p class="card-excerpt">${post.excerpt || (post.content ? post.content.substring(0, 110) + '...' : '')}</p>
        <div class="card-meta">
          <span>By ${post.author || 'Staff'}</span>
          <span>${dateFormatted}</span>
        </div>
        <a href="article.html?id=${id}" class="btn btn-primary" style="margin-top: 1.25rem; width: 100%;">Read Full Story</a>
      </div>
    </article>
  `;
}

// Fetch all documents from Firestore
async function fetchArticles() {
  try {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    globalArticles = [];
    snapshot.forEach(doc => {
      globalArticles.push({ id: doc.id, ...doc.data() });
    });

    renderFeed();
  } catch (err) {
    console.error("Firestore retrieval error:", err);
    const errorMsg = `<p style="color: var(--text-muted);">Failed to load latest stories. Please verify your Firestore security rules.</p>`;
    if (articlesGrid) articlesGrid.innerHTML = errorMsg;
    if (blogGrid) blogGrid.innerHTML = errorMsg;
  }
}

function renderFeed(filterText = "") {
  const filtered = globalArticles.filter(art => {
    const query = filterText.toLowerCase();
    return (
      art.title?.toLowerCase().includes(query) ||
      art.category?.toLowerCase().includes(query) ||
      art.excerpt?.toLowerCase().includes(query)
    );
  });

  const targetContainer = blogGrid || articlesGrid;
  if (!targetContainer) return;

  if (filtered.length === 0) {
    targetContainer.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">No travel guides match your query.</p>`;
    return;
  }

  targetContainer.innerHTML = filtered.map(item => createArticleCard(item.id, item)).join('');
}

// Search interaction listener
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    renderFeed(e.target.value);
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', fetchArticles);
