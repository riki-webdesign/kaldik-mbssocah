<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM announcements ORDER BY date DESC");
            $items = $stmt->fetchAll();
            foreach ($items as &$item) {
                $item['isImportant'] = (bool)$item['isImportant'];
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

        if (!$data || !isset($data['id']) || !isset($data['title']) || !isset($data['content'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
            exit();
        }

        try {
            $sql = "INSERT INTO announcements (id, title, category, date, content, author, isImportant)
                    VALUES (:id, :title, :category, :date, :content, :author, :isImportant)
                    ON DUPLICATE KEY UPDATE
                    title = VALUES(title), category = VALUES(category), date = VALUES(date),
                    content = VALUES(content), author = VALUES(author), isImportant = VALUES(isImportant)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $data['id'],
                ':title' => $data['title'],
                ':category' => $data['category'] ?? 'Informasi',
                ':date' => $data['date'] ?? date('Y-m-d'),
                ':content' => $data['content'],
                ':author' => $data['author'] ?? 'Sekretariat Pesantren',
                ':isImportant' => !empty($data['isImportant']) ? 1 : 0
            ]);

            echo json_encode(['status' => 'success', 'message' => 'Pengumuman berhasil disimpan']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            $id = $data['id'] ?? null;
        }

        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID pengumuman wajib dikirim']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM announcements WHERE id = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(['status' => 'success', 'message' => 'Pengumuman berhasil dihapus']);
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
