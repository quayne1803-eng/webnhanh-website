/* ============================================================
   main.js — Hiển thị nội dung từ config + tương tác cơ bản.
   Thông thường KHÔNG cần sửa file này — chỉ sửa js/config.js.
   ============================================================ */
(function () {
  'use strict';

  const cfg = window.BUSINESS_CONFIG;

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
  // Đổi nền thanh điều hướng khi cuộn xuống
  const nav = $('#nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Hero, tiêu đề trang & Giới thiệu ---------- */
  setText('#business-name', cfg.business.name);
  setText('#business-tagline', cfg.business.tagline);
  setText('#hero-cta', cfg.ctaText);
  setText('#nav-cta', cfg.ctaText);
  setText('#nav-logo', cfg.business.name);
  document.title = cfg.business.name + ' — ' + cfg.business.tagline;

  const hero = $('#hero');
  if (hero) hero.style.backgroundImage = "url('" + cfg.images.hero + "')";

  const aboutImg = $('#about-img');
  if (aboutImg) {
    aboutImg.src = cfg.images.about;
    aboutImg.alt = 'Không gian ' + cfg.business.name;
    aboutImg.onerror = () => {
      aboutImg.onerror = null;
      aboutImg.src = cfg.images.fallback + '-about/900/700';
    };
  }
  setText('#about-text', cfg.business.about);

  /* ---------- 3. Thực đơn / Dịch vụ (render từ config) ---------- */
  const grid = $('#services-grid');
  if (grid) {
    cfg.services.forEach((s) => {
      const card = document.createElement('article');
      card.className = 'service-card';
      card.innerHTML =
        '<div class="service-icon" aria-hidden="true">' + s.icon + '</div>' +
        '<h3>' + s.name + '</h3>' +
        '<p>' + s.desc + '</p>' +
        '<div class="service-price">' + s.price + '</div>';
      grid.appendChild(card);
    });
  }

  /* ---------- 4. Thư viện ảnh (có ảnh dự phòng nếu link hỏng) ---------- */
  const gallery = $('#gallery-grid');
  if (gallery) {
    cfg.images.gallery.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = cfg.business.name + ' — ảnh ' + (i + 1);
      img.loading = 'lazy';
      img.onerror = () => {
        img.onerror = null;
        img.src = cfg.images.fallback + '-' + i + '/700/500';
      };
      gallery.appendChild(img);
    });
  }

  /* ---------- 5. Liên hệ, giờ mở cửa, bản đồ ---------- */
  setText('#contact-address', cfg.contact.address);
  setText('#contact-phone', cfg.contact.phone);
  const phoneLink = $('#contact-phone-link');
  if (phoneLink) {
    // Chuyển "034 975 1745" → tel:+84349751745 để bấm gọi được trên điện thoại
    phoneLink.href = 'tel:+' + cfg.contact.phone.replace(/\D/g, '').replace(/^0/, '84');
  }

  const hoursList = $('#hours-list');
  if (hoursList) {
    cfg.hours.forEach((h) => {
      const li = document.createElement('li');
      li.innerHTML = '<span>' + h.days + '</span><strong>' + h.time + '</strong>';
      hoursList.appendChild(li);
    });
  }

  const map = $('#map');
  if (map) {
    // Google Maps nhúng KHÔNG cần API key
    map.src = 'https://www.google.com/maps?q=' + encodeURIComponent(cfg.contact.mapQuery) + '&output=embed';
  }

  /* ---------- 6. Form liên hệ — gửi thật qua Formspree ----------
     ID form khai báo trong js/config.js → formspreeId (endpoint:
     https://formspree.io/f/mgaezbyr). Nếu ID rỗng/sai định dạng, form
     tự chạy chế độ demo (chỉ alert, KHÔNG gửi đi đâu). */
  const form = $('#contact-form');
  if (form) {
    const id = (cfg.formspreeId || '').trim();
    const FORM_ENDPOINT = /^[a-z0-9]{4,16}$/i.test(id)
      ? 'https://formspree.io/f/' + id
      : '';
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const name = this.elements['name'].value.trim();
      const phone = this.elements['phone'].value.trim();
      const message = this.elements['message'].value.trim();
      const digits = phone.replace(/\D/g, '');
      if (!name) { alert('Bạn vui lòng nhập họ tên nhé!'); this.elements['name'].focus(); return; }
      if (digits.length < 9 || digits.length > 12) {
        alert('Số điện thoại chưa hợp lệ, bạn kiểm tra lại giúp mình nhé!');
        this.elements['phone'].focus();
        return;
      }

      // Chế độ demo: chưa cấu hình Formspree → chỉ thông báo
      if (!FORM_ENDPOINT) {
        alert('Cảm ơn ' + name + '! ' + cfg.business.name + ' sẽ liên hệ với bạn trong thời gian sớm nhất. ' + (cfg.emoji || ''));
        this.reset();
        return;
      }

      // Gửi thật qua Formspree (đăng ký miễn phí, lấy ID tại formspree.io)
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang gửi…'; }
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name: name, phone: phone, message: message, from: cfg.business.name }),
        });
        if (!res.ok) throw new Error('Formspree trả lỗi ' + res.status);
        alert('Cảm ơn ' + name + '! Đã gửi thông tin thành công. ' + cfg.business.name + ' sẽ liên hệ với bạn trong thời gian sớm nhất. ' + (cfg.emoji || ''));
        this.reset();
      } catch (err) {
        // Gửi thất bại (mất mạng / ID sai) → hướng dẫn khách liên hệ trực tiếp
        alert('Rất tiếc, gửi thông tin chưa thành công. Bạn vui lòng gọi hoặc nhắn Zalo cho chúng tôi theo số ' + cfg.contact.phone + ' nhé!');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
      }
    });
  }

  /* ---------- 7. Nút nổi Zalo / Messenger ----------
     Messenger chỉ hiện khi contact.facebook có link Fanpage thật. */
  const zaloBtn = $('#zalo-btn');
  const fbBtn = $('#fb-btn');
  if (zaloBtn) zaloBtn.href = cfg.contact.zalo;
  if (fbBtn) {
    const fbHref = (cfg.contact.facebook || '').trim();
    if (fbHref) { fbBtn.href = fbHref; } else { fbBtn.style.display = 'none'; }
  }

  /* ---------- 8. Footer ---------- */
  setText('#footer-name', '© ' + new Date().getFullYear() + ' ' + cfg.business.name);
  setText('#footer-address', cfg.contact.address + ' · ' + cfg.contact.phone);
})();
