// ============================================
// Blog Knowledge Graph — Annotation System
// ============================================
// Select text in articles, leave comments, export all annotations.
// Persists to localStorage. Works on file:// protocol.

(function () {
  'use strict';

  const STORAGE_KEY = 'lifepanel-annotations';
  let annotationMode = false;
  let currentArticleId = null;

  // --- Storage ---

  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getAnnotations(articleId) {
    return loadAll()[articleId] || [];
  }

  function saveAnnotation(articleId, text, comment) {
    const data = loadAll();
    if (!data[articleId]) data[articleId] = [];
    data[articleId].push({
      id: Math.random().toString(36).slice(2, 8),
      text: text,
      comment: comment,
      ts: Date.now()
    });
    saveAll(data);
  }

  function updateAnnotation(articleId, annId, newComment) {
    const data = loadAll();
    const list = data[articleId] || [];
    const ann = list.find(a => a.id === annId);
    if (ann) {
      ann.comment = newComment;
      ann.ts = Date.now();
      saveAll(data);
    }
  }

  function deleteAnnotation(articleId, annId) {
    const data = loadAll();
    if (!data[articleId]) return;
    data[articleId] = data[articleId].filter(a => a.id !== annId);
    if (data[articleId].length === 0) delete data[articleId];
    saveAll(data);
  }

  // --- Selection Popup (created once, shown/hidden) ---

  const popup = document.createElement('div');
  popup.className = 'ann-popup';
  popup.innerHTML = `
    <textarea class="ann-popup-text" rows="3" placeholder="Your comment..."></textarea>
    <div class="ann-popup-actions">
      <button class="ann-popup-save">Save</button>
      <button class="ann-popup-cancel">Cancel</button>
    </div>
  `;
  popup.style.display = 'none';
  document.body.appendChild(popup);

  const popupTextarea = popup.querySelector('.ann-popup-text');
  let pendingSelectionText = '';

  popup.querySelector('.ann-popup-save').addEventListener('click', function () {
    const comment = popupTextarea.value.trim();
    if (comment && pendingSelectionText && currentArticleId) {
      saveAnnotation(currentArticleId, pendingSelectionText, comment);
      hidePopup();
      applyHighlights(currentArticleId);
      renderCommentsSection(currentArticleId);
    }
  });

  popup.querySelector('.ann-popup-cancel').addEventListener('click', hidePopup);

  function showPopup(x, y) {
    popup.style.display = 'block';
    // Position near selection, but keep within viewport
    const pw = popup.offsetWidth;
    const ph = popup.offsetHeight;
    let left = x - pw / 2;
    let top = y + 10;
    if (left < 8) left = 8;
    if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
    if (top + ph > window.innerHeight - 8) top = y - ph - 10;
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
    popupTextarea.value = '';
    popupTextarea.focus();
  }

  function hidePopup() {
    popup.style.display = 'none';
    pendingSelectionText = '';
  }

  // --- Comment Tooltip (for clicking highlights) ---

  const tooltip = document.createElement('div');
  tooltip.className = 'ann-tooltip';
  tooltip.style.display = 'none';
  document.body.appendChild(tooltip);

  function showTooltip(mark, ann) {
    const rect = mark.getBoundingClientRect();
    tooltip.innerHTML = `
      <div class="ann-tooltip-comment">${escapeHtml(ann.comment)}</div>
      <div class="ann-tooltip-actions">
        <button class="ann-tooltip-edit">Edit</button>
        <button class="ann-tooltip-delete">Delete</button>
      </div>
    `;
    tooltip.style.display = 'block';

    // Position below the highlight
    const tw = tooltip.offsetWidth;
    let left = rect.left + rect.width / 2 - tw / 2;
    let top = rect.bottom + 6;
    if (left < 8) left = 8;
    if (left + tw > window.innerWidth - 8) left = window.innerWidth - tw - 8;
    if (top + tooltip.offsetHeight > window.innerHeight - 8) {
      top = rect.top - tooltip.offsetHeight - 6;
    }
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';

    tooltip.querySelector('.ann-tooltip-edit').onclick = function () {
      hideTooltip();
      const newComment = prompt('Edit comment:', ann.comment);
      if (newComment !== null && newComment.trim()) {
        updateAnnotation(currentArticleId, ann.id, newComment.trim());
        applyHighlights(currentArticleId);
        renderCommentsSection(currentArticleId);
      }
    };

    tooltip.querySelector('.ann-tooltip-delete').onclick = function () {
      hideTooltip();
      deleteAnnotation(currentArticleId, ann.id);
      applyHighlights(currentArticleId);
      renderCommentsSection(currentArticleId);
    };
  }

  function hideTooltip() {
    tooltip.style.display = 'none';
  }

  // Close tooltip/popup when clicking outside
  document.addEventListener('mousedown', function (e) {
    if (!tooltip.contains(e.target) && !e.target.classList.contains('ann-highlight')) {
      hideTooltip();
    }
    if (!popup.contains(e.target)) {
      // Don't hide popup on the mousedown that triggers selection
      // Only hide if it's visible and click is outside
      if (popup.style.display === 'block') {
        hidePopup();
      }
    }
  });

  // --- Highlight Application ---

  function applyHighlights(articleId) {
    const contentEl = document.querySelector('#post-panel .post-content');
    if (!contentEl) return;

    // Remove existing highlights first (re-render from clean HTML)
    const existing = contentEl.querySelectorAll('mark.ann-highlight');
    existing.forEach(function (mark) {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      parent.normalize();
    });

    const annotations = getAnnotations(articleId);
    if (!annotations.length) return;

    // For each annotation, walk text nodes and wrap matches
    annotations.forEach(function (ann) {
      wrapTextMatch(contentEl, ann.text, ann.id);
    });
  }

  function wrapTextMatch(root, searchText, annId) {
    // Use TreeWalker to find text nodes
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    // Try to find the search text across consecutive text nodes
    // First, try single-node match
    for (let i = 0; i < textNodes.length; i++) {
      const node = textNodes[i];
      const idx = node.textContent.indexOf(searchText);
      if (idx !== -1) {
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + searchText.length);
        const mark = document.createElement('mark');
        mark.className = 'ann-highlight';
        mark.dataset.annId = annId;
        try {
          range.surroundContents(mark);
        } catch (e) {
          // surroundContents fails if range crosses element boundaries
          // Fall back: just mark the first part we can
        }
        return true;
      }
    }

    // Multi-node match: concatenate consecutive text nodes to find spanning matches
    for (let i = 0; i < textNodes.length; i++) {
      let combined = '';
      let nodeSpans = [];
      for (let j = i; j < textNodes.length && combined.length < searchText.length + 500; j++) {
        const start = combined.length;
        combined += textNodes[j].textContent;
        nodeSpans.push({ node: textNodes[j], start: start, end: combined.length });

        const idx = combined.indexOf(searchText);
        if (idx !== -1) {
          // Found it spanning nodes i..j
          // Wrap each involved text node's portion
          for (let k = 0; k < nodeSpans.length; k++) {
            const span = nodeSpans[k];
            const matchStart = Math.max(idx, span.start) - span.start;
            const matchEnd = Math.min(idx + searchText.length, span.end) - span.start;
            if (matchEnd <= matchStart) continue;

            const node = span.node;
            if (matchStart > 0) {
              node.splitText(matchStart);
              const next = node.nextSibling;
              if (matchEnd - matchStart < next.textContent.length) {
                next.splitText(matchEnd - matchStart);
              }
              const mark = document.createElement('mark');
              mark.className = 'ann-highlight';
              mark.dataset.annId = annId;
              next.parentNode.insertBefore(mark, next);
              mark.appendChild(next);
            } else {
              if (matchEnd < node.textContent.length) {
                node.splitText(matchEnd);
              }
              const mark = document.createElement('mark');
              mark.className = 'ann-highlight';
              mark.dataset.annId = annId;
              node.parentNode.insertBefore(mark, node);
              mark.appendChild(node);
            }
          }
          return true;
        }
      }
    }

    return false; // orphaned
  }

  // --- Handle highlight clicks ---

  document.addEventListener('click', function (e) {
    const mark = e.target.closest('mark.ann-highlight');
    if (!mark || !currentArticleId) return;
    e.stopPropagation();
    const annId = mark.dataset.annId;
    const annotations = getAnnotations(currentArticleId);
    const ann = annotations.find(a => a.id === annId);
    if (ann) {
      showTooltip(mark, ann);
    }
  });

  // --- Selection Handler ---

  function handleSelection(e) {
    if (!annotationMode || !currentArticleId) return;

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) return;

    // Make sure selection is inside .post-content
    const contentEl = document.querySelector('#post-panel .post-content');
    if (!contentEl) return;
    const anchor = sel.anchorNode;
    const focus = sel.focusNode;
    if (!contentEl.contains(anchor) || !contentEl.contains(focus)) return;

    pendingSelectionText = sel.toString().trim();
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    showPopup(rect.left + rect.width / 2, rect.bottom);
  }

  document.addEventListener('mouseup', function (e) {
    // Small delay to let selection finalize
    if (!annotationMode) return;
    // Don't trigger on popup/tooltip clicks
    if (popup.contains(e.target) || tooltip.contains(e.target)) return;
    setTimeout(function () { handleSelection(e); }, 10);
  });

  // --- Comments Section ---

  function renderCommentsSection(articleId) {
    const panel = document.querySelector('#post-panel .post-inner');
    if (!panel) return;

    // Remove existing comments section
    const existing = panel.querySelector('.ann-comments');
    if (existing) existing.remove();

    const annotations = getAnnotations(articleId);
    if (!annotations.length) return;

    const section = document.createElement('div');
    section.className = 'ann-comments';

    let html = '<h3>Annotations</h3>';
    annotations.forEach(function (ann, i) {
      const orphaned = !isTextInContent(ann.text);
      html += `
        <div class="ann-comment-item${orphaned ? ' ann-orphaned' : ''}" data-ann-id="${ann.id}">
          <div class="ann-comment-num">[${i + 1}]</div>
          <div class="ann-comment-body">
            <div class="ann-comment-quote">"${escapeHtml(truncate(ann.text, 80))}"</div>
            <div class="ann-comment-text">${escapeHtml(ann.comment)}</div>
            ${orphaned ? '<div class="ann-comment-orphaned">(text no longer found in article)</div>' : ''}
          </div>
          <div class="ann-comment-actions">
            <button class="ann-comment-edit" data-ann-id="${ann.id}">Edit</button>
            <button class="ann-comment-delete" data-ann-id="${ann.id}">Delete</button>
          </div>
        </div>
      `;
    });

    html += '<button class="ann-copy-all">Copy All Annotations</button>';
    section.innerHTML = html;

    // Event delegation for edit/delete/copy
    section.addEventListener('click', function (e) {
      const editBtn = e.target.closest('.ann-comment-edit');
      const deleteBtn = e.target.closest('.ann-comment-delete');
      const copyBtn = e.target.closest('.ann-copy-all');

      if (editBtn) {
        const id = editBtn.dataset.annId;
        const ann = getAnnotations(articleId).find(a => a.id === id);
        if (ann) {
          const newComment = prompt('Edit comment:', ann.comment);
          if (newComment !== null && newComment.trim()) {
            updateAnnotation(articleId, id, newComment.trim());
            applyHighlights(articleId);
            renderCommentsSection(articleId);
          }
        }
      }

      if (deleteBtn) {
        const id = deleteBtn.dataset.annId;
        deleteAnnotation(articleId, id);
        applyHighlights(articleId);
        renderCommentsSection(articleId);
      }

      if (copyBtn) {
        exportAnnotations();
      }
    });

    panel.appendChild(section);
  }

  function isTextInContent(text) {
    const contentEl = document.querySelector('#post-panel .post-content');
    if (!contentEl) return false;
    return contentEl.textContent.indexOf(text) !== -1;
  }

  // --- Export ---

  function exportAnnotations() {
    const data = loadAll();
    const articleIds = Object.keys(data);
    if (!articleIds.length) {
      alert('No annotations to export.');
      return;
    }

    let output = '';
    articleIds.forEach(function (articleId) {
      // Try to find article title
      let title = articleId;
      if (typeof POSTS !== 'undefined') {
        const post = POSTS.find(p => p.id === articleId);
        if (post) title = post.title;
      }

      output += '=== ' + title + ' ===\n\n';
      data[articleId].forEach(function (ann, i) {
        output += '[' + (i + 1) + '] "' + truncate(ann.text, 120) + '"\n';
        output += '    → ' + ann.comment + '\n\n';
      });
    });

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(output.trim()).then(function () {
        showCopyFeedback();
      }, function () {
        fallbackCopy(output.trim());
      });
    } else {
      fallbackCopy(output.trim());
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showCopyFeedback();
    } catch (e) {
      alert('Could not copy. Here are your annotations:\n\n' + text);
    }
    document.body.removeChild(ta);
  }

  function showCopyFeedback() {
    const btn = document.querySelector('.ann-copy-all');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = orig;
        btn.disabled = false;
      }, 1500);
    }
  }

  // --- Pencil Button & Mode Toggle ---

  function toggleAnnotationMode() {
    annotationMode = !annotationMode;
    const btn = document.querySelector('.ann-btn');
    if (btn) {
      btn.classList.toggle('active', annotationMode);
    }
    // Change cursor on post content
    const contentEl = document.querySelector('#post-panel .post-content');
    if (contentEl) {
      contentEl.style.cursor = annotationMode ? 'text' : '';
    }
    if (!annotationMode) {
      hidePopup();
      hideTooltip();
    }
  }

  function injectPencilButton() {
    const closeDiv = document.querySelector('#post-panel .post-close');
    if (!closeDiv) return;
    // Don't double-inject
    if (closeDiv.querySelector('.ann-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'ann-btn';
    btn.setAttribute('aria-label', 'Toggle annotations');
    btn.innerHTML = '&#9998;'; // pencil unicode
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleAnnotationMode();
    });

    // Insert before the close button
    const closeBtn = closeDiv.querySelector('button');
    closeDiv.insertBefore(btn, closeBtn);
  }

  // --- Hook into openPost via monkey-patch ---

  const originalOpenPost = window.openPost;

  window.openPost = function (postId) {
    // Reset mode when switching articles
    annotationMode = false;
    hidePopup();
    hideTooltip();

    // Call original
    originalOpenPost(postId);

    currentArticleId = postId;

    // Inject our UI after a tick (DOM needs to render)
    requestAnimationFrame(function () {
      injectPencilButton();
      applyHighlights(postId);
      renderCommentsSection(postId);
    });
  };

  // Also hook closePost to clean up
  const originalClosePost = window.closePost;

  window.closePost = function () {
    annotationMode = false;
    currentArticleId = null;
    hidePopup();
    hideTooltip();
    originalClosePost();
  };

  // --- Utilities ---

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function truncate(str, len) {
    if (str.length <= len) return str;
    return str.slice(0, len) + '...';
  }

})();
