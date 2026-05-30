/* ═══════════════════════════════════════════════════════════
   Magic Shadows — Shared Web Components
   ═══════════════════════════════════════════════════════════ */

/* ─── <char-form> — data carrier only ─── */
class CharForm extends HTMLElement {}
customElements.define('char-form', CharForm);

/* ─── <character-card> — full detail section ───
 *
 * Attributes (superset across all characters):
 *   name          – character name
 *   index         – display number e.g. "01"
 *   creature      – species / race
 *   age           – numeric age
 *   skill         – unique origin of power / skill note
 *   powers        – comma-separated list of powers
 *   equipment     – weapons / items
 *   gem           – gem type
 *   elven-status  – royal or family status in elven hierarchy
 *   flaw          – character flaw description
 *   story         – biography / personality paragraph
 *   cover         – path to main cover image (empty = placeholder)
 *   accent        – CSS hex color for this character's theme
 *
 * Children:
 *   <char-form section="🦊 Fox Form" label="Fox Form" src="images/...">
 */
class CharacterCard extends HTMLElement {
  connectedCallback() {
    const a = (name) => this.getAttribute(name) || '';

    const accent = a('accent') || '#38d8f5';
    const name   = a('name')   || 'Unknown';
    const index  = a('index')  || '??';
    const cover  = a('cover');
    const powers = a('powers').split(',').map(p => p.trim()).filter(Boolean);
    const story  = a('story');

    /* Collect <char-form> children, group by section */
    const forms = [...this.querySelectorAll('char-form')];
    const sections = {};
    forms.forEach(f => {
      const sec = f.getAttribute('section') || 'Other';
      if (!sections[sec]) sections[sec] = [];
      sections[sec].push({ label: f.getAttribute('label') || '', src: f.getAttribute('src') || '' });
    });

    /* Helpers */
    const stat = (label, value, wide = false) => {
      const missing = !value;
      return `
        <div class="stat${wide ? ' wide' : ''}${missing ? ' missing' : ''}">
          <div class="stat-label" style="color:${accent}">${label}</div>
          <div class="stat-value">${value || 'Coming soon…'}</div>
        </div>`;
    };

    const powerTags = powers.length
      ? `<div class="powers-list">${powers.map(p =>
          `<span class="power-tag" style="background:${accent}22;border:1px solid ${accent}55;color:${accent}">✦ ${p}</span>`
        ).join('')}</div>`
      : `<div class="stat-value" style="font-style:italic;color:rgba(255,255,255,.3)">Coming soon…</div>`;

    const coverHtml = cover
      ? `<div class="intro-img-wrap"><img src="${cover}" alt="${name} — main" loading="lazy"/></div>`
      : `<div class="intro-img-wrap"><div class="img-placeholder"><span>✦</span>Art coming soon</div></div>`;

    const galleriesHtml = Object.entries(sections).map(([secLabel, items]) => {
      const cards = items.map(item => {
        const imgHtml = item.src
          ? `<img src="${item.src}" alt="${item.label}" loading="lazy"/>`
          : `<div class="form-placeholder"><span>✦</span>Coming soon</div>`;
        const click = item.src ? `onclick="openLightbox('${item.src}')"` : '';
        return `
          <div class="form-card" ${click}>
            ${imgHtml}
            <div class="form-card-label" style="color:${accent}">${item.label}</div>
          </div>`;
      }).join('');
      return `
        <div class="forms-section-title" style="color:${accent}">${secLabel}</div>
        <div class="forms-grid">${cards}</div>`;
    }).join('');

    const storyHtml = story
      ? `<div class="story-box" style="border-color:${accent}33;--story-accent:${accent}">${story}</div>`
      : `<div class="story-box missing">✦ Story coming soon ✦</div>`;

    const html = `
      <div class="section-inner">
        <p class="char-label" style="color:${accent}">Character ${index}</p>
        <h2 class="char-title" style="background:linear-gradient(135deg,#fff,${accent});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${name}</h2>

        <div class="intro-card">
          ${coverHtml}
          <div>
            <div class="stat-grid">
              ${stat('Creature',     a('creature'))}
              ${stat('Age',          a('age'))}
              ${stat('Gem',          a('gem'))}
              ${stat('Elven Status', a('elven-status'))}
              ${stat('Equipment',    a('equipment'))}
              ${stat('Skill Origin', a('skill'))}
              <div class="stat wide">
                <div class="stat-label" style="color:${accent}">Powers</div>
                ${powerTags}
              </div>
              <div class="stat wide${a('flaw') ? '' : ' missing'}">
                <div class="stat-label" style="color:${accent}">Flaw</div>
                <div class="stat-value" style="font-weight:400;font-size:.9rem;color:#c8a8e8">
                  ${a('flaw') || 'Coming soon…'}
                </div>
              </div>
            </div>
          </div>
        </div>

        ${storyHtml}

        <div class="gem-divider">
          <div class="gem-icon" style="background:radial-gradient(circle at 35% 35%,#fff,${accent} 60%,#1a4a8a);filter:drop-shadow(0 0 6px ${accent})"></div>
        </div>

        ${galleriesHtml}
      </div>`;

    const wrapper = document.createElement('div');
    wrapper.className = 'character-section';
    wrapper.innerHTML = html;
    this.replaceWith(wrapper);
  }
}
customElements.define('character-card', CharacterCard);

/* ─── <location-card> — a single location entry ───
 *
 * Attributes:
 *   name        – location name
 *   img         – image path
 *   description – paragraph describing the location
 *   accent      – optional CSS hex color (default: #38d8f5)
 */
class LocationCard extends HTMLElement {
  connectedCallback() {
    const name  = this.getAttribute('name')        || 'Unknown Location';
    const img   = this.getAttribute('img')         || '';
    const desc  = this.getAttribute('description') || '';
    const accent = this.getAttribute('accent')     || '#38d8f5';

    const imgHtml = img
      ? `<img src="${img}" alt="${name}" loading="lazy" onclick="openLightbox('${img}')" />`
      : `<div class="loc-img-placeholder"><span>✦</span>Art coming soon</div>`;

    const html = `
      <div class="location-card" style="--loc-accent:${accent}">
        <div class="location-card-img" style="border-color:${accent}33">
          ${imgHtml}
          <div class="location-card-overlay"></div>
          <h3 class="location-card-name" style="color:${accent}">${name}</h3>
        </div>
        ${desc ? `<p class="location-card-desc">${desc}</p>` : `<p class="location-card-desc missing">Description coming soon…</p>`}
      </div>`;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    this.replaceWith(wrapper.firstElementChild);
  }
}
customElements.define('location-card', LocationCard);

/* ─── Lightbox ─── */
window.openLightbox = function(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
};
window.closeLightbox = function() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
};
document.addEventListener('keydown', e => { if (e.key === 'Escape') window.closeLightbox(); });
