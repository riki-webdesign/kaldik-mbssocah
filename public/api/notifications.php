<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM notifications ORDER BY created_at DESC");
            $items = $stmt->fetchAll();
            foreach ($items as &$item) {
                $item['read'] = (bool)$item['read'];
            }
            echo json_encode(['status' => 'success', 'data' => $items]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!$data || !isset($data['id']) || !isset($data['title'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
            exit();
        }

        try {
            $sql = "INSERT INTO notifications (id, title, message, timestamp, `read`, category)
                    VALUES (:id, :title, :message, :timestamp, :read, :category)
                    ON DUPLICATE KEY UPDATE
                    title = VALUES(title), message = VALUES(message), timestamp = VALUES(timestamp),
                    `read` = VALUES(`read`), category = VALUES(category)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $data['id'],
                ':title' => $data['title'],
                ':message' => $data['message'] ?? '',
                ':timestamp' => $data['timestamp'] ?? 'Baru saja',
                ':read' => !empty($data['read']) ? 1 : 0,
                ':category' => $data['category'] ?? 'system'
            ]);

            echo json_encode(['status' => 'success', 'message' => 'Notifikasi disimpan']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Mark all read
        try {
            $pdo->exec("UPDATE notifications SET `read` = 1");
            echo json_encode(['status' => 'success', 'message' => 'Semua notifikasi ditandai dibaca']);
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
