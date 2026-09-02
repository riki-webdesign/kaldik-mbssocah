<?php
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? $_GET['entity'] ?? null;

if (!$action) {
    echo json_encode([
        'status' => 'online',
        'app' => 'API Backend Pesantren Babusalam Socah',
        'endpoints' => [
            'events' => '/api/events.php',
            'announcements' => '/api/announcements.php',
            'prayer_times' => '/api/prayer_times.php',
            'attendance' => '/api/attendance.php',
            'notifications' => '/api/notifications.php'
        ]
    ]);
    exit();
}
?>
