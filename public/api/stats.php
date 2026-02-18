<?php
require_once 'config.php';

$stats = [
    'total' => 0,
    'daIniziare' => 0,
    'inCorso' => 0,
    'finita' => 0,
    'sospese' => 0
];

$stmt = $pdo->query("SELECT status, COUNT(*) as count FROM folders GROUP BY status");
$rows = $stmt->fetchAll();

foreach ($rows as $row) {
    $stats['total'] += $row['count'];
    $status = $row['status'];
    
    if ($status === 'Da Iniziare' || $status === 'aperta') $stats['daIniziare'] += $row['count'];
    elseif ($status === 'In Corso') $stats['inCorso'] += $row['count'];
    elseif ($status === 'Finita' || $status === 'chiusa') $stats['finita'] += $row['count'];
    elseif ($status === 'Sospese' || $status === 'archiviata') $stats['sospese'] += $row['count'];
}

echo json_encode($stats);
?>