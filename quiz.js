window.onload = function() {
   const SHEET_API = "https://script.google.com/macros/s/AKfycbyeklnV3sEdhEvMEZ-UDzVhqMZt8ipR9AedDmlkwaQP8HywLh3wWJc-Ah8IaqZmQhSrSQ/exec";
    // ... باقي الكود بدون أي تغيير ...
};

    // تحقق من وجود بيانات الطفل
    const childNID = localStorage.getItem('childNID');
    const childName = localStorage.getItem('childName');
    if (!childNID || !childName) {
        window.location.href = "index.html";
        return;
    }

    // عرض اسم الطفل
    document.getElementById('studentName').textContent = childName;

    // بنوك الأسئلة
    const easyQs = window.questionsBank && window.questionsBank.easy ? window.questionsBank.easy : [];
    const medQs  = window.questionsBank && window.questionsBank.medium ? window.questionsBank.medium : [];
    const hardQs = window.questionsBank && window.questionsBank.hard ? window.questionsBank.hard : [];

    // توزيع الأسئلة حسب السن
    function shuffle(arr) {
        let a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    function pickRandom(arr, n) {
        if (arr.length <= n) return shuffle(arr);
        return shuffle(arr).slice(0, n);
    }

    // توزيع الأسئلة حسب العمر
    let childAge = 0;
    try {
        // حساب السن من الرقم القومي
        const nid = childNID;
        const birthYear = nid[0] === '3'
            ? parseInt('20' + nid.slice(1,3))
            : parseInt('19' + nid.slice(1,3));
        const currentYear = new Date().getFullYear();
        childAge = currentYear - birthYear;
    } catch(e) {}

    // توزيع عادل حسب السن
    let dist = {easy: 8, medium: 2, hard: 0};
    if (childAge >= 7 && childAge <= 8) dist = {easy: 6, medium: 3, hard: 1};
    else if (childAge >= 9) dist = {easy: 5, medium: 3, hard: 2};

    // جلب الأسئلة بشكل عشوائي من كل بنك
    let questions = [
        ...pickRandom(easyQs, dist.easy),
        ...pickRandom(medQs, dist.medium),
        ...pickRandom(hardQs, dist.hard)
    ];
    questions = shuffle(questions).slice(0, 10);

    if (!questions || questions.length === 0) {
        document.getElementById('question-box').textContent = "لا توجد أسئلة متاحة. تأكد من تحميل بنك الأسئلة بشكل صحيح.";
        return;
    }

    // باقي الكود كما هو (لا تغير أي شيء في التصميم)
    fetch(SHEET_API + `?nid=${encodeURIComponent(childNID)}&action=check`)
    .then(res => res.json())
    .then(data => {
        if (data && data.exists) {
            document.querySelector('.quiz-content').style.display = "none";
            const resultBox = document.getElementById('result-box');
            resultBox.style.display = "block";
            resultBox.innerHTML = `
                <div style="border:2px solid #f00; border-radius:10px; padding:20px; background:#fff0f0; color:#900; text-align:center; margin:30px 0;">
                    لقد شاركت بالفعل ولا يمكنك دخول الاختبار مرة أخرى.
                </div>
            `;
            return;
        } else {
            showQuestion();
        }
    })
    .catch(() => {
        document.getElementById('question-box').textContent = "حدث خطأ في التحقق من الاشتراك السابق. حاول التحديث أو التواصل مع المنظم.";
    });

    // إعداد متغيرات الحالة
    let current = 0;
    let userAnswers = [];
    let score = 0;
    let timer;
    let timeLeft = 30;

    // دالة لعرض سؤال
    function showQuestion() {
        clearInterval(timer);
        timeLeft = 30;
        document.getElementById('timer').textContent = timeLeft;
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

    // دالة المؤقت
    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                lockAnswer();
            }
        }, 1000);
    }

    // عند تأكيد الاختيار
    document.getElementById('confirm-btn').onclick = function () {
        lockAnswer();
    };

    function lockAnswer() {
        clearInterval(timer);

        // الحصول على الخيار المختار
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

        // إظهار زر التالي
        document.getElementById('next-btn').style.display = "inline-block";
        document.getElementById('confirm-btn').disabled = true;
    }

    // عند الضغط على زر "السؤال التالي"
    document.getElementById('next-btn').onclick = function () {
        current++;
        if (current < 10) {
            showQuestion();
        } else {
            showResult();
        }
    };

    // إظهار النتيجة النهائية مع حفظها في Google Sheet
    function showResult() {
        document.querySelector('.quiz-content').style.display = "none";
        const resultBox = document.getElementById('result-box');
        resultBox.style.display = "block";

        // إرسال النتيجة إلى Google Sheet
        fetch(SHEET_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: childName,
                nid: childNID,
                score: score
            })
        });

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
};
