# -*- coding: utf-8 -*-
"""Ghi data.json (xuat tu trang admin) tro lai brain.db

Cach dung:
  1. Vao /admin, sua/them du lieu
  2. Bam "Xuat JSON" -> trinh duyet tai ve file data.json
  3. Chay:  python admin/sync.py duong_dan_toi_data.json
     (khong truyen gi thi mac dinh doc admin/data.json)
"""
import os, sys, json, sqlite3, shutil, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(HERE)                      # thu muc website
DB = os.path.join(WEB, "brain.db")
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "data.json")

if not os.path.exists(src):
    print("Khong thay file: " + src); sys.exit(1)
if not os.path.exists(DB):
    print("Khong thay brain.db: " + DB); sys.exit(1)

data = json.load(open(src, encoding="utf-8"))

# backup
bak = os.path.join(HERE, "brain.db.bak-" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
shutil.copy2(DB, bak)
print("backup: " + os.path.basename(bak))

conn = sqlite3.connect(DB)
cur = conn.cursor()
cur.executescript("""
CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, type TEXT, price INTEGER,
  description TEXT, stock INTEGER, created_at TEXT);
CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY, name TEXT, phone TEXT, zalo TEXT,
  note TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER,
  amount INTEGER, status TEXT, paid_at TEXT, created_at TEXT);
""")
for t in ("orders", "products", "customers"):
    cur.execute("DELETE FROM " + t)
for p in data.get("products", []):
    cur.execute("INSERT INTO products (id,name,type,price,description,stock,created_at) VALUES (?,?,?,?,?,?,?)",
                (p.get("id"), p.get("name"), p.get("type"), p.get("price", 0), p.get("description"), p.get("stock"), p.get("created_at")))
for c in data.get("customers", []):
    cur.execute("INSERT INTO customers (id,name,phone,zalo,note,created_at) VALUES (?,?,?,?,?,?)",
                (c.get("id"), c.get("name"), c.get("phone"), c.get("zalo"), c.get("note"), c.get("created_at")))
for o in data.get("orders", []):
    cur.execute("INSERT INTO orders (id,customer_id,product_id,amount,status,paid_at,created_at) VALUES (?,?,?,?,?,?,?)",
                (o.get("id"), o.get("customer_id"), o.get("product_id"), o.get("amount", 0), o.get("status"), o.get("paid_at"), o.get("created_at")))
conn.commit()
for t in ("products", "customers", "orders"):
    cur.execute("SELECT COUNT(*) FROM " + t)
    print("  %-10s %d ban ghi" % (t, cur.fetchone()[0]))
conn.close()
print("Da ghi vao brain.db: " + DB)
