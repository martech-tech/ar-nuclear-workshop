/* JKShare — สร้างการ์ดผลงานติดแบรนด์ + ถ่ายเซลฟี่ AR + แชร์/ดาวน์โหลด
   ทุกอย่างประมวลผลในเครื่อง (ไม่อัปโหลดขึ้นเซิร์ฟเวอร์ใดๆ) เพื่อความเป็นส่วนตัวของเด็ก
   ใช้ร่วมกันทั้ง index.html (AR) และ viewer.html (3D) */

(function () {

  var BRAND = {
    navy: '#0b2447', blue: '#146c94', gold: '#ffd93d',
    hashtag: '#JKnowledge  #นักสำรวจพลังงาน  #TCASExpo',
    site: 'jknowledgetutor.com'
  };

  // โหลดรูปครั้งเดียว (โลโก้) แล้ว cache ไว้
  var imgCache = {};
  function loadImg(src) {
    if (imgCache[src]) return imgCache[src];
    imgCache[src] = new Promise(function (resolve) {
      var im = new Image();
      im.onload = function () { resolve(im); };
      im.onerror = function () { resolve(null); };   // ถ้าโหลดไม่ได้ ก็วาดต่อโดยไม่มีโลโก้
      im.src = src;
    });
    return imgCache[src];
  }
  // พรีโหลดโลโก้ตั้งแต่โหลดหน้า — ตอนกดแชร์จะได้ไม่มีดีเลย์รอเน็ต
  // (สำคัญมากบน iOS Safari: navigator.share ต้องถูกเรียกในจังหวะที่ user เพิ่งแตะ)
  loadImg('assets/logo-jk.png'); loadImg('assets/logo-expo.png');

  // วาดรูปแบบ cover (เต็มกรอบ ไม่บิด)
  function drawCover(ctx, img, dw, dh, iw, ih) {
    iw = iw || img.width; ih = ih || img.height;
    if (!iw || !ih) return;
    var s = Math.max(dw / iw, dh / ih);
    var w = iw * s, h = ih * s;
    ctx.drawImage(img, (dw - w) / 2, (dh - h) / 2, w, h);
  }

  // ตัวอักษรกึ่งกลางแบบมีเงา
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

  // แถบโลโก้บน + แฮชแท็กล่าง (ใช้ทั้งการ์ดและเซลฟี่)
  function drawLogos(ctx, jk, expo, cx, y, h) {
    var pad = 14, x = cx;
    var ew = 0;
    if (expo && expo.width) ew = h * expo.width / expo.height;
    var jw = jk ? h : 0;
    var total = jw + (jw && ew ? pad : 0) + ew;
    var startX = cx - total / 2;
    if (jk) { ctx.drawImage(jk, startX, y, jw, h); startX += jw + pad; }
    if (expo && ew) {
      // พื้นหลังขาวมนหลังโลโก้งาน (โลโก้งานพื้นใส)
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      roundRect(ctx, startX - 8, y - 4, ew + 16, h + 8, 12); ctx.fill();
      ctx.drawImage(expo, startX, y, ew, h);
    }
  }

  // ===== การ์ดผลงาน (ไม่ต้องใช้กล้อง) =====
  // opts: { name, points, total, stationName }
  function makeCard(opts) {
    opts = opts || {};
    var W = 1080, H = 1350;
    return Promise.all([loadImg('assets/logo-jk.png'), loadImg('assets/logo-expo.png')]).then(function (imgs) {
      var jk = imgs[0], expo = imgs[1];
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      var ctx = c.getContext('2d');

      // พื้นหลังไล่สี
      var g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, BRAND.navy); g.addColorStop(0.55, '#19376d'); g.addColorStop(1, BRAND.blue);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // จุดดาวประดับ
      ctx.fillStyle = 'rgba(255,255,255,.06)';
      for (var i = 0; i < 40; i++) {
        var rx = (i * 137.5) % W, ry = (i * 219.7) % H, rr = 3 + (i % 5);
        ctx.beginPath(); ctx.arc(rx, ry, rr, 0, 6.3); ctx.fill();
      }
      // กรอบทอง
      ctx.strokeStyle = BRAND.gold; ctx.lineWidth = 10;
      roundRect(ctx, 26, 26, W - 52, H - 52, 44); ctx.stroke();

      // โลโก้บน
      drawLogos(ctx, jk, expo, W / 2, 70, 96);

      // ถ้วยรางวัล
      centerText(ctx, '🏆', W / 2, 380, '190px sans-serif', '#fff', false);

      // หัวเรื่อง
      centerFit(ctx, 'นักสำรวจพลังงานตัวจริง!', W / 2, 560, W - 130, 76, 'bold', BRAND.gold, true);

      // ชื่อ (ถ้ามี)
      if (opts.name) {
        centerText(ctx, '“' + opts.name + '”', W / 2, 660, 'bold 60px sans-serif', '#fff', true);
      }

      // บรรทัดผลงาน
      var pts = (opts.points != null ? opts.points : 10) + '/' + (opts.total || 10);
      centerText(ctx, 'สำรวจครบ ' + pts + ' จุด', W / 2, opts.name ? 748 : 700, '52px sans-serif', '#dbe7f5', false);
      centerText(ctx, '⚛️ ' + (opts.stationName || 'โรงไฟฟ้านิวเคลียร์ AR'), W / 2, opts.name ? 812 : 764, '46px sans-serif', '#dbe7f5', false);

      // แถวดาว 10 ดวง
      var stars = '';
      var n = opts.points != null ? opts.points : 10;
      for (var s = 0; s < (opts.total || 10); s++) stars += (s < n ? '★' : '☆');
      centerText(ctx, stars, W / 2, 920, '54px sans-serif', BRAND.gold, false);

      // ป้ายชวนเล่น
      ctx.fillStyle = 'rgba(255,255,255,.1)';
      roundRect(ctx, W / 2 - 380, 1000, 760, 120, 24); ctx.fill();
      centerText(ctx, 'มาลองเล่น AR วิทยาศาสตร์กับ JKnowledge', W / 2, 1044, '40px sans-serif', '#fff', false);
      centerText(ctx, 'สแกน QR ที่บูธ แล้วสำรวจให้ครบทุกจุด!', W / 2, 1092, '36px sans-serif', '#bcd3ea', false);

      // แฮชแท็ก + เว็บ
      centerFit(ctx, BRAND.hashtag, W / 2, 1220, W - 90, 38, 'bold', BRAND.gold, false);
      centerText(ctx, BRAND.site, W / 2, 1275, '34px sans-serif', '#9fd0ff', false);

      return new Promise(function (res) { c.toBlob(function (b) { res(b); }, 'image/png'); });
    });
  }

  // ===== เซลฟี่ AR (ภาพกล้อง + โมเดล 3D + กรอบแบรนด์) =====
  function makeSelfie() {
    return Promise.all([loadImg('assets/logo-jk.png'), loadImg('assets/logo-expo.png')]).then(function (imgs) {
      var jk = imgs[0], expo = imgs[1];
      var scene = document.querySelector('a-scene');
      var gl = scene && scene.canvas;
      var video = document.querySelector('video');
      if (!gl) return null;

      var vw = window.innerWidth, vh = window.innerHeight;
      // ให้ชั้นโมเดลคมเท่ากับที่ renderer วาดจริง (ตรง pixelRatio ที่ cap ไว้)
      var scale = (scene.renderer && scene.renderer.getPixelRatio && scene.renderer.getPixelRatio()) || Math.min(2, window.devicePixelRatio || 1);
      var W = Math.round(vw * scale), H = Math.round(vh * scale);
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      var ctx = c.getContext('2d');

      // 1) ภาพจากกล้อง (ถ้ามี) เต็มกรอบ
      if (video && video.videoWidth) {
        drawCover(ctx, video, W, H, video.videoWidth, video.videoHeight);
      } else {
        ctx.fillStyle = '#12233d'; ctx.fillRect(0, 0, W, H);
      }
      // 2) เรนเดอร์โมเดลใหม่แบบ synchronous แล้วอ่านทันที
      //    (ไม่ต้องเปิด preserveDrawingBuffer ตลอดเวลา ซึ่งกิน FPS บนมือถือ)
      try {
        if (scene.renderer && scene.camera) scene.renderer.render(scene.object3D, scene.camera);
        ctx.drawImage(gl, 0, 0, W, H);
      } catch (e) {}

      // 3) แถบแบรนด์ บน-ล่าง
      var topH = Math.round(H * 0.11);
      var gTop = ctx.createLinearGradient(0, 0, 0, topH);
      gTop.addColorStop(0, 'rgba(11,36,71,.85)'); gTop.addColorStop(1, 'rgba(11,36,71,0)');
      ctx.fillStyle = gTop; ctx.fillRect(0, 0, W, topH);
      drawLogos(ctx, jk, expo, W / 2, Math.round(topH * 0.22), Math.round(topH * 0.52));

      var botH = Math.round(H * 0.13);
      var gBot = ctx.createLinearGradient(0, H - botH, 0, H);
      gBot.addColorStop(0, 'rgba(11,36,71,0)'); gBot.addColorStop(1, 'rgba(11,36,71,.9)');
      ctx.fillStyle = gBot; ctx.fillRect(0, H - botH, W, botH);
      centerFit(ctx, '⚛️ ไปสำรวจโรงไฟฟ้านิวเคลียร์ AR มาแล้ว!', W / 2, H - botH * 0.62, W * 0.9, Math.round(H * 0.032), 'bold', '#fff', true);
      centerFit(ctx, BRAND.hashtag, W / 2, H - botH * 0.3, W * 0.9, Math.round(H * 0.024), 'bold', BRAND.gold, false);
      centerText(ctx, BRAND.site, W / 2, H - botH * 0.09, Math.round(H * 0.02) + 'px sans-serif', '#bcd3ea', false);

      return new Promise(function (res) { c.toBlob(function (b) { res(b); }, 'image/png', 0.92); });
    });
  }

  function download(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    return 'download';
  }

  // ===== แชร์ (Web Share API) หรือดาวน์โหลด =====
  function send(blob, filename, text) {
    if (!blob) return Promise.resolve('error');
    var file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      return navigator.share({ files: [file], text: text })
        .then(function () { return 'shared'; })
        .catch(function (err) {
          // ผู้ใช้กดยกเลิกเอง = จบ / แต่ถ้าแชร์ล้มเหลวจริง (เช่น iOS activation หมดเวลา)
          // ให้ตกไปดาวน์โหลดแทน จะได้ไม่เงียบหาย
          if (err && err.name === 'AbortError') return 'cancel';
          return download(blob, filename);
        });
    }
    return Promise.resolve(download(blob, filename));
  }

  window.JKShare = { makeCard: makeCard, makeSelfie: makeSelfie, send: send };

})();
