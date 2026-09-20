# Ghi chú deploy lên VPS

## Biến .env cần có trên VPS
| Biến | Ý nghĩa | Lấy ở đâu |
|---|---|---|
| \`PORT\` | cổng server lắng nghe | 3000 |
| \`APP_URL\` | địa chỉ công khai | https://webnhanh.io.vn |
| \`DB_PATH\` | đường dẫn file SQLite | ./data.db |
| \`ADMIN_KEY\` | mật khẩu trang /admin | (đặt mới) |
| \`BANK_BIN\` \`BANK_ACCOUNT\` \`BANK_NAME\` | thông tin nhận tiền cho QR | MB Bank 970422 / 5450012062001 |
| \`RESEND_API_KEY\` | khoá gửi email | resend.com |
| \`EMAIL_FROM\` \`EMAIL_REPLY_TO\` | người gửi / nhận trả lời | hi@webnhanh.io.vn |
| \`SEPAY_WEBHOOK_KEY\` | (tuỳ chọn) xác thực webhook | để trống nếu không dùng |

## Lệnh chạy
\`\`\`bash
cd /opt/webnhanh-website
npm install --omit=dev
node server.js          # test tay
# hoặc để chạy 24/7:
sudo systemctl start webnhanh
\`\`\`

## Cổng đang lắng nghe
- \`3000\` — website + API (localhost và qua Load Balancer)

## Dữ liệu
- \`data.db\` (SQLite) chứa sản phẩm, khách hàng, đơn hàng
- File này **KHÔNG** nằm trong GitHub (đã chặn ở .gitignore) — phải upload riêng
- Sao lưu: \`cp data.db backup-$(date +%F).db\`
