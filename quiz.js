window.onload = function() {
    // تحقق من وجود بيانات الطفل
    const childNID = localStorage.getItem('childNID');
    const childName = localStorage.getItem('childName');
    if (!childNID || !childName) {
        window.location.href = "index.html";
        return;
    }

    // عرض اسم الطفل
    document.getElementById('studentName').textContent = childName;

    // تحديد بنك الأسئلة المناسب (يمكنك تغيير المنطق حسب السن مثلاً)
    const questions = window.questionsBank && window.questionsBank.easy ? window.questionsBank.easy : [];
    if (!questions || questions.length === 0) {
        document.getElementById('question-box').textContent = "لا توجد أسئلة متاحة. تأكد من تحميل بنك الأسئلة بشكل صحيح.";
        return;
    }

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
        if (current < 10) {
            showQuestion();
        } else {
            showResult();
        }
    };

    // إظهار النتيجة النهائية
    function showResult() {
        document.querySelector('.quiz-content').style.display = "none";
        const resultBox = document.getElementById('result-box');
        resultBox.style.display = "block";
        resultBox.innerHTML = `<h2>انتهت المسابقة!</h2>
            <p>أحسنت يا ${childName}!</p>
            <p>درجتك: ${score} من 10</p>`;
    }

    // ابدأ الامتحان
    showQuestion();
};
