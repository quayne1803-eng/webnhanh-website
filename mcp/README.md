# MCP server — cánh tay cho AI agent

Transport **streamable-http**, cổng **3001**, chỉ bind `127.0.0.1` (goClaw gọi qua localhost, người ngoài internet không thấy cửa).

## Chạy
```bash
cd /opt/webnhanh-website
npm install --omit=dev
node mcp/server.js          # hoặc: sudo systemctl start mcp-server
```

## systemd
```ini
[Unit]
Description=Web Nhanh MCP server
After=network.target

[Service]
Type=simple
User=goclaw-vps
WorkingDirectory=/opt/webnhanh-website
ExecStart=/usr/bin/node mcp/server.js
Restart=always
RestartSec=5
EnvironmentFile=/opt/webnhanh-website/.env

[Install]
WantedBy=multi-user.target
```

## Nối vào goClaw Dashboard
Capabilities → MCP Servers → Add:
- Name: `my-business`
- Transport: `streamable-http`
- URL: `http://127.0.0.1:3001/mcp`
- Tool prefix: `biz`  → tool cuối có dạng `biz__today_orders`
- Enabled ✓

Rồi vào Agents → agent Telegram → tab Config → Tools: để profile `full` hoặc thêm `biz__*` vào alsoAllow.

## Kiểm tra nhanh
```bash
curl -s http://127.0.0.1:3001/health
```
