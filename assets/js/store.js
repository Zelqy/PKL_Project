/* =========================================================
   Store — state lokal + persistensi (offline-first)
   Semua aksi tulis masuk ke state lokal dulu, lalu dicatat
   di syncQueue. Kalau online, queue "dikirim" ke server
   (di MVP ini disimulasikan). Kalau offline, tetap tersimpan.
   ========================================================= */
(function () {
  const KEY = "pasarjanapria.v1";
  const clone = (v) => JSON.parse(JSON.stringify(v));

  function seedState() {
    return {
      lang: "id",
      user: clone(SEED.user),
      products: clone(SEED.products),
      services: clone(SEED.services),
      chats: clone(SEED.chats),
      forum: clone(SEED.forum),
      notifications: clone(SEED.notifications),
      cart: [],
      orders: [],
      reports: [],
      myProductIds: [],
      adminSession: null,
      adminLog: [],
      offlineMode: false,
      lastSync: null,
      syncQueue: []
    };
  }

  let state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? Object.assign(seedState(), JSON.parse(raw)) : seedState();
  } catch (e) {
    state = seedState();
  }

  const listeners = [];

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // localStorage penuh (mis. banyak foto) — beri tahu app
      window.dispatchEvent(new CustomEvent("store:full"));
    }
    listeners.forEach((fn) => fn(state));
  }

  let syncTimer = null;
  function scheduleSync() {
    clearTimeout(syncTimer);
    if (!window.Store || !window.Store.isOnline() || !state.syncQueue.length) return;
    syncTimer = setTimeout(() => {
      if (!window.Store.isOnline() || !state.syncQueue.length) return;
      const n = window.Store.flushQueue();
      if (n) window.dispatchEvent(new CustomEvent("store:synced", { detail: { count: n } }));
    }, 1600);
  }

  function enqueue(action, payload) {
    state.syncQueue.push({
      id: "q" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      action,
      payload,
      at: new Date().toISOString()
    });
    // Sesuai prinsip offline-first: saat online, antrean dikirim otomatis
    // (di MVP disimulasikan dengan jeda singkat).
    scheduleSync();
  }

  window.Store = {
    get state() { return state; },
    subscribe(fn) { listeners.push(fn); },

    save,
    reset() {
      state = seedState();
      save();
    },

    // ---------- sesi admin ----------
    // Demo MVP: PIN dicek di perangkat. Di produksi pindah ke endpoint
    // POST /api/admin/login yang membandingkan hash PIN di server.
    login(nip, pin) {
      const acc = SEED.admins.find((a) => a.nip.toLowerCase() === String(nip || "").trim().toLowerCase());
      if (!acc) return { ok: false, error: "nip" };
      if (String(pin).trim() !== acc.pin) return { ok: false, error: "pin" };
      state.adminSession = {
        nip: acc.nip, name: acc.name, role: acc.role, jabatan: acc.jabatan,
        at: new Date().toISOString()
      };
      state.adminLog.unshift({ at: new Date().toISOString(), action: "login", nip: acc.nip, detail: acc.name });
      save();
      return { ok: true, session: state.adminSession };
    },
    logout() {
      if (state.adminSession) {
        state.adminLog.unshift({
          at: new Date().toISOString(), action: "logout",
          nip: state.adminSession.nip, detail: state.adminSession.name
        });
      }
      state.adminSession = null;
      save();
    },
    isAdmin() { return !!state.adminSession; },
    logAdminAction(action, detail) {
      if (!state.adminSession) return;
      state.adminLog.unshift({
        at: new Date().toISOString(), action, nip: state.adminSession.nip, detail
      });
      state.adminLog = state.adminLog.slice(0, 20);
      save();
    },

    // ---------- pengaturan ----------
    setLang(lang) { state.lang = lang; save(); },
    setOfflineMode(on) {
      state.offlineMode = !!on;
      save();
      if (!state.offlineMode) scheduleSync();
    },

    isOnline() {
      return navigator.onLine && !state.offlineMode;
    },

    // ---------- keranjang ----------
    addToCart(productId, qty = 1) {
      const p = state.products.find((x) => x.id === productId);
      if (!p || p.status !== "aktif") return false;
      const row = state.cart.find((c) => c.id === productId);
      const max = p.stock || 99;
      if (row) row.qty = Math.min(row.qty + qty, max);
      else state.cart.push({ id: productId, qty: Math.min(qty, max) });
      enqueue("cart.add", { productId, qty });
      save();
      return true;
    },
    setCartQty(productId, qty) {
      const p = state.products.find((x) => x.id === productId);
      const max = p ? p.stock : 99;
      const row = state.cart.find((c) => c.id === productId);
      if (!row) return;
      row.qty = Math.max(1, Math.min(qty, max));
      save();
    },
    removeFromCart(productId) {
      state.cart = state.cart.filter((c) => c.id !== productId);
      save();
    },
    cartDetailed() {
      return state.cart
        .map((row) => {
          const p = state.products.find((x) => x.id === row.id);
          return p ? { ...row, product: p, lineTotal: p.price * row.qty } : null;
        })
        .filter(Boolean);
    },
    cartCount() {
      return state.cart.reduce((n, r) => n + r.qty, 0);
    },
    cartSubtotal() {
      return this.cartDetailed().reduce((n, r) => n + r.lineTotal, 0);
    },
    clearCart() { state.cart = []; save(); },

    // ---------- pesanan ----------
    deliveryOptions: [
      { id: "pickup", cost: 0 },
      { id: "desa", cost: 5000 },
      { id: "kec", cost: 10000 }
    ],
    createOrder(input) {
      const items = this.cartDetailed();
      if (!items.length) return null;
      const delivery = this.deliveryOptions.find((d) => d.id === input.delivery) || this.deliveryOptions[0];
      const subtotal = this.cartSubtotal();
      const discount = Math.max(0, Math.min(Number(input.discount) || 0, subtotal));
      const code = "JP-" + String(Date.now()).slice(-6);
      const order = {
        id: code,
        items: items.map((r) => ({
          id: r.product.id, name: r.product.name, price: r.product.price,
          qty: r.qty, emoji: r.product.emoji, seller: r.product.seller
        })),
        subtotal,
        shipping: delivery.cost,
        discount,
        voucher: input.voucher || null,
        total: Math.max(0, subtotal + delivery.cost - discount),
        delivery: delivery.id,
        payment: input.payment || "cod",
        name: input.name || state.user.name,
        phone: input.phone || state.user.phone,
        address: input.address || state.user.dusun,
        note: input.note || "",
        status: "wait",
        createdAt: new Date().toISOString()
      };
      state.orders.unshift(order);
      items.forEach((r) => {
        const p = state.products.find((x) => x.id === r.product.id);
        if (p) {
          p.stock = Math.max(0, p.stock - r.qty);
          p.sold += r.qty;
        }
      });
      // kurangi stok, catat antrean, lalu chat otomatis ke penjual pertama
      const sellerName = items[0].product.seller;
      let chat = state.chats.find((c) => c.name === sellerName);
      if (!chat) {
        chat = {
          id: "c" + Date.now().toString(36), name: sellerName, role: "Penjual",
          emoji: items[0].product.emoji, unread: 0, messages: []
        };
        state.chats.unshift(chat);
      }
      chat.messages.push({
        from: "me",
        text: `Halo, saya pesan ${order.items.map((i) => i.name + " ×" + i.qty).join(", ")}. Kode ${order.id}.`,
        time: nowTime()
      });
      chat.messages.push({
        from: "them",
        text: this.isOnline()
          ? `Pesanan ${order.id} diterima. Nanti saya konfirmasi ya.`
          : `Pesanan ${order.id} tercatat di HP saya. Nanti saya cek setelah sinyal bagus.`,
        time: nowTime()
      });
      state.cart = [];
      enqueue("order.create", { id: order.id, total: order.total });
      save();
      return order;
    },
    updateOrderStatus(id, status) {
      const o = state.orders.find((x) => x.id === id);
      if (o) { o.status = status; save(); }
    },

    // ---------- chat ----------
    chatById(id) { return state.chats.find((c) => c.id === id); },
    sendMessage(chatId, text) {
      const chat = this.chatById(chatId);
      if (!chat || !text.trim()) return null;
      const msg = { from: "me", text: text.trim(), time: nowTime() };
      chat.messages.push(msg);
      enqueue("chat.send", { chatId, text: msg.text });
      save();
      return msg;
    },
    markChatRead(chatId) {
      const c = this.chatById(chatId);
      if (c && c.unread) { c.unread = 0; save(); }
    },
    openChatWith(name, role, emoji) {
      let chat = state.chats.find((c) => c.name === name);
      if (!chat) {
        chat = { id: "c" + Date.now().toString(36), name, role, emoji, unread: 0, messages: [] };
        state.chats.unshift(chat);
        save();
      }
      return chat.id;
    },

    // ---------- forum ----------
    addPost(text) {
      const post = {
        id: "f" + Date.now().toString(36),
        author: state.user.name,
        dusun: state.user.dusun.replace("Dusun ", ""),
        emoji: "🙋",
        time: "Baru saja",
        text: text.trim(),
        replies: []
      };
      state.forum.unshift(post);
      enqueue("forum.post", { id: post.id });
      save();
      return post;
    },
    addReply(postId, text) {
      const p = state.forum.find((f) => f.id === postId);
      if (!p) return;
      p.replies.push({ author: state.user.name, text: text.trim() });
      enqueue("forum.reply", { postId });
      save();
    },

    // ---------- produk ----------
    addProduct(data) {
      const p = {
        id: "p" + Date.now().toString(36),
        name: data.name,
        price: data.price,
        unit: data.unit || "buah",
        category: data.category,
        emoji: data.emoji || "🛍️",
        seller: data.seller || state.user.name,
        dusun: data.dusun || "Janapria Daya",
        rating: 0, reviewsCount: 0, sold: 0,
        stock: data.stock || 10,
        verified: false, featured: false,
        status: "pending",
        joined: "2025",
        desc: data.desc,
        reviews: [],
        image: data.image || null
      };
      state.products.unshift(p);
      state.myProductIds.push(p.id);
      enqueue("product.create", { id: p.id });
      save();
      return p;
    },
    approveProduct(id) {
      const p = state.products.find((x) => x.id === id);
      if (!p) return;
      p.status = "aktif";
      p.verified = true;
      state.notifications.unshift({
        id: "n" + Date.now().toString(36),
        type: "produk",
        title: "Produk baru tayang",
        body: `${p.name} dari ${p.seller} sudah lolos verifikasi admin desa.`,
        time: "Baru saja"
      });
      enqueue("product.approve", { id });
      save();
    },
    rejectProduct(id) {
      const p = state.products.find((x) => x.id === id);
      if (!p) return;
      p.status = "ditolak";
      enqueue("product.reject", { id });
      save();
    },
    reportProduct(id, reason) {
      const p = state.products.find((x) => x.id === id);
      state.reports.push({ id: "r" + Date.now().toString(36), productId: id, name: p ? p.name : id, reason, at: new Date().toISOString() });
      enqueue("product.report", { id, reason });
      save();
    },

    // ---------- pengumuman admin ----------
    addAnnouncement(title, body) {
      state.notifications.unshift({
        id: "n" + Date.now().toString(36), type: "desa", title, body, time: "Baru saja"
      });
      enqueue("announcement.create", { title });
      save();
    },

    // ---------- sinkronisasi ----------
    pendingCount() { return state.syncQueue.length; },
    syncSoon() { scheduleSync(); },
    flushQueue() {
      clearTimeout(syncTimer);
      const n = state.syncQueue.length;
      state.syncQueue = [];
      state.lastSync = new Date().toISOString();
      save();
      return n;
    }
  };

  function nowTime() {
    return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }

  window.nowTime = nowTime;
  window.fmtRp = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");
})();
