window.onload = function() {
    // جلب السن من localStorage أو أي طريقة بتستخدمها
    const childAge = parseInt(localStorage.getItem('childAge')) || 0;

    // بنوك الأسئلة
    const easyQs = window.questionsBank && window.questionsBank.easy ? window.questionsBank.easy : [];
    const medQs  = window.questionsBank && window.questionsBank.medium ? window.questionsBank.medium : [];
    const hardQs = window.questionsBank && window.questionsBank.hard ? window.questionsBank.hard : [];

    // دوال للخلط والتوزيع العشوائي
    function shuffle(array) {
        let arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    function pickRandom(arr, n) {
        if (arr.length <= n) return shuffle(arr); // لو أقل من العدد المطلوب
        return shuffle(arr).slice(0, n);
    }

    // جلب آخر اختبار من localStorage
    let lastTestQs = [];
    try {
        lastTestQs = JSON.parse(localStorage.getItem('lastTestQs') || '[]');
    } catch { lastTestQs = []; }

    function areArraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for(let i=0; i<arr1.length; i++) {
            if(arr1[i].q !== arr2[i].q) return false;
        }
        return true;
    }

    function generateTest(easyQs, medQs, hardQs, childAge, lastTestQs) {
        let selectedQuestions;
        let tries = 0;
        do {
            // توزيع الأسئلة حسب السن
            if (childAge <= 6) {
                selectedQuestions = [
                    ...pickRandom(easyQs, 8),
                    ...pickRandom(medQs, 2)
                ];
            } else if (childAge >= 7 && childAge <= 8) {
                selectedQuestions = [
                    ...pickRandom(easyQs, 6),
                    ...pickRandom(medQs, 3),
                    ...pickRandom(hardQs, 1)
                ];
            } else {
                selectedQuestions = [
                    ...pickRandom(easyQs, 5),
                    ...pickRandom(medQs, 3),
                    ...pickRandom(hardQs, 2)
                ];
            }
            selectedQuestions = shuffle(selectedQuestions).slice(0, 10); // دايمًا 10 أسئلة فقط
            tries++;
        } while (tries < 20 && areArraysEqual(selectedQuestions, lastTestQs));
        return selectedQuestions;
    }

    const questions = generateTest(easyQs, medQs, hardQs, childAge, lastTestQs);

    // خزن الاختبار الجديد (حتى لا يتكرر مرة أخرى لنفس الطفل)
    localStorage.setItem('lastTestQs', JSON.stringify(questions));

    // باقي كود المسابقة
    let currentQuestion = 0;
    let score = 0;
    let answers = [];

    function showQuestion() {
        if (currentQuestion >= questions.length) {
            document.getElementById('question-box').innerHTML = `<p>انتهت المسابقة!</p>
                <p>درجتك: ${score} من 10</p>`;
            return;
        }
        const q = questions[currentQuestion];
        let optionsHtml = "";
        q.options.forEach((opt, idx) => {
            optionsHtml += `<button class="option-btn" onclick="selectAnswer(${idx})">${opt}</button><br>`;
        });
        document.getElementById('question-box').innerHTML =
            `<div>
                <p>${currentQuestion + 1} - ${q.q}</p>
                ${optionsHtml}
            </div>`;
    }

    window.selectAnswer = function(idx) {
        answers.push(idx);
        if (questions[currentQuestion].correct === idx) {
            score++;
        }
        currentQuestion++;
        showQuestion();
    };

    document.getElementById('start-btn').onclick = function() {
        currentQuestion = 0;
        score = 0;
        answers = [];
        showQuestion();
        this.style.display = "none";
    };

    document.getElementById('start-btn').style.display = "block";
    document.getElementById('question-box').innerHTML = "";
}
