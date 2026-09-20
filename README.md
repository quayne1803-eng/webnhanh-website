# webnhanh-website — website + CRM + thanh toán + email (bản chạy trên VPS)

Bản production của webnhanh.io.vn: Express + SQLite, thay thế cho bản tĩnh trên Vercel.

## Có gì trong này
- \`server.js\` — Express server: phục vụ website tĩnh + toàn bộ API (đơn hàng, khách, sản phẩm, webhook Sepay, cron email)
- \`public/\` — website tĩnh (trang chủ, thanh toán, admin, portfolio, 3 trang demo)
- \`scripts/\` — script chuyển dữ liệu và import
- \`deploy_notes.md\` — biến môi trường + lệnh chạy

## API
| Endpoint | Việc |
|---|---|
| \`GET /api/orders?action=status&code=WN...\` | tra trạng thái 1 đơn (công khai) |
| \`GET /api/orders?action=list\` | danh sách sản phẩm/khách/đơn (cần \`x-admin-key\`) |
| \`POST /api/orders\` | tạo đơn, xác nhận, huỷ, CRUD sản phẩm/khách |
| \`POST /api/sepay-webhook\` | Sepay báo tiền vào → tự chuyển đơn sang đã thanh toán |
| \`GET /api/cron-emails\` | gửi email đến hạn (cũng tự chạy mỗi 15 phút) |

## Chạy thử ở máy
\`\`\`bash
npm install
cp .env.example .env      # điền giá trị thật
node server.js            # mở http://localhost:3000
\`\`\`
