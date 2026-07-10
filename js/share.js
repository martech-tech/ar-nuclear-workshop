/* JKShare — สร้างการ์ดผลงานติดแบรนด์ + ถ่ายเซลฟี่ AR + แชร์ (share sheet มาตรฐาน)
   ทุกอย่างประมวลผลในเครื่อง (ไม่อัปโหลดขึ้นเซิร์ฟเวอร์ใดๆ) เพื่อความเป็นส่วนตัวของเด็ก
   สำคัญ: navigator.share ถูกเรียกแบบ SYNCHRONOUS ทันทีที่ผู้ใช้แตะ
   (iOS Safari จะเปิด share sheet ก็ต่อเมื่อไม่มี async คั่นระหว่างการแตะกับ share) */

(function () {

  var BRAND = {
    navy: '#0b2447', blue: '#146c94', gold: '#ffd93d',
    hashtag: '#JKnowledge  #นักสำรวจพลังงาน  #TCASExpo',
    site: 'jknowledgetutor.com'
  };

  // โหลดโลโก้ล่วงหน้าตั้งแต่เปิดหน้า เก็บ Image ที่โหลดเสร็จไว้ใน ready{}
  // เพื่อให้ตอนกดแชร์วาดการ์ดได้แบบ synchronous (ไม่ต้องรอเน็ต)
  var ready = {};
  function preload(src) {
    var im = new Image();
    im.onload = function () { ready[src] = im; };
    im.src = src;
  }
  var JK = 'assets/logo-jk.png', EXPO = 'assets/logo-expo.png';
  preload(JK); preload(EXPO);

  function drawCover(ctx, img, dw, dh, iw, ih) {
    iw = iw || img.width; ih = ih || img.height;
    if (!iw || !ih) return;
    var s = Math.max(dw / iw, dh / ih);
    var w = iw * s, h = ih * s;
    ctx.drawImage(img, (dw - w) / 2, (dh - h) / 2, w, h);
  }

  function centerText(ctx, text, x, y, font, color, shadow) {
    ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (shadow) { ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2; }
    ctx.fillStyle = color; ctx.fillText(text, x, y);
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  }

  // ตัวอักษรกึ่งกลาง + ย่อฟอนต์อัตโนมัติให้พอดีความกว้าง (กันข้อความล้นขอบ)
  function centerFit(ctx, text, x, y, maxW, basePx, weight, color, shadow) {
    var px = basePx;
    do {
      ctx.font = (weight ? weight + ' ' : '') + px + 'px sans-serif';
      if (ctx.measureText(text).width <= maxW) break;
      px -= 2;
    } while (px > 14);
    centerText(ctx, text, x, y, ctx.font, color, shadow);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawLogos(ctx, cx, y, h) {
    var jk = ready[JK], expo = ready[EXPO];
    var pad = 14, ew = 0, jw = jk ? h : 0;
    if (expo && expo.width) ew = h * expo.width / expo.height;
    var total = jw + (jw && ew ? pad : 0) + ew;
    var startX = cx - total / 2;
    if (jk) { ctx.drawImage(jk, startX, y, jw, h); startX += jw + pad; }
    if (expo && ew) {
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      roundRect(ctx, startX - 8, y - 4, ew + 16, h + 8, 12); ctx.fill();
      ctx.drawImage(expo, startX, y, ew, h);
    }
  }

  // ---------- สร้าง canvas (synchronous) ----------
  function buildCard(opts) {
    opts = opts || {};
    var W = 1080, H = 1350;
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var ctx = c.getContext('2d');

    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, BRAND.navy); g.addColorStop(0.55, '#19376d'); g.addColorStop(1, BRAND.blue);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    for (var i = 0; i < 40; i++) {
      ctx.beginPath(); ctx.arc((i * 137.5) % W, (i * 219.7) % H, 3 + (i % 5), 0, 6.3); ctx.fill();
    }
    ctx.strokeStyle = BRAND.gold; ctx.lineWidth = 10;
    roundRect(ctx, 26, 26, W - 52, H - 52, 44); ctx.stroke();

    drawLogos(ctx, W / 2, 70, 96);
    centerText(ctx, '🏆', W / 2, 380, '190px sans-serif', '#fff', false);
    centerFit(ctx, (opts.title || 'นักสำรวจพลังงานตัวจริง!'), W / 2, 560, W - 130, 76, 'bold', BRAND.gold, true);
    if (opts.name) centerFit(ctx, '“' + opts.name + '”', W / 2, 660, W - 160, 60, 'bold', '#fff', true);

    var n = opts.points != null ? opts.points : 10, tot = opts.total || 10;
    centerText(ctx, 'สำรวจครบ ' + n + '/' + tot + ' จุด', W / 2, opts.name ? 748 : 700, '52px sans-serif', '#dbe7f5', false);
    centerText(ctx, '⚛️ ' + (opts.stationName || 'โรงไฟฟ้านิวเคลียร์ AR'), W / 2, opts.name ? 812 : 764, '46px sans-serif', '#dbe7f5', false);

    var stars = '';
    for (var s = 0; s < tot; s++) stars += (s < n ? '★' : '☆');
    centerText(ctx, stars, W / 2, 905, '54px sans-serif', BRAND.gold, false);

    // เวลาแข่ง — ตัวจุดประกาย "ท้าเพื่อน" ให้เกิดการแชร์ต่อ
    if (opts.timeText) {
      centerFit(ctx, '⏱ ล่าครบใน ' + opts.timeText + ' นาที — แน่จริงมาทำลายสถิติสิ!', W / 2, 968, W - 120, 40, 'bold', '#ffffff', true);
    }

    ctx.fillStyle = 'rgba(255,255,255,.1)';
    roundRect(ctx, W / 2 - 380, 1005, 760, 118, 24); ctx.fill();
    centerText(ctx, 'มาลองเล่น AR วิทยาศาสตร์กับ JKnowledge', W / 2, 1048, '40px sans-serif', '#fff', false);
    centerText(ctx, 'สแกน QR ที่บูธ แล้วสำรวจให้ครบทุกจุด!', W / 2, 1094, '36px sans-serif', '#bcd3ea', false);

    centerFit(ctx, BRAND.hashtag, W / 2, 1220, W - 90, 38, 'bold', BRAND.gold, false);
    centerText(ctx, BRAND.site, W / 2, 1275, '34px sans-serif', '#9fd0ff', false);
    return c;
  }

  function buildSelfie() {
    var scene = document.querySelector('a-scene');
    var gl = scene && scene.canvas;
    var video = document.querySelector('video');
    if (!gl) return null;

    var scale = (scene.renderer && scene.renderer.getPixelRatio && scene.renderer.getPixelRatio()) || Math.min(2, window.devicePixelRatio || 1);
    var W = Math.round(window.innerWidth * scale), H = Math.round(window.innerHeight * scale);
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var ctx = c.getContext('2d');

    if (video && video.videoWidth) drawCover(ctx, video, W, H, video.videoWidth, video.videoHeight);
    else { ctx.fillStyle = '#12233d'; ctx.fillRect(0, 0, W, H); }

    // เรนเดอร์โมเดลใหม่แบบ synchronous แล้วอ่านทันที (ไม่ต้องใช้ preserveDrawingBuffer)
    try {
      if (scene.renderer && scene.camera) scene.renderer.render(scene.object3D, scene.camera);
      ctx.drawImage(gl, 0, 0, W, H);
    } catch (e) {}

    var topH = Math.round(H * 0.11);
    var gTop = ctx.createLinearGradient(0, 0, 0, topH);
    gTop.addColorStop(0, 'rgba(11,36,71,.85)'); gTop.addColorStop(1, 'rgba(11,36,71,0)');
    ctx.fillStyle = gTop; ctx.fillRect(0, 0, W, topH);
    drawLogos(ctx, W / 2, Math.round(topH * 0.22), Math.round(topH * 0.52));

    var botH = Math.round(H * 0.13);
    var gBot = ctx.createLinearGradient(0, H - botH, 0, H);
    gBot.addColorStop(0, 'rgba(11,36,71,0)'); gBot.addColorStop(1, 'rgba(11,36,71,.9)');
    ctx.fillStyle = gBot; ctx.fillRect(0, H - botH, W, botH);
    centerFit(ctx, '⚛️ ไปสำรวจโรงไฟฟ้านิวเคลียร์ AR มาแล้ว!', W / 2, H - botH * 0.62, W * 0.9, Math.round(H * 0.032), 'bold', '#fff', true);
    centerFit(ctx, BRAND.hashtag, W / 2, H - botH * 0.3, W * 0.9, Math.round(H * 0.024), 'bold', BRAND.gold, false);
    centerText(ctx, BRAND.site, W / 2, H - botH * 0.09, Math.round(H * 0.02) + 'px sans-serif', '#bcd3ea', false);
    return c;
  }

  // ---------- แปลง canvas → Blob แบบ synchronous (toDataURL) ----------
  function canvasToBlob(canvas) {
    var dataURL = canvas.toDataURL('image/png');
    var parts = dataURL.split(',');
    var mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/png';
    var bin = atob(parts[1]);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  function download(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    return 'download';
  }

  // เรียก share sheet มาตรฐาน (เลือกลง Story/โพสต์/Messenger/LINE ฯลฯ)
  // ต้องถูกเรียกแบบ synchronous ต่อจากการแตะของผู้ใช้ → ห้ามมี await คั่นก่อนถึงตรงนี้
  function shareBlob(blob, filename, text) {
    if (!blob) return Promise.resolve('error');
    try {
      var file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        return navigator.share({ files: [file], text: text })
          .then(function () { return 'shared'; })
          .catch(function (err) {
            if (err && err.name === 'AbortError') return 'cancel';   // ผู้ใช้ยกเลิกเอง
            return download(blob, filename);                          // ล้มเหลวจริง → ดาวน์โหลด
          });
      }
    } catch (e) {}
    return Promise.resolve(download(blob, filename));
  }

  // ---------- API หลัก ----------
  // card()/selfie() สร้าง Blob (synchronous — เรียกตอนแตะปุ่มถ่าย/สร้างการ์ด)
  // share()/save()  เรียกตอนแตะปุ่มในหน้าพรีวิว (share ต้องเรียกจากการแตะสดๆ)
  window.JKShare = {
    card: function (opts) { return canvasToBlob(buildCard(opts)); },
    selfie: function () { var c = buildSelfie(); return c ? canvasToBlob(c) : null; },
    share: shareBlob,   // (blob, filename, text) -> Promise
    save: download      // (blob, filename)
  };

})();
