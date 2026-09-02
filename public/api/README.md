# 📖 Panduan Upload & Migrasi Backend ke Niagahoster (cPanel)

Panduan ini digunakan untuk memindahkan database & backend dari **Firebase** ke **Niagahoster (MySQL + PHP)** agar bebas dari limit kuota harian.

---

## 🛠️ LANGKAH 1: Buat Database MySQL di cPanel Niagahoster

1. Login ke **cPanel Niagahoster** Anda.
2. Cari dan buka menu **MySQL® Databases** (atau **Database Wizard**).
3. Buat Database baru, misalnya: `u1234567_agenda_db`
4. Buat User Database baru, misalnya: `u1234567_agenda_user` dengan password pilihan Anda.
5. Hubungkan User tersebut ke Database dan centang **ALL PRIVILEGES** (Semua Izin).
6. Catat 3 data berikut:
   - **Nama Database**: `u1234567_agenda_db`
   - **Username Database**: `u1234567_agenda_user`
   - **Password Database**: `(password yang Anda buat)`

---

## 🗄️ LANGKAH 2: Import Tabel Data (database.sql)

1. Kembali ke cPanel, lalu buka menu **phpMyAdmin**.
2. Pilih nama database yang baru Anda buat di panel sebelah kiri.
3. Klik tab **Import** di bagian atas menu phpMyAdmin.
4. Klik tombol **Choose File / Browse**, lalu pilih file `database.sql` yang ada di dalam folder ini.
5. Scroll ke bawah dan klik tombol **Go / Kirim**.
6. Selesai! Tabel `events`, `announcements`, `prayer_times`, `notifications`, dan `attendance` beserta data awal agenda pesantren otomatis terisi.

---

## ⚙️ LANGKAH 3: Setting Kredensial Database di `config.php`

1. Buka file `config.php` dengan Text Editor (Notepad, VS Code, atau Edit di File Manager cPanel).
2. Ubah bagian kredensial sesuai data di Langkah 1:

```php
$db_host = 'localhost';
$db_name = 'u1234567_agenda_db';    // Ganti dengan Nama Database cPanel Anda
$db_user = 'u1234567_agenda_user';  // Ganti dengan Username Database cPanel Anda
$db_pass = 'PasswordRahasia123!';  // Ganti dengan Password Database cPanel Anda
```
3. Simpan file `config.php`.

---

## 📂 LANGKAH 4: Upload File API ke cPanel

1. Buka menu **File Manager** di cPanel Niagahoster.
2. Masuk ke folder **`public_html`**.
3. Buat folder baru bernama **`api`** (sehingga jalurnya menjadi `public_html/api`).
4. Upload semua file PHP berikut ke dalam folder `public_html/api/`:
   - `config.php`
   - `events.php`
   - `announcements.php`
   - `prayer_times.php`
   - `notifications.php`
   - `attendance.php`
   - `index.php`

   *Sekarang API backend Anda dapat diakses melalui browser di: `https://domain-anda.com/api/events.php`*

---

## 🖥️ LANGKAH 5: Publish Website React ke Niagahoster

1. Di komputer Anda, jalankan perintah build proyek React:
   ```bash
   npm run build
   ```
2. Upload seluruh isi di dalam folder `dist/` hasil build ke dalam folder `public_html` di cPanel Niagahoster Anda.
3. Buat file `.htaccess` di folder `public_html` dengan isi:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

🎉 **Selamat! Website & Database Agenda Pesantren Babusalam Anda sekarang 100% berjalan mandiri di server Niagahoster!**
