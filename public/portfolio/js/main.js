/* ============================================================
   main.js — Hiển thị nội dung từ config + tương tác cơ bản.
   Thông thường KHÔNG cần sửa file này — chỉ sửa js/config.js.
   ============================================================ */
(function () {
  'use strict';

  const cfg = window.PORTFOLIO_CONFIG;

  /* ---------- Tiện ích nhỏ ---------- */
  const $ = (sel) => document.querySelector(sel);
  const setText = (sel, text) => {
    const el = $(sel);
    if (el && text != null) el.textContent = text;
  };

  /* ---------- 1. Điều hướng ---------- */
  const navToggle = $('#nav-toggle');
  const navLinks = $('#nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }
  const nav = $('#nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Hero & thương hiệu ---------- */
  setText('#nav-logo', cfg.brand);
  setText('#hero-badge', cfg.heroBadge);
  setText('#hero-title', cfg.heroTitle);
  setText('#hero-intro', cfg.heroIntro);
  document.title = cfg.brand + ' — Website trọn gói cho hộ kinh doanh nhỏ';

  /* ---------- 3. Thẻ website mẫu ---------- */
  const demosGrid = $('#demos-grid');
  if (demosGrid) {
    cfg.demos.forEach((d) => {
      const card = document.createElement('article');
      card.className = 'demo-card';
      card.innerHTML =
        '<img class="demo-thumb" src="' + d.img + '" alt="' + d.name + '" loading="lazy" ' +
        'onerror="this.onerror=null;this.src=\'https://picsum.photos/seed/' +
        encodeURIComponent(d.name) + '/800/500\';">' +
        '<div class="demo-body">' +
          '<span class="demo-tag">' + d.tag + '</span>' +
          '<h3>' + d.name + '</h3>' +
          '<p>' + d.desc + '</p>' +
          '<a class="btn btn-primary demo-btn" href="' + d.url + '" target="_blank" rel="noopener">Xem demo ↗</a>' +
        '</div>';
      demosGrid.appendChild(card);
    });
  }

  /* ---------- 4. Bảng giá ---------- */
  const pricingGrid = $('#pricing-grid');
  if (pricingGrid) {
    cfg.pricing.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'price-card' + (p.featured ? ' featured' : '');
      const li = p.features.map((f) => '<li>' + f + '</li>').join('');
      card.innerHTML =
        (p.featured ? '<span class="price-flag">⭐ Phổ biến nhất</span>' : '') +
        '<div class="price-name">' + p.name + '</div>' +
        '<div class="price-amount">' + p.amount + '</div>' +
        '<div class="price-time">⏱ ' + p.time + '</div>' +
        '<ul class="price-features">' + li + '</ul>' +
        '<button type="button" class="btn btn-primary" data-package="' + p.name + ' (' + p.amount + ')">Chọn gói này</button>';
      pricingGrid.appendChild(card);
    });
  }

  /* ---------- 4.5 Form báo giá: dropdown gói + hành vi nút "Chọn gói này" ----------
     Nút ở bảng giá cuộn tới form, tự chọn đúng gói và nháy sáng form. */
  const packageSelect = $('#package-select');
  if (packageSelect) {
    const optDefault = document.createElement('option');
    optDefault.value = 'Chưa chắc — cần tư vấn';
    optDefault.textContent = 'Chưa chắc — cần tư vấn';
    packageSelect.appendChild(optDefault);
    cfg.pricing.forEach((p) => {
      const o = document.createElement('option');
      o.value = p.name + ' (' + p.amount + ')';
      o.textContent = p.name + ' (' + p.amount + ')';
      packageSelect.appendChild(o);
    });
  }
  document.querySelectorAll('#pricing-grid [data-package]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-package');
      const form = $('#quote-form');
      if (packageSelect && val) packageSelect.value = val;
      if (form) {
        form.classList.add('flash');
        setTimeout(() => form.classList.remove('flash'), 1600);
        if (typeof form.scrollIntoView === 'function') {
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        const nameInput = form.querySelector('input[name="name"]');
        if (nameInput) setTimeout(() => nameInput.focus({ preventScroll: true }), 400);
      }
    });
  });

  /* ---------- 5. Quy trình 4 bước ---------- */
  const stepsGrid = $('#steps-grid');
  if (stepsGrid) {
    cfg.steps.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = 'step-card';
      card.innerHTML =
        '<div class="step-num">' + (i + 1) + '</div>' +
        '<h3>' + s.title + '</h3>' +
        '<p>' + s.desc + '</p>';
      stepsGrid.appendChild(card);
    });
  }

  /* ---------- 6. Liên hệ (Zalo / Messenger / Gọi điện) ----------
     Messenger chỉ hiện khi contact.facebook có link Fanpage thật. */
  const zaloBtn = $('#zalo-btn');
  const fbBtn = $('#fb-btn');
  const callBtn = $('#call-btn');
  if (zaloBtn) zaloBtn.href = cfg.contact.zalo;
  if (fbBtn) {
    const fbHref = (cfg.contact.facebook || '').trim();
    if (fbHref) { fbBtn.href = fbHref; } else { fbBtn.style.display = 'none'; }
  }
  if (callBtn) {
    callBtn.href = 'tel:+' + cfg.contact.phone.replace(/\D/g, '').replace(/^0/, '84');
  }

  /* ---------- 6.5 Form yêu cầu báo giá — gửi qua Formspree ----------
     ID khai báo trong js/config.js → formspreeId. ID rỗng/sai → chế độ demo. */
  const quoteForm = $('#quote-form');
  if (quoteForm) {
    const qid = (cfg.formspreeId || '').trim();
    const QUOTE_ENDPOINT = /^[a-z0-9]{4,16}$/i.test(qid) ? 'https://formspree.io/f/' + qid : '';
    const quoteBtn = quoteForm.querySelector('button[type="submit"]');
    const quoteBtnText = quoteBtn ? quoteBtn.textContent : '';
    quoteForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const name = this.elements['name'].value.trim();
      const phone = this.elements['phone'].value.trim();
      const pkg = this.elements['package'].value;
      const industry = this.elements['industry'] ? this.elements['industry'].value.trim() : '';
      const hasWebsite = this.elements['has_website'] ? this.elements['has_website'].value : '';
      const timeline = this.elements['timeline'] ? this.elements['timeline'].value : '';
      const hasContent = this.elements['has_content'] ? this.elements['has_content'].value : '';
      const altContact = this.elements['alt_contact'] ? this.elements['alt_contact'].value.trim() : '';
      const digits = phone.replace(/\D/g, '');
      if (!name) { alert('Bạn vui lòng nhập họ tên nhé!'); this.elements['name'].focus(); return; }
      if (digits.length < 9 || digits.length > 12) {
        alert('Số điện thoại chưa hợp lệ, bạn kiểm tra lại giúp mình nhé!');
        this.elements['phone'].focus();
        return;
      }
      if (!QUOTE_ENDPOINT) {
        alert('Cảm ơn ' + name + '! Tôi đã ghi nhận yêu cầu của bạn và sẽ liên hệ sớm nhất.');
        this.reset();
        return;
      }
      if (quoteBtn) { quoteBtn.disabled = true; quoteBtn.textContent = 'Đang gửi…'; }
      try {
        const res = await fetch(QUOTE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: name,
            phone: phone,
            package: pkg,
            industry: industry,
            has_website: hasWebsite,
            timeline: timeline,
            has_content: hasContent,
            alt_contact: altContact,
            from: 'Portfolio ' + cfg.brand,
          }),
        });
        if (!res.ok) throw new Error('Formspree trả lỗi ' + res.status);
        alert('Cảm ơn ' + name + '! Đã gửi yêu cầu gói "' + pkg + '". Tôi sẽ gọi lại cho bạn trong thời gian sớm nhất.');
        this.reset();
      } catch (err) {
        alert('Rất tiếc, gửi yêu cầu chưa thành công. Bạn vui lòng nhắn Zalo hoặc gọi theo số ' + cfg.contact.phone + ' nhé!');
      } finally {
        if (quoteBtn) { quoteBtn.disabled = false; quoteBtn.textContent = quoteBtnText; }
      }
    });
  }
  setText('#contact-name', cfg.contact.name || '');
  setText('#contact-phone-zalo', cfg.contact.phone);
  setText('#contact-phone-call', cfg.contact.phone);

  /* ---------- 7. Nút nổi góc màn hình ----------
     Messenger chỉ hiện khi contact.facebook có link Fanpage thật. */
  const zaloFloat = $('#zalo-btn-float');
  const fbFloat = $('#fb-btn-float');
  if (zaloFloat) zaloFloat.href = cfg.contact.zalo;
  if (fbFloat) {
    const fbHref = (cfg.contact.facebook || '').trim();
    if (fbHref) { fbFloat.href = fbHref; } else { fbFloat.style.display = 'none'; }
  }

  /* ---------- 8. Footer ---------- */
  setText('#footer-brand', '© ' + new Date().getFullYear() + ' ' + cfg.brand);
})();
