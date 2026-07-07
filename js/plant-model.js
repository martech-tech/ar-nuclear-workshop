/* โมเดลโรงไฟฟ้านิวเคลียร์ 3 มิติ — สร้างจาก A-Frame primitives + custom components
   ใช้ร่วมกันระหว่าง index.html (AR) และ viewer.html (3D)
   หน่วย: 1 หน่วย ≈ ความกว้างมาร์กเกอร์ | แกน: +x ตะวันออก, +z ใต้, +y ขึ้นฟ้า */

(function () {

  // ---------- ตัวช่วยสร้างชิ้นส่วนซ้ำๆ ----------

  // แถวหน้าต่างเรืองแสง
  function winRow(cx, cy, cz, n, gap, w, h, rotY) {
    var out = '';
    var startX = -((n - 1) * gap) / 2;
    for (var i = 0; i < n; i++) {
      out += '<a-plane position="' + (startX + i * gap) + ' 0 0" width="' + w + '" height="' + h + '"' +
             ' material="color: #d9ecff; emissive: #9fd0ff; emissiveIntensity: 0.55; side: double"></a-plane>';
    }
    return '<a-entity position="' + cx + ' ' + cy + ' ' + cz + '" rotation="0 ' + rotY + ' 0">' + out + '</a-entity>';
  }

  // ครีบรอบอาคารโดม
  function domeRibs(cx, cz, r, h, n) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var x = cx + Math.cos(a) * r;
      var z = cz + Math.sin(a) * r;
      var deg = -a * 180 / Math.PI + 90;
      out += '<a-box position="' + x + ' ' + (h / 2) + ' ' + z + '" rotation="0 ' + deg + ' 0"' +
             ' width="0.014" height="' + h + '" depth="0.014" color="#ded5c0"></a-box>';
    }
    return '<a-entity id="domeRibs">' + out + '</a-entity>';
  }

  // เงาจางใต้สิ่งก่อสร้าง
  function shadow(x, z, r) {
    return '<a-circle position="' + x + ' 0.006 ' + z + '" rotation="-90 0 0" radius="' + r + '"' +
           ' material="color: #1b3a1b; opacity: 0.14; transparent: true"></a-circle>';
  }

  // ต้นไม้ (พุ่ม 2 ชั้น)
  function tree(x, z, s, shade) {
    s = s || 1; shade = shade || '#2e7d32';
    return '<a-entity position="' + x + ' 0 ' + z + '" scale="' + s + ' ' + s + ' ' + s + '">' +
      '<a-cylinder position="0 0.05 0" radius="0.018" height="0.1" color="#7a4f28"></a-cylinder>' +
      '<a-cone position="0 0.16 0" radius-bottom="0.095" radius-top="0.03" height="0.16" color="' + shade + '"></a-cone>' +
      '<a-cone position="0 0.27 0" radius-bottom="0.065" radius-top="0" height="0.13" color="#43a047"></a-cone>' +
      shadow(0, 0, 0.09) +
      '</a-entity>';
  }

  // ไอน้ำ 1 ก้อน — lift คือระยะเริ่มต้นเหนือปากหอ (เหลื่อมเฟสให้คอลัมน์ไอดูต่อเนื่อง)
  function steam(x, z, dur, lift, drift) {
    var fromY = 0.88 + lift;
    var fromOp = Math.max(0.18, 0.7 - lift * 0.85).toFixed(2);
    var fromSc = (0.55 + lift * 1.9).toFixed(2);
    return '<a-sphere position="' + x + ' ' + fromY + ' ' + z + '" radius="0.085" color="#ffffff"' +
      ' material="transparent: true; opacity: ' + fromOp + '; depthWrite: false"' +
      ' animation__up="property: position; from: ' + x + ' ' + fromY + ' ' + z + '; to: ' + (x + drift) + ' 1.62 ' + (z + drift * 0.5) + '; dur: ' + dur + '; loop: true; easing: linear"' +
      ' animation__fade="property: material.opacity; from: ' + fromOp + '; to: 0; dur: ' + dur + '; loop: true; easing: linear"' +
      ' animation__grow="property: scale; from: ' + fromSc + ' ' + fromSc + ' ' + fromSc + '; to: 1.9 1.9 1.9; dur: ' + dur + '; loop: true; easing: linear"></a-sphere>';
  }

  // หอหล่อเย็น + ไอน้ำ 3 ก้อน (คนละช่วงความสูง ให้ดูเป็นสายไอต่อเนื่อง)
  function coolingTower(x, z, d1, d2, d3) {
    return '<a-entity position="' + x + ' 0 ' + z + '" cooling-tower="height: 0.85"></a-entity>' +
      shadow(x, z, 0.36) +
      steam(x, z, d1, 0.0, 0.02) + steam(x, z, d2, 0.22, -0.03) + steam(x, z, d3, 0.42, 0.04);
  }

  // หม้อแปลงไฟฟ้า
  function transformer(x, z) {
    return '<a-entity position="' + x + ' 0 ' + z + '">' +
      '<a-box position="0 0.055 0" width="0.09" height="0.09" depth="0.07" color="#78828a"></a-box>' +
      '<a-cylinder position="-0.025 0.125 0" radius="0.008" height="0.05" color="#b8c0c6"></a-cylinder>' +
      '<a-cylinder position="0.0 0.125 0"    radius="0.008" height="0.05" color="#b8c0c6"></a-cylinder>' +
      '<a-cylinder position="0.025 0.125 0"  radius="0.008" height="0.05" color="#b8c0c6"></a-cylinder>' +
      '<a-box position="0.055 0.05 0" width="0.02" height="0.06" depth="0.05" color="#5d666d"></a-box>' +
      '</a-entity>';
  }

  // เสาส่งไฟฟ้าแรงสูง
  function pylon(x, z, h, rotY) {
    return '<a-entity position="' + x + ' 0 ' + z + '" rotation="0 ' + (rotY || 0) + ' 0">' +
      '<a-box position="-0.028 ' + (h / 2) + ' 0" rotation="0 0 3"  width="0.014" height="' + h + '" depth="0.014" color="#6d7378"></a-box>' +
      '<a-box position="0.028 '  + (h / 2) + ' 0" rotation="0 0 -3" width="0.014" height="' + h + '" depth="0.014" color="#6d7378"></a-box>' +
      '<a-box position="0 ' + (h * 0.92) + ' 0" width="0.3"  height="0.014" depth="0.014" color="#6d7378"></a-box>' +
      '<a-box position="0 ' + (h * 0.72) + ' 0" width="0.22" height="0.014" depth="0.014" color="#6d7378"></a-box>' +
      '<a-box position="0 ' + (h * 0.35) + ' 0" width="0.05" height="0.012" depth="0.012" color="#6d7378"></a-box>' +
      '</a-entity>';
  }

  // กล่องรับสัมผัสโปร่งใส ครอบอาคารให้แตะได้ (opacity 0 แต่ raycast โดนอยู่)
  function hitBox(poi, x, y, z, w, h, d) {
    return '<a-box class="poi-hit" data-poi="' + poi + '" position="' + x + ' ' + y + ' ' + z + '"' +
      ' width="' + w + '" height="' + h + '" depth="' + d + '"' +
      ' material="transparent: true; opacity: 0; depthWrite: false"></a-box>';
  }

  // รถยนต์คันจิ๋ว
  function car(x, z, color, rotY) {
    return '<a-entity position="' + x + ' 0 ' + z + '" rotation="0 ' + (rotY || 0) + ' 0">' +
      '<a-box position="0 0.022 0" width="0.075" height="0.026" depth="0.04" color="' + color + '"></a-box>' +
      '<a-box position="-0.005 0.048 0" width="0.04" height="0.022" depth="0.036" color="#dfe8ee"></a-box>' +
      '<a-cylinder position="-0.024 0.01 0.02"  rotation="90 0 0" radius="0.01" height="0.008" color="#222"></a-cylinder>' +
      '<a-cylinder position="0.024 0.01 0.02"   rotation="90 0 0" radius="0.01" height="0.008" color="#222"></a-cylinder>' +
      '<a-cylinder position="-0.024 0.01 -0.02" rotation="90 0 0" radius="0.01" height="0.008" color="#222"></a-cylinder>' +
      '<a-cylinder position="0.024 0.01 -0.02"  rotation="90 0 0" radius="0.01" height="0.008" color="#222"></a-cylinder>' +
      '</a-entity>';
  }

  // ---------- ประกอบโมเดลทั้งหมด ----------

  var PLANT_HTML =
    // ===== พื้น =====
    '<a-circle position="0 0.001 0" rotation="-90 0 0" radius="1.25" color="#79b45f"></a-circle>' +
    '<a-plane position="-0.02 0.004 -0.15" rotation="-90 0 0" width="1.62" height="1.12" color="#cfd4d8"></a-plane>' +
    // ถนนทางเข้า (ใต้ → ลานหม้อแปลง) + เส้นแบ่งเลน
    '<a-plane position="-0.42 0.006 0.9" rotation="-90 0 0" width="0.16" height="0.62" color="#8f959b"></a-plane>' +
    '<a-plane position="-0.42 0.008 0.78" rotation="-90 0 0" width="0.012" height="0.09" color="#f4f6f8"></a-plane>' +
    '<a-plane position="-0.42 0.008 0.98" rotation="-90 0 0" width="0.012" height="0.09" color="#f4f6f8"></a-plane>' +
    // ลานจอดรถ
    '<a-plane position="-0.68 0.006 0.62" rotation="-90 0 0" width="0.34" height="0.22" color="#a6acb2"></a-plane>' +
    car(-0.74, 0.62, '#d95f4b', 90) + car(-0.62, 0.62, '#3f8fd2', 90) +

    // ===== อาคารเครื่องปฏิกรณ์ (โดม) =====
    '<a-entity id="reactorComplex">' +
      shadow(-0.55, 0.05, 0.37) +
      '<a-cylinder position="-0.55 0.025 0.05" radius="0.335" height="0.05" color="#b9c0c5"></a-cylinder>' +
      '<a-cylinder id="domeWall" position="-0.55 0.26 0.05" radius="0.3" height="0.42"' +
        ' material="color: #f0ead9; roughness: 0.9"></a-cylinder>' +
      '<a-sphere id="domeCap" position="-0.55 0.47 0.05" radius="0.3" theta-length="90"' +
        ' material="color: #e9e2cf; roughness: 0.9"></a-sphere>' +
      domeRibs(-0.55, 0.05, 0.302, 0.42, 12) +
      '<a-torus position="-0.55 0.44 0.05" rotation="-90 0 0" radius="0.302" radius-tubular="0.007"' +
        ' segments-tubular="40" color="#cc4b3c"></a-torus>' +
      '<a-cylinder position="-0.55 0.78 0.05" radius="0.02" height="0.04" color="#c9c2b0"></a-cylinder>' +
      '<a-box position="-0.55 0.11 0.353" width="0.11" height="0.13" depth="0.012" color="#55606a"></a-box>' +

      // ภายในเตาปฏิกรณ์ (มองเห็นเมื่อเปิดโหมดส่องข้างใน)
      '<a-entity id="reactorCore">' +
        '<a-cylinder position="-0.55 0.2 0.05" radius="0.1" height="0.24"' +
          ' material="color: #ff8c1a; emissive: #ff6a00; emissiveIntensity: 0.8"></a-cylinder>' +
        '<a-sphere position="-0.55 0.32 0.05" radius="0.1" theta-length="90"' +
          ' material="color: #ff8c1a; emissive: #ff6a00; emissiveIntensity: 0.8"></a-sphere>' +
        // แท่งควบคุม — ขยับขึ้นลงช้าๆ ให้เห็นว่ามันคือ "คันเร่ง-เบรก" ของเตา
        '<a-cylinder position="-0.585 0.4 0.05" radius="0.008" height="0.12" color="#8d99a5"' +
          ' animation__rod="property: position; from: -0.585 0.38 0.05; to: -0.585 0.44 0.05; dir: alternate; dur: 2400; loop: true; easing: easeInOutSine"></a-cylinder>' +
        '<a-cylinder position="-0.55 0.41 0.05"  radius="0.008" height="0.14" color="#8d99a5"' +
          ' animation__rod="property: position; from: -0.55 0.39 0.05; to: -0.55 0.46 0.05; dir: alternate; dur: 3100; loop: true; easing: easeInOutSine"></a-cylinder>' +
        '<a-cylinder position="-0.515 0.4 0.05" radius="0.008" height="0.12" color="#8d99a5"' +
          ' animation__rod="property: position; from: -0.515 0.44 0.05; to: -0.515 0.38 0.05; dir: alternate; dur: 2700; loop: true; easing: easeInOutSine"></a-cylinder>' +
        '<a-sphere position="-0.55 0.24 0.05" radius="0.13"' +
          ' material="color: #ffd23d; transparent: true; opacity: 0.25; depthWrite: false"' +
          ' animation__pulse="property: material.opacity; from: 0.25; to: 0.06; dir: alternate; dur: 900; loop: true; easing: easeInOutSine"></a-sphere>' +
      '</a-entity>' +
    '</a-entity>' +

    // อาคารเชื้อเพลิงข้างโดม
    shadow(-0.24, 0.28, 0.19) +
    '<a-box position="-0.24 0.1 0.28" width="0.28" height="0.2" depth="0.24" color="#e3dcc9"></a-box>' +
    '<a-box position="-0.24 0.21 0.28" width="0.3" height="0.02" depth="0.26" color="#c9c2b0"></a-box>' +
    winRow(-0.24, 0.12, 0.405, 3, 0.08, 0.045, 0.05, 0) +

    // ===== อาคารกังหันไอน้ำ =====
    '<a-entity id="turbineHall">' +
      shadow(-0.02, -0.52, 0.42) +
      '<a-box position="-0.02 0.13 -0.52" width="0.95" height="0.26" depth="0.34" color="#5d87b8"></a-box>' +
      '<a-box position="-0.02 0.27 -0.52" width="0.99" height="0.028" depth="0.38" color="#3f6795"></a-box>' +
      // ช่องระบายบนหลังคา
      '<a-box position="-0.28 0.3 -0.52" width="0.1" height="0.035" depth="0.12" color="#35597f"></a-box>' +
      '<a-box position="0.0 0.3 -0.52"   width="0.1" height="0.035" depth="0.12" color="#35597f"></a-box>' +
      '<a-box position="0.28 0.3 -0.52"  width="0.1" height="0.035" depth="0.12" color="#35597f"></a-box>' +
      // หน้าต่าง 2 ฝั่ง + ประตูใหญ่
      winRow(-0.02, 0.17, -0.348, 7, 0.12, 0.06, 0.07, 0) +
      winRow(-0.02, 0.17, -0.692, 7, 0.12, 0.06, 0.07, 0) +
      '<a-box position="-0.49 0.09 -0.52" width="0.012" height="0.14" depth="0.14" color="#37516d"></a-box>' +
      // เครื่องกำเนิดไฟฟ้า (annex ปลายตะวันออก)
      '<a-box position="0.52 0.09 -0.52" width="0.14" height="0.18" depth="0.24" color="#7d95ad"></a-box>' +
      '<a-cylinder position="0.52 0.2 -0.52" rotation="0 0 90" radius="0.05" height="0.13" color="#93a7bb"></a-cylinder>' +
    '</a-entity>' +

    // ท่อไอน้ำ โดม → อาคารกังหัน (พร้อมข้อต่อ)
    '<a-cylinder position="-0.55 0.15 -0.25" rotation="90 0 0" radius="0.022" height="0.2" color="#c9ced2"></a-cylinder>' +
    '<a-sphere position="-0.55 0.15 -0.35" radius="0.028" color="#b5bcc2"></a-sphere>' +
    '<a-cylinder position="-0.52 0.15 -0.35" rotation="0 0 90" radius="0.022" height="0.06" color="#c9ced2"></a-cylinder>' +
    '<a-box position="-0.55 0.06 -0.3" width="0.016" height="0.12" depth="0.016" color="#9aa2a9"></a-box>' +

    // ===== หอหล่อเย็น 2 หอ =====
    '<a-entity id="coolingTowers">' +
      coolingTower(0.66, -0.26, 2700, 3400, 4100) +
      coolingTower(0.66, 0.34, 3000, 3800, 4600) +
    '</a-entity>' +
    // คลองน้ำเชื่อมอาคารกังหัน → หอหล่อเย็น
    '<a-box position="0.45 0.012 -0.4" rotation="0 25 0" width="0.3" height="0.02" depth="0.05" color="#3d9adf"></a-box>' +
    '<a-box position="0.45 0.012 0.05" rotation="0 -55 0" width="0.34" height="0.02" depth="0.05" color="#3d9adf"></a-box>' +

    // ===== บ่อพักน้ำ =====
    shadow(0.52, 0.82, 0.3) +
    '<a-circle position="0.52 0.01 0.82" rotation="-90 0 0" radius="0.27"' +
      ' material="color: #3d9adf; opacity: 0.95; metalness: 0.35; roughness: 0.25"' +
      ' animation__shim="property: material.opacity; from: 0.95; to: 0.75; dir: alternate; dur: 2200; loop: true; easing: easeInOutSine"></a-circle>' +
    '<a-torus position="0.52 0.012 0.82" rotation="-90 0 0" radius="0.275" radius-tubular="0.008" segments-tubular="36" color="#9fb3bd"></a-torus>' +

    // ===== ลานหม้อแปลง + สายส่ง =====
    '<a-entity id="switchyard">' +
      '<a-plane position="-0.05 0.008 0.63" rotation="-90 0 0" width="0.46" height="0.3" color="#b3b9be"></a-plane>' +
      transformer(-0.16, 0.62) + transformer(0.04, 0.62) +
      pylon(-0.05, 0.95, 0.42, 0) +
      pylon(-0.85, 0.78, 0.55, 35) +
    '</a-entity>' +
    // สายไฟ: เครื่องกำเนิด → หม้อแปลง → เสา 1 → เสา 2
    '<a-entity wire="start: 0.52 0.26 -0.4; end: 0.04 0.15 0.585; sag: 0.1"></a-entity>' +
    '<a-entity wire="start: 0.04 0.15 0.655; end: -0.02 0.385 0.95; sag: 0.05"></a-entity>' +
    '<a-entity wire="start: -0.16 0.15 0.655; end: -0.08 0.385 0.95; sag: 0.05"></a-entity>' +
    '<a-entity wire="start: -0.05 0.385 0.95; end: -0.85 0.5 0.78; sag: 0.12"></a-entity>' +
    '<a-entity wire="start: -0.05 0.3 0.95; end: -0.85 0.39 0.78; sag: 0.12"></a-entity>' +

    // ===== ปล่องระบายอากาศ + ไฟเตือนกะพริบ =====
    '<a-cylinder position="-0.88 0.3 -0.3" radius="0.03" height="0.6" color="#eceff1"></a-cylinder>' +
    '<a-cylinder position="-0.88 0.63 -0.3" radius="0.031" height="0.07" color="#cc4b3c"></a-cylinder>' +
    '<a-sphere position="-0.88 0.685 -0.3" radius="0.02"' +
      ' material="color: #ff2a2a; emissive: #ff2a2a; emissiveIntensity: 1; transparent: true"' +
      ' animation__blink="property: material.opacity; from: 1; to: 0.15; dir: alternate; dur: 650; loop: true; easing: easeInOutSine"></a-sphere>' +
    shadow(-0.88, -0.3, 0.06) +

    // ===== อาคารสำนักงาน + เสาธงชาติไทย =====
    shadow(-0.78, 0.3, 0.14) +
    '<a-box position="-0.78 0.07 0.3" width="0.2" height="0.14" depth="0.16" color="#f5f0e1"></a-box>' +
    '<a-box position="-0.78 0.15 0.3" width="0.22" height="0.02" depth="0.18" color="#cc4b3c"></a-box>' +
    winRow(-0.78, 0.08, 0.385, 3, 0.06, 0.035, 0.045, 0) +
    '<a-cylinder position="-0.32 0.11 1.02" radius="0.005" height="0.22" color="#c9ced2"></a-cylinder>' +
    '<a-entity position="-0.27 0.185 1.02">' +   // ธงไทย สัดส่วน 1:1:2:1:1
      '<a-plane position="0 0.0225 0"  width="0.09" height="0.009" color="#A51931"></a-plane>' +
      '<a-plane position="0 0.0135 0"  width="0.09" height="0.009" color="#F4F5F8"></a-plane>' +
      '<a-plane position="0 0 0"       width="0.09" height="0.018" color="#2D2A4A"></a-plane>' +
      '<a-plane position="0 -0.0135 0" width="0.09" height="0.009" color="#F4F5F8"></a-plane>' +
      '<a-plane position="0 -0.0225 0" width="0.09" height="0.009" color="#A51931"></a-plane>' +
    '</a-entity>' +

    // ===== ต้นไม้รอบพื้นที่ =====
    tree(-1.0, -0.6, 1.1) + tree(-0.62, -0.85, 0.9, '#388e3c') + tree(-1.05, 0.05, 1.0) +
    tree(0.15, 0.95, 1.05, '#388e3c') + tree(1.02, 0.62, 0.95) + tree(1.05, -0.62, 1.1, '#388e3c') +
    tree(0.28, -0.92, 0.85) + tree(-0.15, 1.05, 0.9) +

    // ===== เม็ดพลังงานวิ่ง: เตาปฏิกรณ์ → กังหัน → หม้อแปลง → สายส่ง =====
    '<a-entity id="energyFlow" energy-flow="path:' +
      ' -0.55 0.2 0.05, -0.55 0.15 -0.3, -0.3 0.14 -0.52, 0.1 0.14 -0.52, 0.52 0.2 -0.5,' +
      ' 0.3 0.14 0.1, 0.04 0.12 0.62, -0.02 0.38 0.95, -0.45 0.45 0.86, -0.85 0.5 0.78, -1.15 0.3 0.85' +
    '; enabled: false"></a-entity>' +

    // ===== ป้ายชื่อภาษาไทย =====
    '<a-entity class="plantLabel" thai-label="text: อาคารเครื่องปฏิกรณ์; icon: ⚛️; width: 0.58; accent: #cc4b3c" billboard position="-0.55 0.98 0.05"></a-entity>' +
    '<a-entity class="plantLabel" thai-label="text: หอหล่อเย็น; icon: 🌫️; width: 0.46; accent: #3d9adf" billboard position="0.66 1.35 0.04"></a-entity>' +
    '<a-entity class="plantLabel" thai-label="text: อาคารกังหันไอน้ำ; icon: ⚙️; width: 0.55; accent: #3f6795" billboard position="-0.02 0.58 -0.52"></a-entity>' +
    '<a-entity class="plantLabel" thai-label="text: ลานหม้อแปลง; icon: ⚡; width: 0.46; accent: #f2a51a" billboard position="-0.05 0.62 0.63"></a-entity>' +

    // ===== กล่องรับสัมผัส: แตะอาคารเพื่อดูการ์ดความรู้ =====
    '<a-entity id="poiHits">' +
      hitBox('dome',       -0.55, 0.4,  0.05,  0.62, 0.8,  0.62) +
      hitBox('cooling',     0.66, 0.45, -0.2,  0.72, 0.95, 0.48) +   // หดฝั่งเหนือ ไม่ให้ทับเครื่องกำเนิดไฟฟ้า
      hitBox('cooling',     0.66, 0.45,  0.34, 0.72, 0.95, 0.6) +
      hitBox('turbine',     0.0,  0.16, -0.52, 1.2,  0.4,  0.44) +
      hitBox('switchyard', -0.05, 0.2,   0.63, 0.5,  0.42, 0.34) +
      hitBox('pond',        0.52, 0.06,  0.82, 0.58, 0.14, 0.58) +
      hitBox('stack',      -0.88, 0.36, -0.3,  0.16, 0.78, 0.16) +
      hitBox('admin',      -0.78, 0.1,   0.3,  0.26, 0.24, 0.22) +
    '</a-entity>' +

    // ===== ลูกศรไฮไลต์ (โหมดเรียนรู้) =====
    '<a-entity id="stepMarker" visible="false">' +
      '<a-cone position="0 0.06 0" rotation="180 0 0" radius-bottom="0.05" radius-top="0" height="0.09"' +
        ' material="color: #ffd23d; emissive: #ffb800; emissiveIntensity: 0.7"' +
        ' animation__bob="property: position; from: 0 0.05 0; to: 0 0.13 0; dir: alternate; dur: 500; loop: true; easing: easeInOutQuad"></a-cone>' +
      '<a-torus position="0 0.01 0" rotation="-90 0 0" radius="0.09" radius-tubular="0.01" segments-tubular="32"' +
        ' material="color: #ffd23d; transparent: true; opacity: 0.9"' +
        ' animation__ring="property: scale; from: 1 1 1; to: 1.5 1.5 1.5; dir: alternate; dur: 700; loop: true; easing: easeInOutSine"' +
        ' animation__ringop="property: material.opacity; from: 0.9; to: 0.3; dir: alternate; dur: 700; loop: true; easing: easeInOutSine"></a-torus>' +
    '</a-entity>' +

    // ===== แสง =====
    '<a-entity light="type: ambient; color: #ffffff; intensity: 0.72"></a-entity>' +
    '<a-entity light="type: directional; color: #fff6e0; intensity: 0.75" position="1.2 2.2 1.4"></a-entity>' +
    '<a-entity light="type: directional; color: #cfe4ff; intensity: 0.25" position="-1.5 1.5 -1"></a-entity>';

  // ฉีดโมเดลเข้า entity เป้าหมาย
  window.injectPlant = function (selector) {
    var root = document.querySelector(selector);
    if (root) root.innerHTML = PLANT_HTML;
  };

})();
