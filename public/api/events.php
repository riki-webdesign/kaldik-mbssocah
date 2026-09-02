<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM events ORDER BY startDate ASC");
            $events = $stmt->fetchAll();
            // Cast boolean fields
            foreach ($events as &$evt) {
                $evt['isDone'] = (bool)$evt['isDone'];
                if (isset($evt['allDay'])) $evt['allDay'] = (bool)$evt['allDay'];
            }
            echo json_encode(['status' => 'success', 'data' => $events]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!$data || !isset($data['id']) || !isset($data['title']) || !isset($data['startDate'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap (id, title, startDate wajib)']);
            exit();
        }

        try {
            $endDate = (!empty($data['endDate'])) ? $data['endDate'] : null;
            $startTime = (!empty($data['startTime'])) ? $data['startTime'] : null;
            $endTime = (!empty($data['endTime'])) ? $data['endTime'] : null;
            $speakerOrTeacher = (!empty($data['speakerOrTeacher'])) ? $data['speakerOrTeacher'] : null;

            $sql = "INSERT INTO events (id, title, category, startDate, endDate, startTime, endTime, location, description, speakerOrTeacher, isDone) 
                    VALUES (:id, :title, :category, :startDate, :endDate, :startTime, :endTime, :location, :description, :speakerOrTeacher, :isDone)
                    ON DUPLICATE KEY UPDATE 
                    title = VALUES(title), category = VALUES(category), startDate = VALUES(startDate), endDate = VALUES(endDate),
                    startTime = VALUES(startTime), endTime = VALUES(endTime), location = VALUES(location), description = VALUES(description),
                    speakerOrTeacher = VALUES(speakerOrTeacher), isDone = VALUES(isDone)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $data['id'],
                ':title' => $data['title'],
                ':category' => $data['category'] ?? 'formal',
                ':startDate' => $data['startDate'],
                ':endDate' => $endDate,
                ':startTime' => $startTime,
                ':endTime' => $endTime,
                ':location' => !empty($data['location']) ? $data['location'] : 'Pondok Pesantren Babusalam Socah',
                ':description' => $data['description'] ?? '',
                ':speakerOrTeacher' => $speakerOrTeacher,
                ':isDone' => !empty($data['isDone']) ? 1 : 0
            ]);

            echo json_encode(['status' => 'success', 'message' => 'Agenda berhasil disimpan']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!$data || !isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID agenda wajib dikirim']);
            exit();
        }

        try {
            $fields = [];
            $params = [':id' => $data['id']];
            
            $allowed = ['title', 'category', 'startDate', 'endDate', 'startTime', 'endTime', 'location', 'description', 'speakerOrTeacher', 'isDone'];
            foreach ($allowed as $f) {
                if (array_key_exists($f, $data)) {
                    $fields[] = "`$f` = :$f";
                    $val = $data[$f];
                    if (in_array($f, ['endDate', 'startTime', 'endTime', 'speakerOrTeacher']) && ($val === '' || $val === null)) {
                        $val = null;
                    }
                    if ($f === 'isDone') {
                        $val = !empty($val) ? 1 : 0;
                    }
                    $params[":$f"] = $val;
                }
            }

            if (empty($fields)) {
                echo json_encode(['status' => 'success', 'message' => 'Tidak ada field yang diubah']);
                exit();
            }

            $sql = "UPDATE events SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            echo json_encode(['status' => 'success', 'message' => 'Agenda berhasil di-update']);
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
            echo json_encode(['status' => 'error', 'message' => 'ID agenda wajib dikirim']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM events WHERE id = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(['status' => 'success', 'message' => 'Agenda berhasil dihapus']);
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
