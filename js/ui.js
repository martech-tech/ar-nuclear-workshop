/* UI ควบคุมประสบการณ์เรียนรู้ — ใช้ร่วมกันระหว่าง index.html (AR) และ viewer.html (3D)
   เรียกใช้: PlantUI.init({ arMode: true/false }) หลัง DOM พร้อม */

(function () {

  // ---------- เนื้อหาโหมดเรียนรู้ (ทีละขั้น) ----------
  var LEARN_STEPS = [
    {
      icon: '🏭', title: 'รู้จักโรงไฟฟ้านิวเคลียร์',
      text: 'นี่คือโรงไฟฟ้านิวเคลียร์ — โรงไฟฟ้าพลังงานสะอาดที่ผลิตไฟฟ้าให้บ้านได้มากกว่า 1 ล้านหลัง โดยแทบไม่ปล่อยก๊าซคาร์บอนเลย เดินดูรอบๆ ได้ แล้วกด "ถัดไป" เพื่อดูการทำงานทีละขั้น!',
      target: null, cutaway: false, energy: false
    },
    {
      icon: '⚛️', title: 'ขั้นที่ 1 — ฟิชชัน',
      text: 'ในอาคารโดม อะตอมของยูเรเนียมถูกยิงด้วยนิวตรอนจน "แตกตัว" เรียกว่าปฏิกิริยาฟิชชัน ปล่อยความร้อนมหาศาล — ลองส่องดูเตาปฏิกรณ์สีส้มข้างในสิ!',
      target: [-0.55, 0.82, 0.05], cutaway: true, energy: false
    },
    {
      icon: '💨', title: 'ขั้นที่ 2 — ต้มน้ำให้เป็นไอ',
      text: 'ความร้อนจากฟิชชันถูกส่งไปต้มน้ำอีกวงจรหนึ่ง จนกลายเป็นไอน้ำแรงดันสูงมาก แล้ววิ่งไปตามท่อสีเงินสู่อาคารกังหัน',
      target: [-0.55, 0.35, -0.3], cutaway: true, energy: false
    },
    {
      icon: '⚙️', title: 'ขั้นที่ 3 — หมุนกังหันปั่นไฟ',
      text: 'ไอน้ำแรงดันสูงพุ่งชนใบพัดกังหันให้หมุนติ้วๆ กังหันต่ออยู่กับเครื่องกำเนิดไฟฟ้า (ทรงกระบอกด้านท้ายอาคาร) — หมุนปุ๊บ ได้ไฟฟ้าปั๊บ!',
      target: [-0.02, 0.48, -0.52], cutaway: false, energy: false
    },
    {
      icon: '🌫️', title: 'ขั้นที่ 4 — หล่อเย็น',
      text: 'น้ำที่ใช้แล้วยังร้อนอยู่ จึงถูกส่งไปหอหล่อเย็นทรงเอวคอดยักษ์ ไอสีขาวที่ลอยขึ้นคือ "ไอน้ำธรรมดา" ไม่ใช่ควันพิษนะ!',
      target: [0.66, 1.05, 0.04], cutaway: false, energy: false
    },
    {
      icon: '⚡', title: 'ขั้นที่ 5 — ส่งไฟฟ้าถึงบ้าน',
      text: 'ไฟฟ้าถูกเพิ่มแรงดันที่หม้อแปลง แล้ววิ่งไปตามสายส่งแรงสูงถึงบ้านเรา — ดูเม็ดพลังงานสีทองวิ่งจากเตาปฏิกรณ์ไปตามสายไฟสิ!',
      target: [-0.05, 0.52, 0.63], cutaway: false, energy: true
    }
  ];

  // ---------- ควิซ ----------
  var QUIZ = [
    {
      q: 'ไอสีขาวที่ลอยจากหอหล่อเย็นคืออะไร?',
      choices: ['ควันพิษ', 'ไอน้ำธรรมดา', 'ก๊าซคาร์บอน'], correct: 1,
      why: 'ไอสีขาวคือไอน้ำธรรมดา ไม่มีสารกัมมันตรังสีเลย'
    },
    {
      q: 'พลังงานนิวเคลียร์เกิดจากปฏิกิริยาอะไร?',
      choices: ['ฟิชชัน (อะตอมแตกตัว)', 'การเผาไหม้', 'การสังเคราะห์แสง'], correct: 0,
      why: 'ฟิชชันคือการที่อะตอมยูเรเนียมแตกตัว ปล่อยพลังงานมหาศาล'
    },
    {
      q: 'อาคารทรงโดมมีไว้ทำอะไร?',
      choices: ['เก็บน้ำฝน', 'ที่จอดเฮลิคอปเตอร์', 'ครอบเตาปฏิกรณ์ให้ปลอดภัย'], correct: 2,
      why: 'โดมคอนกรีตหนากว่า 1 เมตร ปกป้องเตาปฏิกรณ์ไว้ข้างใน'
    },
    {
      q: 'ขณะผลิตไฟฟ้า โรงไฟฟ้านิวเคลียร์ปล่อยก๊าซคาร์บอนเท่าไร?',
      choices: ['ปล่อยมากที่สุด', 'แทบไม่ปล่อยเลย', 'เท่ากับรถยนต์ 1 คัน'], correct: 1,
      why: 'แทบเป็นศูนย์! จึงเป็นพลังงานสะอาดที่ช่วยลดโลกร้อน'
    },
    {
      q: 'อะไรเป็นตัวหมุนเครื่องกำเนิดไฟฟ้า?',
      choices: ['กังหันไอน้ำ', 'กังหันลม', 'แผงโซลาร์เซลล์'], correct: 0,
      why: 'ไอน้ำแรงดันสูงหมุนกังหัน → กังหันหมุนเครื่องกำเนิดไฟฟ้า'
    }
  ];

  // ---------- การ์ดความรู้ประจำอาคาร (แตะอาคารเพื่อเปิด) ----------
  var POI = {
    dome: {
      emoji: '⚛️', name: 'อาคารเครื่องปฏิกรณ์', tag: 'หัวใจของโรงไฟฟ้า',
      body: 'ข้างในโดมมี "เตาปฏิกรณ์" ที่อะตอมยูเรเนียมแตกตัวปล่อยความร้อนมหาศาล เหมือนหม้อหุงข้าวยักษ์ที่ไม่ใช้ไฟ แต่ใช้พลังจากอะตอม! ผนังคอนกรีตหนากว่า 1 เมตร แข็งแรงขนาดเครื่องบินชนยังทนไหว',
      fact: 'เม็ดเชื้อเพลิงยูเรเนียมขนาดเท่าลูกอม 1 เม็ด ให้พลังงานเท่าถ่านหินเกือบ 1 ตัน!',
      arrow: [-0.55, 0.85, 0.05], view: { target: [-0.55, 0.35, 0.05], dist: 1.2 }
    },
    cooling: {
      emoji: '🌫️', name: 'หอหล่อเย็น', tag: 'ยักษ์ใจดีทรงเอวคอด',
      body: 'หอยักษ์นี้ช่วย "คลายร้อน" ให้น้ำที่ใช้งานแล้ว ทรงโค้งเอวคอดถูกออกแบบให้ดูดอากาศไหลขึ้นเองตามธรรมชาติ ไม่ต้องใช้พัดลมเลย ส่วนไอสีขาวที่ลอยออกมาคือไอน้ำสะอาด ไม่ใช่ควันพิษนะ',
      fact: 'ของจริงสูงราว 150 เมตร เท่าตึก 40 ชั้น — ที่เห็นอยู่นี่คือย่อส่วนหลายพันเท่า!',
      arrow: [0.66, 1.05, 0.04], view: { target: [0.66, 0.5, 0.04], dist: 1.7 }
    },
    turbine: {
      emoji: '⚙️', name: 'อาคารกังหันไอน้ำ', tag: 'โรงงานปั่นไฟตัวจริง',
      body: 'ไอน้ำแรงดันสูงพุ่งชนใบพัดกังหันให้หมุนเร็วถึง 3,000 รอบต่อนาที! กังหันต่ออยู่กับ "เครื่องกำเนิดไฟฟ้า" ที่หมุนแม่เหล็กในขดลวด — หมุนปุ๊บ ไฟฟ้าไหลปั๊บ',
      fact: 'หลักการเดียวกับไดนาโมไฟหน้าจักรยาน แค่ใหญ่และแรงกว่าหลายหมื่นเท่า',
      arrow: [-0.02, 0.45, -0.52], view: { target: [-0.02, 0.2, -0.52], dist: 1.3 }
    },
    switchyard: {
      emoji: '⚡', name: 'ลานหม้อแปลงไฟฟ้า', tag: 'ด่านส่งไฟออกเดินทาง',
      body: 'ก่อนไฟฟ้าออกเดินทาง หม้อแปลงจะ "อัดแรงดัน" ให้สูงมาก เพื่อให้วิ่งไปตามสายส่งได้ไกลหลายร้อยกิโลเมตรโดยไม่หายไประหว่างทาง เหมือนฉีดน้ำแรงๆ ให้พุ่งไปได้ไกล',
      fact: 'สายส่งแรงสูงมีแรงดันถึง 500,000 โวลต์ — ปลั๊กบ้านเรามีแค่ 220 โวลต์เอง',
      arrow: [-0.05, 0.42, 0.63], view: { target: [-0.05, 0.2, 0.63], dist: 1.1 }
    },
    pond: {
      emoji: '💧', name: 'บ่อพักน้ำ', tag: 'คลังน้ำเย็นหมุนเวียน',
      body: 'โรงไฟฟ้าใช้น้ำเยอะมากในการหล่อเย็น บ่อนี้เก็บน้ำเย็นไว้วนกลับมาใช้ใหม่ได้เรื่อยๆ นี่คือเหตุผลที่โรงไฟฟ้าจริงต้องสร้างใกล้ทะเล แม่น้ำ หรือแหล่งน้ำใหญ่',
      fact: 'น้ำหล่อเย็นถูกวนใช้ซ้ำแล้วซ้ำอีก ไม่ได้ใช้แล้วทิ้ง — ประหยัดสุดๆ',
      arrow: [0.52, 0.25, 0.82], view: { target: [0.52, 0.1, 0.82], dist: 1.0 }
    },
    stack: {
      emoji: '🗼', name: 'ปล่องระบายอากาศ', tag: 'ยามเฝ้าอากาศ 24 ชม.',
      body: 'ปล่องนี้ไม่ได้ปล่อยควันดำเลยสักนิด! มันคือช่องระบายอากาศที่ติดเครื่องตรวจวัดไว้คอยเช็คคุณภาพอากาศตลอด 24 ชั่วโมง เพื่อความปลอดภัยของทุกคน',
      fact: 'ไฟแดงที่กะพริบบนยอด มีไว้เตือนเครื่องบินตอนกลางคืน',
      arrow: [-0.88, 0.82, -0.3], view: { target: [-0.88, 0.35, -0.3], dist: 1.1 }
    },
    admin: {
      emoji: '🏢', name: 'อาคารสำนักงาน', tag: 'ศูนย์บัญชาการ',
      body: 'สมองของโรงไฟฟ้า! ในห้องควบคุมมีวิศวกรผลัดเวรเฝ้าจอตลอด 24 ชั่วโมง ทุกวัน ไม่มีวันหยุด คอยดูแลให้ทุกระบบทำงานอย่างปลอดภัย',
      fact: 'กว่าจะได้เป็นพนักงานควบคุมเตาปฏิกรณ์ ต้องฝึกและสอบใบอนุญาตกันหลายปีเลย',
      arrow: [-0.78, 0.35, 0.3], view: { target: [-0.78, 0.12, 0.3], dist: 0.9 }
    }
  };

  var state = {
    scale: 1, rotY: 0,
    energyOn: false, cutawayOn: false,   // สถานะที่ผู้ใช้กดเอง
    learnOpen: false, learnStep: 0,
    poiOpen: null, arMode: false, tapHintShown: false,
    quizIndex: 0, quizScore: 0, quizAnswered: false
  };

  function $(id) { return document.getElementById(id); }

  // ---------- โหมดส่องข้างใน (ทำผนังโดมโปร่งใส) ----------
  function applyCutaway(on) {
    var wall = $('domeWall'), cap = $('domeCap'), ribs = $('domeRibs');
    if (!wall || !cap) return;
    [wall, cap].forEach(function (el) {
      el.setAttribute('material', 'transparent', true);
      el.setAttribute('material', 'opacity', on ? 0.18 : 1);
    });
    if (ribs) ribs.setAttribute('visible', !on);
    var btn = $('btnCutaway');
    if (btn) btn.classList.toggle('on', on);
  }

  // ---------- เม็ดพลังงาน ----------
  function applyEnergy(on) {
    var flow = $('energyFlow');
    if (flow) flow.setAttribute('energy-flow', 'enabled', on);
    var btn = $('btnEnergy');
    if (btn) btn.classList.toggle('on', on);
  }

  // ---------- ลูกศรไฮไลต์ ----------
  function setHighlight(pos) {
    var m = $('stepMarker');
    if (!m) return;
    if (pos) {
      m.setAttribute('position', pos[0] + ' ' + pos[1] + ' ' + pos[2]);
      m.setAttribute('visible', true);
    } else {
      m.setAttribute('visible', false);
    }
  }

  // ---------- โหมดเรียนรู้ ----------
  function renderLearnStep() {
    var s = LEARN_STEPS[state.learnStep];
    $('learnIcon').textContent = s.icon;
    $('learnTitle').textContent = s.title;
    $('learnText').textContent = s.text;
    $('learnPrev').disabled = state.learnStep === 0;
    $('learnNext').textContent = state.learnStep === LEARN_STEPS.length - 1 ? 'จบบทเรียน ✔' : 'ถัดไป ▶';

    var dots = '';
    for (var i = 0; i < LEARN_STEPS.length; i++) {
      dots += '<span class="dot' + (i === state.learnStep ? ' active' : '') + '"></span>';
    }
    $('learnDots').innerHTML = dots;

    setHighlight(s.target);
    applyCutaway(s.cutaway);
    applyEnergy(s.energy);
  }

  function openLearn() {
    if (state.poiOpen) closePoi(false);   // ปิดการ์ดอาคารก่อนเข้าบทเรียน
    state.learnOpen = true;
    state.learnStep = 0;
    $('learnPanel').style.display = 'block';
    $('controls').style.display = 'none';
    renderLearnStep();
  }

  function closeLearn() {
    state.learnOpen = false;
    $('learnPanel').style.display = 'none';
    $('controls').style.display = 'flex';
    setHighlight(null);
    applyCutaway(state.cutawayOn);   // คืนค่าที่ผู้ใช้เลือกไว้เอง
    applyEnergy(state.energyOn);
  }

  // ---------- การ์ดอาคาร (เปิดเมื่อแตะอาคาร) ----------
  function openPoi(id) {
    var p = POI[id];
    if (!p || state.learnOpen) return;   // ระหว่างโหมดเรียนรู้ ให้เดินเรื่องตามบทก่อน
    state.poiOpen = id;
    hideTapHint();
    $('poiEmoji').textContent = p.emoji;
    $('poiName').textContent = p.name;
    $('poiTag').textContent = p.tag;
    $('poiBody').textContent = p.body;
    $('poiFact').innerHTML = '💡 <b>รู้หรือไม่?</b> ' + p.fact;
    $('poiPanel').style.display = 'block';
    $('controls').style.display = 'none';
    setHighlight(p.arrow);
    setLabelsVisible(false);
    if (state.arMode) {
      $('poiOverview').style.display = 'none';
      $('poiWalkTip').style.display = 'inline';
    } else {
      $('poiOverview').style.display = 'inline-block';
      $('poiWalkTip').style.display = 'none';
      var orbit = getOrbit();
      if (orbit) orbit.flyTo(p.view.target[0], p.view.target[1], p.view.target[2], p.view.dist);
    }
  }

  function closePoi(backToOverview) {
    state.poiOpen = null;
    $('poiPanel').style.display = 'none';
    $('controls').style.display = 'flex';
    setHighlight(null);
    setLabelsVisible(true);
    if (backToOverview) {
      var orbit = getOrbit();
      if (orbit) orbit.overview();
    }
    // โหมด AR: ถ้าปิดการ์ดตอนที่มาร์กเกอร์ยังหลุดอยู่ ให้คำใบ้กลับมา
    if (state.arMode) {
      var m = $('marker'), hint = $('hint'), splash = $('splash');
      if (m && hint && !m.object3D.visible && (!splash || splash.style.display === 'none')) {
        hint.style.display = 'block';
      }
    }
  }

  // ซ่อน/โชว์ป้ายชื่ออาคารทั้งหมด (ป้ายลอยบังกล้องตอนซูมใกล้)
  function setLabelsVisible(on) {
    document.querySelectorAll('.plantLabel').forEach(function (el) {
      el.setAttribute('visible', on);
    });
  }

  function getOrbit() {
    var el = document.querySelector('[simple-orbit]');
    return el ? el.components['simple-orbit'] : null;
  }

  // คำใบ้ "แตะอาคารได้นะ" — โชว์ครั้งเดียว
  function showTapHint() {
    if (state.tapHintShown) return;
    state.tapHintShown = true;
    var h = $('tapHint');
    if (!h) return;
    h.style.display = 'block';
    setTimeout(function () { h.style.opacity = '0'; }, 4500);
    setTimeout(function () { h.style.display = 'none'; }, 5300);
  }
  function hideTapHint() {
    var h = $('tapHint');
    if (h) { h.style.display = 'none'; }
  }

  // เลือกอาคารจากรายการที่ raycast โดน:
  // กล่องใหญ่ (โดม) ครอบกล่องเล็ก (สำนักงาน/ปล่อง) ได้ → ในกลุ่มที่ระยะใกล้เคียงกล่องแรก เลือกกล่องเล็กสุด
  // แต่กล่องที่อยู่ไกลออกไปข้างหลัง (เกินหน้าต่างระยะ) ต้องไม่แย่ง — ผู้ใช้ตั้งใจแตะสิ่งที่อยู่หน้าสุด
  function pickPoiFromHits(hits) {
    if (!hits || !hits.length) return null;
    var windowEnd = hits[0].distance + 0.25 * state.scale;
    var best = null, bestVol = Infinity;
    hits.forEach(function (h) {
      if (h.distance > windowEnd) return;
      var o = h.object;
      while (o && !(o.el && o.el.dataset && o.el.dataset.poi)) o = o.parent;
      if (!o || !o.el) return;
      var g = o.el.getAttribute('geometry');
      var vol = g ? g.width * g.height * g.depth : Infinity;
      if (vol < bestVol) { bestVol = vol; best = o.el; }
    });
    return best ? best.dataset.poi : null;
  }

  // ---------- ระบบแตะอาคาร (raycast เอง เพื่อแยก "แตะ" ออกจาก "ลากหมุนกล้อง") ----------
  function initTapExplore() {
    var sceneEl = document.querySelector('a-scene');
    var raycaster = new THREE.Raycaster();
    var ndc = new THREE.Vector2();
    var downPos = null, downTime = 0, lastTouchEnd = 0;

    function onTap(x, y) {
      // ระหว่างโหมดเรียนรู้/ควิซ ไม่รับการแตะอาคาร
      if (state.learnOpen || $('quizPanel').style.display === 'flex') return;
      // โหมด AR: โมเดลโผล่เฉพาะตอนเห็นมาร์กเกอร์ (ของที่มองไม่เห็น raycast ยังโดน จึงต้องกันเอง)
      if (state.arMode) {
        var marker = $('marker');
        if (!marker || !marker.object3D.visible) return;
      }
      var camera = sceneEl.camera;
      if (!camera) return;
      var rect = sceneEl.canvas.getBoundingClientRect();
      ndc.x = ((x - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((y - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      var hitEls = document.querySelectorAll('.poi-hit');
      var objects = [];
      hitEls.forEach(function (el) { if (el.object3D) objects.push(el.object3D); });
      var hits = raycaster.intersectObjects(objects, true);
      var poi = pickPoiFromHits(hits);
      if (poi) openPoi(poi);
    }

    function bind() {
      var c = sceneEl.canvas;
      c.addEventListener('mousedown', function (e) {
        downPos = { x: e.clientX, y: e.clientY };
        downTime = Date.now();
      });
      c.addEventListener('mouseup', function (e) {
        // มือถือยิง mouse event ซ้ำหลัง touch (ghost click) — ข้ามถ้าเพิ่งมี touch
        if (Date.now() - lastTouchEnd < 700) { downPos = null; return; }
        if (downPos && Date.now() - downTime < 400 &&
            Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) < 10) onTap(e.clientX, e.clientY);
        downPos = null;
      });
      c.addEventListener('touchstart', function (e) {
        downPos = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
        downTime = Date.now();
      }, { passive: true });
      c.addEventListener('touchend', function (e) {
        lastTouchEnd = Date.now();
        if (downPos && e.changedTouches.length === 1) {
          var t = e.changedTouches[0];
          // ต้องทั้ง "ขยับน้อย" และ "กดสั้น" ถึงนับเป็นแตะ (กันลากลังเล/นิ้วพักบนจอ)
          if (Date.now() - downTime < 400 &&
              Math.hypot(t.clientX - downPos.x, t.clientY - downPos.y) < 12) onTap(t.clientX, t.clientY);
        }
        downPos = null;
      });
    }
    if (sceneEl.canvas) bind();
    else sceneEl.addEventListener('render-target-loaded', bind);
  }

  // ---------- ควิซ ----------
  function renderQuiz() {
    var item = QUIZ[state.quizIndex];
    state.quizAnswered = false;
    $('quizProgress').textContent = 'ข้อ ' + (state.quizIndex + 1) + ' / ' + QUIZ.length;
    $('quizQuestion').textContent = item.q;
    $('quizFeedback').textContent = '';
    $('quizNext').style.display = 'none';

    var html = '';
    item.choices.forEach(function (c, i) {
      html += '<button class="quizChoice" data-i="' + i + '">' + c + '</button>';
    });
    $('quizChoices').innerHTML = html;

    Array.prototype.forEach.call(document.querySelectorAll('.quizChoice'), function (btn) {
      btn.addEventListener('click', function () {
        if (state.quizAnswered) return;
        state.quizAnswered = true;
        var picked = parseInt(btn.dataset.i, 10);
        var correct = picked === item.correct;
        if (correct) state.quizScore++;
        Array.prototype.forEach.call(document.querySelectorAll('.quizChoice'), function (b, i) {
          if (i === item.correct) b.classList.add('correct');
          else if (i === picked) b.classList.add('wrong');
          b.disabled = true;
        });
        $('quizFeedback').textContent = (correct ? '🎉 ถูกต้อง! ' : '❌ ยังไม่ใช่ — ') + item.why;
        $('quizNext').style.display = 'inline-block';
        $('quizNext').textContent = state.quizIndex === QUIZ.length - 1 ? 'ดูคะแนน 🏆' : 'ข้อต่อไป ▶';
      });
    });
  }

  function renderQuizResult() {
    var s = state.quizScore, n = QUIZ.length;
    var stars = s > 0 ? '⭐'.repeat(s) : '💪';   // 0 คะแนนต้องไม่โชว์ดาว (ใบงานให้ระบายดาวตามคะแนนจริง)
    var msg = s === n ? 'สุดยอดนักวิทยาศาสตร์ตัวจริง!'
            : s >= 3  ? 'เก่งมาก! เกือบเต็มแล้ว'
            :           'ไม่เป็นไร ลองดูโหมดเรียนรู้แล้วเล่นใหม่นะ';
    $('quizBody').style.display = 'none';
    $('quizResult').style.display = 'block';
    $('quizScoreText').textContent = s + ' / ' + n;
    $('quizStars').textContent = stars;
    $('quizMsg').textContent = msg;
  }

  function openQuiz() {
    state.quizIndex = 0;
    state.quizScore = 0;
    $('quizPanel').style.display = 'flex';
    $('quizBody').style.display = 'block';
    $('quizResult').style.display = 'none';
    renderQuiz();
  }

  // ---------- ผูกปุ่มทั้งหมด ----------
  function init(opts) {
    opts = opts || {};
    state.arMode = !!opts.arMode;
    var plant = $('plant');

    // แตะอาคารเพื่อดูการ์ดความรู้
    initTapExplore();
    $('poiClose').addEventListener('click', function () { closePoi(false); });
    $('poiOverview').addEventListener('click', function () { closePoi(true); });
    if (!state.arMode) setTimeout(showTapHint, 1600);   // โหมด 3D: บอกใบ้ทันทีที่เข้า

    // ย่อ / ขยาย / หมุน
    $('btnGrow').addEventListener('click', function () {
      state.scale = Math.min(3, state.scale * 1.25);
      plant.setAttribute('scale', state.scale + ' ' + state.scale + ' ' + state.scale);
    });
    $('btnShrink').addEventListener('click', function () {
      state.scale = Math.max(0.35, state.scale / 1.25);
      plant.setAttribute('scale', state.scale + ' ' + state.scale + ' ' + state.scale);
    });
    $('btnRotate').addEventListener('click', function () {
      state.rotY = (state.rotY + 45) % 360;
      plant.setAttribute('rotation', '0 ' + state.rotY + ' 0');
    });

    // สลับโหมด
    $('btnEnergy').addEventListener('click', function () {
      state.energyOn = !state.energyOn;
      applyEnergy(state.energyOn);
    });
    $('btnCutaway').addEventListener('click', function () {
      state.cutawayOn = !state.cutawayOn;
      applyCutaway(state.cutawayOn);
    });

    // โหมดเรียนรู้
    $('btnLearn').addEventListener('click', openLearn);
    $('learnClose').addEventListener('click', closeLearn);
    $('learnPrev').addEventListener('click', function () {
      if (state.learnStep > 0) { state.learnStep--; renderLearnStep(); }
    });
    $('learnNext').addEventListener('click', function () {
      if (state.learnStep < LEARN_STEPS.length - 1) { state.learnStep++; renderLearnStep(); }
      else closeLearn();
    });

    // ควิซ
    $('btnQuiz').addEventListener('click', openQuiz);
    $('quizNext').addEventListener('click', function () {
      if (state.quizIndex < QUIZ.length - 1) { state.quizIndex++; renderQuiz(); }
      else renderQuizResult();
    });
    $('quizRetry').addEventListener('click', openQuiz);
    $('quizClose').addEventListener('click', function () { $('quizPanel').style.display = 'none'; });
    $('quizCloseX').addEventListener('click', function () { $('quizPanel').style.display = 'none'; });

    // เหตุการณ์เจอ/หลุดมาร์กเกอร์ (เฉพาะโหมด AR)
    if (opts.arMode) {
      var marker = $('marker'), hint = $('hint'), splash = $('splash');
      if (marker && hint) {
        marker.addEventListener('markerFound', function () {
          hint.style.display = 'none';
          showTapHint();   // เจอมาร์กเกอร์ครั้งแรก → บอกใบ้ว่าแตะอาคารได้
        });
        marker.addEventListener('markerLost', function () {
          // ถ้าการ์ดอาคารเปิดอยู่ ไม่ต้องเอาคำใบ้ขึ้นมาทับ (จะโชว์ตอนปิดการ์ดถ้ายังหามาร์กเกอร์ไม่เจอ)
          if (splash && splash.style.display === 'none' && !state.poiOpen) hint.style.display = 'block';
        });
      }
    }
  }

  window.PlantUI = { init: init, openPoi: openPoi, closePoi: closePoi, pickPoiFromHits: pickPoiFromHits };

})();
