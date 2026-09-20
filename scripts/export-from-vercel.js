/**
 * Lấy dữ liệu hiện tại từ bản Vercel (Blob) rồi lưu ra file JSON
 * Dùng: node scripts/export-from-vercel.js
 */
const fs = require('fs');
const path = require('path');

const LIVE = process.env.LIVE_URL || 'https://webnhanh.io.vn';
const h = fs.readFileSync(path.join(__dirname, '..', '.admin-key'), 'utf8').trim();
const OUT = path.join(__dirname, '..', 'du-lieu-tu-vercel.json');

(async () => {
  const r = await fetch(LIVE + '/api/orders?action=list', { headers: { 'x-admin-key': h } });
  const j = await r.json();
  if (!j.ok) { console.error('Không lấy được dữ liệu:', JSON.stringify(j)); process.exit(1); }
  const out = {
    exported_at: new Date().toISOString(),
    products: j.products || [],
    customers: (j.customers || []).map((c) => ({ ...c })),
    orders: (j.orders || []).map((o) => ({ ...o }))
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1), 'utf8');
  console.log('Đã export:', out.products.length, 'sản phẩm |', out.customers.length, 'khách |', out.orders.length, 'đơn');
  console.log('File:', OUT);
})();
