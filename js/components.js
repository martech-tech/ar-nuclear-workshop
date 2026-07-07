/* global AFRAME, THREE */
/* Custom A-Frame components ที่ใช้ร่วมกันระหว่างหน้า AR (index.html) และหน้า 3D viewer (viewer.html) */

(function () {

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // ---------- ป้ายภาษาไทย (a-text ไม่รองรับอักษรไทย จึงวาดลง canvas) ----------
  AFRAME.registerComponent('thai-label', {
    schema: {
      text:   { default: '' },
      icon:   { default: '' },
      width:  { default: 0.6 },
      color:  { default: '#0b2447' },
      accent: { default: '#ffd93d' }
    },
    init: function () {
      var d = this.data;
      var canvas = document.createElement('canvas');
      canvas.width = 640; canvas.height = 160;
      var ctx = canvas.getContext('2d');

      ctx.fillStyle = 'rgba(255,255,255,0.93)';
      roundRect(ctx, 4, 4, 632, 152, 58);
      ctx.fill();
      ctx.lineWidth = 10;
      ctx.strokeStyle = d.accent;
      roundRect(ctx, 10, 10, 620, 140, 52);
      ctx.stroke();

      ctx.fillStyle = d.color;
      ctx.font = 'bold 58px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((d.icon ? d.icon + ' ' : '') + d.text, 320, 86);

      var texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 4;
      var mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(d.width, d.width * 160 / 640),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, depthWrite: false })
      );
      this.el.setObject3D('mesh', mesh);
    }
  });

  // ---------- หันหน้าเข้ากล้องเสมอ ----------
  AFRAME.registerComponent('billboard', {
    init: function () { this.camPos = new THREE.Vector3(); },
    tick: function () {
      var cam = this.el.sceneEl.camera;
      if (!cam) return;
      cam.getWorldPosition(this.camPos);
      this.el.object3D.lookAt(this.camPos);
    }
  });

  // ---------- หอหล่อเย็นทรงไฮเพอร์โบลอยด์ (LatheGeometry โค้งเนียนจริง) ----------
  AFRAME.registerComponent('cooling-tower', {
    schema: {
      height: { default: 0.85 },
      color:  { default: '#e6e9ea' }
    },
    init: function () {
      var h = this.data.height;
      // โปรไฟล์ความกว้างของหอ (รัศมี, สัดส่วนความสูง) — ฐานกว้าง เอวคอด ปากบานเล็กน้อย
      var profile = [
        [0.340, 0.00], [0.300, 0.10], [0.258, 0.24], [0.222, 0.40],
        [0.196, 0.56], [0.186, 0.68], [0.190, 0.78], [0.202, 0.90], [0.218, 1.00]
      ];
      var pts = profile.map(function (p) { return new THREE.Vector2(p[0], p[1] * h); });

      var group = new THREE.Group();
      group.add(new THREE.Mesh(
        new THREE.LatheGeometry(pts, 48),
        new THREE.MeshStandardMaterial({
          color: this.data.color, roughness: 0.92, metalness: 0.02, side: THREE.DoubleSide
        })
      ));
      // แผ่นมืดด้านในปากหอ ให้ดูมีความลึก
      var rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.012, 48),
        new THREE.MeshBasicMaterial({ color: '#46525a' })
      );
      rim.position.y = 0.965 * h;
      group.add(rim);
      // แถบฐานสีเข้ม
      var base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.345, 0.35, 0.03, 48),
        new THREE.MeshStandardMaterial({ color: '#aeb6ba', roughness: 0.9 })
      );
      base.position.y = 0.015;
      group.add(base);

      this.el.setObject3D('mesh', group);
    }
  });

  // ---------- สายไฟหย่อนโค้งระหว่างสองจุด ----------
  AFRAME.registerComponent('wire', {
    schema: {
      start:  { type: 'vec3' },
      end:    { type: 'vec3' },
      sag:    { default: 0.07 },
      radius: { default: 0.0035 },
      color:  { default: '#3a3f44' }
    },
    init: function () {
      var s = this.data.start, e = this.data.end;
      var mid = new THREE.Vector3((s.x + e.x) / 2, (s.y + e.y) / 2 - this.data.sag, (s.z + e.z) / 2);
      var curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(s.x, s.y, s.z), mid, new THREE.Vector3(e.x, e.y, e.z)
      );
      this.el.setObject3D('mesh', new THREE.Mesh(
        new THREE.TubeGeometry(curve, 24, this.data.radius, 6, false),
        new THREE.MeshBasicMaterial({ color: this.data.color })
      ));
    }
  });

  // ---------- เม็ดพลังงานเรืองแสงวิ่งตามเส้นทาง (แสดงการเดินทางของพลังงาน) ----------
  AFRAME.registerComponent('energy-flow', {
    schema: {
      path:    { default: '' },        // "x y z, x y z, ..."
      count:   { default: 7 },
      speed:   { default: 0.00006 },   // รอบต่อมิลลิวินาที
      color:   { default: '#ffd23d' },
      size:    { default: 0.022 },
      enabled: { default: false }
    },
    init: function () {
      var d = this.data;
      var pts = d.path.split(',').map(function (s) {
        var a = s.trim().split(/\s+/).map(Number);
        return new THREE.Vector3(a[0], a[1], a[2]);
      });
      this.curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1);
      this.group = new THREE.Group();
      this.dots = [];
      for (var i = 0; i < d.count; i++) {
        var core = new THREE.Mesh(
          new THREE.SphereGeometry(d.size, 10, 10),
          new THREE.MeshBasicMaterial({ color: d.color })
        );
        var halo = new THREE.Mesh(
          new THREE.SphereGeometry(d.size * 2.1, 10, 10),
          new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.28, depthWrite: false })
        );
        core.add(halo);
        this.group.add(core);
        this.dots.push(core);
      }
      this.group.visible = d.enabled;
      this.el.setObject3D('mesh', this.group);
    },
    update: function () {
      if (this.group) this.group.visible = this.data.enabled;
    },
    tick: function (time) {
      if (!this.group || !this.group.visible) return;
      var n = this.dots.length;
      for (var i = 0; i < n; i++) {
        var t = (time * this.data.speed + i / n) % 1;
        this.dots[i].position.copy(this.curve.getPoint(t));
      }
    }
  });

  // ---------- กล้องหมุนรอบโมเดล (สำหรับ viewer.html — ลากหมุน / ลูกกลิ้ง & บีบนิ้วซูม) ----------
  AFRAME.registerComponent('simple-orbit', {
    schema: {
      target:      { type: 'vec3', default: { x: 0, y: 0.3, z: 0 } },
      distance:    { default: 2.4 },
      minDistance: { default: 0.9 },
      maxDistance: { default: 5 },
      autoRotate:  { default: true }
    },
    init: function () {
      var self = this;
      this.theta = Math.PI / 4;      // มุมรอบแกนตั้ง
      this.phi   = Math.PI / 3.1;    // มุมเงย
      this.dist  = this.data.distance;
      this.goalDist = this.dist;     // ระยะเป้าหมาย (ค่อยๆ เลื่อนเข้าใน tick)
      this.auto  = this.data.autoRotate;
      this.dragging = false;
      this.lastX = 0; this.lastY = 0;
      this.pinchDist = 0;

      function down(x, y) { self.dragging = true; self.auto = false; self.lastX = x; self.lastY = y; }
      function move(x, y) {
        if (!self.dragging) return;
        self.theta -= (x - self.lastX) * 0.006;
        self.phi   -= (y - self.lastY) * 0.004;
        self.phi = Math.max(0.15, Math.min(1.45, self.phi));
        self.lastX = x; self.lastY = y;
      }

      // เริ่มลาก/บีบนิ้วเฉพาะบน canvas ของฉาก — ไม่งั้นกดปุ่ม UI แล้วกล้องขยับตาม
      function bindCanvas() {
        var canvas = self.el.sceneEl.canvas;
        canvas.addEventListener('mousedown', function (e) { down(e.clientX, e.clientY); });
        canvas.addEventListener('touchstart', function (e) {
          if (e.touches.length === 1) down(e.touches[0].clientX, e.touches[0].clientY);
          if (e.touches.length === 2) {
            self.pinchDist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
          }
        }, { passive: true });
        canvas.addEventListener('wheel', function (e) {
          self.goalDist = self.dist = Math.max(self.data.minDistance, Math.min(self.data.maxDistance, self.dist + e.deltaY * 0.0018));
        }, { passive: true });
      }
      if (this.el.sceneEl.canvas) bindCanvas();
      else this.el.sceneEl.addEventListener('render-target-loaded', bindCanvas);

      // ระหว่างลากให้ตามต่อได้ทั้งจอ (จบด้วยปล่อยนิ้ว/เมาส์)
      window.addEventListener('mousemove', function (e) { move(e.clientX, e.clientY); });
      window.addEventListener('mouseup',   function () { self.dragging = false; });
      window.addEventListener('touchmove', function (e) {
        if (e.touches.length === 1) move(e.touches[0].clientX, e.touches[0].clientY);
        if (e.touches.length === 2 && self.pinchDist > 1) {
          var dNow = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          if (dNow > 1) {
            self.goalDist = self.dist = Math.max(self.data.minDistance,
              Math.min(self.data.maxDistance, self.dist * (self.pinchDist / dNow)));
            self.pinchDist = dNow;
          }
        }
      }, { passive: true });
      window.addEventListener('touchend', function (e) {
        if (e.touches.length === 1) {
          // ปล่อยจากบีบนิ้วเหลือนิ้วเดียว → เปลี่ยนเป็นลากหมุนต่อได้เลย
          self.pinchDist = 0;
          self.lastX = e.touches[0].clientX;
          self.lastY = e.touches[0].clientY;
          self.dragging = true;
        } else if (e.touches.length === 0) {
          self.dragging = false;
          self.pinchDist = 0;
        }
      });

      this.targetVec = new THREE.Vector3(this.data.target.x, this.data.target.y, this.data.target.z);
      this.goalTarget = this.targetVec.clone();
      this.lookMatrix = new THREE.Matrix4();
      this.up = new THREE.Vector3(0, 1, 0);
    },
    // บินกล้องเข้าไปโฟกัสจุดที่กำหนด (ใช้ตอนแตะอาคาร)
    flyTo: function (x, y, z, dist) {
      this.goalTarget.set(x, y, z);
      this.goalDist = Math.max(this.data.minDistance, Math.min(this.data.maxDistance, dist));
      this.auto = false;
    },
    // กลับมุมมองภาพรวม
    overview: function () {
      var t = this.data.target;
      this.goalTarget.set(t.x, t.y, t.z);
      this.goalDist = this.data.distance;
    },
    tick: function (time, dt) {
      if (this.auto) this.theta += (dt || 16) * 0.00012;
      // เลื่อนเข้าหาเป้าหมายแบบนุ่มนวล
      var k = 1 - Math.exp(-(dt || 16) * 0.005);
      this.targetVec.lerp(this.goalTarget, k);
      this.dist += (this.goalDist - this.dist) * k;
      var t = this.targetVec;
      var x = t.x + this.dist * Math.sin(this.phi) * Math.sin(this.theta);
      var y = t.y + this.dist * Math.cos(this.phi);
      var z = t.z + this.dist * Math.sin(this.phi) * Math.cos(this.theta);
      var o = this.el.object3D;
      o.position.set(x, y, z);
      // entity นี้เป็น group ครอบกล้อง — ต้องหมุนแบบ camera convention (-Z ชี้เข้าเป้า)
      this.lookMatrix.lookAt(o.position, t, this.up);
      o.quaternion.setFromRotationMatrix(this.lookMatrix);
    }
  });

})();
