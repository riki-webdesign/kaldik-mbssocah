<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM prayer_times ORDER BY id ASC");
            $times = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $times]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
    case 'PUT':
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Format data tidak valid']);
            exit();
        }

        try {
            $pdo->beginTransaction();
            $pdo->exec("TRUNCATE TABLE prayer_times");

            $stmt = $pdo->prepare("INSERT INTO prayer_times (name, arabicName, time, icon) VALUES (:name, :arabicName, :time, :icon)");
            foreach ($data as $item) {
                $stmt->execute([
                    ':name' => $item['name'],
                    ':arabicName' => $item['arabicName'],
                    ':time' => $item['time'],
                    ':icon' => $item['icon']
                ]);
            }
            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => 'Jadwal shalat berhasil diperbarui']);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
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
