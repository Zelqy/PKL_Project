/* =========================================================
   Pasar Janapria — aplikasi (hash router + render)
   ========================================================= */
(function () {
  const t = (k) => I18N.t(k);
  const S = Store.state;
  const view = document.getElementById("view");
  const sheet = document.getElementById("sheet");
  const sheetBody = document.getElementById("sheetBody");
  const toastWrap = document.getElementById("toast");

  const ui = {
    cat: "all",
    serviceCat: "all",
    sort: "populer",
    q: "",
    msgTab: "chat",
    qty: {},
    delivery: "desa",
    photo: null,
    photoInfo: null,
    lastPath: null,
    loginNip: "",
    loginError: null,
    loginDenied: false,
    showPin: false
  };

  /* ---------------- util ---------------- */
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  const rp = (n) => window.fmtRp(n);

  function toast(msg, kind) {
    const el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity .25s, transform .25s";
      el.style.opacity = "0";
      el.style.transform = "translateY(6px)";
      setTimeout(() => el.remove(), 260);
    }, 2600);
  }

  function openSheet(html) {
    sheetBody.innerHTML = html;
    sheet.hidden = false;
    document.body.style.overflow = "hidden";
    const focusable = sheetBody.querySelector("input, textarea, button");
    if (focusable) setTimeout(() => focusable.focus({ preventScroll: true }), 120);
  }
  function closeSheet() {
    sheet.hidden = true;
    document.body.style.overflow = "";
    sheetBody.innerHTML = "";
  }

  function daysOpen(s) {
    return Array.isArray(s.available) && s.available.includes(new Date().getDay());
  }
  function dayNames() { return ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]; }

  function greetKey() {
    const h = new Date().getHours();
    if (h < 11) return "greet_pagi";
    if (h < 15) return "greet_siang";
    if (h < 18) return "greet_sore";
    return "greet_malam";
  }

  function productById(id) { return S.products.find((p) => p.id === id); }
  function serviceById(id) { return S.services.find((s) => s.id === id); }
  function categoryLabel(id) {
    const c = SEED.categories.find((x) => x.id === id);
    return c ? c.label : "Lainnya";
  }
  function categoryEmoji(id) {
    const c = SEED.categories.find((x) => x.id === id);
    return c ? c.emoji : "🛍️";
  }

  const PRODUCT_ART = {
    p1: "assets/products/p1.svg",
    p2: "assets/products/p2.svg",
    p3: "assets/products/p3.svg",
    p4: "assets/products/p4.svg",
    p5: "assets/products/p5.svg",
    p6: "assets/products/p6.svg",
    p7: "assets/products/p7.svg",
    p8: "assets/products/p8.svg",
    p9: "assets/products/p9.svg",
    p10: "assets/products/p10.svg",
    p11: "assets/products/p11.svg",
    p12: "assets/products/p12.svg",
    p13: "assets/products/p13.svg",
    p14: "assets/products/p14.svg"
  };

  function thumbInner(p) {
    const src = p.image || PRODUCT_ART[p.id];
    return src ? `<img src="${esc(src)}" alt="${esc(p.name)}" loading="lazy">` : `<span aria-hidden="true">${p.emoji}</span>`;
  }

  /* ---------------- komponen ---------------- */
  function discountInfo(p) {
    const base = p.oldPrice || Math.ceil((p.price * 1.24) / 500) * 500;
    const pct = Math.max(5, Math.round((1 - p.price / base) * 100));
    return { old: base, pct };
  }

  function productCard(p, isFeatured) {
    const d = discountInfo(p);
    return `
      <article class="p-card">
        <div class="p-media-wrap">
          <a class="p-media" href="#/produk/${p.id}" aria-label="${esc(p.name)}">
            <div class="p-thumb">${thumbInner(p)}</div>
            <span class="discount">-${d.pct}%</span>
            ${(isFeatured || p.featured) ? `<span class="feat">Pilihan</span>` : ""}
            ${p.stock <= 0 ? `<span class="soldout">Habis</span>` : ""}
          </a>
          <button class="quick-add" data-action="add-cart" data-id="${p.id}" aria-label="${t("add_cart")} ${esc(p.name)}" ${p.stock <= 0 ? "disabled" : ""}>+</button>
        </div>
        <div class="p-body">
          <a href="#/produk/${p.id}"><h3 class="p-name">${esc(p.name)}</h3></a>
          <div class="p-price-row">
            <span class="price">${rp(p.price)}</span>
            <s class="old-price">${rp(d.old)}</s>
          </div>
          <div class="p-meta">
            <span class="p-rating">★ ${p.rating || "-"}</span>
            <span>${p.sold} ${t("sold")}</span>
          </div>
          <div class="p-loc">📍 ${esc(p.dusun)}</div>
          <div class="p-tags">
            <span class="tag-ship">${t("free_shipping")}</span>
            ${p.verified ? `<span class="tag-verified">✓ ${t("verified")}</span>` : ""}
          </div>
        </div>
      </article>`;
  }

  function productRow(p) {
    return `
      <a class="l-item" href="#/produk/${p.id}">
        <div class="l-thumb">${thumbInner(p)}</div>
        <div class="l-body">
          <h3>${esc(p.name)}</h3>
          <div class="p-seller">${p.verified ? `<span class="verified">${t("verified")}</span>` : `<span class="badge krem">${t("pending_review")}</span>`}</div>
          <div class="p-meta"><span class="star">★ ${p.rating || "-"}</span><span>${p.sold} ${t("sold")}</span><span>📍 ${esc(p.dusun)}</span></div>
          <div class="l-foot">
            <span class="price">${rp(p.price)}</span>
            <span class="badge">${t("open")}</span>
          </div>
        </div>
      </a>`;
  }

  function serviceRow(s) {
    const today = daysOpen(s);
    return `
      <a class="l-item" href="#/jasa/${s.id}">
        <div class="l-thumb" aria-hidden="true">${s.emoji}</div>
        <div class="l-body">
          <h3>${esc(s.name)}</h3>
          <div class="p-seller">${s.verified ? `<span class="verified">${t("verified")}</span> · ` : ""}${esc(s.provider)}</div>
          <div class="p-meta">
            <span class="star">★ ${s.rating}</span>
            <span>${s.jobs} ${t("booked")}</span>
            <span>📍 ${esc(s.dusun)}</span>
          </div>
          <div class="l-foot">
            <span class="price">${rp(s.rate)} <small>/ ${esc(s.rateUnit)}</small></span>
            <span class="badge ${today ? "" : "krem"}">${today ? t("available_today") : t("open")}</span>
          </div>
        </div>
      </a>`;
  }

  /* ---------------- beranda ---------------- */
  function flashProducts() {
    return S.products.filter((p) => p.status === "aktif").slice().sort((a, b) => b.sold - a.sold).slice(0, 6);
  }

  function recommendedProducts() {
    return S.products.filter((p) => p.status === "aktif").slice().sort((a, b) => b.rating - a.rating).slice(0, 10);
  }

  function startFlashCountdown() {
    clearInterval(window.__flashTimer);
    const tick = () => {
      const el = document.getElementById("flashCountdown");
      if (!el) { clearInterval(window.__flashTimer); window.__flashTimer = null; return; }
      const now = new Date();
      const end = new Date(now); end.setHours(23, 59, 59, 999);
      const ms = Math.max(0, end - now);
      const pad = (n) => String(n).padStart(2, "0");
      el.textContent = pad(Math.floor(ms / 3600000)) + ":" + pad(Math.floor((ms % 3600000) / 60000)) + ":" + pad(Math.floor((ms % 60000) / 1000));
    };
    tick();
    window.__flashTimer = setInterval(tick, 1000);
  }

  function notificationsSheet() {
    openSheet(`
      <h3>📣 ${t("notifications")}</h3>
      <p class="sheet-sub">${t("community_sub")}</p>
      <div class="news-list">
        ${S.notifications.map((n) => `
          <div class="news-item">
            <span class="news-ico">${n.type === "desa" ? "🏛️" : "📣"}</span>
            <div class="grow">
              <strong>${esc(n.title)}</strong>
              <p>${esc(n.body)}</p>
              <small>${esc(n.time)}</small>
            </div>
          </div>`).join("")}
      </div>
      <button class="btn block mt-16" data-close-sheet>${t("close")}</button>`);
  }

  function vouchersSheet() {
    openSheet(`
      <h3>🎟️ ${t("voucher_title")}</h3>
      <p class="sheet-sub">${t("voucher_sub")}</p>
      ${SEED.vouchers.map((v) => `
        <div class="voucher-sheet-item ${ui.voucher === v.id ? "active" : ""}">
          <div class="voucher-ticket">🎟️</div>
          <div class="grow">
            <strong>${esc(v.title)}</strong>
            <p class="tiny">${esc(v.desc)}</p>
            <span class="v-code">${esc(v.code)}</span>
          </div>
          <button class="btn sm ${ui.voucher === v.id ? "ghost" : ""}" data-action="use-voucher" data-id="${v.id}">${ui.voucher === v.id ? t("used") : t("use")}</button>
        </div>`).join("")}
      <p class="center tiny mt-12">${t("trust_verified")}</p>`);
  }

  function renderHome() {
    const notifs = S.notifications.slice(0, 2);
    const services = S.services.slice(0, 4);
    const posts = S.forum.slice(0, 2);
    const flash = flashProducts();
    const recommended = recommendedProducts();
    const tones = ["#e9f7ef", "#fff1e7", "#eef2ff", "#fdeef6", "#eef8e2", "#e8f4fb", "#f7f0e4", "#f1ecff"];

    return `
      <div class="view home-view">
        <section class="hero">
          <div class="hero-copy">
            <span class="hero-badge">PROMO DESA · GRATIS ONGKIR</span>
            <h1>${t("home_title")}</h1>
            <p>${t("home_sub")}</p>
            <div class="hero-cta">
              <a class="btn accent" href="#/produk">🛒 ${t("quick_product")}</a>
              <a class="btn ghost-light" href="#/jasa">🔨 ${t("quick_service")}</a>
            </div>
          </div>
          <div class="hero-stats">
            <div><strong>${SEED.profile_stats.umkm}</strong><span>UMKM</span></div>
            <div><strong>${SEED.profile_stats.products}</strong><span>${t("quick_product")}</span></div>
            <div><strong>${SEED.profile_stats.dusun}</strong><span>Dusun</span></div>
          </div>
        </section>

        <div class="benefit-strip">
          <div><span class="b-ico">✅</span><div><strong>${t("trust_verified")}</strong><small>UMKM dicek admin desa</small></div></div>
          <div><span class="b-ico">💵</span><div><strong>${t("trust_cod")}</strong><small>Bayar saat barang tiba</small></div></div>
          <div><span class="b-ico">🛵</span><div><strong>${t("trust_delivery")}</strong><small>Ongkir flat Rp5.000</small></div></div>
          <div><span class="b-ico">🎟️</span><div><strong>Voucher desa</strong><small>Hemat s.d. Rp15.000</small></div></div>
        </div>

        <section class="section">
          <div class="section-head">
            <h2>${t("categories")}</h2>
            <a class="link-more" href="#/produk">${t("see_all")}</a>
          </div>
          <div class="cat-circles">
            ${SEED.categories.map((c, i) => `
              <a class="cat-circle" href="#/produk?cat=${c.id}">
                <span class="cc-ico" style="background:${tones[i % tones.length]}">${c.emoji}</span>
                <span class="cc-label">${esc(c.label)}</span>
              </a>`).join("")}
            <a class="cat-circle" href="#/jual">
              <span class="cc-ico" style="background:#fff0e8">📦</span>
              <span class="cc-label">${t("quick_sell")}</span>
            </a>
            <a class="cat-circle" href="#/pesan?tab=forum">
              <span class="cc-ico" style="background:#eef2ff">💬</span>
              <span class="cc-label">${t("quick_forum")}</span>
            </a>
          </div>
        </section>

        <section class="section">
          <div class="voucher-strip">
            ${SEED.vouchers.map((v) => `
              <button class="voucher-card" data-action="open-vouchers">
                <span class="v-icon">🎟️</span>
                <span class="v-text"><strong>${esc(v.title)}</strong><small>${esc(v.desc)}</small><span class="v-code">${esc(v.code)}</span></span>
                <span class="v-cta">${t("use")}</span>
              </button>`).join("")}
          </div>
        </section>

        <section class="section flash-section">
          <div class="flash-head">
            <div class="flash-head-left">
              <span class="flash-bolt" aria-hidden="true">⚡</span>
              <h2>${t("promo_kilat")}</h2>
              <span class="flash-end">${t("ends_in")}</span>
              <span class="countdown" id="flashCountdown">00:00:00</span>
            </div>
            <a class="link-more" href="#/produk">${t("see_all")}</a>
          </div>
          <div class="flash-grid">
            ${flash.map((p) => {
              const d = discountInfo(p);
              const left = p.stock;
              const pct = 35 + ((p.sold * 7) % 50);
              return `<a class="flash-card" href="#/produk/${p.id}">
                <div class="flash-thumb">${thumbInner(p)}<span class="discount">-${d.pct}%</span></div>
                <div class="flash-info">
                  <span class="flash-price">${rp(p.price)}</span>
                  <s class="old-price">${rp(d.old)}</s>
                  <div class="flash-progress"><span style="width:${pct}%"></span></div>
                  <small>${t("flash_stock")} ${left} ${esc(p.unit)}</small>
                </div>
              </a>`;
            }).join("")}
          </div>
        </section>

        <section class="section">
          <div class="section-head">
            <div>
              <h2>${t("recommended")}</h2>
              <p class="sub">${t("recommended_sub")}</p>
            </div>
            <a class="link-more" href="#/produk">${t("see_all")}</a>
          </div>
          <div class="product-grid">${recommended.map((p) => productCard(p)).join("")}</div>
        </section>

        <section class="section">
          <div class="section-head">
            <div><h2>${t("services_near")}</h2><p class="sub">${t("trust_verified")}</p></div>
            <a class="link-more" href="#/jasa">${t("see_all")}</a>
          </div>
          <div class="list service-list">${services.map(serviceRow).join("")}</div>
        </section>

        <section class="section home-bottom">
          <div class="card news-card">
            <div class="section-head"><h2>📣 ${t("notifications")}</h2><button class="link-more" data-action="notifications">${t("see_all")}</button></div>
            <div class="news-list">
              ${notifs.map((n) => `
                <button class="news-item" data-action="notifications">
                  <span class="news-ico">${n.type === "desa" ? "🏛️" : "📣"}</span>
                  <span class="grow"><strong>${esc(n.title)}</strong><small>${esc(n.time)}</small></span>
                  <span class="m-right">›</span>
                </button>`).join("")}
            </div>
          </div>
          <div class="card community-card">
            <div class="section-head"><h2>💬 ${t("community")}</h2><a class="link-more" href="#/pesan?tab=forum">${t("see_all")}</a></div>
            <p class="muted">${t("community_sub")}</p>
            <div class="community-preview">
              ${posts.map((p) => `<div class="cp-item"><span class="avatar">${p.emoji || "🙋"}</span><span><strong>${esc(p.author)}</strong><small>${esc(p.text.slice(0, 62))}…</small></span></div>`).join("")}
            </div>
            <a class="btn ghost block" href="#/pesan?tab=forum">Buka Warung Semeton</a>
          </div>
        </section>

        <p class="center tiny mt-20">${t("app_info")}</p>
      </div>`;
  }

  /* Slot "Pilihan Minggu Ini" digilir tiap minggu supaya semua UMKM kebagian. */
  function weeklyFeatured() {
    const pool = S.products.filter((p) => p.status === "aktif").slice().sort((a, b) => a.id.localeCompare(b.id));
    if (pool.length <= 4) return pool;
    const week = Math.floor(Date.now() / 604800000);
    const offset = week % pool.length;
    return pool.slice(offset).concat(pool.slice(0, offset)).slice(0, 4);
  }

  /* ---------------- produk ---------------- */
  function filteredProducts() {
    const q = ui.q.trim().toLowerCase();
    let list = S.products.filter((p) => p.status === "aktif");
    if (ui.cat !== "all") list = list.filter((p) => p.category === ui.cat);
    if (q) {
      list = list.filter((p) =>
        (p.name + " " + p.seller + " " + p.dusun + " " + p.desc).toLowerCase().includes(q)
      );
    }
    if (ui.sort === "murah") list.sort((a, b) => a.price - b.price);
    else if (ui.sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => b.sold - a.sold);
    return list;
  }

  function productListHTML() {
    const list = filteredProducts();
    if (!list.length) {
      return `
        <div class="empty">
          <span class="e-ico" aria-hidden="true">🧺</span>
          <h3>${t("empty_product")}</h3>
          <p>${t("empty_product_sub")}</p>
          <a class="btn" href="#/jual">📦 ${t("become_seller")}</a>
        </div>`;
    }
    return `<div class="product-grid">${list.map((p) => productCard(p)).join("")}</div>`;
  }

  function renderProducts() {
    const total = S.products.filter((p) => p.status === "aktif").length;
    return `
      <div class="view">
        <div class="page-head">
          <div>
            <h1>${t("all_products")}</h1>
            <p class="sub">${filteredProducts().length} produk tayang</p>
          </div>
          <a class="btn sm" href="#/jual">+ ${t("become_seller")}</a>
        </div>

        ${ui.q ? `<div class="search-summary">Hasil untuk <strong>“${esc(ui.q)}”</strong><button data-action="clear-search" aria-label="Hapus pencarian">✕</button></div>` : ""}

        <div class="chips mt-12" role="list">
          <button class="chip" data-action="cat" data-cat="all" aria-pressed="${ui.cat === "all"}">${t("all_products")}</button>
          ${SEED.categories.map((c) => `<button class="chip" data-action="cat" data-cat="${c.id}" aria-pressed="${ui.cat === c.id}">${c.emoji} ${esc(c.label)}</button>`).join("")}
        </div>

        <div class="filter-bar">
          <span class="result-count"><strong>${filteredProducts().length}</strong> produk</span>
          <label class="sort-select">
            <span>${t("sort_popular")}</span>
            <select data-sort aria-label="Urutkan">
              <option value="populer" ${ui.sort === "populer" ? "selected" : ""}>${t("sort_popular")}</option>
              <option value="murah" ${ui.sort === "murah" ? "selected" : ""}>${t("sort_cheap")}</option>
              <option value="rating" ${ui.sort === "rating" ? "selected" : ""}>${t("sort_rating")}</option>
            </select>
          </label>
        </div>

        <div id="productList">${productListHTML()}</div>
      </div>`;
  }

  /* ---------------- keranjang ---------------- */
  function renderProductDetail(id) {
    const p = productById(id);
    if (!p || p.status !== "aktif") {
      return `<div class="view"><div class="empty card"><span class="e-ico">🤔</span><h3>Produk tidak ditemukan</h3><p>Mungkin sudah tidak tayang.</p><a class="btn" href="#/produk">${t("all_products")}</a></div></div>`;
    }
    const qty = Math.min(Math.max(1, ui.qty[p.id] || 1), Math.max(1, p.stock));
    ui.qty[p.id] = qty;
    const soldOut = p.stock <= 0;
    const dPrice = discountInfo(p);
    const dist = [5, 4, 3, 2, 1].map((star) => {
      const n = p.reviews ? p.reviews.filter((r) => r.stars === star).length : 0;
      const pct = p.reviews && p.reviews.length ? Math.round((n / p.reviews.length) * 100) : 0;
      return `<div class="bar-row"><span>${star}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span>${n}</span></div>`;
    }).join("");

    return `
      <div class="view detail-view">
        <div class="detail-media">
          <div class="detail-hero">
            <button class="back-btn" data-action="back" aria-label="Kembali">←</button>
            <button class="back-btn share-btn" data-action="share-product" data-id="${p.id}" aria-label="${t("share_wa")}">↗</button>
            ${thumbInner(p)}
            <span class="cat-chip">${categoryEmoji(p.category)} ${esc(categoryLabel(p.category))}</span>
          </div>
          <div class="flex items-center gap-8 wrap mt-12">
            ${p.verified ? `<span class="tag-verified">✓ ${t("verified")}</span>` : ""}
            <span class="badge krem">📍 ${esc(p.dusun)}</span>
            <span class="badge padi">★ ${p.rating || "-"}</span>
          </div>
        </div>

        <div class="detail-info">
          <h1 class="detail-title">${esc(p.name)}</h1>
          <div class="detail-price">
            <span class="price">${rp(p.price)}</span>
            <s class="old-price">${rp(dPrice.old)}</s>
            <span class="discount-pill">-${dPrice.pct}%</span>
          </div>
          <p class="tiny mt-8">${t("stock")}: ${p.stock} ${esc(p.unit)} · ${p.sold} ${t("sold")} · ${esc(p.seller)}</p>

          <button class="voucher-mini" data-action="open-vouchers">
            <span>🎟️</span>
            <span class="grow"><strong>Voucher desa tersedia</strong><small>Hemat s.d. Rp15.000</small></span>
            <span>›</span>
          </button>

          <div class="flex items-center gap-10 mt-12">
            <div class="qty" aria-label="Jumlah">
              <button data-action="dqty" data-id="${p.id}" data-delta="-1" aria-label="Kurangi" ${qty <= 1 || soldOut ? "disabled" : ""}>−</button>
              <span aria-live="polite">${qty}</span>
              <button data-action="dqty" data-id="${p.id}" data-delta="1" aria-label="Tambah" ${qty >= p.stock || soldOut ? "disabled" : ""}>+</button>
            </div>
            <p class="tiny grow">${t("trust_cod")} · ${t("trust_delivery")}</p>
          </div>

          <div class="sticky-cta">
            <button class="btn ghost" data-action="add-cart" data-id="${p.id}" ${soldOut ? "disabled" : ""}>🛒 ${soldOut ? t("out_of_stock") : t("add_cart")}</button>
            <button class="btn accent" data-action="buy-now" data-id="${p.id}" ${soldOut ? "disabled" : ""}>${t("buy_now")}</button>
          </div>
          <div class="cta-spacer" aria-hidden="true"></div>

          <div class="card mt-12">
            <div class="seller-row">
              <div class="avatar" aria-hidden="true">${p.emoji}</div>
              <div class="grow">
                <strong>${esc(p.seller)}</strong>
                <p class="tiny">📍 ${esc(p.dusun)} · ${t("since")} ${p.joined}</p>
              </div>
              <button class="btn ghost sm" data-action="chat-seller" data-producer="${esc(p.seller)}" data-role="${esc(p.name)}" data-emoji="${p.emoji}">💬</button>
            </div>
            <dl class="info-grid">
              <div><dt>${t("delivery")}</dt><dd>${t("ship_value")}</dd></div>
              <div><dt>${t("payment")}</dt><dd>${t("pay_value")}</dd></div>
            </dl>
          </div>

          <section class="section">
            <h2>${t("description")}</h2>
            <p class="muted mt-8" style="line-height:1.65">${esc(p.desc)}</p>
          </section>

          <section class="section">
            <div class="section-head"><h2>${t("reviews")}</h2><span class="tiny">${p.reviewsCount || 0} ${t("reviews").toLowerCase()}</span></div>
            <div class="card">
              <div class="rating-summary">
                <div class="rating-big">${(p.rating || 0).toFixed(1)}</div>
                <div class="bars">${dist}</div>
              </div>
              <div class="divider"></div>
              ${p.reviews && p.reviews.length ? p.reviews.map((r) => `
                <div class="review">
                  <div class="review-head">
                    <div class="avatar" style="width:34px;height:34px;font-size:.8rem">${esc(r.by[0])}</div>
                    <div class="grow"><strong style="font-size:.84rem">${esc(r.by)}</strong><p class="tiny">${"★".repeat(r.stars)}</p></div>
                  </div>
                  <p>${esc(r.text)}</p>
                </div>`).join("") : `<p class="muted">Belum ada ulasan. Jadi yang pertama setelah membeli.</p>`}
            </div>
          </section>

          <p class="center mt-12"><button class="remove-link" data-action="report" data-id="${p.id}">⚠ ${t("report")}</button></p>
          <div class="cta-spacer" aria-hidden="true"></div>
        </div>
      </div>`;
  }

  function cartPricing() {
    const subtotal = Store.cartSubtotal();
    const ship = (Store.deliveryOptions.find((d) => d.id === ui.delivery) || {}).cost || 0;
    const voucher = SEED.vouchers.find((v) => v.id === ui.voucher && subtotal >= v.min) || null;
    const discount = voucher ? Math.min(voucher.value, subtotal) : 0;
    return { subtotal, ship, discount, total: Math.max(0, subtotal + ship - discount), voucher };
  }

  function renderCart() {
    const rows = Store.cartDetailed();
    if (!rows.length) {
      return `<div class="view">
        <div class="page-head"><div><h1>${t("cart")}</h1><p class="sub">0 item</p></div></div>
        <div class="empty card">
          <span class="e-ico" aria-hidden="true">🧺</span>
          <h3>${t("cart_empty")}</h3>
          <p>${t("cart_empty_sub")}</p>
          <a class="btn accent" href="#/produk">${t("browse_products")}</a>
        </div>
      </div>`;
    }
    const { subtotal, ship, discount, total, voucher } = cartPricing();

    return `
      <div class="view cart-view">
        <div class="page-head">
          <div><h1>${t("cart")}</h1><p class="sub">${Store.cartCount()} item · dikirim dari Desa Janapria</p></div>
          <a class="link-more" href="#/produk">+ ${t("quick_product")}</a>
        </div>

        <div class="cart-grid">
        <div class="cart-left">
        <div class="card cart-card">
          <div class="cart-shop">
            <span class="avatar" style="width:30px;height:30px;font-size:.8rem">🏪</span>
            <strong class="grow">UMKM Desa Janapria</strong>
            <span class="tag-verified">✓ ${t("verified")}</span>
          </div>
          ${rows.map((r) => `
            <div class="cart-item">
              <div class="l-thumb">${thumbInner(r.product)}</div>
              <div class="ci-body">
                <h4>${esc(r.product.name)}</h4>
                <p class="tiny">${esc(r.product.seller)} · ${esc(r.product.dusun)}</p>
                <div class="ci-actions">
                  <div class="qty">
                    <button data-action="cart-minus" data-id="${r.product.id}" aria-label="Kurangi" ${r.qty <= 1 ? "disabled" : ""}>−</button>
                    <span>${r.qty}</span>
                    <button data-action="cart-plus" data-id="${r.product.id}" aria-label="Tambah" ${r.qty >= r.product.stock ? "disabled" : ""}>+</button>
                  </div>
                  <strong class="price" style="font-size:.95rem">${rp(r.lineTotal)}</strong>
                </div>
                <button class="remove-link" data-action="remove-cart" data-id="${r.product.id}">${t("remove")}</button>
              </div>
            </div>`).join("")}

          <button class="voucher-row" data-action="open-vouchers">
            <span class="vr-ico">🎟️</span>
            <span class="grow">
              <strong>${t("voucher_title")}</strong>
              <small>${voucher ? esc(voucher.title) + " · " + esc(voucher.code) : "Pilih voucher untuk hemat belanja"}</small>
            </span>
            <span class="vr-cta">${voucher ? t("used") : t("use")} ›</span>
          </button>

          <div class="totals">
            <div><span>${t("subtotal")}</span><span>${rp(subtotal)}</span></div>
            <div><span>${t("delivery")}</span><span id="sumShip">${ship ? rp(ship) : t("free")}</span></div>
            ${voucher ? `<div class="discount-row"><span>${t("discount")} (${esc(voucher.code)})</span><span id="sumDiscount">-${rp(discount)}</span></div>` : ""}
            <div class="grand"><span>${t("total")}</span><span class="price" id="sumTotal">${rp(total)}</span></div>
          </div>
        </div>
        </div>

        <form class="cart-right" data-form="checkout">
          <div class="card">
            <h2 style="font-size:1rem;margin-bottom:10px">${t("delivery")}</h2>
            ${Store.deliveryOptions.map((d) => {
              const key = d.id === "pickup" ? "pickup" : d.id === "desa" ? "antar_desa" : "antar_kec";
              return `<label class="radio-card">
                <input type="radio" name="delivery" value="${d.id}" data-delivery ${ui.delivery === d.id ? "checked" : ""}>
                <span class="grow"><strong>${t(key)}</strong><small>${t(key + "_sub")}</small></span>
                <span class="price-tag">${d.cost ? rp(d.cost) : t("free")}</span>
              </label>`;
            }).join("")}

            <h2 style="font-size:1rem;margin:14px 0 10px">${t("payment")}</h2>
            <label class="radio-card">
              <input type="radio" name="payment" value="cod" checked>
              <span class="grow"><strong>${t("cod")}</strong><small>${t("cod_sub")}</small></span>
            </label>
            <label class="radio-card">
              <input type="radio" name="payment" value="transfer">
              <span class="grow"><strong>${t("transfer")}</strong><small>${t("transfer_sub")}</small></span>
            </label>
            <label class="radio-card">
              <input type="radio" name="payment" value="ewallet">
              <span class="grow"><strong>${t("ewallet")}</strong><small>${t("ewallet_sub")}</small></span>
            </label>
          </div>

          <div class="card mt-12">
            <div class="field">
              <label for="ckName">${t("name")}</label>
              <input id="ckName" type="text" name="name" value="${esc(S.user.name)}" required>
            </div>
            <div class="field">
              <label for="ckPhone">${t("phone")}</label>
              <input id="ckPhone" type="tel" name="phone" value="${esc(S.user.phone)}" required>
            </div>
            <div class="field">
              <label for="ckAddr">${t("address")}</label>
              <input id="ckAddr" type="text" name="address" value="${esc(S.user.dusun)}" placeholder="${t("address_ph")}" required>
            </div>
            <div class="field">
              <label for="ckNote">${t("note_order")}</label>
              <textarea id="ckNote" name="note" placeholder="${t("note_order")} (opsional)"></textarea>
            </div>
          </div>

          <div class="checkout-summary">
            <div><span>${t("total")}</span><strong id="btnTotal">${rp(total)}</strong></div>
            <button class="btn accent block" type="submit">${t("checkout")}</button>
            <p class="center tiny">${t("trust_cod")} · ${t("trust_verified")}</p>
          </div>
        </form>
        </div>
      </div>`;
  }

  /* ---------------- jasa ---------------- */
  function filteredServices() {
    let list = S.services.slice();
    if (ui.serviceCat !== "all") list = list.filter((s) => s.category === ui.serviceCat);
    const q = ui.q.trim().toLowerCase();
    if (q) list = list.filter((s) => (s.name + " " + s.provider + " " + s.desc).toLowerCase().includes(q));
    return list;
  }

  function renderServices() {
    return `
      <div class="view">
        <div class="section-head">
          <div><h2>🧰 ${t("all_services")}</h2><p class="sub">${t("services_near")}</p></div>
          <a class="link-more" href="#/jual">+ ${t("become_seller")}</a>
        </div>

        <div class="chips" role="list">
          <button class="chip" data-action="scat" data-cat="all" aria-pressed="${ui.serviceCat === "all"}">${t("all_services")}</button>
          ${SEED.service_categories.map((c) => `<button class="chip" data-action="scat" data-cat="${c.id}" aria-pressed="${ui.serviceCat === c.id}">${c.emoji} ${esc(c.label)}</button>`).join("")}
        </div>

        <div class="list mt-12">
          ${filteredServices().length ? filteredServices().map(serviceRow).join("") : `<div class="empty"><span class="e-ico">🧰</span><h3>Belum ada jasa di kategori ini</h3><p>Coba kategori lain.</p></div>`}
        </div>

        <div class="card mt-16">
          <strong style="font-size:.9rem">💡 ${I18N.lang === "ss" ? "Cara pesan jasa" : "Cara pesan jasa"}</strong>
          <p class="muted mt-8">Pilih jasa → baca profil &amp; tarif → tekan <strong>${t("book")}</strong> atau <strong>${t("call")}</strong>. Pembayaran langsung ke pengrajin (COD).</p>
        </div>
      </div>`;
  }

  function renderServiceDetail(id) {
    const s = serviceById(id);
    if (!s) {
      return `<div class="view"><div class="empty"><span class="e-ico">🤔</span><h3>Jasa tidak ditemukan</h3><a class="btn" href="#/jasa">${t("all_services")}</a></div></div>`;
    }
    const days = [1, 2, 3, 4, 5, 6, 0].map((d) => {
      const on = s.available.includes(d);
      return `<span class="badge ${on ? "" : "krem"}" style="min-width:44px;justify-content:center;padding:6px 8px">${dayNames()[d]}</span>`;
    }).join("");

    return `
      <div class="view detail-view">
        <div class="detail-media">
          <div class="detail-hero" style="font-size:5rem">
            <button class="back-btn" data-action="back" aria-label="Kembali">←</button>
            <span aria-hidden="true">${s.emoji}</span>
          </div>
          <div class="flex items-center gap-8 wrap mt-12">
            ${s.verified ? `<span class="badge">✓ ${t("verified")}</span>` : ""}
            <span class="badge krem">📍 ${esc(s.dusun)}</span>
            <span class="badge padi">★ ${s.rating}</span>
          </div>
        </div>

        <div class="detail-info">
          <h1 class="detail-title">${esc(s.name)}</h1>
          <div class="detail-price"><span class="price">${rp(s.rate)}</span><span class="muted">/ ${esc(s.rateUnit)}</span></div>

          <div class="card mt-12">
            <div class="seller-row">
              <div class="avatar" aria-hidden="true">${s.emoji}</div>
              <div class="grow">
                <strong>${esc(s.provider)}</strong>
                <p class="tiny">${s.jobs} ${t("booked")} · ★ ${s.rating}</p>
              </div>
              <a class="btn ghost sm" href="#/pesan" data-action="chat-service" data-id="${s.id}">💬</a>
            </div>
            <p class="tiny mt-12" style="font-weight:800;color:var(--tinta-2)">Jadwal tersedia</p>
            <div class="flex gap-8 wrap mt-8">${days}</div>
          </div>

          <div class="sticky-cta">
            <button class="btn ghost" data-action="call-service" data-id="${s.id}">📞 ${t("call")}</button>
            <button class="btn" data-action="book-service" data-id="${s.id}">${t("book")}</button>
          </div>
          <section class="section">
            <h2>${t("description")}</h2>
            <p class="muted mt-8" style="line-height:1.65">${esc(s.desc)}</p>
          </section>

          <p class="center tiny mt-12">${t("trust_cod")} · ${t("trust_verified")}</p>
          <div class="cta-spacer" aria-hidden="true"></div>
        </div>
      </div>`;
  }

  /* ---------------- pesan ---------------- */
  function forumPost(p) {
    return `
      <div class="post">
        <div class="post-head">
          <div class="avatar" aria-hidden="true">${p.emoji || "🙋"}</div>
          <div class="who grow">
            <strong>${esc(p.author)}</strong>
            <small>${t("since") === "" ? "" : "Dusun "}${esc(p.dusun)} · ${esc(p.time)}</small>
          </div>
        </div>
        <p>${esc(p.text)}</p>
        <div class="post-actions">
          <button data-action="reply-post" data-id="${p.id}">💬 ${t("reply")}${p.replies.length ? ` (${p.replies.length})` : ""}</button>
          <button data-action="share-post" data-id="${p.id}">↗ ${t("share_wa")}</button>
        </div>
        ${p.replies.map((r) => `<div class="reply"><strong>${esc(r.author)}</strong><p>${esc(r.text)}</p></div>`).join("")}
      </div>`;
  }

  function chatSideHTML(activeId) {
    const totalUnread = S.chats.reduce((n, c) => n + (c.unread || 0), 0);
    return `
      <div class="section-head">
        <div><h1 style="font-size:1.2rem">💬 ${t("messages")}</h1><p class="sub">${S.chats.length} chat${totalUnread ? " · " + totalUnread + " " + t("unread") : ""}</p></div>
      </div>
      <div class="segmented" role="tablist">
        <button role="tab" aria-selected="true" data-action="msg-tab" data-tab="chat">${t("chat_tab")}</button>
        <button role="tab" aria-selected="false" data-action="msg-tab" data-tab="forum">${t("forum_tab")}</button>
      </div>
      ${S.chats.length ? `<div class="card chat-list" style="padding:0">${S.chats.map((c) => {
        const last = c.messages[c.messages.length - 1];
        return `<a class="chat-item ${activeId === c.id ? "active" : ""}" href="#/pesan/${c.id}">
          <div class="avatar" aria-hidden="true">${c.emoji || "🙂"}</div>
          <div class="ci-main">
            <h4>${esc(c.name)} <span>${last ? esc(last.time) : ""}</span></h4>
            <p>${last ? esc(last.from === "me" ? "Kamu: " + last.text : last.text) : c.role}</p>
          </div>
          ${c.unread ? `<span class="unread-dot">${c.unread}</span>` : ""}
        </a>`;
      }).join("")}</div>` : `
        <div class="empty"><span class="e-ico">💬</span><h3>${t("chat_empty")}</h3><p>${t("chat_empty_sub")}</p><a class="btn" href="#/produk">${t("browse_products")}</a></div>`}
      ${Store.isOnline() ? "" : `<p class="center tiny mt-12">⚠ ${t("offline_note")}</p>`}`;
  }

  function threadPanelHTML(c) {
    return `
      <div class="flex items-center gap-10" style="margin-bottom:12px">
        <a class="icon-btn thread-back" href="#/pesan" aria-label="${t("messages")}">←</a>
        <div class="avatar" aria-hidden="true">${c.emoji || "🙂"}</div>
        <div class="grow"><strong>${esc(c.name)}</strong><p class="tiny">${esc(c.role)}</p></div>
        <a class="icon-btn" href="#/produk" aria-label="${t("quick_product")}">🛍️</a>
      </div>

      <div class="thread-body">
        <div class="thread">
          ${c.messages.map((m) => `<div class="bubble ${m.from === "me" ? "me" : "them"}">${esc(m.text)}<time>${esc(m.time)}</time></div>`).join("")}
        </div>

        <div class="quick-replies">
          <button data-action="quick-reply" data-text="Masih ada stok?">Masih ada stok?</button>
          <button data-action="quick-reply" data-text="Bisa COD di warung?">Bisa COD?</button>
          <button data-action="quick-reply" data-text="Bisa antar ke rumah?">Bisa antar?</button>
          <button data-action="quick-reply" data-text="Tampiasih ya 🙏">Tampiasih 🙏</button>
        </div>
      </div>

      <form class="composer" data-form="send-message" data-chat="${c.id}">
        <input type="text" name="text" placeholder="${t("type_message")}" aria-label="${t("type_message")}" autocomplete="off" required>
        <button type="submit" aria-label="${t("send")}">➤</button>
      </form>
      <div class="composer-spacer" aria-hidden="true"></div>`;
  }

  function renderInbox(id) {
    if (ui.msgTab === "forum") {
      return `
        <div class="view forum-view">
          <div class="section-head"><div><h1 style="font-size:1.2rem">💬 ${t("community")}</h1><p class="sub">${t("community_sub")}</p></div></div>
          <div class="segmented mt-12" role="tablist">
            <button role="tab" aria-selected="false" data-action="msg-tab" data-tab="chat">${t("chat_tab")}</button>
            <button role="tab" aria-selected="true" data-action="msg-tab" data-tab="forum">${t("forum_tab")}</button>
          </div>
          <form data-form="post">
            <div class="field">
              <textarea name="text" placeholder="${t("ask_forum")}" required maxlength="300"></textarea>
            </div>
            <button class="btn block" type="submit">${t("post")}</button>
          </form>
          <div class="card mt-16">${S.forum.map(forumPost).join("")}</div>
          ${Store.isOnline() ? "" : `<p class="center tiny mt-12">${t("offline_note")}</p>`}
        </div>`;
    }

    const active = id ? Store.chatById(id) : null;
    return `
      <div class="view">
        <div class="inbox ${active ? "has-thread" : ""}">
          <aside class="inbox-side">${chatSideHTML(id)}</aside>
          <section class="inbox-main">
            ${active ? threadPanelHTML(active) : `<div class="inbox-empty"><span class="e-ico" aria-hidden="true">💬</span><h3>${t("select_chat")}</h3><p>${t("chat_empty_sub")}</p></div>`}
          </section>
        </div>
      </div>`;
  }

  /* ---------------- profil ---------------- */
  const STATUS = {
    wait: { label: "status_wait", cls: "wait", next: "proses" },
    proses: { label: "status_proses", cls: "proses", next: "kirim" },
    kirim: { label: "status_kirim", cls: "kirim", next: "selesai" },
    selesai: { label: "status_selesai", cls: "selesai" },
    batal: { label: "batal", cls: "batal" }
  };
  const statusOf = (s) => STATUS[s] || STATUS.wait;

  function orderCard(o) {
    const label = statusOf(o.status).label;
    const cls = statusOf(o.status).cls;
    return `
      <div class="card order-card" id="order-${o.id}">
        <div class="order-head">
          <div><span class="code">${t("order_code")} ${esc(o.id)}</span><p class="tiny">${new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} · ${o.items.length} item</p></div>
          <span class="status-pill ${cls}">${t(label)}</span>
        </div>
        ${o.items.map((i) => `<div class="order-line"><span>${i.emoji} ${esc(i.name)} ×${i.qty}</span><span>${rp(i.price * i.qty)}</span></div>`).join("")}
        ${o.discount ? `<div class="order-line"><span>${t("discount")} ${esc(o.voucher || "")}</span><span>-${rp(o.discount)}</span></div>` : ""}
        <div class="order-total"><span>${t("total")}</span><span class="price">${rp(o.total)}</span></div>
        <div class="flex gap-8 mt-8 wrap">
          ${o.status === "wait" ? `<button class="btn ghost sm" data-action="cancel-order" data-id="${o.id}">${t("cancel")}</button>` : ""}
          ${o.status === "kirim" ? `<button class="btn sm" data-action="finish-order" data-id="${o.id}">✓ ${I18N.lang === "ss" ? "Pesanan sube diterima" : "Pesanan diterima"}</button>` : ""}
          ${o.status === "selesai" ? `<a class="btn ghost sm" href="#/produk">${t("continue_shopping")}</a>` : ""}
        </div>
      </div>`;
  }

  function renderProfile() {
    const mine = S.products.filter((p) => S.myProductIds.includes(p.id));
    return `
      <div class="view">
      <div class="profile-grid">
      <div class="profile-main">
        <div class="profile-card">
          <div class="avatar lg" aria-hidden="true">🙋</div>
          <div class="grow">
            <h2>${esc(S.user.name)}</h2>
            <p>${t("role_warga")} · ${esc(S.user.dusun)}</p>
            <p class="tiny" style="margin-top:4px">HP ${esc(S.user.phone)}</p>
          </div>
          <span class="badge padi">✓ ${t("verified")}</span>
        </div>

        <div class="stat-grid mt-12">
          <div class="stat"><div class="s-label">${t("my_orders")}</div><div class="s-value">${S.orders.length}</div><div class="s-sub">${S.orders.filter(o => o.status === "wait").length} ${t("status_wait").toLowerCase()}</div></div>
          <div class="stat"><div class="s-label">${t("my_products")}</div><div class="s-value">${mine.length}</div><div class="s-sub">${mine.filter(p => p.status === "pending").length} ${t("pending_review").toLowerCase()}</div></div>
        </div>

        <section class="section">
          <div class="section-head"><h2>${t("my_orders")}</h2><span class="tiny">${S.orders.length ? "" : t("no_order")}</span></div>
          ${S.orders.length ? `<div class="list">${S.orders.map(orderCard).join("")}</div>` : `<div class="empty card"><span class="e-ico">📦</span><h3>${t("no_order")}</h3><p>${t("no_order_sub")}</p><a class="btn" href="#/produk">${t("browse_products")}</a></div>`}
        </section>

        ${mine.length ? `
        <section class="section">
          <div class="section-head"><h2>${t("my_products")}</h2><a class="link-more" href="#/jual">+ ${t("become_seller")}</a></div>
          <div class="list">${mine.map((p) => `
            <div class="l-item">
              <div class="l-thumb">${thumbInner(p)}</div>
              <div class="l-body">
                <h3>${esc(p.name)}</h3>
                <span class="badge ${p.status === "aktif" ? "" : p.status === "ditolak" ? "merah" : "padi"}">${p.status === "aktif" ? t("open") : p.status === "ditolak" ? t("reject") : t("pending_review")}</span>
                <div class="l-foot"><span class="price">${rp(p.price)}</span><span class="tiny">${p.stock} ${esc(p.unit)}</span></div>
              </div>
            </div>`).join("")}</div>
        </section>` : ""}

      </div>

      <aside class="profile-side">
        <section class="section">
          <div class="menu-list">
            <a class="menu-item" href="#/jual"><span class="m-ico">📦</span><span class="m-label">${t("become_seller")}<small>${t("sell_sub").slice(0, 52)}…</small></span><span class="m-right">›</span></a>
            ${Store.isAdmin()
              ? `<a class="menu-item" href="#/admin"><span class="m-ico">🏛️</span><span class="m-label">${t("admin_panel")}<small>${esc(S.adminSession.name)} · ${t("admin_logged_in")}</small></span><span class="m-right">›</span></a>`
              : `<a class="menu-item" href="#/login?next=admin"><span class="m-ico">🔐</span><span class="m-label">${t("admin_login")}<small>${t("admin_login_sub")}</small></span><span class="m-right">›</span></a>`}
            <a class="menu-item" href="#/pesan?tab=forum"><span class="m-ico">💬</span><span class="m-label">${t("community")}<small>${t("community_sub")}</small></span><span class="m-right">›</span></a>
            <button class="menu-item" data-action="lang"><span class="m-ico">🌐</span><span class="m-label">${t("language")}<small>Indonesia / Sasak (${t("draft")})</small></span><span class="m-right">${I18N.lang === "id" ? "ID" : "SS"}</span></button>
            <button class="menu-item" data-action="toggle-offline" aria-pressed="${S.offlineMode}">
              <span class="m-ico">📶</span>
              <span class="m-label">${t("offline_mode")}<small>${t("offline_mode_sub")}</small></span>
              <span class="switch" aria-hidden="true"></span>
            </button>
            <button class="menu-item" data-action="sync">
              <span class="m-ico">🔄</span>
              <span class="m-label">${t("sync")}<small>${Store.pendingCount() ? Store.pendingCount() + " " + t("pending_sync") : t("all_synced")}</small></span>
              <span class="m-right">${Store.pendingCount() || "✓"}</span>
            </button>
            <button class="menu-item" data-action="reset"><span class="m-ico">🧹</span><span class="m-label">${t("reset_demo")}<small>${t("app_info")}</small></span><span class="m-right">›</span></button>
          </div>
        </section>
        ${I18N.isDraft() ? `<p class="center tiny mt-12">ℹ️ ${t("review_note")}</p>` : ""}
        <p class="center tiny mt-12">${t("app_info")}</p>
      </aside>
      </div>
      </div>`;
  }

  /* ---------------- jual / titip jual ---------------- */
  function renderSell() {
    return `
      <div class="view sell-view">
        <div class="flex items-center gap-10">
          <button class="icon-btn" data-action="back" aria-label="Kembali">←</button>
          <div><h1 style="font-size:1.15rem">📦 ${t("sell_title")}</h1></div>
        </div>
        <p class="muted mt-8">${t("sell_sub")}</p>

        <div class="announce mt-12">
          <span class="a-ico" aria-hidden="true">🤝</span>
          <div>
            <strong>${I18N.lang === "ss" ? "Ndaq bisa pakai HP?" : "Tidak punya HP / bingung?"}</strong>
            <p>${I18N.lang === "ss" ? "Bait bantuan Duta Digital di balai desa. Produk akan difoto kance didaftarkan gratis." : "Datang ke Duta Digital di balai desa. Produk akan difoto dan didaftarkan gratis lewat program Titip Jual."}</p>
          </div>
        </div>

        <form class="mt-16" data-form="sell">
          <div class="card">
            <div class="field">
              <label>${t("photo")}</label>
              <label class="upload" for="photoInput">
                <span class="up-ico" aria-hidden="true">📷</span>
                <p>${ui.photo ? t("photo_change") : t("photo_pick")}</p>
                <small>${t("photo_hint")}</small>
                <input id="photoInput" type="file" accept="image/*" capture="environment" data-photo>
              </label>
              <div id="photoPreview">${photoPreviewHTML()}</div>
            </div>

            <div class="field">
              <label for="sName">${t("product_name")}</label>
              <input id="sName" type="text" name="name" placeholder="${t("product_name_ph")}" required maxlength="70">
            </div>

            <div class="row-2">
              <div class="field">
                <label for="sPrice">${t("price")}</label>
                <input id="sPrice" type="number" name="price" min="1000" step="500" placeholder="25000" required>
              </div>
              <div class="field">
                <label for="sUnit">${t("unit")}</label>
                <input id="sUnit" type="text" name="unit" placeholder="bungkus" value="bungkus" required>
              </div>
            </div>

            <div class="row-2">
              <div class="field">
                <label for="sCat">${t("category")}</label>
                <select id="sCat" name="category">
                  ${SEED.categories.map((c) => `<option value="${c.id}">${c.emoji} ${esc(c.label)}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label for="sStock">${t("stock")}</label>
                <input id="sStock" type="number" name="stock" min="1" value="10" required>
              </div>
            </div>

            <div class="field">
              <label for="sDusun">${t("dusun")}</label>
              <select id="sDusun" name="dusun">
                ${["Janapria Daya", "Janapria Timur", "Janapria Barat", "Selebung", "Langko", "Batu Jangkih"].map((d) => `<option ${d === "Janapria Daya" ? "selected" : ""}>Dusun ${d}</option>`).join("")}
              </select>
            </div>

            <div class="field">
              <label for="sDesc">${t("description")}</label>
              <textarea id="sDesc" name="desc" placeholder="${I18N.lang === "ss" ? "Ceritakan produkndé: bahan, ukuran, kapan bisa diambil…" : "Ceritakan produkmu: bahan, ukuran, kapan bisa diambil…"}" required maxlength="400"></textarea>
            </div>
          </div>

          <button class="btn block mt-12" type="submit">${t("send_product")}</button>
          <p class="center tiny mt-8">${t("trust_verified")} · ${t("pending_review")}</p>
        </form>
      </div>`;
  }

  function photoPreviewHTML() {
    if (!ui.photo) return "";
    const info = ui.photoInfo;
    return `<div class="upload-preview">
      <img src="${esc(ui.photo)}" alt="Pratinjau foto produk">
      <div>
        <p class="tiny"><strong>${info
          ? (info.saved === false
            ? Math.round(info.before / 1024) + " KB · foto asli dipakai"
            : Math.round(info.before / 1024) + " KB → " + Math.round(info.after / 1024) + " KB")
          : "Foto siap"}</strong></p>
        <p class="tiny">${info ? info.width + "×" + info.height + " px" : ""}</p>
        <button type="button" class="remove-link" data-action="clear-photo">${t("remove")}</button>
      </div>
    </div>`;
  }

  /* ---------------- login admin ---------------- */
  function renderLogin(next) {
    if (Store.isAdmin()) {
      return `
        <div class="view login-view">
          <div class="login-card card">
            <div class="login-ok">
              <span class="avatar lg">🏛️</span>
              <h1>${t("already_logged")}</h1>
              <p class="muted">${esc(S.adminSession.name)} · ${esc(S.adminSession.role)}</p>
            </div>
            <div class="flex gap-8 mt-16">
              <a class="btn ghost grow" href="#/profil">${t("nav_profile")}</a>
              <a class="btn accent grow" href="#/admin">${t("open_dashboard")}</a>
            </div>
            <button class="remove-link mt-12" data-action="admin-logout">${t("logout")}</button>
          </div>
        </div>`;
    }

    return `
      <div class="view login-view">
        <div class="login-head">
          <span class="login-mark" aria-hidden="true">🏛️</span>
          <h1>${t("login_title")}</h1>
          <p>${t("login_sub")}</p>
        </div>

        <form class="login-card card" data-form="admin-login" data-next="${esc(next || "admin")}">
          ${next === "admin" && ui.loginDenied ? `<div class="login-alert" role="alert" aria-live="assertive">🔒 ${t("login_required")}</div>` : ""}
          ${ui.loginError ? `<div class="login-alert" role="alert" aria-live="assertive">⚠️ ${t(({ nip: "login_bad_nip", pin: "login_bad_pin", missingNip: "login_missing_nip", missingPin: "login_missing_pin" })[ui.loginError] || "login_bad_pin")}</div>` : ""}

          <div class="field">
            <label for="adNip">${t("nip")}</label>
            <input id="adNip" type="text" name="nip" inputmode="text" autocomplete="username"
              placeholder="Contoh: JP-001" value="${esc(ui.loginNip)}" maxlength="16">
          </div>

          <div class="field">
            <label for="adPin">${t("pin")}</label>
            <div class="pin-row">
              <input id="adPin" type="password" name="pin" inputmode="numeric" autocomplete="current-password"
                placeholder="Masukkan PIN" maxlength="8">
              <button type="button" class="icon-btn pin-eye" data-action="toggle-pin" aria-label="${t("show_pin")}">👁️</button>
            </div>
          </div>

          <button class="btn accent block" type="submit">${t("login")}</button>
          <a class="center tiny mt-12" href="#/beranda" style="display:block">${t("back_user")}</a>
        </form>

        <div class="login-demo card">
          <strong>${t("demo_accounts")}</strong>
          <div class="demo-row">
            <button data-action="fill-demo" data-nip="JP-001" data-pin="1234">
              <span><strong>Lalu Ahmad Fauzi</strong><small>Admin Desa · Kasi Pelayanan</small></span>
              <code>JP-001 / 1234</code>
            </button>
            <button data-action="fill-demo" data-nip="JP-002" data-pin="2345">
              <span><strong>Inaq Wulan Sari</strong><small>Duta Digital · Pendamping UMKM</small></span>
              <code>JP-002 / 2345</code>
            </button>
          </div>
          <p class="tiny">${t("demo_note")}</p>
        </div>
      </div>`;
  }

  /* ---------------- admin ---------------- */
  const LOG_ICON = { login: "🔓", logout: "🔒", approve: "✅", reject: "⛔", announcement: "📣" };

  function renderAdmin() {
    const pending = S.products.filter((p) => p.status === "pending");
    const aktif = S.products.filter((p) => p.status === "aktif").length;
    const max = Math.max(...SEED.sales_by_dusun.map((d) => d.value));
    const totalOrder = S.orders.length + SEED.profile_stats.orders_month;

    return `
      <div class="view admin-view">
        <div class="admin-head">
          <button class="icon-btn" data-action="back" aria-label="Kembali">←</button>
          <div class="grow">
            <h1>🏛️ ${t("admin_title")}</h1>
            <p class="tiny">${t("admin_sub")}</p>
          </div>
          <div class="admin-who">
            <span class="avatar">👤</span>
            <span class="admin-who-text">
              <strong>${esc(S.adminSession.name)}</strong>
              <small>${esc(S.adminSession.role)} · ${esc(S.adminSession.nip)}</small>
            </span>
            <button class="btn ghost sm" data-action="admin-logout">${t("logout")}</button>
          </div>
        </div>

        <div class="stat-grid mt-12">
          <div class="stat"><div class="s-label">${t("stat_umkm")}</div><div class="s-value">${SEED.profile_stats.umkm}</div><div class="s-sub">+3 ${I18N.lang === "ss" ? "minggu ni" : "minggu ini"}</div></div>
          <div class="stat"><div class="s-label">${t("stat_products")}</div><div class="s-value">${SEED.profile_stats.products + aktif}</div><div class="s-sub">${pending.length} ${t("pending_review").toLowerCase()}</div></div>
          <div class="stat"><div class="s-label">${t("stat_orders")}</div><div class="s-value">${totalOrder}</div><div class="s-sub">↑ 12% ${I18N.lang === "ss" ? "jok bulan lalu" : "dari bulan lalu"}</div></div>
          <div class="stat"><div class="s-label">${t("stat_turnover")}</div><div class="s-value" style="font-size:1.1rem">${rp(12750000)}</div><div class="s-sub">COD 78% · transfer 22%</div></div>
        </div>

        <section class="section">
          <div class="section-head"><h2>${t("chart_title")}</h2><span class="tiny">${I18N.lang === "ss" ? "30 hari terakhir" : "30 hari terakhir"}</span></div>
          <div class="card">
            <div class="chart">
              ${SEED.sales_by_dusun.map((d) => `
                <div class="bar" title="${esc(d.dusun)}: ${d.value} pesanan">
                  <span class="val">${d.value}</span>
                  <div class="bar-col"><div class="fill" style="height:${Math.round((d.value / max) * 100)}%"></div></div>
                  <span>${esc(d.dusun.replace("Janapria ", "J. "))}</span>
                </div>`).join("")}
            </div>
          </div>
        </section>

        <section class="section">
          <div class="section-head"><h2>🧾 ${t("recent_orders")}</h2><span class="tiny">${S.orders.length} ${t("my_orders").toLowerCase()}</span></div>
          <div class="admin-orders">
          ${S.orders.length ? S.orders.slice(0, 5).map((o) => {
            const st = statusOf(o.status);
            return `<div class="card order-card" style="margin-bottom:10px">
              <div class="order-head">
                <div><span class="code">${t("order_code")} ${esc(o.id)}</span><p class="tiny">${esc(o.name)} · ${esc(o.address)}</p></div>
                <span class="status-pill ${st.cls}">${t(st.label)}</span>
              </div>
              <div class="order-line"><span>${o.items.length} item · ${o.delivery === "pickup" ? t("pickup") : o.delivery === "desa" ? t("antar_desa") : t("antar_kec")}</span><span class="price">${rp(o.total)}</span></div>
              ${st.next ? `<button class="btn sm mt-8" data-action="advance-order" data-id="${o.id}">→ ${t(STATUS[st.next].label)}</button>` : ""}
            </div>`;
          }).join("") : `<div class="card center"><p class="muted">${t("no_order")}</p><p class="tiny mt-8">${t("no_order_sub")}</p></div>`}
          </div>
        </section>

        <section class="section">
          <div class="section-head"><h2>${t("approval")}</h2><span class="badge padi">${pending.length}</span></div>
          <div class="pending-grid">
          ${pending.length ? pending.map((p) => `
            <div class="card pending-card" style="margin-bottom:10px">
              <div class="pc-head">
                <div class="l-thumb">${thumbInner(p)}</div>
                <div class="grow">
                  <strong style="font-size:.9rem">${esc(p.name)}</strong>
                  <p class="tiny">${esc(p.seller)} · ${esc(p.dusun)}</p>
                  <p class="price mt-8">${rp(p.price)} <small>/ ${esc(p.unit)}</small></p>
                </div>
              </div>
              <p class="muted mt-8">${esc(p.desc)}</p>
              <div class="pc-actions">
                <button class="btn danger" data-action="reject-product" data-id="${p.id}">✕ ${t("reject")}</button>
                <button class="btn" data-action="approve-product" data-id="${p.id}">✓ ${t("approve")}</button>
              </div>
            </div>`).join("") : `<div class="card center"><p class="muted">${t("approval_empty")}</p></div>`}
          </div>
        </section>

        <section class="section">
          <div class="section-head"><h2>📣 ${t("blast")}</h2></div>
          <form class="card" data-form="blast">
            <div class="field">
              <label for="bTitle">${I18N.lang === "ss" ? "Judul" : "Judul"}</label>
              <input id="bTitle" type="text" name="title" placeholder="${I18N.lang === "ss" ? "Contoh: Gotong royong" : "Contoh: Gotong royong"}" required maxlength="60">
            </div>
            <div class="field">
              <label for="bBody">${I18N.lang === "ss" ? "Isi pengumuman" : "Isi pengumuman"}</label>
              <textarea id="bBody" name="body" placeholder="${t("blast_ph")}" required maxlength="240"></textarea>
            </div>
            <button class="btn block" type="submit">${t("blast_send")}</button>
          </form>
        </section>

        ${S.reports.length ? `
        <section class="section">
          <div class="section-head"><h2>⚠ ${t("report")}</h2><span class="badge merah">${S.reports.length}</span></div>
          <div class="card">${S.reports.map((r) => `<div class="order-line"><span>${esc(r.name)}</span><span class="tiny">${esc(r.reason)}</span></div>`).join("")}</div>
        </section>` : ""}

        <section class="section">
          <div class="section-head"><h2>📋 ${t("activity_log")}</h2><span class="tiny">${S.adminLog.length} ${t("activity_entries")}</span></div>
          <div class="card admin-log">
            ${S.adminLog.length ? S.adminLog.slice(0, 8).map((l) => `
              <div class="log-row">
                <span class="log-ico">${LOG_ICON[l.action] || "•"}</span>
                <span class="grow">
                  <strong>${esc(l.detail || l.nip)}</strong>
                  <small>${t("log_" + l.action) || l.action} · ${esc(l.nip)} · ${new Date(l.at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</small>
                </span>
              </div>`).join("") : `<p class="muted">${t("activity_empty")}</p>`}
          </div>
        </section>

        <p class="center tiny mt-20">${t("app_info")}</p>
      </div>`;
  }

  /* ---------------- sheet: booking, laporan, sukses ---------------- */
  function bookSheet(id) {
    const s = serviceById(id);
    if (!s) return;
    const today = new Date().toISOString().slice(0, 10);
    openSheet(`
      <h3>${t("service_booking")}</h3>
      <p class="sheet-sub">${esc(s.name)} · ${esc(s.provider)}</p>
      <form data-form="booking" data-id="${s.id}">
        <div class="field">
          <label for="bkDate">${t("date")}</label>
          <input id="bkDate" type="date" name="date" min="${today}" value="${today}" required>
        </div>
        <div class="field">
          <label for="bkNote">${t("notes")}</label>
          <textarea id="bkNote" name="note" placeholder="${I18N.lang === "ss" ? "Contoh: Renovasi pagar 6 meter, material sube ada." : "Contoh: Renovasi pagar 6 meter, material sudah ada."}" required maxlength="240"></textarea>
        </div>
        <p class="tiny" style="margin-bottom:12px">${t("booking_hint")}</p>
        <div class="flex gap-8">
          <button type="button" class="btn ghost grow" data-close-sheet>${t("cancel")}</button>
          <button type="submit" class="btn grow">${t("send_request")}</button>
        </div>
      </form>`);
  }

  function reportSheet(id) {
    const p = productById(id);
    if (!p) return;
    openSheet(`
      <h3>⚠ ${t("report")}</h3>
      <p class="sheet-sub">${esc(p.name)} — ${esc(p.seller)}</p>
      <form data-form="report" data-id="${p.id}">
        <div class="field">
          <label for="rpReason">${t("reason")}</label>
          <textarea id="rpReason" name="reason" placeholder="${I18N.lang === "ss" ? "Contoh: Foto ndak sesuai barang." : "Contoh: Foto tidak sesuai barang."}" required maxlength="200"></textarea>
        </div>
        <p class="tiny" style="margin-bottom:12px">${t("report_sub")}</p>
        <div class="flex gap-8">
          <button type="button" class="btn ghost grow" data-close-sheet>${t("cancel")}</button>
          <button type="submit" class="btn danger grow">${t("report")}</button>
        </div>
      </form>`);
  }

  function successSheet(order) {
    const sellerChat = S.chats.find((c) => c.name === order.items[0].seller);
    openSheet(`
      <div class="success">
        <div class="big-check" aria-hidden="true">✓</div>
        <h3>${t("order_success")}</h3>
        <div class="code-box">${esc(order.id)}</div>
        <p>${t("order_success_sub")}</p>
        <p class="tiny mt-8">${order.payment === "cod" ? t("cod_sub") : order.payment === "transfer" ? "Transfer ke BNI 0123456789 a.n. BUMDes Janapria" : "E-wallet: DANA/Gopay 0812-3456-7890 (BUMDes)"}</p>
        <div class="sheet-actions">
          <button class="btn ghost" data-close-sheet>${t("close")}</button>
          <button class="btn" data-action="go-chat" data-id="${sellerChat ? sellerChat.id : ""}">💬 ${t("chat_seller")}</button>
        </div>
        <a class="link-more" href="#/profil" data-close-sheet style="display:inline-block;margin-top:12px">${t("view_order")} ›</a>
      </div>`);
  }

  /* ---------------- router ---------------- */
  function parseRoute() {
    const raw = (location.hash || "#/beranda").slice(1);
    const [path, query] = raw.split("?");
    const parts = path.split("/").filter(Boolean);
    const params = new URLSearchParams(query || "");
    return { name: parts[0] || "beranda", id: parts[1] || null, params };
  }

  function render() {
    const route = parseRoute();
    const prevName = ui.lastName;
    if (route.name === "produk" && route.params.get("cat")) ui.cat = route.params.get("cat");
    else if (route.name === "produk" && !route.id && prevName && prevName !== "produk") ui.cat = "all";
    ui.lastName = route.name;
    if (route.name === "produk" && route.params.get("q") != null) ui.q = route.params.get("q");
    if (route.name === "pesan" && route.params.get("tab")) ui.msgTab = route.params.get("tab");

    let html = "";
    switch (route.name) {
      case "beranda": html = renderHome(); break;
      case "produk": html = route.id ? renderProductDetail(route.id) : renderProducts(); break;
      case "jasa": html = route.id ? renderServiceDetail(route.id) : renderServices(); break;
      case "pesan": html = renderInbox(route.id); break;
      case "keranjang": html = renderCart(); break;
      case "profil": html = renderProfile(); break;
      case "jual": html = renderSell(); break;
      case "login": html = renderLogin(route.params.get("next") || ""); break;
      case "admin":
        if (!Store.isAdmin()) {
          ui.loginDenied = true;
          html = renderLogin("admin");
        } else {
          html = renderAdmin();
        }
        break;
      default:
        html = `<div class="view"><div class="empty"><span class="e-ico">🤔</span><h3>Halaman tidak ditemukan</h3><a class="btn" href="#/beranda">${t("nav_home")}</a></div></div>`;
    }

    if (route.name === "pesan" && route.id) Store.markChatRead(route.id);

    applyStaticI18n();
    view.innerHTML = html;
    updateNav(route.name);
    updateBadges();

    const hs = document.getElementById("headerSearch");
    if (hs) hs.value = route.name === "produk" ? ui.q : "";
    if (route.name === "beranda") startFlashCountdown();

    if (ui.lastPath !== location.hash) {
      window.scrollTo({ top: 0, behavior: "instant" in document.documentElement.style ? "instant" : "auto" });
      ui.lastPath = location.hash;
    }
  }

  function toggleLang() {
    const next = I18N.lang === "id" ? "ss" : "id";
    I18N.set(next);
    Store.setLang(next);
    render();
    if (next === "ss") toast("Basa Sasak — " + t("draft") + " · " + t("review_note"));
  }

  function applyStaticI18n() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key) el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key) el.setAttribute("placeholder", t(key));
    });
    document.getElementById("langToggle").textContent = I18N.lang === "id" ? "ID" : "SS";
    document.title = I18N.lang === "id"
      ? "Pasar Janapria — Marketplace UMKM & Jasa Desa"
      : "Pasar Janapria — Peken UMKM & Jasa Desa";
  }

  function updateNav(name) {
    const map = { beranda: "beranda", produk: "produk", jasa: "jasa", pesan: "pesan", profil: "profil", keranjang: "produk", jual: "profil", admin: "profil" };
    const active = map[name] || "beranda";
    document.querySelectorAll(".tabbar a, .desktop-nav a").forEach((a) => {
      if (a.dataset.tab === active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function scrollThreadToEnd() {
    requestAnimationFrame(() => {
      const body = document.querySelector(".thread-body");
      if (body) { body.scrollTop = body.scrollHeight; return; }
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
  }

  function updateBadges() {
    const n = Store.cartCount();
    const badge = document.getElementById("cartCount");
    badge.textContent = n;
    badge.hidden = n === 0;

    const unread = S.chats.reduce((sum, c) => sum + (c.unread || 0), 0);
    ["msgDot", "msgDotDesktop"].forEach((id) => {
      const dot = document.getElementById(id);
      if (dot) {
        dot.textContent = unread;
        dot.hidden = unread === 0;
      }
    });
    updateNet();
  }

  function updateNet() {
    const online = Store.isOnline();
    document.body.classList.toggle("is-offline", !online);
    const label = document.getElementById("netText");
    const pending = Store.pendingCount();
    label.textContent = online ? (pending ? "Antre " + pending : "Online") : "Offline";
  }

  /* ---------------- interaksi ---------------- */
  document.addEventListener("click", (e) => {
    const closer = e.target.closest("[data-close-sheet]");
    if (closer) { closeSheet(); if (closer.tagName === "A") return; e.preventDefault(); return; }

    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;
    const id = el.dataset.id;

    switch (action) {
      case "back": {
        e.preventDefault();
        if (history.length > 1) history.back();
        else location.hash = "#/beranda";
        break;
      }
      case "add-cart": {
        e.preventDefault();
        const p = productById(id);
        if (!p) break;
        const qty = (location.hash.includes("/produk/") ? (ui.qty[id] || 1) : 1);
        if (Store.addToCart(id, qty)) {
          ui.qty[id] = 1;
          toast(`${qty}× ${p.name} — ${t("added_cart")}`, "good");
          updateBadges();
          if (location.hash === "#/keranjang") render();
        }
        break;
      }
      case "buy-now": {
        e.preventDefault();
        const qty = ui.qty[id] || 1;
        if (Store.addToCart(id, qty)) { location.hash = "#/keranjang"; }
        break;
      }
      case "dqty": {
        e.preventDefault();
        const p = productById(id);
        const next = Math.max(1, Math.min(p.stock, (ui.qty[id] || 1) + Number(el.dataset.delta)));
        ui.qty[id] = next;
        render();
        break;
      }
      case "clear-search": {
        ui.q = "";
        render();
        break;
      }
      case "admin-logout": {
        Store.logout();
        ui.loginError = null;
        ui.loginDenied = false;
        location.hash = "#/login?next=admin";
        render();
        toast(t("logout_done"));
        break;
      }
      case "toggle-pin": {
        ui.showPin = !ui.showPin;
        const pin = document.getElementById("adPin");
        if (pin) { pin.type = ui.showPin ? "text" : "password"; pin.focus(); }
        el.textContent = ui.showPin ? "🙈" : "👁️";
        break;
      }
      case "fill-demo": {
        ui.loginNip = el.dataset.nip;
        ui.loginError = null;
        ui.loginDenied = false;
        render();
        const pin = document.getElementById("adPin");
        if (pin) { pin.value = el.dataset.pin; pin.focus(); }
        break;
      }
      case "notifications": {
        notificationsSheet();
        break;
      }
      case "open-vouchers": {
        vouchersSheet();
        break;
      }
      case "use-voucher": {
        ui.voucher = el.dataset.id;
        closeSheet();
        render();
        toast(t("used") + " ✓", "good");
        break;
      }
      case "cat": {
        ui.cat = el.dataset.cat;
        render();
        break;
      }
      case "scat": {
        ui.serviceCat = el.dataset.cat;
        render();
        break;
      }
      case "cart-plus": {
        const row = S.cart.find((c) => c.id === id);
        if (row) { Store.setCartQty(id, row.qty + 1); render(); }
        break;
      }
      case "cart-minus": {
        const row = S.cart.find((c) => c.id === id);
        if (row) { Store.setCartQty(id, row.qty - 1); render(); }
        break;
      }
      case "remove-cart": {
        Store.removeFromCart(id);
        render();
        toast(t("remove") + " ✓");
        break;
      }
      case "chat-seller": {
        const chatId = Store.openChatWith(el.dataset.producer, el.dataset.role, el.dataset.emoji);
        location.hash = "#/pesan/" + chatId;
        break;
      }
      case "chat-service": {
        e.preventDefault();
        const s = serviceById(id);
        const chatId = Store.openChatWith(s.provider, s.name, s.emoji);
        location.hash = "#/pesan/" + chatId;
        break;
      }
      case "book-service": bookSheet(id); break;
      case "call-service": {
        const s = serviceById(id);
        const text = `Halo ${s.provider}, saya lihat jasa "${s.name}" di Pasar Janapria. Apakah bisa ${s.rateUnit === "hari" ? "dipesan" : "dipanggil"}?`;
        window.open(`https://wa.me/${s.wa}?text=${encodeURIComponent(text)}`, "_blank");
        break;
      }
      case "msg-tab": {
        ui.msgTab = el.dataset.tab;
        location.hash = ui.msgTab === "forum" ? "#/pesan?tab=forum" : "#/pesan";
        render();
        break;
      }
      case "quick-reply": {
        const form = document.querySelector('form[data-form="send-message"]');
        if (form) { form.querySelector("input[name=text]").value = el.dataset.text; form.querySelector("input[name=text]").focus(); }
        break;
      }
      case "reply-post": {
        const post = S.forum.find((p) => p.id === id);
        openSheet(`
          <h3>💬 ${t("reply")}</h3>
          <p class="sheet-sub">${esc(post.text.slice(0, 90))}${post.text.length > 90 ? "…" : ""}</p>
          <form data-form="reply" data-id="${post.id}">
            <div class="field"><textarea name="text" required maxlength="240" placeholder="${t("type_message")}"></textarea></div>
            <div class="flex gap-8">
              <button type="button" class="btn ghost grow" data-close-sheet>${t("cancel")}</button>
              <button type="submit" class="btn grow">${t("post")}</button>
            </div>
          </form>`);
        break;
      }
      case "share-post": {
        const post = S.forum.find((p) => p.id === id);
        window.open(`https://wa.me/?text=${encodeURIComponent(post.text + "\n\n— Pasar Janapria")}`, "_blank");
        break;
      }
      case "share-product": {
        const p = productById(id);
        const text = `${p.name} — ${rp(p.price)}/${p.unit}\n${p.seller}, ${p.dusun}\n\nPesan lewat Pasar Janapria: ${location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
        break;
      }
      case "approve-product": {
        Store.approveProduct(id);
        Store.logAdminAction("approve", (productById(id) || {}).name || id);
        render();
        toast(t("approve_done"), "good");
        break;
      }
      case "reject-product": {
        Store.rejectProduct(id);
        Store.logAdminAction("reject", (productById(id) || {}).name || id);
        render();
        toast(t("reject_done"), "warn");
        break;
      }
      case "report": reportSheet(id); break;
      case "advance-order": {
        const order = S.orders.find((o) => o.id === id);
        if (order && statusOf(order.status).next) {
          const next = statusOf(order.status).next;
          Store.updateOrderStatus(id, next);
          render();
          toast("✓ " + t(statusOf(next).label), "good");
        }
        break;
      }
      case "finish-order": {
        Store.updateOrderStatus(id, "selesai");
        render();
        toast("✓ " + t("status_selesai"), "good");
        break;
      }
      case "cancel-order": {
        Store.updateOrderStatus(id, "batal");
        render();
        toast(t("cancel"));
        break;
      }
      case "toggle-offline": {
        Store.setOfflineMode(!S.offlineMode);
        render();
        toast(S.offlineMode ? "📴 " + t("offline_mode") : "📶 Online");
        break;
      }
      case "sync": {
        if (!Store.isOnline()) { toast(t("offline_note"), "warn"); break; }
        const n = Store.flushQueue();
        render();
        toast(n ? `${n} ${t("synced")}` : t("all_synced"), "good");
        break;
      }
      case "reset": {
        if (confirm(t("reset_confirm"))) {
          Store.reset();
          I18N.set("id");
          ui.q = ""; ui.cat = "all"; ui.serviceCat = "all"; ui.msgTab = "chat"; ui.photo = null;
          S.lang = "id";
          render();
          toast("Demo data direset");
        }
        break;
      }
      case "lang": {
        toggleLang();
        break;
      }
      case "clear-photo": {
        ui.photo = null; ui.photoInfo = null;
        const box = document.getElementById("photoPreview");
        if (box) box.innerHTML = "";
        break;
      }
      case "go-chat": {
        closeSheet();
        if (id) location.hash = "#/pesan/" + id;
        else location.hash = "#/pesan";
        break;
      }
    }
  });

  document.addEventListener("submit", (e) => {
    const form = e.target.closest("form[data-form]");
    if (!form) return;
    e.preventDefault();
    const kind = form.dataset.form;

    if (kind === "admin-login") {
      const nipField = form.querySelector('[name="nip"]');
      const pinField = form.querySelector('[name="pin"]');
      const nip = (nipField.value || "").trim();
      const pin = (pinField.value || "").trim();
      ui.loginNip = nip;
      ui.loginError = null;
      if (!nip) {
        ui.loginError = "missingNip";
        render();
        const field = document.getElementById("adNip");
        if (field) field.focus();
        return;
      }
      if (!pin) {
        ui.loginError = "missingPin";
        render();
        const field = document.getElementById("adPin");
        if (field) field.focus();
        return;
      }
      const res = Store.login(nip, pin);
      if (!res.ok) {
        ui.loginError = res.error;
        render();
        const box = document.getElementById(res.error === "nip" ? "adNip" : "adPin");
        if (box) box.focus();
        return;
      }
      ui.loginError = null;
      ui.loginDenied = false;
      ui.loginNip = "";
      location.hash = "#/" + (form.dataset.next || "admin");
      render();
      toast(t("login_welcome") + ", " + res.session.name, "good");
      return;
    }

    if (kind === "search") {
      ui.q = form.querySelector("input[name=q]").value.trim();
      ui.cat = "all";
      if (location.hash.startsWith("#/produk")) render();
      else location.hash = "#/produk";
      return;
    }

    if (kind === "checkout") {
      const fd = new FormData(form);
      const pricing = cartPricing();
      const order = Store.createOrder({
        name: fd.get("name"), phone: fd.get("phone"), address: fd.get("address"),
        note: fd.get("note"), delivery: fd.get("delivery"), payment: fd.get("payment"),
        discount: pricing.discount, voucher: pricing.voucher ? pricing.voucher.code : null
      });
      if (!order) { toast(t("cart_empty"), "warn"); return; }
      render();
      successSheet(order);
      return;
    }

    if (kind === "send-message") {
      const input = form.querySelector("input[name=text]");
      const text = input.value.trim();
      if (!text) return;
      Store.sendMessage(form.dataset.chat, text);
      input.value = "";
      render();
      scrollThreadToEnd();
      if (!Store.isOnline()) toast(t("offline_queued"), "warn");
      return;
    }

    if (kind === "post") {
      const text = form.querySelector("textarea[name=text]").value.trim();
      if (!text) return;
      Store.addPost(text);
      render();
      toast(Store.isOnline() ? t("post") + " ✓" : t("offline_queued"), Store.isOnline() ? "good" : "warn");
      return;
    }

    if (kind === "reply") {
      const text = form.querySelector("textarea[name=text]").value.trim();
      if (!text) return;
      Store.addReply(form.dataset.id, text);
      closeSheet();
      render();
      toast(t("post") + " ✓", "good");
      return;
    }

    if (kind === "booking") {
      const fd = new FormData(form);
      const s = serviceById(form.dataset.id);
      const chatId = Store.openChatWith(s.provider, s.name, s.emoji);
      Store.sendMessage(chatId, `Halo ${s.provider}, saya mau pesan "${s.name}" untuk tanggal ${fd.get("date")}. ${fd.get("note")}`);
      closeSheet();
      location.hash = "#/pesan/" + chatId;
      toast(t("booked_msg"), "good");
      return;
    }

    if (kind === "report") {
      const reason = form.querySelector("textarea[name=reason]").value.trim();
      if (!reason) return;
      Store.reportProduct(form.dataset.id, reason);
      closeSheet();
      toast(t("report_sent"), "good");
      return;
    }

    if (kind === "blast") {
      const fd = new FormData(form);
      Store.addAnnouncement(fd.get("title"), fd.get("body"));
      Store.logAdminAction("announcement", fd.get("title"));
      form.reset();
      render();
      toast(t("blast_sent"), "good");
      return;
    }

    if (kind === "sell") {
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const price = Number(fd.get("price"));
      if (!name || !price) { toast(t("required"), "warn"); return; }
      Store.addProduct({
        name, price,
        unit: fd.get("unit"), category: fd.get("category"), stock: Number(fd.get("stock")) || 10,
        dusun: fd.get("dusun"), desc: fd.get("desc"), seller: S.user.name,
        image: ui.photo, emoji: emojiForCategory(fd.get("category"))
      });
      ui.photo = null; ui.photoInfo = null;
      form.reset();
      location.hash = "#/profil";
      toast(t("product_sent"), "good");
      return;
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target.matches("[data-search]")) {
      ui.q = e.target.value;
      const box = document.getElementById("productList");
      if (box) box.innerHTML = productListHTML();
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-sort]")) {
      ui.sort = e.target.value;
      const box = document.getElementById("productList");
      if (box) box.innerHTML = productListHTML();
    }
    if (e.target.matches("[data-delivery]")) {
      ui.delivery = e.target.value;
      const p = cartPricing();
      const shipEl = document.getElementById("sumShip");
      const totalEl = document.getElementById("sumTotal");
      const btnTotal = document.getElementById("btnTotal");
      if (shipEl) shipEl.textContent = p.ship ? rp(p.ship) : t("free");
      if (totalEl) totalEl.textContent = rp(p.total);
      if (btnTotal) btnTotal.textContent = rp(p.total);
    }
    if (e.target.matches("[data-photo]")) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      compressImage(file).then((res) => {
        ui.photo = res.dataUrl;
        ui.photoInfo = res;
        const box = document.getElementById("photoPreview");
        if (box) box.innerHTML = photoPreviewHTML();
        toast(res.saved === false
          ? "Foto siap dipakai"
          : `Foto dikecilkan: ${Math.round(res.before / 1024)} KB → ${Math.round(res.after / 1024)} KB`, "good");
      }).catch(() => toast("Foto gagal diproses, coba foto lain", "warn"));
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !sheet.hidden) closeSheet();
  });

  sheet.addEventListener("click", (e) => {
    if (e.target.classList.contains("sheet-backdrop")) closeSheet();
  });

  window.addEventListener("hashchange", render);
  window.addEventListener("online", () => { updateNet(); Store.syncSoon(); toast("📶 Online — data siap disinkronkan", "good"); });
  window.addEventListener("store:synced", () => updateNet());
  window.addEventListener("offline", () => { updateNet(); toast("📴 Offline — data disimpan di HP", "warn"); });
  window.addEventListener("store:full", () => toast("Penyimpanan HP hampir penuh. Hapus foto/chat lama.", "warn"));

  /* ---------------- util foto ---------------- */
  function compressImage(file, maxDim = 1000, quality = 0.75) {
    return new Promise((resolve, reject) => {
      if (!file.type || !file.type.startsWith("image/")) { reject(new Error("not-image")); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          let dataUrl;
          try { dataUrl = canvas.toDataURL("image/jpeg", quality); }
          catch (err) { reject(err); return; }
          const after = Math.round(dataUrl.length * 0.75);
          // Foto kecil bisa justru membesar setelah diubah ke JPEG.
          // Simpan aslinya kalau tidak ada penghematan dan ukurannya masih wajar.
          if (after >= file.size && file.size < 300 * 1024) {
            resolve({
              dataUrl: reader.result, width: img.width, height: img.height,
              before: file.size, after: file.size, saved: false
            });
            return;
          }
          resolve({
            dataUrl, width: w, height: h,
            before: file.size,
            after: after,
            saved: after < file.size
          });
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function emojiForCategory(cat) {
    const map = { sembako: "🌾", camilan: "🍪", minuman: "☕", kriya: "🧵", sayur: "🥬", pertanian: "🌱", herbal: "🌿" };
    return map[cat] || "🛍️";
  }

  /* ---------------- start ---------------- */
  document.getElementById("langToggle").addEventListener("click", toggleLang);

  I18N.set(S.lang || "id");
  if (!location.hash) location.hash = "#/beranda";
  render();
  updateNet();
})();
