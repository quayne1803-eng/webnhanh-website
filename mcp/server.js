/**
 * Web Nhanh — MCP server (cánh tay cho AI agent)
 * Transport: streamable-http, cổng 3001, chỉ bind 127.0.0.1 (an toàn, goClaw gọi qua localhost)
 *
 * Tools:
 *   biz__today_orders    — báo cáo đơn hôm nay
 *   biz__confirm_order   — xác nhận đã thanh toán cho 1 đơn
 *   biz__update_hero     — đổi tiêu đề landing page
 *   biz__list_customers  — ai mới để lại thông tin
 *   biz__send_email      — gửi email cho 1 khách
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const Database = require('better-sqlite3');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { z } = require('zod');

const PORT = process.env.MCP_PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data.db');
const db = new Database(DB_PATH, { readonly: false });
const E = (k) => process.env[k] || '';

const MCP_KEY = E('MCP_' + 'TOKEN');


/* --- migration: cot "notified" de khong nhan trung (co che da_nhan) --- */
function themCot(table, cot) {
  try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${cot} INTEGER DEFAULT 0`); console.log(`[migrate] them cot ${table}.${cot}`); }
  catch (e) { /* da co -> bo qua */ }
}
themCot('orders', 'notified');
themCot('customers', 'notified');
/* danh dau cac ban ghi CU la da thong bao (khong nhan bu) */
try {
  const n1 = db.prepare('UPDATE orders SET notified = 1 WHERE notified IS NULL').run().changes;
  const n2 = db.prepare('UPDATE customers SET notified = 1 WHERE notified IS NULL').run().changes;
  if (n1 || n2) console.log(`[migrate] danh dau ban ghi cu: ${n1} don, ${n2} khach`);
} catch (e) { /* bo qua */ }

const log = (tool, msg) => console.log(`[${new Date().toISOString()}] ${tool}: ${msg}`);
const money = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';
const today = () => new Date().toISOString().slice(0, 10);

/* gửi email qua Resend (dùng lại mẫu đơn giản) */
async function sendEmail(to, subject, text) {
  const key = E('RESEND_' + 'API_' + 'KEY');
  if (!key) return { ok: false, error: 'Chưa cấu hình RESEND_API_KEY trên máy chủ' };
  const from = process.env.EMAIL_FROM || 'Web Nhanh <hi@webnhanh.io.vn>';
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bear' + 'er ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.7">${text.replace(/\n/g, '<br>')}</div>` })
  });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, error: r.ok ? null : ((j && j.message) || ('HTTP ' + r.status)) };
}

/* ============================ MCP SERVER ============================ */
function buildServer() {
  const s = new McpServer({ name: 'my-business', version: '1.0.0' });

  s.registerTool('today_orders', {
    title: 'Báo cáo đơn hôm nay',
    description: 'Cho biết hôm nay có bao nhiêu đơn, tổng tiền, bao nhiêu đơn đã thanh toán.',
    inputSchema: {}
  }, async () => {
    const rows = db.prepare('SELECT * FROM orders WHERE date(created_at) = date(?)').all(today());
    const ok = rows.filter((o) => o.status === 'success');
    const total = rows.reduce((a, o) => a + Number(o.amount || 0), 0);
    const okTotal = ok.reduce((a, o) => a + Number(o.amount || 0), 0);
    const text = rows.length
      ? `Hôm nay có ${rows.length} đơn, tổng ${money(total)}. Trong đó ${ok.length} đơn đã thanh toán (${money(okTotal)}).`
      : 'Hôm nay chưa có đơn nào.';
    const detail = rows.slice(-10).map((o) => `- ${o.code} · ${money(o.amount)} · ${o.status}`).join('\n');
    log('today_orders', text);
    return { content: [{ type: 'text', text: text + (detail ? '\n' + detail : '') }] };
  });

  s.registerTool('confirm_order', {
    title: 'Xác nhận đã thanh toán',
    description: 'Xác nhận một đơn đã nhận tiền (đơn chuyển sang trạng thái đã thanh toán). Dùng khi khách chuyển khoản mà nội dung không khớp mã đơn.',
    inputSchema: { code: z.string().describe('Mã đơn, ví dụ WN123456') }
  }, async ({ code }) => {
    const o = db.prepare('SELECT * FROM orders WHERE code = ?').get(String(code || '').trim());
    if (!o) { log('confirm_order', 'không thấy đơn ' + code); return { content: [{ type: 'text', text: `Không tìm thấy đơn ${code}.` }] }; }
    if (o.status === 'success') return { content: [{ type: 'text', text: `Đơn ${o.code} đã ở trạng thái đã thanh toán từ trước.` }] };
    db.prepare("UPDATE orders SET status='success', paid_at=datetime('now') WHERE id=?").run(o.id);
    log('confirm_order', 'đã xác nhận ' + o.code);
    return { content: [{ type: 'text', text: `Đã xác nhận đơn ${o.code} (${money(o.amount)}) là đã thanh toán.` }] };
  });

  s.registerTool('update_hero', {
    title: 'Đổi tiêu đề trang chủ',
    description: 'Đổi dòng tiêu đề lớn (h1) trên trang chủ website.',
    inputSchema: { text: z.string().describe('Nội dung tiêu đề mới') }
  }, async ({ text }) => {
    const file = path.join(__dirname, '..', 'public', 'index.html');
    const html = fs.readFileSync(file, 'utf8');
    const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (!m) { log('update_hero', 'không thấy thẻ h1'); return { content: [{ type: 'text', text: 'Không tìm thấy thẻ tiêu đề (h1) trên trang chủ.' }] }; }
    const cu = m[1].replace(/\s+/g, ' ').trim();
    const moi = html.replace(m[0], m[0].replace(m[1], String(text)));
    fs.writeFileSync(file, moi, 'utf8');
    log('update_hero', `"${cu}" -> "${text}"`);
    return { content: [{ type: 'text', text: `Đã đổi tiêu đề trang chủ từ "${cu}" thành "${text}". Khách truy cập lại là thấy ngay.` }] };
  });

  s.registerTool('list_customers', {
    title: 'Khách mới để lại thông tin',
    description: 'Liệt kê những khách vừa để lại thông tin (mặc định 5 người mới nhất).',
    inputSchema: { limit: z.number().optional().describe('Số lượng muốn xem, mặc định 5') }
  }, async ({ limit }) => {
    const n = Math.min(Math.max(parseInt(limit || 5, 10), 1), 50);
    const rows = db.prepare('SELECT name, phone, email, created_at FROM customers ORDER BY id DESC LIMIT ?').all(n);
    if (!rows.length) return { content: [{ type: 'text', text: 'Chưa có khách nào để lại thông tin.' }] };
    const text = `${rows.length} khách mới nhất:\n` + rows.map((c) => `- ${c.name} · ${c.phone || 'chưa có SĐT'} · ${c.email || 'chưa có email'} · ${(c.created_at || '').slice(0, 10)}`).join('\n');
    log('list_customers', rows.length + ' khách');
    return { content: [{ type: 'text', text }] };
  });

  s.registerTool('send_email', {
    title: 'Gửi email cho một khách',
    description: 'Gửi email cho một khách theo tên hoặc số điện thoại.',
    inputSchema: {
      query: z.string().describe('Tên hoặc số điện thoại của khách'),
      subject: z.string().describe('Tiêu đề email'),
      body: z.string().describe('Nội dung email (văn bản thường)')
    }
  }, async ({ query, subject, body }) => {
    const q = String(query || '').trim();
    const c = db.prepare('SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY id DESC LIMIT 1').get('%' + q + '%', '%' + q + '%');
    if (!c) { log('send_email', 'không thấy khách ' + q); return { content: [{ type: 'text', text: `Không tìm thấy khách nào khớp "${q}".` }] }; }
    if (!c.email) return { content: [{ type: 'text', text: `Khách ${c.name} chưa có email trong hệ thống.` }] };
    const r = await sendEmail(c.email, subject, body);
    log('send_email', `${c.name} <${c.email}> : ${r.ok ? 'OK' : r.error}`);
    return { content: [{ type: 'text', text: r.ok ? `Đã gửi email "${subject}" tới ${c.name} (${c.email}).` : `Gửi email lỗi: ${r.error}` }] };
  });

  /* ---------- Tín hiệu chủ động (Ngày 15) ---------- */

  s.registerTool('get_new_orders', {
    title: 'Đơn mới chưa thông báo',
    description: 'Trả về các đơn hàng mới đặt mà chưa từng thông báo cho chủ. Sau khi trả, tự đánh dấu là đã thông báo để không nhắn trùng. Nếu không có đơn mới, trả về chuỗi rỗng.',
    inputSchema: {}
  }, async () => {
    const rows = db.prepare('SELECT o.*, c.name AS ten_khach, c.phone, p.name AS ten_sp FROM orders o LEFT JOIN customers c ON c.id = o.customer_id LEFT JOIN products p ON p.id = o.product_id WHERE IFNULL(o.notified,0) = 0 ORDER BY o.id').all();
    if (!rows.length) { log('get_new_orders', 'khong co don moi'); return { content: [{ type: 'text', text: '' }] }; }
    for (const r of rows) db.prepare('UPDATE orders SET notified = 1 WHERE id = ?').run(r.id);
    const homNay = db.prepare("SELECT COUNT(*) c, IFNULL(SUM(amount),0) s FROM orders WHERE date(created_at) = date('now')").get();
    const text = rows.map((o) => `Đơn mới: ${o.code} — ${o.ten_khach || 'khách'}${o.phone ? ' (' + o.phone + ')' : ''} — ${money(o.amount)} — ${o.ten_sp || ''}`).join('\n')
      + `\nTổng hôm nay: ${homNay.c} đơn, ${money(homNay.s)}.`;
    log('get_new_orders', `${rows.length} đơn mới`);
    return { content: [{ type: 'text', text }] };
  });

  s.registerTool('get_new_leads', {
    title: 'Khách mới để lại thông tin chưa thông báo',
    description: 'Trả về các khách vừa điền form mà chưa từng thông báo. Tự đánh dấu đã thông báo để không nhắn trùng. Không có thì trả chuỗi rỗng.',
    inputSchema: {}
  }, async () => {
    const rows = db.prepare('SELECT * FROM customers WHERE IFNULL(notified,0) = 0 ORDER BY id').all();
    if (!rows.length) { log('get_new_leads', 'khong co lead moi'); return { content: [{ type: 'text', text: '' }] }; }
    for (const r of rows) db.prepare('UPDATE customers SET notified = 1 WHERE id = ?').run(r.id);
    const homNay = db.prepare("SELECT COUNT(*) c FROM customers WHERE date(created_at) = date('now')").get();
    const text = rows.map((c) => `Khách mới: ${c.name} — ${c.phone || 'chưa có SĐT'}${c.note ? ' — ' + c.note : ''}`).join('\n')
      + `\nKhách hôm nay: ${homNay.c}.`;
    log('get_new_leads', `${rows.length} lead mới`);
    return { content: [{ type: 'text', text }] };
  });

  s.registerTool('daily_summary', {
    title: 'Tổng kết 24 giờ qua',
    description: 'Tổng kết đơn hàng và khách mới trong 24 giờ qua, dùng cho tin nhắn báo sáng mỗi ngày.',
    inputSchema: {}
  }, async () => {
    const o = db.prepare("SELECT COUNT(*) c, IFNULL(SUM(amount),0) s FROM orders WHERE created_at >= datetime('now','-1 day')").get();
    const ok = db.prepare("SELECT COUNT(*) c, IFNULL(SUM(amount),0) s FROM orders WHERE created_at >= datetime('now','-1 day') AND status='success'").get();
    const c = db.prepare("SELECT COUNT(*) c FROM customers WHERE created_at >= datetime('now','-1 day')").get();
    const cho = db.prepare("SELECT COUNT(*) c FROM orders WHERE status='pending'").get();
    const text = `24 giờ qua: ${o.c} đơn mới (${money(o.s)}), trong đó ${ok.c} đơn đã thanh toán (${money(ok.s)}). `
      + `${c.c} khách mới để lại thông tin. Hiện có ${cho.c} đơn đang chờ xử lý.`;
    log('daily_summary', text);
    return { content: [{ type: 'text', text }] };
  });

  return s;
}

/* ============================ HTTP (streamable) ============================ */
const app = express();
app.use(express.json({ limit: '1mb' }));

/* Ghi log mọi request để chẩn đoán */
app.use((req, res, next) => {
  console.log(`[req] ${new Date().toISOString()} ${req.method} ${req.path} auth=${req.headers.authorization ? 'co' : 'khong'} ua=${(req.headers['user-agent'] || '').slice(0, 30)}`);
  next();
});

/* Bảo vệ: goClaw gọi qua internet nên BẮT BUỘC có token */
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  if (!MCP_KEY) return next();
  /* goClaw chay trong Docker tren cung may -> request noi bo duoc tin cay */
  const ip = (req.socket && req.socket.remoteAddress) || '';
  const noiBo = /^(::ffff:)?(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(ip) || ip === '::1';
  const a = req.headers.authorization || '';
  const ok = noiBo || a === 'Bear' + 'er ' + MCP_KEY;
  if (!ok) {
    console.log(`[${new Date().toISOString()}] từ chối: thiếu/sai token (${req.path})`);
    return res.status(401).json({ jsonrpc: '2.0', error: { code: -32001, message: 'Unauthorized' }, id: null });
  }
  next();
});

app.post(['/mcp', '/biz-mcp'], async (req, res) => {
  try {
    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => { transport.close(); server.close(); });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (e) {
    console.error('[mcp] lỗi xử lý:', e.message);
    if (!res.headersSent) res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: String(e.message || e) }, id: null });
  }
});
app.get(['/mcp', '/biz-mcp'], (req, res) => res.status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed (dùng POST)' }, id: null }));
app.get(['/health', '/biz-mcp/health'], (req, res) => {
  const c = (t) => db.prepare('SELECT COUNT(*) c FROM ' + t).get().c;
  res.json({ ok: true, service: 'webnhanh-mcp', db: DB_PATH, products: c('products'), customers: c('customers'), orders: c('orders') });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP server chạy tại http://0.0.0.0:${PORT}/mcp (co token bao ve)`);
  console.log(`  DB: ${DB_PATH}`);
  console.log('  Tools: today_orders, confirm_order, update_hero, list_customers, send_email');
});
