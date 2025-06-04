// مثال بيانات الاختبار (عدلها حسب نتائج تطبيقك أو اجمعها بشكل ديناميكي)
const testResults = [
  { name: "أحمد", score: 8, time: "2025-06-04 21:00" },
  { name: "سارة", score: 10, time: "2025-06-04 21:05" },
  // أضف النتائج هنا أو اربطها من التطبيق
];

// دالة لتحويل البيانات إلى صيغة CSV
function toCSV(data) {
  if (!data.length) return '';
  const header = Object.keys(data[0]).join(",");
  const rows = data.map(row => Object.values(row).join(","));
  return [header, ...rows].join("\n");
}

// دالة لتحميل ملف CSV
function downloadCSV() {
  const csvContent = toCSV(testResults);
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "results.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// إذا أردت ربط الدالة بزر في HTML استخدم التالي في صفحتك:
// <button onclick="downloadCSV()">تحميل النتائج كملف CSV</button>
