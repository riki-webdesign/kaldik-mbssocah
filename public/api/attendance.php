<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM attendance ORDER BY created_at DESC");
            $records = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $records]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!$data || !isset($data['id']) || !isset($data['santriName'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
            exit();
        }

        try {
            $sql = "INSERT INTO attendance (id, santriName, nis, className, status, date, activityName, notes)
                    VALUES (:id, :santriName, :nis, :className, :status, :date, :activityName, :notes)
                    ON DUPLICATE KEY UPDATE
                    santriName = VALUES(santriName), nis = VALUES(nis), className = VALUES(className),
                    status = VALUES(status), date = VALUES(date), activityName = VALUES(activityName), notes = VALUES(notes)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $data['id'],
                ':santriName' => $data['santriName'],
                ':nis' => $data['nis'] ?? '-',
                ':className' => $data['className'] ?? '-',
                ':status' => $data['status'] ?? 'Hadir',
                ':date' => $data['date'] ?? date('Y-m-d'),
                ':activityName' => $data['activityName'] ?? 'Absensi Kegiatan',
                ':notes' => $data['notes'] ?? ''
            ]);

            echo json_encode(['status' => 'success', 'message' => 'Absensi berhasil disimpan']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        break;
}
?>
