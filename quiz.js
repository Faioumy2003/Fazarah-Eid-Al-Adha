window.onload = function() {
    // بيانات الطفل
    const childNID  = localStorage.getItem('childNID');
    const childName = localStorage.getItem('childName');
    const childAge  = parseInt(localStorage.getItem('childAge')) || 0;
    if (!childNID || !childName) {
        window.location.href = "index.html";
        return;
    }
    document.getElementById('studentName').textContent = childName;

    // بنوك الأسئلة
    const easyQs = (window.questionsBank && window.questionsBank.easy)   ? window.questionsBank.easy   : [];
    const medQs  = (window.questionsBank && window.questionsBank.medium) ? window.questionsBank.medium : [];
    const hardQs = (window.questionsBank && window.questionsBank.hard)   ? window.questionsBank.hard   : [];

    // دوال عشوائية
    function shuffle(array) {
        let arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    function pickRandom(arr, n) {
        if (arr.length <= n) return shuffle(arr);
        return shuffle(arr).slice(0, n);
    }

    // توزيع حسب السن
    function getDistribution(age) {
        if (age <= 6)    return {easy: 8, medium: 2, hard: 0};
        if (age <= 8)    return {easy: 6, medium: 3, hard: 1};
        return                  {easy: 5, medium: 3, hard: 2};
    }

    // لا تكرر نفس مجموعة الأسئلة مرتين ورا بعض
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

    function generateTest(easyQs, medQs, hardQs, age, lastTestQs) {
        let selectedQuestions, tries = 0;
        const dist = getDistribution(age);
        do {
            selectedQuestions = [
                ...pickRandom(easyQs, dist.easy),
                ...pickRandom(medQs, dist.medium),
                ...pickRandom(hardQs, dist.hard)
            ];
            selectedQuestions = shuffle(selectedQuestions).slice(0, 10);
            tries++;
        } while (tries < 20 && areArraysEqual(selectedQuestions, lastTestQs));
        return selectedQuestions;
    }

    // اختيار العشرة أسئلة
    const questions = generateTest(easyQs, medQs, hardQs, childAge, lastTestQs);
    localStorage.setItem('lastTestQs', JSON.stringify(questions));

    // متغيرات الامتحان
    let current = 0, userAnswers = [], score = 0, timer, timeLeft = 30;

    // عرض سؤال
    function showQuestion() {
        clearInterval(timer);
        timeLeft = 30;
        if (document.getElementById('timer')) document.getElementById('timer').textContent = timeLeft;
        startTimer();

        const q = questions[current];
        document.getElementById('question-box').textContent = q.q;

        // عرض الخيارات
        const optionsBox = document.getElementById('options-box');
        optionsBox.innerHTML = "";
        q.options.forEach((opt, idx) => {
            const radio = document.createElement('input');
            radio.type = "radio";
            radio.name = "qOption";
            radio.value = idx;
            radio.id = "option" + idx;

            radio.onchange = () => document.getElementById('confirm-btn').disabled = false;

            const label = document.createElement('label');
            label.htmlFor = radio.id;
            label.style.display = "block";
            label.appendChild(radio);
            label.appendChild(document.createTextNode(opt));
            optionsBox.appendChild(label);
        });

        document.getElementById('confirm-btn').disabled = true;
        document.getElementById('next-btn').style.display = "none";
    }

    // المؤقت
    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            if (document.getElementById('timer')) document.getElementById('timer').textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                lockAnswer();
            }
        }, 1000);
    }

    // تأكيد الإجابة
    document.getElementById('confirm-btn').onclick = function () {
        lockAnswer();
    };

    function lockAnswer() {
        clearInterval(timer);

        // الخيار المختار
        const options = document.getElementsByName('qOption');
        let selected = -1;
        options.forEach((opt) => {
            opt.disabled = true;
            if (opt.checked) selected = parseInt(opt.value);
        });

        userAnswers.push(selected);

        // التصحيح (يدعم answer أو correct)
        const correct = typeof questions[current].correct !== "undefined" ? questions[current].correct : questions[current].answer;
        if (selected === correct) {
            score++;
        }

        // زر التالي
        document.getElementById('next-btn').style.display = "inline-block";
        document.getElementById('confirm-btn').disabled = true;
    }

    // السؤال التالي
    document.getElementById('next-btn').onclick = function () {
        current++;
        if (current < 10) {
            showQuestion();
        } else {
            showResult();
        }
    };

    // النتيجة النهائية
    function showResult() {
        if (document.querySelector('.quiz-content')) document.querySelector('.quiz-content').style.display = "none";
        const resultBox = document.getElementById('result-box');
        if (resultBox) {
            resultBox.style.display = "block";
            let messageHTML = "";
            if (score >= 8) {
                messageHTML = `
                    <div style="border: 3px solid #ff69b4; border-radius: 18px; padding: 18px; background: #fff0f6; margin: 18px 0; text-align:center; font-size:1.2em;">
                        <span style="font-size:2em;">🌸🌸🌸</span><br>
                        تهانينا يا حبيبي ، ليك جائزة
                        <br><span style="font-size:2em;">🌸🌸🌸</span>
                    </div>
                `;
            } else {
                messageHTML = `
                    <div style="border: 2px dashed #bbb; border-radius: 12px; padding: 14px; background: #f9f9f9; margin: 18px 0; text-align:center; font-size:1.1em;">
                        حظ أوفر المرة الجاية يا حبيبي
                    </div>
                `;
            }
            resultBox.innerHTML = `
                <h2>انتهت المسابقة!</h2>
                <p>درجتك: ${score} من 10</p>
                ${messageHTML}
            `;
        }
    }

    // ابدأ الامتحان على طول
    showQuestion();
};
