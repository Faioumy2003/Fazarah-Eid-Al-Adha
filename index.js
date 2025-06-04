const SHEET_API = "https://script.google.com/macros/s/XXXXXXXXXXXX/exec"; // ضع رابط الـ WebApp هنا

document.querySelector('.entry-form').onsubmit = async function(e) {
    e.preventDefault();
    const nid = document.getElementById('nid').value.trim();
    const name = document.getElementById('fullName').value.trim();

    // تحقق من Google Sheet (محاولة مُسبقة)
    const res = await fetch(SHEET_API, {
        method: "POST",
        body: JSON.stringify({nid, name}),
        headers: {'Content-Type': 'application/json'}
    });
    const result = await res.json();
    if (result.exists) {
        alert("لقد شاركت بالفعل ولا يمكنك دخول الامتحان مرة أخرى.");
        return false;
    }

    // سجل بيانات الطفل محليًا
    localStorage.setItem('childName', name);
    localStorage.setItem('childNID', nid);
    window.location.href = "quiz.html";
};