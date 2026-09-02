<?php
/**
 * Konfigurasi Database MySQL untuk Niagahoster (cPanel)
 * Pondok Pesantren Babusalam Socah
 */

// Headers CORS agar aplikasi React dapat mengakses API ini dari mana saja
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Mengabaikan pre-flight request OPTIONS dari browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// =============================================================================
-- UBAH KREDENSIAL DI BAWAH INI SESUAI DATABASE NIAGAHOSTER ANDA
// =============================================================================
$db_host = 'localhost';
$db_name = 'namauser_agendadb';    // Ubah sesuai nama database di cPanel Niagahoster
$db_user = 'namauser_agendauser';  // Ubah sesuai username database di cPanel
$db_pass = 'PasswordRahasia123!';  // Ubah sesuai password database di cPanel

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
} catch (PDOException $e) {
    // Jika koneksi gagal, kembalikan JSON error yang jelas
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Koneksi ke Database MySQL Niagahoster Gagal: ' . $e->getMessage()
    ]);
    exit();
}
?>
