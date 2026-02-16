// ============================================
// Blog Knowledge Graph — D3.js Force Graph
// ============================================

(function () {
  'use strict';

  const NODE_WIDTH = 220;
  const NODE_HEIGHT = 72;
  const NODE_RX = 14;
  const PADDING = 12;

  let svg, g, simulation, nodeElements, edgeElements, edgeLabelElements;
  let width, height;
  let currentPostId = null;

  // Build edge list from POSTS connections (bidirectional, deduplicated)
  function buildEdges() {
    const edgeSet = new Set();
    const edges = [];
    POSTS.forEach(post => {
      (post.connections || []).forEach(conn => {
        // Support both string and {id, label} connection formats
        const targetId = typeof conn === 'string' ? conn : conn.id;
        const label = typeof conn === 'string' ? '' : (conn.label || '');
        const key = [post.id, targetId].sort().join('--');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ source: post.id, target: targetId, label });
        }
      });
    });
    return edges;
  }

  // SVG filters — expensive, applied only after simulation settles
  let filtersActive = false;

  function createFilters(defs) {
    const filter = defs.append('filter')
      .attr('id', 'rough')
      .attr('x', '-5%')
      .attr('y', '-5%')
      .attr('width', '110%')
      .attr('height', '110%');

    filter.append('feTurbulence')
      .attr('type', 'turbulence')
      .attr('baseFrequency', '0.03')
      .attr('numOctaves', '3')
      .attr('result', 'noise')
      .attr('seed', '2');

    filter.append('feDisplacementMap')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'noise')
      .attr('scale', '1.8')
      .attr('xChannelSelector', 'R')
      .attr('yChannelSelector', 'G');

    const shadow = defs.append('filter')
      .attr('id', 'shadow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');

    shadow.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '3')
      .attr('stdDeviation', '6')
      .attr('flood-color', 'rgba(0,0,0,0.07)');
  }

  // Position edge labels once — computes geometry once per label
  function positionEdgeLabels() {
    edgeLabelElements.each(function (d) {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const offset = len * 0.1;
      const mx = (d.source.x + d.target.x) / 2;
      const my = (d.source.y + d.target.y) / 2;
      const cx = Math.round(mx + (-dy / len * offset));
      const cy = Math.round(my + (dx / len * offset));
      let angle = Math.atan2(dy, dx) * 180 / Math.PI;
      if (angle > 90) angle -= 180;
      if (angle < -90) angle += 180;

      d3.select(this)
        .attr('x', cx)
        .attr('y', cy)
        .attr('transform', `rotate(${angle}, ${cx}, ${cy})`);
    });
  }

  function enableFilters() {
    if (filtersActive) return;
    filtersActive = true;
    edgeElements.attr('filter', 'url(#rough)');
    nodeElements.selectAll('path').attr('filter', 'url(#shadow)');
    // Show and position edge labels now that graph has settled
    positionEdgeLabels();
    edgeLabelElements.style('display', null);
  }

  function disableFilters() {
    if (!filtersActive) return;
    filtersActive = false;
    edgeElements.attr('filter', null);
    nodeElements.selectAll('path').attr('filter', null);
    // Hide edge labels during motion
    edgeLabelElements.style('display', 'none');
  }

  // Generate a subtly wobbly rounded rect path
  function wobbleRect(w, h, rx, seed) {
    const rng = mulberry32(seed);
    const wobble = (val) => val + (rng() - 0.5) * 2.2;

    const r = Math.min(rx, w / 2, h / 2);
    // Slightly irregular rounded rectangle
    return `M ${wobble(r)},0
            L ${wobble(w - r)},${wobble(0)}
            Q ${wobble(w)},${wobble(0)} ${wobble(w)},${wobble(r)}
            L ${wobble(w)},${wobble(h - r)}
            Q ${wobble(w)},${wobble(h)} ${wobble(w - r)},${wobble(h)}
            L ${wobble(r)},${wobble(h)}
            Q ${wobble(0)},${wobble(h)} ${wobble(0)},${wobble(h - r)}
            L ${wobble(0)},${wobble(r)}
            Q ${wobble(0)},${wobble(0)} ${wobble(r)},${wobble(0)}
            Z`;
  }

  // Simple seeded PRNG
  function mulberry32(seed) {
    let a = seed | 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Hash string to number for seeded randomness
  function hashStr(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // Curved edge path with slight hand-drawn wobble
  function edgePath(d) {
    const sx = Math.round(d.source.x), sy = Math.round(d.source.y);
    const tx = Math.round(d.target.x), ty = Math.round(d.target.y);
    const mx = (sx + tx) / 2;
    const my = (sy + ty) / 2;
    // Offset the midpoint perpendicular to the line for curvature
    const dx = tx - sx, dy = ty - sy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const offset = len * 0.1;
    const nx = -dy / len * offset;
    const ny = dx / len * offset;
    return `M ${sx},${sy} Q ${Math.round(mx + nx)},${Math.round(my + ny)} ${tx},${ty}`;
  }

  // Truncate text to fit within node width
  function truncateTitle(text, maxChars) {
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars - 1) + '...';
  }

  function init() {
    const container = document.getElementById('graph-container');
    width = container.clientWidth;
    height = container.clientHeight;

    const edges = buildEdges();

    svg = d3.select('#graph-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const defs = svg.append('defs');
    createFilters(defs);

    // Zoom behavior
    let zoomTimer;
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        // Disable filters during active pan/zoom
        disableFilters();
        clearTimeout(zoomTimer);
        zoomTimer = setTimeout(enableFilters, 300);
      });

    svg.call(zoom);

    // Disable double-click zoom
    svg.on('dblclick.zoom', null);

    g = svg.append('g');

    // Center the initial view
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(1)
      .translate(-width / 2, -height / 2);
    svg.call(zoom.transform, initialTransform);

    // Draw edges first (below nodes)
    edgeElements = g.selectAll('.edge')
      .data(edges)
      .enter()
      .append('path')
      .attr('class', 'edge');

    // Edge labels — hidden until simulation settles
    edgeLabelElements = g.selectAll('.edge-label')
      .data(edges.filter(e => e.label))
      .enter()
      .append('text')
      .attr('class', 'edge-label')
      .attr('text-anchor', 'middle')
      .attr('dy', -8)
      .style('display', 'none')
      .text(d => d.label);

    // Draw nodes
    nodeElements = g.selectAll('.node')
      .data(POSTS)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));

    // Node background (wobbly rounded rect)
    nodeElements.each(function (d, i) {
      const colors = CATEGORY_COLORS[d.category] || CATEGORY_COLORS.philosophy;
      const seed = hashStr(d.id);

      d3.select(this).append('path')
        .attr('d', wobbleRect(NODE_WIDTH, NODE_HEIGHT, NODE_RX, seed))
        .attr('fill', colors.fill)
        .attr('stroke', colors.stroke)
        .attr('stroke-width', 2);
    });

    // Node title text
    nodeElements.append('text')
      .attr('class', 'node-title')
      .attr('x', NODE_WIDTH / 2)
      .attr('y', NODE_HEIGHT / 2 - 6)
      .attr('text-anchor', 'middle')
      .text(d => truncateTitle(d.title, 24));

    // Node subtitle text
    nodeElements.append('text')
      .attr('class', 'node-subtitle')
      .attr('x', NODE_WIDTH / 2)
      .attr('y', NODE_HEIGHT / 2 + 14)
      .attr('text-anchor', 'middle')
      .text(d => truncateTitle(d.subtitle, 32));

    // Click handler
    nodeElements.on('click', (event, d) => {
      event.stopPropagation();
      if (typeof openPost === 'function') {
        openPost(d.id);
      }
    });

    // Hover effects
    nodeElements
      .on('mouseenter', (event, d) => {
        highlightConnections(d.id);
      })
      .on('mouseleave', () => {
        clearHighlights();
      });

    // Click on background to close post
    svg.on('click', () => {
      if (typeof closePost === 'function') {
        closePost();
      }
    });

    // Force simulation — pre-compute layout, render once (no initial animation)
    simulation = d3.forceSimulation(POSTS)
      .force('link', d3.forceLink(edges)
        .id(d => d.id)
        .distance(280)
        .strength(0.4))
      .force('charge', d3.forceManyBody()
        .strength(-600))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius(NODE_WIDTH / 2 + 30))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .alphaDecay(0.05)
      .stop();

    simulation.tick(300);
    ticked();
    enableFilters();

    simulation.on('tick', ticked);
  }

  function ticked() {
    nodeElements.attr('transform', d =>
      `translate(${Math.round(d.x - NODE_WIDTH / 2)}, ${Math.round(d.y - NODE_HEIGHT / 2)})`
    );
    edgeElements.attr('d', edgePath);

    // Enable expensive filters only once simulation has nearly settled
    if (!filtersActive && simulation.alpha() < 0.05) {
      enableFilters();
    }
  }

  // Drag handlers — disable expensive filters during drag for smooth interaction
  function dragStarted(event, d) {
    disableFilters();
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    // Re-enable filters after simulation settles (handled in ticked)
  }

  // Highlight connected nodes and edges
  function highlightConnections(postId) {
    const connectedIds = new Set();
    connectedIds.add(postId);

    // Build connected set from edges
    edgeElements.each(function (d) {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      if (sourceId === postId || targetId === postId) {
        connectedIds.add(sourceId);
        connectedIds.add(targetId);
      }
    });

    edgeElements.each(function (d) {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const isConnected = sourceId === postId || targetId === postId;
      d3.select(this)
        .classed('highlighted', isConnected)
        .classed('dimmed', !isConnected);
    });

    edgeLabelElements.each(function (d) {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const isConnected = sourceId === postId || targetId === postId;
      d3.select(this)
        .classed('highlighted', isConnected)
        .classed('dimmed', !isConnected);
    });

    nodeElements.each(function (d) {
      d3.select(this).classed('dimmed', !connectedIds.has(d.id));
    });
  }

  function clearHighlights() {
    edgeElements.classed('highlighted', false).classed('dimmed', false);
    edgeLabelElements.classed('highlighted', false).classed('dimmed', false);
    nodeElements.classed('dimmed', false);
  }

  // Shift graph when post opens — transition only active during shift
  window.shiftGraph = function (open) {
    const el = document.getElementById('graph-container');
    el.classList.add('shifting');
    el.classList.toggle('shifted', open);
    const onEnd = () => {
      el.classList.remove('shifting');
      el.removeEventListener('transitionend', onEnd);
    };
    el.addEventListener('transitionend', onEnd);
  };

  // Resize handler
  function handleResize() {
    disableFilters();
    const container = document.getElementById('graph-container');
    width = container.clientWidth;
    height = container.clientHeight;
    svg.attr('width', width).attr('height', height);
    simulation.force('center', d3.forceCenter(width / 2, height / 2));
    simulation.force('x', d3.forceX(width / 2).strength(0.05));
    simulation.force('y', d3.forceY(height / 2).strength(0.05));
    simulation.alpha(0.3).restart();
  }

  window.addEventListener('resize', debounce(handleResize, 250));

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
