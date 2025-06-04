window.onload = function() {
    // رابط Google Apps Script الخاص بك:
    const SHEET_API = "https://script.google.com/macros/s/AKfycbxf7Ia9PjVrC2fCWkyHGGrY_kUmazGrCdLKcTLqcfw_xHeOs3ih-zoOfCX5aGlj9PCU-g/exec";

    // دوال المساعدة للخلط والاختيار العشوائي
    function shuffle(array) {
        let arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    function pickRandom(arr, n) {
        return shuffle(arr).slice(0, n);
    }

    // توليد اختبار فريد مع أقل تشابه مع الاختبار السابق
    function generateUniqueTest(easyQs, medQs, hardQs, lastTestQs, childAge) {
        let selectedQuestions;
        let MAX_COMMON = 2; // أقصى عدد تكرار أسئلة بين اختبارين
        let tries = 0;
        do {
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
            selectedQuestions = shuffle(selectedQuestions);

            // قارن مع آخر اختبار
            let common = 0;
            if (lastTestQs && lastTestQs.length > 0) {
                for (let q of selectedQuestions) {
                    if (lastTestQs.find(lq => lq.q === q.q)) common++;
                }
            }
            if (common <= MAX_COMMON) break;
            tries++;
        } while (tries < 20); // جرب 20 مرة فقط لتسريع الأداء

        return selectedQuestions;
    }

    // جلب بيانات الطفل
    const childNID = localStorage.getItem('childNID');
    const childName = localStorage.getItem('childName');
    const childAge = parseInt(localStorage.getItem('childAge')); // يجب التأكد من حفظ السن مسبقاً

    if (!childNID || !childName || isNaN(childAge)) {
        window.location.href = "index.html";
        return;
    }

    // عرض اسم الطفل
    document.getElementById('studentName').textContent = childName;

    // بنوك الأسئلة
    const easyQs = window.questionsBank && window.questionsBank.easy ? window.questionsBank.easy : [];
    const medQs = window.questionsBank && window.questionsBank.medium ? window.questionsBank.medium : [];
    const hardQs = window.questionsBank && window.questionsBank.hard ? window.questionsBank.hard : [];

    // استرجاع آخر اختبار (لو موجود) من localStorage
    let lastTestQs = [];
    try {
        lastTestQs = JSON.parse(localStorage.getItem('lastTestQs') || '[]');
    } catch { lastTestQs = []; }

    // توزيع الأسئلة حسب السن مع منع التشابه الكبير مع آخر اختبار
    let selectedQuestions = generateUniqueTest(easyQs, medQs, hardQs, lastTestQs, childAge);

    // خزن مجموعة الأسئلة الحالية في localStorage لاستخدامها في المقارنة لاحقاً
    localStorage.setItem('lastTestQs', JSON.stringify(selectedQuestions));

    // التحقق من كفاية الأسئلة
    if (selectedQuestions.length < 10) {
        document.getElementById('question-box').textContent = "لا يوجد عدد كافٍ من الأسئلة في بنك الأسئلة.";
        return;
    }

    const questions = selectedQuestions;

    // منع دخول الاختبار مرتين بنفس الرقم القومي
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

        // التصحيح
        if (selected === questions[current].answer) {
            score++;
        }

        // إظهار زر التالي
        document.getElementById('next-btn').style.display = "inline-block";
        document.getElementById('confirm-btn').disabled = true;
    }

    // عند الضغط على زر "السؤال التالي"
    document.getElementById('next-btn').onclick = function () {
        current++;
        if (current < questions.length) {
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
            <p>درجتك: ${score} من ${questions.length}</p>
            ${messageHTML}
        `;
    }
};
