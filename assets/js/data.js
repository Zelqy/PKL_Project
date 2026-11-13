/* =========================================================
   Data contoh (seed) — Pasar Janapria
   Semua data disimpan lokal (localStorage) supaya MVP bisa
   didemokan tanpa server. Struktur ini mengikuti bentuk
   respons REST API, jadi mudah ditukar ke backend nanti.
   ========================================================= */
window.SEED = {
  user: {
    name: "Amaq Rian",
    dusun: "Dusun Janapria Daya",
    phone: "0812-3456-7890",
    role: "Warga",
    joined: "2025"
  },

  profile_stats: { umkm: 48, products: 126, dusun: 7, orders_month: 312 },

  /* Akun pengelola (data demo — di produksi disimpan hashed di server) */
  admins: [
    { nip: "JP-001", name: "Lalu Ahmad Fauzi", role: "Admin Desa", jabatan: "Kasi Pelayanan", pin: "1234" },
    { nip: "JP-002", name: "Inaq Wulan Sari", role: "Duta Digital", jabatan: "Pendamping UMKM", pin: "2345" }
  ],

  categories: [
    { id: "sembako", label: "Sembako", emoji: "🌾" },
    { id: "camilan", label: "Camilan", emoji: "🍪" },
    { id: "minuman", label: "Kopi & Minuman", emoji: "☕" },
    { id: "kriya", label: "Kriya & Tenun", emoji: "🧵" },
    { id: "sayur", label: "Sayur & Buah", emoji: "🥬" },
    { id: "pertanian", label: "Pertanian", emoji: "🚜" },
    { id: "herbal", label: "Herbal", emoji: "🌿" }
  ],

  service_categories: [
    { id: "pertukangan", label: "Pertukangan", emoji: "🔨" },
    { id: "pertanian", label: "Pertanian", emoji: "🌾" },
    { id: "rumahtangga", label: "Rumah Tangga", emoji: "🧹" },
    { id: "event", label: "Event Desa", emoji: "🎪" },
    { id: "transportasi", label: "Transportasi", emoji: "🛺" }
  ],

  products: [
    {
      id: "p1", name: "Kopi Robusta Janapria 250 gram", price: 35000, unit: "bungkus",
      category: "minuman", emoji: "☕", seller: "Bu Inaq Sariah", dusun: "Janapria Daya",
      rating: 4.8, reviewsCount: 41, sold: 132, stock: 24, verified: true, featured: true,
      status: "aktif", joined: "2024",
      desc: "Kopi robusta petik merah dari kebun lereng Janapria. Disangrai kayu bakar, digiling kasar. Aroma kuat, sedikit coklat, tidak asam. Cocok untuk kopi tubruk atau espresso rumahan.",
      reviews: [
        { by: "Lalu Sopian", stars: 5, text: "Wanginya mantap, masih segar. Beli 2 bungkus buat tamu hajatan." },
        { by: "Inaq Nur", stars: 4, text: "Enak, tapi bungkusnya minta dibanyakin lagi ya." }
      ]
    },
    {
      id: "p2", name: "Beras Pandan Wangi 5 kg", price: 65000, unit: "karung",
      category: "sembako", emoji: "🍚", seller: "Pak Amaq Rudi", dusun: "Janapria Timur",
      rating: 4.9, reviewsCount: 76, sold: 210, stock: 40, verified: true, featured: true,
      status: "aktif", joined: "2023",
      desc: "Beras pandan wangi hasil panen musim ini, disosoh dua kali. Pulen, wangi, cocok untuk kebutuhan harian maupun hajatan. Bisa pesan karungan banyak.",
      reviews: [
        { by: "Bu Inaq Mina", stars: 5, text: "Pulenn, anak-anak doyan. Antar sampai rumah cepat." },
        { by: "Amaq Sukri", stars: 5, text: "Harga ramah, kualitas tidak kalah toko." }
      ]
    },
    {
      id: "p3", name: "Madu Hutan Selebung 500 ml", price: 85000, unit: "botol",
      category: "herbal", emoji: "🍯", seller: "H. Lalu Wira", dusun: "Selebung",
      rating: 4.7, reviewsCount: 28, sold: 64, stock: 12, verified: true, featured: false,
      status: "aktif", joined: "2024",
      desc: "Madu hutan murni dari kawasan Selebung. Dipanen berkelompok, tanpa campuran gula. Kental, rasa floral, cocok untuk stamina dan obat batuk ringan.",
      reviews: [
        { by: "Amaq Hasan", stars: 5, text: "Kental, beda dengan madu di pasaran. Recommended." }
      ]
    },
    {
      id: "p4", name: "Songket Tenun Khas Lombok", price: 450000, unit: "lembar",
      category: "kriya", emoji: "🧵", seller: "Bu Inaq Nur", dusun: "Janapria Barat",
      rating: 5.0, reviewsCount: 19, sold: 27, stock: 5, verified: true, featured: true,
      status: "aktif", joined: "2023",
      desc: "Songket tenun tangan motif khas Lombok, benang emas. Proses 3–4 minggu per lembar. Cocok untuk acara adat, pernikahan, atau koleksi. Bisa pesan motif sendiri.",
      reviews: [
        { by: "Sanggar Seni Janapria", stars: 5, text: "Hasil tenunan rapi, motif sesuai permintaan. Dipakai untuk acara adat." }
      ]
    },
    {
      id: "p5", name: "Keripik Pisang Pedas", price: 15000, unit: "bungkus", 
      category: "camilan", emoji: "🍌", seller: "UMKM Dende Ayu", dusun: "Langko",
      rating: 4.6, reviewsCount: 52, sold: 180, stock: 60, verified: true, featured: false,
      status: "aktif", joined: "2024",
      desc: "Keripik pisang kepok iris tipis, digoreng dua kali, dibumbui cabai kering. Pedasnya nampol tapi tidak bikin sakit perut. Tanpa pengawet, tahan 3 minggu.",
      reviews: [
        { by: "Dende Wati", stars: 5, text: "Pedasnya pas, bikin nagih. Sudah repeat order 3 kali." }
      ]
    },
    {
      id: "p6", name: "Gula Aren Cair 500 ml", price: 28000, unit: "botol",
      category: "sembako", emoji: "🥥", seller: "Kelompok Tani Sade", dusun: "Selebung",
      rating: 4.8, reviewsCount: 34, sold: 96, stock: 18, verified: true, featured: false,
      status: "aktif", joined: "2023",
      desc: "Gula aren cair dari nira asli, dimasak dengan kayu. Tanpa gula pasir campuran. Praktis untuk bikin kopi, jajan, atau bumbu masak.",
      reviews: [
        { by: "Warung Inaq Mina", stars: 5, text: "Manisnya alami, tidak bikin enek. Langganan warung saya." }
      ]
    },
    {
      id: "p7", name: "Cabai Rawit Merah 1 kg", price: 40000, unit: "kg",
      category: "sayur", emoji: "🌶️", seller: "Pak Amaq Sukri", dusun: "Janapria Daya",
      rating: 4.5, reviewsCount: 23, sold: 87, stock: 15, verified: true, featured: false,
      status: "aktif", joined: "2024",
      desc: "Cabai rawit merah segar, dipetik pagi hari. Bisa ambil sendiri di kebun atau diantar dalam desa. Harga mengikuti panen harian.",
      reviews: [
        { by: "Bu Inaq Sariah", stars: 4, text: "Segar, pedasnya mantap. Pengiriman agak siang tapi oke." }
      ]
    },
    {
      id: "p8", name: "Anyaman Ketak Tempat Buah", price: 55000, unit: "buah",
      category: "kriya", emoji: "🧺", seller: "Bu Inaq Raihan", dusun: "Langko",
      rating: 4.9, reviewsCount: 16, sold: 38, stock: 9, verified: true, featured: false,
      status: "aktif", joined: "2024",
      desc: "Anyaman ketak alami, dibuat tangan oleh ibu-ibu Dusun Langko. Kuat, ringan, dan ramah lingkungan. Bisa untuk tempat buah, hantaran, atau dekorasi.",
      reviews: [
        { by: "H. Lalu Wira", stars: 5, text: "Rapi dan kuat. Saya beli 10 untuk hantaran keluarga." }
      ]
    },
    {
      id: "p9", name: "Telur Ayam Kampung 1 tray", price: 52000, unit: "tray",
      category: "sembako", emoji: "🥚", seller: "Peternakan Semeton Jaya", dusun: "Janapria Timur",
      rating: 4.7, reviewsCount: 45, sold: 143, stock: 22, verified: true, featured: false,
      status: "aktif", joined: "2023",
      desc: "Telur ayam kampung segar dari kandang umbaran. Dikemas tray karton, aman untuk dibawa jauh. Bisa langganan mingguan dengan harga khusus.",
      reviews: [
        { by: "Bu Inaq Nur", stars: 5, text: "Kuning telurnya pekat, enak untuk jamu." }
      ]
    },
    {
      id: "p10", name: "Es Kelapa Muda Segar", price: 12000, unit: "gelas",
      category: "minuman", emoji: "🥤", seller: "Warung Inaq Mina", dusun: "Janapria Barat",
      rating: 4.4, reviewsCount: 61, sold: 205, stock: 30, verified: true, featured: false,
      status: "aktif", joined: "2024",
      desc: "Es kelapa muda asli, tanpa pemanis buatan. Tersedia original atau campur jeruk nipis. Cocok untuk siang hari yang panas.",
      reviews: [
        { by: "Amaq Rian", stars: 4, text: "Segar, harganya bersahabat. Bisa pesan banyak untuk acara." }
      ]
    },
    {
      id: "p11", name: "Tempe & Tahu Segar", price: 10000, unit: "paket",
      category: "sembako", emoji: "🍲", seller: "Pak Amaq Hasan", dusun: "Janapria Daya",
      rating: 4.6, reviewsCount: 39, sold: 167, stock: 25, verified: true, featured: false,
      status: "aktif", joined: "2024",
      desc: "Tempe dan tahu dibuat setiap pagi, tanpa pengawet. Satu paket isi 2 tempe dan 4 tahu. Pesan sebelum jam 9 untuk pengiriman hari yang sama.",
      reviews: [
        { by: "Bu Inaq Raihan", stars: 5, text: "Masih hangat waktu diantar. Enak digoreng." }
      ]
    },
    {
      id: "p12", name: "Pupuk Kompos Organik 10 kg", price: 45000, unit: "karung",
      category: "pertanian", emoji: "🌱", seller: "Kelompok Tani Sade", dusun: "Selebung",
      rating: 4.8, reviewsCount: 21, sold: 58, stock: 33, verified: true, featured: false,
      status: "aktif", joined: "2023",
      desc: "Kompos matang dari kotoran ternak dan jerami, difermentasi 6 minggu. Cocok untuk padi, sayur, dan tanaman pekarangan. Bisa antar dengan pick-up.",
      reviews: [
        { by: "Pak Amaq Sukri", stars: 5, text: "Tanaman sayur saya subur. Bau tidak menyengat." }
      ]
    },
    {
      id: "p13", name: "Abon Ikan Tongkol", price: 30000, unit: "bungkus",
      category: "camilan", emoji: "🐟", seller: "Bu Inaq Wati", dusun: "Langko",
      rating: 4.5, reviewsCount: 0, sold: 0, stock: 10, verified: false, featured: false,
      status: "pending", joined: "2025",
      desc: "Abon ikan tongkol tanpa pengawet, dimasak dengan bumbu rumahan. Cocok untuk lauk praktis atau bekal anak sekolah.",
      reviews: []
    },
    {
      id: "p14", name: "Sabun Susu Kambing", price: 25000, unit: "buah",
      category: "herbal", emoji: "🧼", seller: "Bu Inaq Dewi", dusun: "Janapria Timur",
      rating: 4.4, reviewsCount: 0, sold: 0, stock: 20, verified: false, featured: false,
      status: "pending", joined: "2025",
      desc: "Sabun susu kambing tanpa SLS, dibuat sendiri di rumah. Lembut untuk kulit kering. Ada varian tanpa pewangi.",
      reviews: []
    }
  ],

  services: [
    {
      id: "s1", name: "Jasa Tukang Bangunan", provider: "Lalu Sopian", category: "pertukangan",
      emoji: "🔨", rate: 150000, rateUnit: "hari", rating: 4.8, jobs: 47,
      dusun: "Janapria Daya", verified: true, available: [1, 2, 3, 4, 5, 6],
      desc: "Tukang batu dan kayu untuk renovasi rumah, pagar, dan bangunan sederhana. Bisa kerja borongan atau harian. Bawa alat sendiri.",
      wa: "6281234567001"
    },
    {
      id: "s2", name: "Jasa Bajak Sawah (Traktor)", provider: "Kelompok Tani Sade", category: "pertanian",
      emoji: "🚜", rate: 450000, rateUnit: "petak", rating: 4.9, jobs: 83,
      dusun: "Selebung", verified: true, available: [1, 2, 3, 4, 5, 6, 0],
      desc: "Bajak dan garu sawah dengan traktor tangan. Satu petak ± 1.000 m². Termasuk operator dan bahan bakar. Pesan minimal H-2.",
      wa: "6281234567002"
    },
    {
      id: "s3", name: "Sewa Traktor Mini", provider: "Pak Amaq Sukri", category: "pertanian",
      emoji: "🚜", rate: 300000, rateUnit: "hari", rating: 4.6, jobs: 31,
      dusun: "Janapria Daya", verified: true, available: [1, 2, 3, 4, 5, 6],
      desc: "Traktor mini untuk lahan sempit atau kebun. Sudah termasuk operator. BBM ditanggung penyewa.",
      wa: "6281234567003"
    },
    {
      id: "s4", name: "Jasa Jahit & Permak Pakaian", provider: "Bu Inaq Nur", category: "rumahtangga",
      emoji: "🪡", rate: 35000, rateUnit: "potong", rating: 4.9, jobs: 112,
      dusun: "Janapria Barat", verified: true, available: [1, 2, 3, 4, 5],
      desc: "Jahit baju, seragam sekolah, kebaya, dan permak pakaian. Bisa datang ke rumah atau ambil-antar di dusun sekitar.",
      wa: "6281234567004"
    },
    {
      id: "s5", name: "Catering & Masak Hajatan", provider: "Dapur Semeton", category: "event",
      emoji: "🍛", rate: 25000, rateUnit: "porsi", rating: 4.7, jobs: 64,
      dusun: "Janapria Timur", verified: true, available: [1, 2, 3, 4, 5, 6, 0],
      desc: "Masak untuk hajatan, arisan, dan acara desa. Menu khas Sasak: ayam pedal, plecing, dan urap. Minimal 50 porsi.",
      wa: "6281234567005"
    },
    {
      id: "s6", name: "Sewa Tenda & Sound System", provider: "Karang Taruna Janapria", category: "event",
      emoji: "🎪", rate: 1500000, rateUnit: "paket", rating: 4.6, jobs: 28,
      dusun: "Janapria Daya", verified: true, available: [1, 2, 3, 4, 5, 6, 0],
      desc: "Paket tenda 4×8 m, kursi 100 buah, sound system, dan panggung kecil. Termasuk tenaga pasang dan bongkar.",
      wa: "6281234567006"
    },
    {
      id: "s7", name: "Ojek Desa & Antar Hasil Panen", provider: "Pak Rian", category: "transportasi",
      emoji: "🛵", rate: 10000, rateUnit: "antar", rating: 4.8, jobs: 156,
      dusun: "Janapria Daya", verified: true, available: [1, 2, 3, 4, 5, 6, 0],
      desc: "Antar orang, barang, dan hasil panen dalam desa. Tersedia pagi sampai malam. Bisa titip belanja dari pasar.",
      wa: "6281234567007"
    },
    {
      id: "s8", name: "Sewa Mobil Pick-up", provider: "Pak Amaq Hasan", category: "transportasi",
      emoji: "🚚", rate: 250000, rateUnit: "hari", rating: 4.5, jobs: 22,
      dusun: "Janapria Daya", verified: true, available: [1, 2, 3, 4, 5, 6],
      desc: "Pick-up untuk angkut barang, hasil panen, atau pindahan. Lepas kunci atau dengan sopir. BBM di luar harga sewa.",
      wa: "6281234567008"
    },
    {
      id: "s9", name: "Jasa Bersih Rumah & Halaman", provider: "Bu Inaq Mina", category: "rumahtangga",
      emoji: "🧹", rate: 60000, rateUnit: "rumah", rating: 4.7, jobs: 39,
      dusun: "Janapria Barat", verified: true, available: [1, 2, 3, 4, 5, 6],
      desc: "Bersih-bersih rumah, sapu halaman, dan cuci perabot. Bawa alat sendiri. Bisa harian atau mingguan.",
      wa: "6281234567009"
    },
    {
      id: "s10", name: "MC & Rias Pengantin", provider: "Sanggar Seni Janapria", category: "event",
      emoji: "💄", rate: 800000, rateUnit: "paket", rating: 4.9, jobs: 17,
      dusun: "Janapria Barat", verified: true, available: [1, 2, 3, 4, 5, 6, 0],
      desc: "Paket MC adat Sasak, rias pengantin, dan iringan musik tradisional. Konsultasi gratis sebelum hari acara.",
      wa: "6281234567010"
    }
  ],

  chats: [
    {
      id: "c1", name: "Bu Inaq Sariah", role: "Penjual Kopi Robusta", emoji: "☕", unread: 1,
      messages: [
        { from: "them", text: "Selamat siang Amaq. Kopinya masih ada 24 bungkus.", time: "10:12" },
        { from: "me", text: "Nggih Inaq, nanti sore saya ambil 2 bungkus ya.", time: "10:15" },
        { from: "them", text: "Siap Amaq. Nanti saya siapkan, bisa COD di warung.", time: "10:16" }
      ]
    },
    {
      id: "c2", name: "Lalu Sopian", role: "Tukang Bangunan", emoji: "🔨", unread: 0,
      messages: [
        { from: "them", text: "Untuk renovasi pagar, saya bisa mulai Senin pagi.", time: "Kemarin" },
        { from: "me", text: "Baik, estimasi berapa hari selesai?", time: "Kemarin" },
        { from: "them", text: "Sekitar 4 hari kalau material sudah siap di lokasi.", time: "Kemarin" }
      ]
    },
    {
      id: "c3", name: "Admin Desa (Duta Digital)", role: "Admin Pasar Janapria", emoji: "🏛️", unread: 0,
      messages: [
        { from: "them", text: "Selamat datang di Pasar Janapria! Kalau butuh bantuan titip jual, chat saya ya.", time: "Senin" }
      ]
    }
  ],

  forum: [
    {
      id: "f1", author: "Amaq Rian", dusun: "Janapria Daya", emoji: "👨‍🌾", time: "2 jam lalu",
      text: "Ada yang jual mangga harum manis? Butuh 5 kg untuk acara keluarga sabtu ini.",
      replies: [
        { author: "Bu Inaq Sariah", text: "Saya punya, panen kemarin. 1 kg Rp 20.000, bisa antar." },
        { author: "Amaq Rian", text: "Baik Inaq, nanti saya chat langsung." }
      ]
    },
    {
      id: "f2", author: "Dende Wati", dusun: "Langko", emoji: "👩", time: "5 jam lalu",
      text: "Info: ibu-ibu Dusun Langko buka kelas anyaman ketak gratis tiap Jumat sore di balai dusun. Bawa alat sendiri ya.",
      replies: [
        { author: "Admin Desa", text: "Sudah kami masukkan ke pengumuman desa. Terima kasih Dende!" }
      ]
    },
    {
      id: "f3", author: "Pak Amaq Sukri", dusun: "Janapria Daya", emoji: "👨‍🌾", time: "Kemarin",
      text: "Traktor mini saya kosong hari Kamis–Jumat. Yang butuh bisa langsung hubungi.",
      replies: []
    }
  ],

  notifications: [
    {
      id: "n1", type: "panen", title: "Panen mangga di Dusun A",
      body: "Bu Inaq Sariah panen mangga harum manis hari ini. Diskon 10% untuk pembelian 3 kg ke atas.",
      time: "Hari ini"
    },
    {
      id: "n2", type: "desa", title: "Posyandu & vaksinasi",
      body: "Posyandu balita dan vaksinasi lansia di Balai Desa Janapria, Sabtu pukul 08.00–11.00. Gratis.",
      time: "Kemarin"
    },
    {
      id: "n3", type: "desa", title: "Gotong royong bersih saluran",
      body: "Minggu pagi pukul 07.00 di saluran irigasi Dusun Janapria Timur. Bawa alat kerja masing-masing.",
      time: "3 hari lalu"
    }
  ],

  vouchers: [
    { id: "v1", code: "ONGKIR0", title: "Gratis Ongkir", desc: "Min. belanja Rp50.000", min: 50000, value: 5000 },
    { id: "v2", code: "HEMAT10", title: "Diskon Rp10.000", desc: "Min. belanja Rp100.000", min: 100000, value: 10000 },
    { id: "v3", code: "DESA15", title: "Potongan Rp15.000", desc: "Min. belanja Rp150.000", min: 150000, value: 15000 }
  ],

  sales_by_dusun: [
    { dusun: "Janapria Daya", value: 96 },
    { dusun: "Janapria Timur", value: 74 },
    { dusun: "Janapria Barat", value: 58 },
    { dusun: "Selebung", value: 42 },
    { dusun: "Langko", value: 28 },
    { dusun: "Batu Jangkih", value: 14 }
  ]
};
