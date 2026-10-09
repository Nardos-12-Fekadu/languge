// Database of Multi-language Content
const DATA = {
  zh: {
    code: 'zh-CN',
    quiz: [
      { q: "How do you say 'Hello' in Chinese?", options: ["你好 (Nǐ hǎo)", "谢谢 (Xièxiè)", "再见 (Zàijiàn)", "对不起 (Duìbùqǐ)"], answer: 0, hint: "Common everyday greeting" },
      { q: "What is the meaning of '谢谢'?", options: ["Sorry", "Thank you", "Goodbye", "Please"], answer: 1, hint: "Used when receiving help" },
      { q: "Which word means 'Student'?", options: ["老师 (Lǎoshī)", "学生 (Xuéshēng)", "朋友 (Péngyǒu)", "医生 (Yīshēng)"], answer: 1, hint: "Person learning in school" }
    ],
    match: [
      { a: "你好", b: "Hello" },
      { a: "水", b: "Water" },
      { a: "猫", b: "Cat" },
      { a: "书", b: "Book" }
    ],
    builder: [
      { english: "I am a student.", target: ["我", "是", "学生"], audio: "我是学生" },
      { english: "Thank you very much.", target: ["非常", "谢谢", "你"], audio: "非常谢谢你" }
    ]
  },
  de: {
    code: 'de-DE',
    quiz: [
      { q: "How do you say 'Good morning' in German?", options: ["Guten Morgen", "Guten Tag", "Gute Nacht", "Auf Wiedersehen"], answer: 0, hint: "Greeting early in the day" },
      { q: "What is the German word for 'Apple'?", options: ["Brot", "Wasser", "Apfel", "Milch"], answer: 2, hint: "A common fruit" },
      { q: "What does 'Danke' mean?", options: ["Please", "Thank you", "Yes", "No"], answer: 1, hint: "Expressing gratitude" }
    ],
    match: [
      { a: "Haus", b: "House" },
      { a: "Hund", b: "Dog" },
      { a: "Sonne", b: "Sun" },
      { a: "Freund", b: "Friend" }
    ],
    builder: [
      { english: "I am learning German.", target: ["Ich", "lerne", "Deutsch"], audio: "Ich lerne Deutsch" },
      { english: "Life is beautiful.", target: ["Das", "Leben", "ist", "schön"], audio: "Das Leben ist schön" }
    ]
  },
  en: {
    code: 'en-US',
    quiz: [
      { q: "Select the correct synonym for 'Rapid':", options: ["Slow", "Quick", "Heavy", "Quiet"], answer: 1, hint: "Fast movement" },
      { q: "What is the past tense of 'Go'?", options: ["Goed", "Gone", "Went", "Going"], answer: 2, hint: "Irregular verb form" }
    ],
    match: [
      { a: "Joyful", b: "Happy" },
      { a: "Ancient", b: "Very old" },
      { a: "Attempt", b: "Try" },
      { a: "Silent", b: "Quiet" }
    ],
    builder: [
      { english: "Practice makes perfect.", target: ["Practice", "makes", "perfect"], audio: "Practice makes perfect" }
    ]
  }
};

// Global App State
let currentLang = 'zh';
let currentMode = 'quiz';
let score = 0;
let quizIndex = 0;
let selectedLeft = null;
let selectedRight = null;
let builderSelected = [];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setLanguage('zh');
  setMode('quiz');
});

function setLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('.selector-btn[id^="lang-"]').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`lang-${lang}`).classList.add('active');
  resetGame();
}

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.selector-btn[id^="mode-"]').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`mode-${mode}`).classList.add('active');
  resetGame();
}

function resetGame() {
  quizIndex = 0;
  selectedLeft = null;
  selectedRight = null;
  builderSelected = [];
  renderArena();
}

function playAudio(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = DATA[currentLang].code;
    window.speechSynthesis.speak(utterance);
  }
}

function addScore(points) {
  score += points;
  document.getElementById('score-count').innerText = score;
  if (typeof confetti === 'function') {
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
  }
}

function renderArena() {
  const arena = document.getElementById('game-arena');
  arena.innerHTML = '';

  if (currentMode === 'quiz') renderQuiz(arena);
  else if (currentMode === 'match') renderMatch(arena);
  else if (currentMode === 'builder') renderBuilder(arena);
}

// --- QUIZ MODE ---
function renderQuiz(container) {
  const list = DATA[currentLang].quiz;
  if (quizIndex >= list.length) {
    container.innerHTML = `
      <div class="complete-card">
        <i class="fa-solid fa-circle-check"></i>
        <h2>Quiz Completed!</h2>
        <p>Great job practicing your vocabulary.</p>
        <button onclick="resetGame()" class="action-btn">Play Again</button>
      </div>
    `;
    return;
  }

  const item = list[quizIndex];
  container.innerHTML = `
    <div>
      <div class="quiz-header">
        <span class="question-tag">Question ${quizIndex + 1} of ${list.length}</span>
        <button onclick="playAudio('${item.options[item.answer]}')" class="audio-btn">
          <i class="fa-solid fa-volume-high"></i> Listen
        </button>
      </div>
      <h3 class="question-text">${item.q}</h3>
      <div class="options-grid">
        ${item.options.map((opt, i) => `
          <button onclick="checkQuiz(${i}, this)" class="opt-btn">${opt}</button>
        `).join('')}
      </div>
    </div>
  `;
}

function checkQuiz(selectedIndex, btn) {
  const item = DATA[currentLang].quiz[quizIndex];
  if (selectedIndex === item.answer) {
    btn.classList.add('correct');
    addScore(10);
    setTimeout(() => {
      quizIndex++;
      renderArena();
    }, 800);
  } else {
    btn.classList.add('incorrect');
  }
}

// --- WORD MATCH MODE ---
function renderMatch(container) {
  const items = DATA[currentLang].match;
  let left = items.map(x => x.a);
  let right = [...items.map(x => x.b)].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div>
      <h3 class="question-text">Match the terms correctly</h3>
      <div class="match-grid">
        <div class="match-col">
          ${left.map(w => `<button onclick="selectMatch('left', '${w}', this)" class="match-card">${w}</button>`).join('')}
        </div>
        <div class="match-col">
          ${right.map(w => `<button onclick="selectMatch('right', '${w}', this)" class="match-card">${w}</button>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function selectMatch(side, word, btn) {
  if (side === 'left') {
    if (selectedLeft) selectedLeft.btn.classList.remove('selected');
    selectedLeft = { word, btn };
    btn.classList.add('selected');
  } else {
    if (selectedRight) selectedRight.btn.classList.remove('selected');
    selectedRight = { word, btn };
    btn.classList.add('selected');
  }

  if (selectedLeft && selectedRight) {
    const match = DATA[currentLang].match.find(m => m.a === selectedLeft.word && m.b === selectedRight.word);
    if (match) {
      addScore(15);
      selectedLeft.btn.className = 'match-card matched';
      selectedRight.btn.className = 'match-card matched';
      selectedLeft = null;
      selectedRight = null;
    } else {
      setTimeout(() => {
        if (selectedLeft) selectedLeft.btn.classList.remove('selected');
        if (selectedRight) selectedRight.btn.classList.remove('selected');
        selectedLeft = null;
        selectedRight = null;
      }, 400);
    }
  }
}

// --- SENTENCE BUILDER MODE ---
function renderBuilder(container) {
  const list = DATA[currentLang].builder;
  const item = list[0];
  const shuffled = [...item.target].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div>
      <div class="quiz-header">
        <span class="question-tag">Translate to target language</span>
        <button onclick="playAudio('${item.audio}')" class="audio-btn">
          <i class="fa-solid fa-volume-high"></i> Listen
        </button>
      </div>
      <h3 class="question-text">${item.english}</h3>

      <!-- Target Drop Zone -->
      <div id="builder-target" class="builder-target"></div>

      <!-- Word Pool -->
      <div id="builder-pool" class="builder-pool">
        ${shuffled.map(word => `
          <button onclick="pickTile(this, '${word}')" class="tile-btn">${word}</button>
        `).join('')}
      </div>
    </div>
    <button onclick="checkSentence()" class="action-btn">Check Answer</button>
  `;
}

function pickTile(btn, word) {
  const target = document.getElementById('builder-target');
  const pool = document.getElementById('builder-pool');

  if (btn.parentElement.id === 'builder-pool') {
    target.appendChild(btn);
    builderSelected.push(word);
  } else {
    pool.appendChild(btn);
    builderSelected = builderSelected.filter(w => w !== word);
  }
}

function checkSentence() {
  const item = DATA[currentLang].builder[0];
  if (JSON.stringify(builderSelected) === JSON.stringify(item.target)) {
    addScore(20);
    alert("Correct! Excellent sentence structure.");
    resetGame();
  } else {
    alert("Not quite right! Try reordering the words.");
  }
}