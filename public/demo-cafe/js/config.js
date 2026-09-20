/* ══════════════════════════════════════════════════════════════
   ⚙️  CONFIG — SỬA THÔNG TIN KHÁCH HÀNG CHỈ TRONG FILE NÀY
   Đổi tên, SĐT, Zalo, địa chỉ, giờ mở cửa, thực đơn, giá, ảnh…
   Lưu lại là toàn bộ website tự cập nhật. KHÔNG cần sửa file khác.
   ══════════════════════════════════════════════════════════════ */
window.BUSINESS_CONFIG = {

  /* --- Nhãn nhỏ dùng trong thông báo --- */
  emoji: "☕",

  /* --- Form liên hệ qua Formspree (miễn phí) ---
     ID đã cấu hình thật (endpoint: https://formspree.io/f/mgaezbyr).
     Muốn đổi form khác: đăng ký tại formspree.io rồi thay giá trị bên dưới.
     Nếu ID rỗng/sai định dạng, form tự chạy chế độ demo: chỉ alert, KHÔNG gửi. */
  formspreeId: "mgaezbyr",

  /* --- Thông tin doanh nghiệp --- */
  business: {
    name: "The Morning Cafe",
    tagline: "Cà phê rang xay nguyên bản — nơi bắt đầu một ngày nhẹ nhàng",
    about: "Ẩn mình trên phố đi bộ, The Morning Cafe phục vụ những dòng cà phê rang xay được tuyển chọn hạt thủ công cùng bánh ngọt làm mới mỗi ngày. Không gian ấm cúng với nhiều cây xanh, phù hợp để làm việc, hẹn hò hay đơn giản là tận hưởng một buổi sáng yên bình. Chúng tôi tin rằng một tách cà phê ngon có thể thay đổi cả ngày dài của bạn.",
  },

  /* --- Thông tin liên hệ --- */
  contact: {
    name: "Nguyên Vỹ",                       // Tên người nhận tin nhắn Zalo
    phone: "034 975 1745",                   // SĐT hiển thị trên web (bấm gọi: tel:+84349751745)
    zalo: "https://zalo.me/0349751745",      // Link chat Zalo
    facebook: "",                            // Chưa có Fanpage → nút Messenger tự ẨN (dán link m.me/... khi có)
    address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    mapQuery: "Nguyễn Huệ, Quận 1, Hồ Chí Minh", // Địa chỉ dùng cho Google Maps
  },

  /* --- Giờ mở cửa --- */
  hours: [
    { days: "Thứ 2 – Thứ 6", time: "07:00 – 22:00" },
    { days: "Thứ 7 – Chủ nhật", time: "08:00 – 23:00" },
  ],

  /* --- Chữ trên nút CTA (màu nâu) --- */
  ctaText: "Đặt bàn ngay",

  /* --- Ảnh (thay bằng link ảnh thật của quán khi có) --- */
  images: {
    hero: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=75",
    about: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=70",
    gallery: [
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1524350876685-274059332603?auto=format&fit=crop&w=700&q=60",
    ],
    fallback: "https://picsum.photos/seed/cafe", // Ảnh dự phòng nếu ảnh trên không tải được
  },

  /* --- Thực đơn (4–6 món, giá minh họa) --- */
  services: [
    { icon: "☕", name: "Cà phê rang xay", desc: "Hạt Arabica rang mộc, pha phin truyền thống đậm đà.", price: "35.000đ" },
    { icon: "🥛", name: "Cà phê sữa đá", desc: "Vị cà phê đậm hòa quyện cùng sữa đặc thơm ngọt.", price: "32.000đ" },
    { icon: "🧋", name: "Trà sữa trân châu", desc: "Trà Oolong thượng hạng, trân châu đường đen dẻo dai.", price: "45.000đ" },
    { icon: "🥐", name: "Bánh sừng bò", desc: "Nướng tại chỗ mỗi sáng — vỏ giòn rụm, ruột mềm bơ.", price: "30.000đ" },
    { icon: "🍋", name: "Nước ép trái cây", desc: "Ép tươi 100%, không thêm đường, nhiều vị theo mùa.", price: "40.000đ" },
    { icon: "🥪", name: "Bánh mì & món ngọt", desc: "Bánh mì que pate kinh điển, bánh ngọt Âu mỗi ngày.", price: "25.000đ" },
  ],
};
