/**
 * Nhập dữ liệu từ file JSON (kết quả export từ bản Vercel) vào data.db
 * Dùng: node scripts/import-json.js du-lieu.json
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const file = process.argv[2];
if (!file) { console.error('Thiếu đường dẫn file JSON'); process.exit(1); }
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const db = new Database(process.env.DB_PATH || path.join(__dirname, '..', 'data.db'));
db.pragma('journal_mode = WAL');

const tx = db.transaction(() => {
  db.prepare('DELETE FROM orders').run();
  db.prepare('DELETE FROM customers').run();
  db.prepare('DELETE FROM products').run();
  const ip = db.prepare('INSERT INTO products (id,name,type,price,description,stock,created_at) VALUES (?,?,?,?,?,?,?)');
  for (const p of data.products || []) ip.run(p.id, p.name, p.type, p.price, p.description || '', p.stock == null ? null : p.stock, p.created_at || new Date().toISOString());
  const ic = db.prepare('INSERT INTO customers (id,name,phone,email,zalo,note,email_optin,email_step,next_email_at,emails_sent,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  for (const c of data.customers || []) ic.run(c.id, c.name, c.phone || '', c.email || '', c.zalo || '', c.note || '', c.email_optin === false ? 0 : 1, c.email_step || 0, c.next_email_at || null, JSON.stringify(c.emails_sent || []), c.created_at || new Date().toISOString());
  const io = db.prepare('INSERT INTO orders (id,code,customer_id,product_id,amount,status,paid_at,note,email,confirm_email_sent,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  for (const o of data.orders || []) io.run(o.id, o.code, o.customer_id, o.product_id, o.amount, o.status, o.paid_at || null, o.note || '', o.email || '', o.confirm_email_sent ? 1 : 0, o.created_at || new Date().toISOString());
});
tx();

const n = (t) => db.prepare('SELECT COUNT(*) c FROM ' + t).get().c;
console.log('Đã nhập:', n('products'), 'sản phẩm |', n('customers'), 'khách |', n('orders'), 'đơn');
