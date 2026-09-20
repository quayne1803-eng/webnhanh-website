/* ══════════════════════════════════════════════════════════════
   ⚙️  CONFIG — SỬA THÔNG TIN KHÁCH HÀNG CHỈ TRONG FILE NÀY
   Đổi tên, SĐT, Zalo, địa chỉ, giờ mở cửa, dịch vụ, giá, ảnh…
   Lưu lại là toàn bộ website tự cập nhật. KHÔNG cần sửa file khác.
   ══════════════════════════════════════════════════════════════ */
window.BUSINESS_CONFIG = {

  /* --- Nhãn nhỏ dùng trong thông báo --- */
  emoji: "🌿",

  /* --- Form liên hệ qua Formspree (miễn phí) ---
     ID đã cấu hình thật (endpoint: https://formspree.io/f/mgaezbyr).
     Muốn đổi form khác: đăng ký tại formspree.io rồi thay giá trị bên dưới.
     Nếu ID rỗng/sai định dạng, form tự chạy chế độ demo: chỉ alert, KHÔNG gửi. */
  formspreeId: "mgaezbyr",

  /* --- Thông tin doanh nghiệp --- */
  business: {
    name: "Serenity Spa",
    tagline: "Thư giãn chuẩn spa — tái tạo năng lượng cho làn da và tâm trí",
    about: "Serenity Spa mang đến những liệu trình chăm sóc da và thư giãn cơ thể được thiết kế riêng cho từng khách hàng. Không gian yên tĩnh, hương thơm thảo dược cùng đội ngũ kỹ thuật viên được đào tạo bài bản sẽ giúp bạn hoàn toàn thả lỏng. Chúng tôi chỉ sử dụng sản phẩm có nguồn gốc rõ ràng, dịu nhẹ với mọi loại da.",
  },

  /* --- Thông tin liên hệ --- */
  contact: {
    name: "Nguyên Vỹ",                       // Tên người nhận tin nhắn Zalo
    phone: "034 975 1745",                   // SĐT hiển thị trên web (bấm gọi: tel:+84349751745)
    zalo: "https://zalo.me/0349751745",      // Link chat Zalo
    facebook: "",                            // Chưa có Fanpage → nút Messenger tự ẨN (dán link m.me/... khi có)
    address: "45 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh",
    mapQuery: "Lê Thánh Tôn, Quận 1, Hồ Chí Minh", // Địa chỉ dùng cho Google Maps
  },

  /* --- Giờ mở cửa --- */
  hours: [
    { days: "Thứ 2 – Thứ 6", time: "09:00 – 21:00" },
    { days: "Thứ 7 – Chủ nhật", time: "09:00 – 20:00" },
  ],

  /* --- Chữ trên nút CTA (màu sage) --- */
  ctaText: "Đặt lịch ngay",

  /* --- Ảnh (thay bằng link ảnh thật của spa khi có) --- */
  images: {
    hero: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=75",
    about: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=70",
    gallery: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1583416750470-965b2707b355?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=700&q=60",
    ],
    fallback: "https://picsum.photos/seed/spa", // Ảnh dự phòng nếu ảnh trên không tải được
  },

  /* --- Dịch vụ (4–6 liệu trình, giá minh họa) --- */
  services: [
    { icon: "✨", name: "Chăm sóc da mặt", desc: "Làm sạch sâu, cấp ẩm và trẻ hóa làn da.", price: "350.000đ" },
    { icon: "💆", name: "Massage body thư giãn", desc: "Thả lỏng toàn cơ thể, giảm căng thẳng mệt mỏi.", price: "400.000đ" },
    { icon: "🚿", name: "Gội đầu dưỡng sinh", desc: "Gội thảo dược, massage vai gáy cực kỳ sảng khoái.", price: "250.000đ" },
    { icon: "🌸", name: "Tẩy tế bào chết toàn thân", desc: "Lột xác làn da mềm mịn, sáng khỏe tự nhiên.", price: "300.000đ" },
    { icon: "♨️", name: "Xông hơi thảo dược", desc: "Đào thải độc tố, lưu thông khí huyết.", price: "200.000đ" },
    { icon: "💎", name: "Combo chăm sóc toàn diện", desc: "Da mặt + body + xông hơi, tiết kiệm đến 20%.", price: "790.000đ" },
  ],
};
