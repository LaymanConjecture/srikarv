// ============================================
// Blog Knowledge Graph — Post Panel + Routing
// ============================================

(function () {
  'use strict';

  const panel = document.getElementById('post-panel');
  let currentPostId = null;
  let handlingPopstate = false;

  // Find a post by ID
  function findPost(id) {
    return POSTS.find(p => p.id === id) || null;
  }

  // Get all posts connected to a given post (bidirectional)
  function getRelatedPosts(post) {
    const relatedIds = new Set(post.connections || []);

    // Also find posts that connect TO this post
    POSTS.forEach(p => {
      if (p.connections && p.connections.includes(post.id)) {
        relatedIds.add(p.id);
      }
    });

    return Array.from(relatedIds)
      .map(id => findPost(id))
      .filter(Boolean);
  }

  // Format date nicely
  function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Render the post panel content
  function renderPost(post) {
    const related = getRelatedPosts(post);
    const categoryClass = `category-${post.category}`;

    let relatedHTML = '';
    if (related.length > 0) {
      relatedHTML = `
        <div class="post-related">
          <h3>Related</h3>
          <ul class="post-related-list">
            ${related.map(r => `
              <li>
                <a data-post-id="${r.id}" onclick="openPost('${r.id}')">${r.title}</a>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    panel.innerHTML = `
      <div class="post-close">
        <button onclick="closePost()" aria-label="Close">&times;</button>
      </div>
      <div class="post-inner">
        <div class="post-meta">
          <span class="post-date">${formatDate(post.date)}</span>
          <span class="post-category ${categoryClass}">${post.category}</span>
        </div>
        <h1 class="post-title">${post.title}</h1>
        <p class="post-subtitle">${post.subtitle}</p>
        <div class="post-content">
          ${post.content}
        </div>
        ${relatedHTML}
      </div>
    `;
  }

  // Open a post
  window.openPost = function (postId) {
    const post = findPost(postId);
    if (!post) return;

    currentPostId = postId;
    renderPost(post);

    // Scroll to top of panel
    panel.scrollTop = 0;

    // Update URL (safe for file:// protocol)
    if (!handlingPopstate) {
      try { history.pushState({ postId: postId }, '', '/' + postId); } catch (e) {}
    }

    // Update page title
    document.title = post.title + ' — Life Panel';

    // Trigger transitions
    requestAnimationFrame(() => {
      panel.classList.add('open');
      if (typeof shiftGraph === 'function') {
        shiftGraph(true);
      }
    });
  };

  // Close the post panel
  window.closePost = function () {
    if (!currentPostId) return;
    currentPostId = null;

    panel.classList.remove('open');
    if (typeof shiftGraph === 'function') {
      shiftGraph(false);
    }

    // Update URL (safe for file:// protocol)
    if (!handlingPopstate) {
      try { history.pushState({}, '', '/'); } catch (e) {}
    }

    // Restore page title
    document.title = 'Life Panel — Blog';
  };

  // Handle browser back/forward
  window.addEventListener('popstate', function (event) {
    handlingPopstate = true;
    if (event.state && event.state.postId) {
      const post = findPost(event.state.postId);
      if (post) {
        currentPostId = event.state.postId;
        renderPost(post);
        panel.scrollTop = 0;
        document.title = post.title + ' — Life Panel';
        requestAnimationFrame(() => {
          panel.classList.add('open');
          if (typeof shiftGraph === 'function') shiftGraph(true);
        });
      }
    } else {
      if (currentPostId) {
        currentPostId = null;
        panel.classList.remove('open');
        if (typeof shiftGraph === 'function') shiftGraph(false);
        document.title = 'Life Panel — Blog';
      }
    }
    handlingPopstate = false;
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentPostId) {
      closePost();
    }
  });

  // Check URL on load for direct article links
  function checkInitialRoute() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    const postId = segments[segments.length - 1];
    if (postId && postId !== 'index.html') {
      const post = findPost(postId);
      if (post) {
        history.replaceState({ postId: postId }, '', path);
        openPost(postId);
      }
    }
  }

  // Run after graph init (which also fires on DOMContentLoaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(checkInitialRoute, 50));
  } else {
    setTimeout(checkInitialRoute, 50);
  }

})();
