/* ══════════════════════════════════════════════════════════════
   ⚙️  CONFIG — SỬA THÔNG TIN CỦA BẠN CHỈ TRONG FILE NÀY
   Đổi tên thương hiệu, SĐT, Zalo, Facebook, giá, quy trình…
   Lưu lại là toàn bộ trang tự cập nhật. KHÔNG cần sửa file khác.
   ══════════════════════════════════════════════════════════════ */
window.PORTFOLIO_CONFIG = {

  /* --- Thương hiệu của bạn --- */
  brand: "Web Nhanh",
  heroBadge: "🚀 Web cho quán nhỏ — xong trong 2 ngày",
  heroTitle: "Website cho quán của bạn — xong trong 2 ngày",
  heroIntro:
    "Bạn chỉ cần gửi 3 thứ: tên quán, hình ảnh và menu. Hai ngày sau có website chạy thật, " +
    "chuẩn trên điện thoại, có nút gọi và Zalo ngay trên trang. Trả một lần, không phí thuê hàng tháng " +
    "— khác với mấy nền tảng bắt đóng theo tháng.",

  /* --- Liên hệ của bạn --- */
  contact: {
    name: "Nguyên Vỹ",                     // Tên hiển thị cùng nút Zalo
    phone: "034 975 1745",                 // SĐT hiển thị trên web (bấm gọi: tel:+84349751745)
    zalo: "https://zalo.me/0349751745",    // Link chat Zalo
    facebook: "",                          // Chưa có Fanpage → nút Messenger tự ẨN (dán link m.me/... khi có)
  },

  /* --- Form yêu cầu báo giá (gửi qua Formspree, cùng ID với 3 demo) ---
     Muốn tách dữ liệu riêng cho portfolio: tạo form mới tại formspree.io rồi đổi ID bên dưới. */
  formspreeId: "mgaezbyr",

  /* --- 3 website mẫu (url trỏ tới folder demo tương ứng) --- */
  demos: [
    {
      tag: "Quán cà phê / ăn uống",
      name: "The Morning Cafe",
      desc: "Thực đơn có giá, hình ảnh không gian, đặt bàn qua Zalo trong 1 chạm.",
      img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=60",
      url: "../demo-cafe/",
    },
    {
      tag: "Spa / Salon / Làm đẹp",
      name: "Serenity Spa",
      desc: "Liệu trình + bảng giá rõ ràng, đặt lịch hẹn nhanh qua form hoặc Zalo.",
      img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=60",
      url: "../demo-spa/",
    },
    {
      tag: "Phòng gym / Yoga",
      name: "IronPulse Gym",
      desc: "Gói tập, lớp học, đăng ký tập thử miễn phí ngay trên website.",
      img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=60",
      url: "../demo-gym/",
    },
  ],

  /* --- Bảng giá 2 gói --- */
  pricing: [
    {
      name: "Gói Cơ Bản",
      amount: "1.000.000 – 1.500.000đ",
      time: "Giao trong 2 ngày",
      featured: false,
      features: [
        "Website 1 trang giới thiệu chuyên nghiệp",
        "Giới thiệu dịch vụ / thực đơn + bảng giá",
        "Bản đồ Google Maps + thông tin liên hệ",
        "Form liên hệ + nút Zalo / Messenger",
        "Chuẩn hiển thị trên điện thoại",
      ],
    },
    {
      name: "Gói Đầy Đủ",
      amount: "2.000.000 – 3.000.000đ",
      time: "Giao trong 4 ngày",
      featured: true, // gói này được gắn nhãn "Phổ biến nhất"
      features: [
        "Tất cả tính năng của Gói Cơ Bản",
        "Trang đặt lịch hẹn / giỏ hàng cơ bản",
        "Tối ưu tốc độ tải & hiển thị Google",
        "Chỉnh sửa nội dung theo yêu cầu 1 lần",
        "Hướng dẫn tự cập nhật thông tin",
      ],
    },
  ],

  /* --- Quy trình làm việc 4 bước --- */
  steps: [
    { title: "Liên hệ", desc: "Nhắn Zalo / Facebook, kể rõ quán bạn cần gì." },
    { title: "Chọn demo mẫu", desc: "Xem website mẫu theo ngành, chọn phong cách ưng ý." },
    { title: "Xác nhận", desc: "Gửi tên, menu/dịch vụ, hình ảnh — chốt giá & thời gian." },
    { title: "Nhận website", desc: "Nhận link website hoàn chỉnh trong 2–4 ngày." },
  ],
};
