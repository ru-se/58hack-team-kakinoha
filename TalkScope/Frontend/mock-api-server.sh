#!/bin/bash
# mock-api-server.sh
# sendFullTranscript のテスト用モックAPIサーバー（ポート3001）
# 使い方: bash mock-api-server.sh

node -e "
const http = require('http');
http.createServer((req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }
  let body = '';
  req.on('data', d => body += d);
  req.on('end', () => {
    console.log('=== POST受信 ===');
    try { console.log(JSON.stringify(JSON.parse(body), null, 2)); } catch { console.log(body); }
    res.writeHead(200, cors);
    res.end(JSON.stringify({ ok: true }));
  });
}).listen(3001, () => console.log('モックサーバー起動: http://localhost:3001'));
"
