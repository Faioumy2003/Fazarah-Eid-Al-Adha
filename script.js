const questions = [
    {
        question: "ما اسم الجبل الذي بُني عليه الكعبة؟",
        answers: ["جبل عرفات", "جبل النور", "جبل أبي قبيس", "جبل أحد"],
        correct: 2
    },
    {
        question: "كم عدد ركعات صلاة العيد؟",
        answers: ["ركعتان", "ثلاث ركعات", "أربع ركعات", "خمس ركعات"],
        correct: 0
    },
    {
        question: "ما هو اليوم الذي يسبق عيد الأضحى؟",
        answers: ["يوم التروية", "يوم عرفة", "يوم التشريق", "يوم الجمعة"],
        correct: 1
    },
    {
        question: "ما اسم السورة التي تتحدث عن الأضحية؟",
        answers: ["سورة الفاتحة", "سورة الكوثر", "سورة الناس", "سورة الإخلاص"],
        correct: 1
    },
    {
        question: "كم مرة يطوف الحاج حول الكعبة في طواف الإفاضة؟",
        answers: ["5 مرات", "6 مرات", "7 مرات", "8 مرات"],
        correct: 2
    }
];

let current = 0;
let score = 0;

const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const nextBtn = document.getElementById('next-btn');
const resultEl = document.getElementById('result');

function showQuestion() {
    const q = questions[current];
    questionEl.textContent = q.question;
    answersEl.innerHTML = '';
    q.answers.forEach((ans, idx) => {
        const btn = document.createElement('button');
        btn.textContent = ans;
        btn.onclick = () => selectAnswer(idx);
        answersEl.appendChild(btn);
    });
    nextBtn.style.display = 'none';
}

function selectAnswer(idx) {
    const q = questions[current];
    const buttons = answersEl.querySelectorAll('button');
    buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.correct) btn.style.background = '#b2dfdb';
        if (i === idx && idx !== q.correct) btn.style.background = '#ffcdd2';
    });
    if (idx === q.correct) score++;
    nextBtn.style.display = 'inline-block';
}

nextBtn.onclick = () => {
    current++;
    if (current < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
};

function showResult() {
    document.getElementById('quiz-box').style.display = 'none';
    resultEl.style.display = 'block';
    resultEl.innerHTML = `أحسنت! نتيجتك: <b>${score} من ${questions.length}</b> <br>عيد أضحى مبارك!`;
}

// بدء المسابقة
showQuestion();
