<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) die('No data');
    $line = [
        $data['name'] ?? '',
        $data['nid'] ?? '',
        $data['score'] ?? '',
        date('Y-m-d H:i:s')
    ];
    $file = 'results.csv';
    $writeHeader = !file_exists($file);
    $f = fopen($file, 'a');
    if ($writeHeader) {
        fputcsv($f, ['الاسم','الرقم القومي','الدرجة','التاريخ']);
    }
    fputcsv($f, $line);
    fclose($f);
    echo json_encode(['success'=>true]);
} else {
    echo "Invalid request";
}
?>
