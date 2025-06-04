window.onload = function() {
    const childNID = localStorage.getItem('childNID');
    const childName = localStorage.getItem('childName');
    if (!childNID || !childName) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById('studentName').textContent = childName;

    const easyQs = window.questionsBank && window.questionsBank.easy ? window.questionsBank.easy : [];
    const medQs  = window.questionsBank && window.questionsBank.medium ? window.questionsBank.medium : [];
    const hardQs = window.questionsBank && window.questionsBank.hard ? window.questionsBank.hard : [];

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

    let childAge = 0;
    try {
        const nid = childNID;
        const birthYear = nid[0] === '3'
            ? parseInt('20' + nid.slice(1,3))
            : parseInt('19' + nid.slice(1,3));
        const currentYear = new Date().getFullYear();
        childAge = currentYear - birthYear;
    } catch(e) {}

    let dist = {easy: 8, medium: 2, hard: 0};
    if (childAge >= 7 && childAge <= 8) dist = {easy: 6, medium: 3, hard: 1};
    else if (childAge >= 9) dist = {easy: 5, medium: 3, hard: 2};

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

    let current = 0;
    let userAnswers = [];
    let score = 0;
    let timer;
    let timeLeft = 30;
    let selectedOption = -1;

    function showQuestion() {
        clearInterval(timer);
        timeLeft = 30;
        document.getElementById('timer').textContent = timeLeft;
        startTimer();

        const q = questions[current];
        document.getElementById('question-box').textContent = q.q;

        const optionsBox = document.getElementById('options-box');
        optionsBox.innerHTML = "";
        selectedOption = -1;
        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.type = "button";
            btn.className = "option-btn";
            btn.textContent = opt;
            btn.onclick = function () {
                Array.from(optionsBox.children).forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedOption = idx;
                document.getElementById('confirm-btn').disabled = false;
            };
            optionsBox.appendChild(btn);
        });

        document.getElementById('confirm-btn').disabled = true;
        document.getElementById('next-btn').style.display = "none";
    }

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

    document.getElementById('confirm-btn').onclick = function () {
        lockAnswer();
    };

    function lockAnswer() {
        clearInterval(timer);

        // تعطيل كل الأزرار
        Array.from(document.querySelectorAll('.option-btn')).forEach(btn => btn.disabled = true);

        userAnswers.push(selectedOption);

        const correct = typeof questions[current].correct !== "undefined" ? questions[current].correct : questions[current].answer;
        if (selectedOption === correct) {
            score++;
        }

        // إبراز الألوان
        Array.from(document.querySelectorAll('.option-btn')).forEach((btn, idx) => {
            if(idx === correct) btn.style.background = "#d4f7d4";
            if(idx === selectedOption && selectedOption !== correct) btn.style.background = "#ffd3d3";
        });

        // إذا كان آخر سؤال: غيّر الزر إلى "إنهاء المسابقة"
        if(current === 9){
            document.getElementById('next-btn').textContent = "إنهاء المسابقة";
        } else {
            document.getElementById('next-btn').textContent = "السؤال التالي";
        }
        document.getElementById('next-btn').style.display = "inline-block";
        document.getElementById('confirm-btn').disabled = true;
    }

    document.getElementById('next-btn').onclick = function () {
        current++;
        if (current < 10) {
            showQuestion();
        } else {
            showResult();
        }
    };

    // دالة لحفظ النتيجة محليًا (LocalStorage)
    function saveResultLocally(name, nid, score) {
        let results = JSON.parse(localStorage.getItem('localResults') || "[]");
        results.push({
            name: name,
            nid: nid,
            score: score,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('localResults', JSON.stringify(results));
    }

    // دالة لتحميل النتائج كملف CSV
    window.downloadResultsCSV = function() {
        let results = JSON.parse(localStorage.getItem('localResults') || "[]");
        if(results.length === 0) {
            alert("لا توجد بيانات محفوظة بعد.");
            return;
        }
        let csv = "الاسم,الرقم القومي,الدرجة,التاريخ\n";
        results.forEach(r => {
            csv += `"${r.name}","${r.nid}","${r.score}","${r.date}"\n`;
        });
        let blob = new Blob([csv], {type: 'text/csv'});
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = "quiz_results.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    function showResult() {
        document.querySelector('.quiz-content').style.display = "none";
        const resultBox = document.getElementById('result-box');
        resultBox.style.display = "block";

        // حفظ النتيجة محليًا
        saveResultLocally(childName, childNID, score);

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

        // إضافة زر تحميل النتائج بعد ظهور النتيجة فقط
        resultBox.innerHTML = `
            <h2>انتهت المسابقة!</h2>
            <p>درجتك: ${score} من 10</p>
            ${messageHTML}
            <button onclick="downloadResultsCSV()" style="margin-top:20px;padding:10px 20px;font-size:1.05em;border-radius:8px;background:#1976d2;color:#fff;border:none;cursor:pointer;">تحميل كل النتائج (CSV)</button>
        `;
    }

    // عرض أول سؤال عند البداية
    showQuestion();
};
