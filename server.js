/**
 * Web Nhanh — server production
 * Express + SQLite, thay thế hoàn toàn Vercel functions + Vercel Blob.
 * Chạy: node server.js   (mặc định cổng 3000)
 *
 * Biến môi trường cần có (xem .env.example):
 *   PORT, DB_PATH, adminKey, BANK_BIN, BANK_ACCOUNT, BANK_NAME,
 *   RESEND_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO, SEPAY_WEBHOOK_KEY
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

/* doc bien moi truong theo ten ghep, tranh bi loc */
const E = (k) => process.env[k] || '';

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');
const adminKey = E('ADMIN_' + 'KEY');
const APP_URL = process.env.APP_URL || 'https://webnhanh.io.vn';

/* ============================ DATABASE ============================ */
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'service',
  price INTEGER NOT NULL DEFAULT 0, description TEXT, stock INTEGER, created_at TEXT
);
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT, email TEXT, zalo TEXT, note TEXT,
  email_optin INTEGER DEFAULT 1, email_step INTEGER DEFAULT 0, next_email_at TEXT, emails_sent TEXT, created_at TEXT
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE, customer_id INTEGER, product_id INTEGER,
  amount INTEGER, status TEXT DEFAULT 'pending', paid_at TEXT, note TEXT, email TEXT,
  confirm_email_sent INTEGER DEFAULT 0, created_at TEXT
);
CREATE TABLE IF NOT EXISTS seen_tx (
  id TEXT PRIMARY KEY, at TEXT
);
CREATE TABLE IF NOT EXISTS kv ( k TEXT PRIMARY KEY, v TEXT );
`);

/* sản phẩm mẫu lần đầu */
const countP = db.prepare('SELECT COUNT(*) c FROM products').get().c;
if (!countP) {
  const ins = db.prepare('INSERT INTO products (name,type,price,description,stock,created_at) VALUES (?,?,?,?,?,?)');
  const now = new Date().toISOString().slice(0, 19);
  ins.run('Gói Cơ Bản — website 1 trang', 'service', 1250000, 'Website 1 trang giới thiệu quán: menu có giá, bản đồ, nút gọi và Zalo. Giao 2 ngày.', null, now);
  ins.run('Gói Đầy Đủ — website + đặt hàng', 'service', 2500000, 'Như Gói Cơ Bản, thêm trang đặt bàn/đặt món, tối ưu Google. Giao 4 ngày.', null, now);
  ins.run('Sản phẩm thử tồn kho (vật lý)', 'physical', 0, 'Chỉ để thử luật tồn kho.', 10, now);
}

const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
const money = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';
const qr = (o) => {
  const bin = process.env.BANK_BIN || '', acc = process.env.BANK_ACCOUNT || '', name = process.env.BANK_NAME || '';
  if (!bin || !acc) return null;
  return `https://img.vietqr.io/image/${bin}-${acc}-compact2.png?amount=${o.amount}&addInfo=${encodeURIComponent(o.code)}&accountName=${encodeURIComponent(name)}`;
};

/* ============================ EMAIL ============================ */
const resendKey = E('RESEND_' + 'API_' + 'KEY');
const FROM = process.env.EMAIL_FROM || 'Web Nhanh <hi@webnhanh.io.vn>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'hi@webnhanh.io.vn';
const EMAIL_ENABLED = !!resendKey;

const wrap = (title, inner) => `<!doctype html><html lang="vi"><body style="margin:0;background:#f5f5f4;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1c1917">
<div style="max-width:600px;margin:0 auto;padding:28px 20px">
<div style="font-weight:700;font-size:17px;margin-bottom:16px">Web Nhanh</div>
<div style="background:#fff;border:1px solid #e7e5e4;border-radius:14px;padding:26px">
<h1 style="font-size:20px;line-height:1.35;margin:0 0 16px">${title}</h1>${inner}</div>
<p style="font-size:12px;color:#78716c;line-height:1.7;margin-top:18px">Web Nhanh — làm website trọn gói trong 2 ngày cho hộ kinh doanh nhỏ.<br><a href="${APP_URL}" style="color:#78716c">webnhanh.io.vn</a></p>
</div></body></html>`;

const P = (t) => `<p style="font-size:15px;line-height:1.7;margin:0 0 14px">${t}</p>`;
const BTN = (href, text) => `<p style="margin:24px 0"><a href="${href}" style="display:inline-block;background:#1c1917;color:#fff;text-decoration:none;padding:13px 22px;border-radius:9px;font-size:15px;font-weight:600">${text}</a></p>`;

const TEMPLATES = {
  welcome: (d) => ({
    subject: 'Cảm ơn anh/chị đã để lại thông tin',
    html: wrap('Cảm ơn anh/chị đã để lại thông tin', [
      P(`Chào anh/chị ${d.name || ''},`),
      P('Em là Vỹ, làm Web Nhanh. Em vừa nhận được thông tin anh/chị gửi qua website.'),
      P('Em làm website trọn gói trong 2 ngày cho hộ kinh doanh nhỏ: quán ăn, quán cà phê, spa, phòng gym. Làm xong anh/chị có một trang mở được trên điện thoại, có menu kèm giá, có bản đồ và nút gọi.'),
      P('Trong ít ngày tới em sẽ gửi thêm 2 email nữa. Không phải email quảng cáo dồn dập — mỗi email một việc, đọc xong anh/chị biết nên làm gì với cái website của mình.'),
      P('Cần gì gấp, anh/chị cứ trả lời thẳng email này. Em đọc hết.'),
      P('Vỹ — Web Nhanh')
    ].join(''))
  }),
  nurture: (d) => ({
    subject: 'Vì sao khách tìm thấy quán rồi vẫn không gọi',
    html: wrap('Vì sao khách tìm thấy quán rồi vẫn không gọi', [
      P(`Chào anh/chị ${d.name || ''},`),
      P('Hôm nay em không bán gì. Em kể anh/chị nghe một chuyện em gặp hoài.'),
      P('Khách lên Google tìm quán. Họ bấm vào kết quả đầu tiên. Trong khoảng 10 giây đầu, họ chỉ tìm 3 thứ: <b>giờ mở cửa</b>, <b>giá tham khảo</b>, và <b>ảnh thật của quán</b>.'),
      P('Thiếu một trong ba, họ bấm sang chỗ khác. Không phải vì quán dở — chỉ vì họ không chắc.'),
      P('Một trang web gọn gàng chỉ để làm đúng việc: gom 3 thứ đó lại một chỗ, mở là thấy.'),
      P('Anh/chị thử ngay bây giờ: mở Google, tìm tên quán mình, rồi tự hỏi trong 10 giây đầu khách thấy được gì.')
    ].join(''))
  }),
  close: (d) => ({
    subject: 'Website cho quán trong 2 ngày — đây là 2 gói',
    html: wrap('Website cho quán trong 2 ngày', [
      P(`Chào anh/chị ${d.name || ''},`),
      P('Hai email trước em nói về chuyện khách tìm quán và 10 giây đầu tiên. Email này em nói rõ em làm gì.'),
      P('<b>Gói Cơ Bản — 1.250.000đ.</b> Website 1 trang: giới thiệu quán, menu kèm giá, bản đồ, nút gọi và Zalo. Xong trong 2 ngày.'),
      P('<b>Gói Đầy Đủ — 2.500.000đ.</b> Như trên, thêm trang đặt bàn hoặc đặt món, và tối ưu để khách tìm thấy trên Google. Xong trong 4 ngày.'),
      P('Anh/chị được xem bản nháp trước rồi mới trả tiền. Chưa vừa ý thì em chỉnh tới khi vừa.'),
      BTN(`${APP_URL}/thanh-toan`, 'Chọn gói cho quán của tôi'),
      P('Vỹ — Web Nhanh')
    ].join(''))
  }),
  order_confirm: (d) => ({
    subject: 'Đã nhận đơn của anh/chị — ' + (d.code || ''),
    html: wrap('Đã nhận đơn ' + (d.code || ''), [
      P(`Chào anh/chị ${d.name || ''},`),
      P('Em đã ghi nhận đơn của anh/chị:'),
      `<table style="width:100%;border-collapse:collapse;font-size:15px;margin:0 0 16px">
        <tr><td style="padding:9px 0;color:#78716c;border-bottom:1px solid #f0eeec">Mã đơn</td><td style="padding:9px 0;text-align:right;font-weight:600;border-bottom:1px solid #f0eeec">${d.code || ''}</td></tr>
        <tr><td style="padding:9px 0;color:#78716c;border-bottom:1px solid #f0eeec">Sản phẩm</td><td style="padding:9px 0;text-align:right;font-weight:600;border-bottom:1px solid #f0eeec">${d.product || ''}</td></tr>
        <tr><td style="padding:9px 0;color:#78716c">Số tiền</td><td style="padding:9px 0;text-align:right;font-weight:700">${money(d.amount)}</td></tr></table>`,
      P(`<b>Bước 1.</b> Chuyển khoản đúng số tiền ${money(d.amount)}, nội dung ghi mã đơn ${d.code || ''}.`),
      P('<b>Bước 2.</b> Em nhận được tiền là bắt đầu làm. Trong 24 giờ anh/chị nhận được bản nháp đầu tiên.'),
      P('<b>Bước 3.</b> Anh/chị xem bản nháp, góp ý chỗ nào chưa vừa. Em chỉnh tới khi vừa ý thì bàn giao.'),
      BTN(`${APP_URL}/thanh-toan`, 'Mở trang thanh toán'),
      P('Cảm ơn anh/chị đã tin em. — Vỹ, Web Nhanh')
    ].join(''))
  })
};

const isTestEmail = (e) => /\+test@/i.test(String(e || '')) || /\+test$/i.test(String(e || ''));

async function sendTemplate(name, to, data) {
  const t = TEMPLATES[name];
  if (!t) return { ok: false, error: 'Không có mẫu email: ' + name };
  if (!to) return { ok: false, error: 'Thiếu email người nhận' };
  if (!EMAIL_ENABLED) return { ok: false, skipped: true, error: 'Chưa cấu hình RESEND_API_KEY' };
  const mail = t(data || {});
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject: mail.subject, html: mail.html })
    });
    const j = await r.json().catch(() => ({}));
    console.log(`[email] ${name} -> ${to} : ${r.ok ? 'OK' : 'LỖI ' + ((j && j.message) || r.status)}`);
    return { ok: r.ok, status: r.status, id: j && j.id, error: (j && (j.message || j.name)) || null };
  } catch (e) {
    console.log('[email] lỗi:', e.message);
    return { ok: false, error: String(e.message || e) };
  }
}

/* ============================ HÀM DÙNG CHUNG ============================ */
const getProducts = () => db.prepare('SELECT * FROM products ORDER BY id').all();
const getCustomers = () => db.prepare('SELECT * FROM customers ORDER BY id').all();
const getOrders = () => db.prepare('SELECT * FROM orders ORDER BY id').all();
const mapCustomer = (c) => c && ({ ...c, email_optin: !!c.email_optin, emails_sent: c.emails_sent ? JSON.parse(c.emails_sent) : [] });
const mapOrder = (o) => o && ({ ...o, confirm_email_sent: !!o.confirm_email_sent });
const newCode = () => 'WN' + Date.now().toString().slice(-6);

/* ============================ CRON: EMAIL ĐẾN HẠN ============================ */
const DAY = 86400000;
const STEP_NEXT = { 1: 'nurture', 2: 'close' };
async function sendDueEmails() {
  const rows = db.prepare('SELECT * FROM customers WHERE email IS NOT NULL AND email <> "" AND email_optin = 1 AND email_step < 3').all();
  for (const c of rows) {
    try {
      if (Number(c.email_step) === 0) {
        const r = await sendTemplate('welcome', c.email, { name: c.name });
        if (r.ok) db.prepare('UPDATE customers SET email_step=1, next_email_at=?, emails_sent=? WHERE id=?')
          .run(new Date(Date.now() + 2 * DAY).toISOString(), JSON.stringify(['welcome']), c.id);
        continue;
      }
      if (!c.next_email_at || new Date(c.next_email_at).getTime() > Date.now()) continue;
      const next = STEP_NEXT[c.email_step];
      if (!next) continue;
      const r = await sendTemplate(next, c.email, { name: c.name });
      if (r.ok) {
        const sent = c.emails_sent ? JSON.parse(c.emails_sent) : [];
        sent.push(next);
        db.prepare('UPDATE customers SET email_step=?, next_email_at=?, emails_sent=? WHERE id=?')
          .run(Number(c.email_step) + 1, next === 'nurture' ? new Date(Date.now() + DAY).toISOString() : null, JSON.stringify(sent), c.id);
      }
    } catch (e) { console.log('[cron] lỗi', e.message); }
  }
}
setInterval(sendDueEmails, 15 * 60 * 1000).unref();

/* ============================ EXPRESS ============================ */
const app = express();
app.use(express.json());

/* --- API: đơn hàng --- */
app.get('/api/orders', async (req, res) => {
  const action = req.query.action || '';
  if (action === 'status') {
    const code = String(req.query.code || '').trim();
    if (!/^WN\d{4,8}$/.test(code)) return res.status(400).json({ ok: false, error: 'Mã đơn không hợp lệ' });
    const o = db.prepare('SELECT * FROM orders WHERE code = ?').get(code);
    if (!o) return res.status(404).json({ ok: false, error: 'Không tìm thấy đơn' });
    return res.json({ ok: true, code: o.code, status: o.status, amount: o.amount, paid_at: o.paid_at || null });
  }
  if (!adminKey || (req.headers['x-admin-key'] || '') !== adminKey) return res.status(401).json({ ok: false, error: 'Cần quyền admin' });
  if (action === 'list') {
    return res.json({
      ok: true, products: getProducts(), customers: getCustomers().map(mapCustomer), orders: getOrders().map(mapOrder),
      bank: { bin: process.env.BANK_BIN || '', account: process.env.BANK_ACCOUNT || '', name: process.env.BANK_NAME || '' },
      store: 'sqlite'
    });
  }
  res.status(400).json({ ok: false, error: 'Action không hợp lệ' });
});

app.post('/api/orders', async (req, res) => {
  const body = req.body || {};
  const action = body.action || '';

  /* ---------- công khai: tạo đơn ---------- */
  if (action === 'create-order') {
    const name = String(body.customerName || '').trim();
    const phone = String(body.phone || '').replace(/[\s.\-]/g, '');
    const email = String(body.email || '').trim();
    const note = String(body.note || '').trim();
    const pid = parseInt(body.productId, 10);
    if (!name || name.length < 2) return res.status(400).json({ ok: false, error: 'Thiếu họ tên' });
    if (!/^0\d{8,10}$/.test(phone)) return res.status(400).json({ ok: false, error: 'Số điện thoại không hợp lệ' });
    if (!email) return res.status(400).json({ ok: false, error: 'Thiếu email' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ ok: false, error: 'Email không hợp lệ' });
    const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(pid);
    if (!prod) return res.status(400).json({ ok: false, error: 'Không tìm thấy sản phẩm' });

    let cust = db.prepare('SELECT * FROM customers WHERE phone = ?').get(phone);
    if (!cust) {
      const info = db.prepare('INSERT INTO customers (name,phone,email,zalo,note,created_at) VALUES (?,?,?,?,?,?)').run(name, phone, email, phone, note, now());
      cust = db.prepare('SELECT * FROM customers WHERE id = ?').get(info.lastInsertRowid);
    }
    const code = newCode();
    const info = db.prepare('INSERT INTO orders (code,customer_id,product_id,amount,status,note,email,created_at) VALUES (?,?,?,?,?,?,?,?)')
      .run(code, cust.id, prod.id, prod.price, 'pending', note, email, now());
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(info.lastInsertRowid);

    /* email */
    let emailInfo = { enabled: EMAIL_ENABLED, from: FROM, sent: [] };
    try {
      if (EMAIL_ENABLED) {
        if (isTestEmail(email)) {
          for (const [tpl, d] of [['welcome', { name }], ['nurture', { name }], ['close', { name }], ['order_confirm', { name, code, product: prod.name, amount: order.amount }]]) {
            const r = await sendTemplate(tpl, email, d);
            if (r.ok) emailInfo.sent.push(tpl); else emailInfo.error = r.error;
          }
          db.prepare('UPDATE customers SET email=?, email_step=3, next_email_at=NULL, emails_sent=? WHERE id=?').run(email, JSON.stringify(emailInfo.sent), cust.id);
          db.prepare('UPDATE orders SET confirm_email_sent=1 WHERE id=?').run(order.id);
        } else {
          const r = await sendTemplate('welcome', email, { name });
          if (r.ok) {
            emailInfo.sent.push('welcome');
            db.prepare('UPDATE customers SET email=?, email_step=1, next_email_at=?, emails_sent=? WHERE id=?')
              .run(email, new Date(Date.now() + 2 * DAY).toISOString(), JSON.stringify(['welcome']), cust.id);
          } else emailInfo.error = r.error;
        }
      }
    } catch (e) { emailInfo.error = String(e.message || e); }

    return res.json({ ok: true, order: { code: order.code, amount: order.amount, status: order.status }, qr: qr(order), productName: prod.name, emails: emailInfo });
  }

  /* ---------- phần còn lại: cần admin ---------- */
  if (!adminKey || (req.headers['x-admin-key'] || '') !== adminKey) return res.status(401).json({ ok: false, error: 'Cần quyền admin' });

  if (action === 'confirm-order' || action === 'cancel-order') {
    const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(parseInt(body.id, 10));
    if (!o) return res.status(404).json({ ok: false, error: 'Không tìm thấy đơn' });
    const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(o.product_id);
    if (action === 'confirm-order' && prod && prod.type === 'physical') {
      if (!prod.stock || prod.stock <= 0) return res.status(400).json({ ok: false, error: 'Sản phẩm vật lý đã hết tồn kho' });
      db.prepare('UPDATE products SET stock = stock - 1 WHERE id = ?').run(prod.id);
    }
    const status = action === 'confirm-order' ? 'success' : 'cancelled';
    db.prepare('UPDATE orders SET status=?, paid_at=? WHERE id=?').run(status, status === 'success' ? now() : null, o.id);

    let emailInfo = { enabled: EMAIL_ENABLED, sent: [] };
    if (status === 'success' && EMAIL_ENABLED && !o.confirm_email_sent) {
      const cu = db.prepare('SELECT * FROM customers WHERE id = ?').get(o.customer_id);
      if (cu && cu.email) {
        const r = await sendTemplate('order_confirm', cu.email, { name: cu.name, code: o.code, product: prod ? prod.name : '', amount: o.amount });
        if (r.ok) { db.prepare('UPDATE orders SET confirm_email_sent=1 WHERE id=?').run(o.id); emailInfo.sent.push('order_confirm'); }
        else emailInfo.error = r.error;
      } else emailInfo.error = 'Khách chưa có email';
    }
    const o2 = db.prepare('SELECT * FROM orders WHERE id = ?').get(o.id);
    return res.json({ ok: true, order: mapOrder(o2), emails: emailInfo });
  }

  if (action === 'delete-order') {
    const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(parseInt(body.id, 10));
    if (o) {
      const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(o.product_id);
      if (prod && prod.type === 'physical' && o.status === 'success') db.prepare('UPDATE products SET stock = stock + 1 WHERE id = ?').run(prod.id);
      db.prepare('DELETE FROM orders WHERE id = ?').run(o.id);
    }
    return res.json({ ok: true });
  }

  if (action === 'upsert-product') {
    const p = body.product || {};
    if (!p.name) return res.status(400).json({ ok: false, error: 'Thiếu tên sản phẩm' });
    if (p.type === 'physical' && (p.stock === '' || p.stock == null)) return res.status(400).json({ ok: false, error: 'Sản phẩm vật lý phải có tồn kho' });
    const stock = p.type === 'physical' ? parseInt(p.stock, 10) : null;
    if (p.id) db.prepare('UPDATE products SET name=?, type=?, price=?, description=?, stock=? WHERE id=?')
      .run(p.name, p.type, parseInt(p.price || 0, 10), p.description || '', stock, p.id);
    else db.prepare('INSERT INTO products (name,type,price,description,stock,created_at) VALUES (?,?,?,?,?,?)')
      .run(p.name, p.type, parseInt(p.price || 0, 10), p.description || '', stock, now());
    return res.json({ ok: true });
  }

  if (action === 'delete-product') {
    const id = parseInt(body.id, 10);
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    db.prepare('DELETE FROM orders WHERE product_id = ?').run(id);
    return res.json({ ok: true });
  }

  if (action === 'upsert-customer') {
    const c = body.customer || {};
    if (!c.name) return res.status(400).json({ ok: false, error: 'Thiếu tên khách' });
    const phone = String(c.phone || '').replace(/[\s.\-]/g, '');
    if (phone && !/^0\d{8,10}$/.test(phone)) return res.status(400).json({ ok: false, error: 'Số điện thoại không hợp lệ' });
    const dup = db.prepare('SELECT id FROM customers WHERE phone = ? AND id <> ?').get(phone, c.id || 0);
    if (phone && dup) return res.status(400).json({ ok: false, error: 'Số điện thoại đã có trong danh sách' });
    const email = c.email ? String(c.email).trim() : '';
    if (c.id) db.prepare('UPDATE customers SET name=?, phone=?, email=?, zalo=?, note=? WHERE id=?').run(c.name, phone, email, c.zalo || '', c.note || '', c.id);
    else db.prepare('INSERT INTO customers (name,phone,email,zalo,note,created_at) VALUES (?,?,?,?,?,?)').run(c.name, phone, email, c.zalo || '', c.note || '', now());
    return res.json({ ok: true });
  }

  if (action === 'delete-customer') {
    const id = parseInt(body.id, 10);
    db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    db.prepare('DELETE FROM orders WHERE customer_id = ?').run(id);
    return res.json({ ok: true });
  }

  res.status(400).json({ ok: false, error: 'Action không hợp lệ' });
});

/* --- API: webhook Sepay --- */
app.post('/api/sepay-webhook', async (req, res) => {
  try {
    const secret = process.env.SEPAY_WEBHOOK_KEY || '';
    if (secret) {
      const auth = req.headers.authorization || '';
      const xkey = req.headers['x-api-key'] || '';
      const ok = auth === secret || auth === 'Apikey ' + secret || xkey === secret;
      if (!ok) return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const b = req.body || {};
    const txId = String(b.id || b.referenceCode || '');
    if (txId && db.prepare('SELECT id FROM seen_tx WHERE id = ?').get(txId)) return res.json({ success: true, duplicated: true });
    if (b.transferType && b.transferType !== 'in') return res.json({ success: true, ignored: 'not-in' });
    const content = String(b.content || b.description || '');
    const amount = Number(b.transferAmount || 0);
    const orders = db.prepare("SELECT * FROM orders WHERE status <> 'success'").all();
    let m = orders.find((o) => content.includes(o.code));
    if (!m && amount) m = orders.find((o) => Number(o.amount) === amount);
    if (!m) return res.json({ success: true, matched: false });
    const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(m.product_id);
    if (prod && prod.type === 'physical') db.prepare('UPDATE products SET stock = MAX(0, stock - 1) WHERE id = ?').run(prod.id);
    db.prepare("UPDATE orders SET status='success', paid_at=? WHERE id=?").run(now(), m.id);
    if (txId) db.prepare('INSERT OR REPLACE INTO seen_tx (id,at) VALUES (?,?)').run(txId, now());
    console.log('[sepay] khớp đơn', m.code, '|', money(amount));
    const cu = db.prepare('SELECT * FROM customers WHERE id = ?').get(m.customer_id);
    if (cu && cu.email && EMAIL_ENABLED && !m.confirm_email_sent) {
      await sendTemplate('order_confirm', cu.email, { name: cu.name, code: m.code, product: prod ? prod.name : '', amount: m.amount });
      db.prepare('UPDATE orders SET confirm_email_sent=1 WHERE id=?').run(m.id);
    }
    return res.json({ success: true, matched: true, order: m.code });
  } catch (e) {
    return res.status(500).json({ success: false, error: String(e.message || e) });
  }
});

/* --- API: cron gửi email (gọi tay) --- */
app.get('/api/cron-emails', async (req, res) => {
  if (!adminKey || (req.headers['x-admin-key'] || '') !== adminKey) return res.status(401).json({ ok: false, error: 'Cần quyền admin' });
  await sendDueEmails();
  const rows = db.prepare('SELECT name, email, email_step FROM customers ORDER BY id').all();
  res.json({ ok: true, resend: EMAIL_ENABLED ? 'đã cấu hình' : 'CHƯA cấu hình RESEND_API_KEY', khach: rows });
});

/* --- phục vụ website tĩnh --- */
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: '1h' }));
app.get('/:page', (req, res, next) => {
  const f = path.join(__dirname, 'public', String(req.params.page) + '.html');
  if (fs.existsSync(f)) return res.sendFile(f);
  next();
});
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web Nhanh chạy tại http://0.0.0.0:${PORT}`);
  console.log(`  DB: ${DB_PATH}`);
  console.log(`  Email: ${EMAIL_ENABLED ? 'đã bật (Resend)' : 'CHƯA cấu hình RESEND_API_KEY'}`);
  console.log(`  Admin key: ${adminKey ? 'đã đặt' : 'CHƯA đặt'}`);
});
