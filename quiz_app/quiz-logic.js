// ===== GLOBAL STATE =====
let selectedCategory = null;
let selectedLevel = null; // kept only for UI, not used in data

let questions = [];
let currentIndex = 0;
let score = 0;

let timer = null;
let timeLeft = 30;
let selectedOption = null;
let timePerQuestion = [];
let reviewData = [];

// ===== ELEMENTS =====
const homeScreen = document.getElementById("home");
const quizScreen = document.getElementById("quiz");
const resultScreen = document.getElementById("result");

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const timerEl = document.getElementById("timer");

// ===== CATEGORY SELECTION =====
document.querySelectorAll("[data-cat]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-cat]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCategory = btn.dataset.cat;
  });
});

// ===== LEVEL SELECTION (UI ONLY) =====
document.querySelectorAll("[data-lvl]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-lvl]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedLevel = btn.dataset.lvl;
  });
});

// ===== START QUIZ =====
document.getElementById("start").addEventListener("click", () => {
  if (!selectedCategory || !selectedLevel) {
    alert("Please select category and difficulty");
    return;
  }

  // 🔥 IMPORTANT FIX (your data has NO levels)
  questions = quizData[selectedCategory];

  currentIndex = 0;
  score = 0;
  timePerQuestion = [];

  homeScreen.style.display = "none";
  quizScreen.style.display = "block";

  showQuestion();
});

// ===== SHOW QUESTION =====
function showQuestion() {
  clearInterval(timer);
  selectedOption = null;
  timeLeft = 30;

  timerEl.innerText = `⏱ ${timeLeft}s`;

  const currentQuestion = questions[currentIndex];
  questionEl.innerText = currentQuestion.q;

  optionsEl.innerHTML = "";

  currentQuestion.o.forEach((opt, index) => {
    const div = document.createElement("div");
    div.className = "option-btn";
    div.innerText = opt;

    div.addEventListener("click", () => {
      document.querySelectorAll(".option-btn").forEach(o =>
        o.classList.remove("selected")
      );
      div.classList.add("selected");
      selectedOption = index;
    });

    optionsEl.appendChild(div);
  });

  timer = setInterval(() => {
    timeLeft--;
    timerEl.innerText = `⏱ ${timeLeft}s`;

    if (timeLeft === 0) {
      submitAnswer();
    }
  }, 1000);
}

// ===== SUBMIT ANSWER =====
document.getElementById("submit").addEventListener("click", () => {
  if (selectedOption === null) {
    alert("Please select an option");
    return;
  }
  submitAnswer();
});

function submitAnswer() {
  clearInterval(timer);

  timePerQuestion.push(30 - timeLeft);

const isCorrect = selectedOption === questions[currentIndex].a;

if (isCorrect) score++;

reviewData.push({
  question: questions[currentIndex].q,
  selected: questions[currentIndex].o[selectedOption],
  correct: questions[currentIndex].o[questions[currentIndex].a],
  isCorrect: isCorrect,
  time: 30 - timeLeft
});


  currentIndex++;

  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

// ===== SHOW RESULT =====
function showResult() {
  quizScreen.style.display = "none";
  resultScreen.style.display = "block";

  document.getElementById("correctC").innerText = score;
  document.getElementById("wrongC").innerText = questions.length - score;
  document.getElementById("scoreP").innerText =
    Math.round((score / questions.length) * 100) + "%";

  const avg =
    timePerQuestion.reduce((a, b) => a + b, 0) / timePerQuestion.length;

  document.getElementById("avgT").innerText = Math.round(avg) + "s";
const box = document.getElementById("detailedResults");
box.innerHTML += reviewData.map((item, i) => `
  <div class="detail-item ${item.isCorrect ? "correct" : "wrong"}">
    <strong>Q${i + 1}:</strong> ${item.question}<br>
    <small>
      Your Answer: ${item.selected} |
      Correct Answer: ${item.correct} |
      Time: ${item.time}s
    </small>
  </div>
`).join("");

  // ===== PIE CHART =====
  new Chart(document.getElementById("pie"), {
    type: "pie",
    data: {
      labels: ["Correct", "Wrong"],
      datasets: [
        {
          data: [score, questions.length - score],
          backgroundColor: ["#28a745", "#dc3545"]
        }
      ]
    }
  });

  // ===== BAR CHART =====
  new Chart(document.getElementById("bar"), {
    type: "bar",
    data: {
      labels: timePerQuestion.map((_, i) => "Q" + (i + 1)),
      datasets: [
        {
          label: "Time (seconds)",
          data: timePerQuestion
        }
      ]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
