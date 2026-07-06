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

  var state = {
    scale: 1, rotY: 0,
    energyOn: false, cutawayOn: false,   // สถานะที่ผู้ใช้กดเอง
    learnOpen: false, learnStep: 0,
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
    var plant = $('plant');

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
        marker.addEventListener('markerFound', function () { hint.style.display = 'none'; });
        marker.addEventListener('markerLost', function () {
          if (splash && splash.style.display === 'none') hint.style.display = 'block';
        });
      }
    }
  }

  window.PlantUI = { init: init };

})();
