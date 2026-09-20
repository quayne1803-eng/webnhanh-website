/* ══════════════════════════════════════════════════════════════
   ⚙️  CONFIG — SỬA THÔNG TIN KHÁCH HÀNG CHỈ TRONG FILE NÀY
   Đổi tên, SĐT, Zalo, địa chỉ, giờ mở cửa, gói tập, giá, ảnh…
   Lưu lại là toàn bộ website tự cập nhật. KHÔNG cần sửa file khác.
   ══════════════════════════════════════════════════════════════ */
window.BUSINESS_CONFIG = {

  /* --- Nhãn nhỏ dùng trong thông báo --- */
  emoji: "💪",

  /* --- Form liên hệ qua Formspree (miễn phí) ---
     ID đã cấu hình thật (endpoint: https://formspree.io/f/mgaezbyr).
     Muốn đổi form khác: đăng ký tại formspree.io rồi thay giá trị bên dưới.
     Nếu ID rỗng/sai định dạng, form tự chạy chế độ demo: chỉ alert, KHÔNG gửi. */
  formspreeId: "mgaezbyr",

  /* --- Thông tin doanh nghiệp --- */
  business: {
    name: "IronPulse Gym",
    tagline: "Mỗi buổi tập là một bước gần hơn tới phiên bản mạnh mẽ nhất của bạn",
    about: "IronPulse Gym sở hữu mặt bằng 500m² với hệ thống máy tập nhập khẩu mới 100%, khu tạ tự do rộng rãi và các lớp học nhóm năng lượng cao. Đội ngũ huấn luyện viên chứng chỉ quốc tế luôn theo sát từng học viên, từ người mới bắt đầu đến dân tập lâu năm. Vào ngay hôm nay để nhận buổi tập thử miễn phí cùng đo cơ thể chuyên sâu.",
  },

  /* --- Thông tin liên hệ --- */
  contact: {
    name: "Nguyên Vỹ",                       // Tên người nhận tin nhắn Zalo
    phone: "034 975 1745",                   // SĐT hiển thị trên web (bấm gọi: tel:+84349751745)
    zalo: "https://zalo.me/0349751745",      // Link chat Zalo
    facebook: "",                            // Chưa có Fanpage → nút Messenger tự ẨN (dán link m.me/... khi có)
    address: "88 Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh",
    mapQuery: "Trần Hưng Đạo, Quận 5, Hồ Chí Minh", // Địa chỉ dùng cho Google Maps
  },

  /* --- Giờ mở cửa --- */
  hours: [
    { days: "Thứ 2 – Thứ 7", time: "05:30 – 22:00" },
    { days: "Chủ nhật", time: "06:00 – 20:00" },
  ],

  /* --- Chữ trên nút CTA (màu cam) --- */
  ctaText: "Đăng ký tập thử",

  /* --- Ảnh (thay bằng link ảnh thật của phòng tập khi có) --- */
  images: {
    hero: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=75",
    about: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=70",
    gallery: [
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?auto=format&fit=crop&w=700&q=60",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=700&q=60",
    ],
    fallback: "https://picsum.photos/seed/gym", // Ảnh dự phòng nếu ảnh trên không tải được
  },

  /* --- Gói tập & dịch vụ (4–6 mục, giá minh họa) --- */
  services: [
    { icon: "🏋️", name: "Gói cơ bản 1 tháng", desc: "Truy cập toàn bộ khu tạ tự do và máy tập.", price: "500.000đ" },
    { icon: "🔥", name: "Gói 3 tháng tiết kiệm", desc: "Giảm 15%, kèm đo InBody định kỳ mỗi tháng.", price: "1.300.000đ" },
    { icon: "🥊", name: "Kickfit & Boxing", desc: "Lớp nhóm cực chất, đốt 600–800 kcal mỗi buổi.", price: "700.000đ" },
    { icon: "👤", name: "PT 1 kèm 1", desc: "Huấn luyện viên cá nhân, giáo trình riêng cho bạn.", price: "2.000.000đ" },
    { icon: "🧘", name: "Yoga & Aerobics", desc: "Lớp dành cho nữ, tăng dẻo dai và thả lỏng.", price: "450.000đ" },
    { icon: "🥗", name: "Tư vấn dinh dưỡng", desc: "Thực đơn theo mục tiêu giảm mỡ / tăng cơ.", price: "300.000đ" },
  ],
};
