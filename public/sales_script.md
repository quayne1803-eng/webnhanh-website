# KỊCH BẢN CHATBOT BÁN HÀNG — WEB NHANH
Cập nhật: 14/09/2026 · viết từ /data (sản phẩm, FAQ, khách hàng, lý do từ chối) + brand_voice trong brain.db
Giọng: bình thản, câu ngắn, bình dân, chất Sài Gòn. Không emoji, không sáo rỗng.

## 1. CÂU CHÀO
"Chào anh chị. Tui là Nguyên Vỹ bên Web Nhanh.
Tui làm website cho quán ăn, quán cà phê, spa, salon, phòng gym — 2 ngày là xong.
Anh chị cần hỏi gì cứ nhắn, hoặc bấm nút bên dưới để để lại số điện thoại."

## 2. MƯỜI CÂU HỎI KHÁCH HAY HỎI NHẤT + CÂU TRẢ LỜI
1. Giá bao nhiêu?
   "Gói Cơ Bản 1 triệu đến 1,5 triệu. Gói Đầy Đủ 2 triệu đến 3 triệu. Giá nói trước, không phát sinh thêm."
2. Bao lâu có web?
   "Gói Cơ Bản 2 ngày. Gói Đầy Đủ 4 ngày. Tính từ lúc đủ hình ảnh với menu."
3. Tui không rành công nghệ thì sao?
   "Anh chị chỉ gửi ba thứ: tên quán, hình ảnh, menu. Còn lại tui làm hết. Cần chỉnh gì cứ nhắn."
4. Có đóng phí hàng tháng không?
   "Không. Trả một lần là web của anh chị luôn."
5. Chưa có hình ảnh, chưa có menu thì sao?
   "Hình chụp bằng điện thoại cũng được. Menu chưa có thì mình làm khung trước, có giá thì đắp vô sau."
6. Có xem trước được không?
   "Có. Tui có ba mẫu theo ngành: quán ăn/cà phê, spa/salon, phòng gym. Ưng cái nào thì làm theo cái đó."
7. Web có hiện trên Google không?
   "Có. Trang được làm để Google đọc được: tên quán, ngành, địa chỉ, số điện thoại."
8. Ai cập nhật giá với món mới?
   "Tui có hướng dẫn để anh chị tự sửa. Không rành thì nhắn Zalo, tui sửa cho."
9. Trả tiền sao?
   "Mình trao đổi rồi chốt. Anh chị để lại số, tui gọi lại nói rõ từng bước."
10. Nhận web rồi mà lỗi thì sao?
    "Anh chị nhắn Zalo cho tui, tui kiểm tra và sửa."

## 3. CÂU CHỐT ĐƠN (khi khách có vẻ quan tâm)
- "Anh chị muốn xong trong tuần này không? Nếu ừ thì tui làm gói Cơ Bản, 2 ngày có web."
- "Anh chị để lại tên với số Zalo, tui gọi lại chốt trong 5 phút là bắt đầu được."
- "Bên tui có mẫu sẵn theo ngành, anh chị không phải chờ thiết kế."

## 4. CÂU HƯỚNG KHÁCH ĐIỀN FORM (khi chưa sẵn sàng mua)
- "Dạ không sao. Anh chị để lại số ở form dưới trang này, khi nào cần tui gọi lại tư vấn."
- "Anh chị điền giúp tui 5 câu ở form, tui coi rồi gửi mẫu phù hợp cho mình xem trước."
- "Không cần quyết liền. Để lại thông tin trước, tui gửi mẫu theo ngành cho anh chị tham khảo."

## GHI CHÚ KỸ THUẬT
Chatbot này là kịch bản CỐ ĐỊNH (không gọi AI bên ngoài). Nó khớp từ khoá trong câu khách nhắn
để trả lời; không khớp thì mời khách để lại số qua form. Muốn nâng cấp thành AI thật sau này
thì thay phần khớp từ khoá bằng API, không phải làm lại web.
