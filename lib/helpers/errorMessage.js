const messages = {
  'unauthorized': 'Sesi login anda telah berakhir. Silahkan login kembali',
  'CAPTCHA is invalid.': 'Mohon periksa kembali kode Captcha yang anda masukan.',
  'user_inactive': 'Akun anda masih dalam peninjauan. Anda perlu mendapat persetujuan sebelum dapat mulai menggunakan sistem',
  'user_not_found': 'Mohon periksa kembali username atau kata sandi anda',
  'authorization code already consumed': 'Kode verifikasi telah kadaluarsa',
  'input_user_name': 'Masukkan nama user terlebih dahulu',
  'user_name_min_3': 'Nama user minimal 3 karakter',
  'select_upi_first': 'Pilih Nama UPI terlebih dahulu',
  'password_mismatch': 'Mohon periksa kembali username atau kata sandi anda.',
  'Nama permission sudah dipakai': 'Nama PERMISSION sudah dipakai, mohon ganti dengan nama yang lain.',
  'record_not_found': 'Maaf informasi dari data yang anda cari saat ini tidak tersedia didalam sistem.',
  'CTT Request Detail not found': 'Maaf informasi dari data yang anda cari saat ini tidak tersedia didalam sistem.',
  'record not found': 'Maaf informasi dari data yang anda cari saat ini tidak tersedia didalam sistem.',
  'Title sudah dipakai': 'Maaf judul (TITLE) yang anda tuliskan sudah terdaftar didalam Database, mohon ganti dengan yang lain.',
  'password_expired': 'password_expired',
  'password_exist': 'Anda sudah pernah menggunakan kata sandi ini sebelumnya, Mohon ganti kata sandi Anda.',
  'forbidden': 'Maaf anda tidak memiliki akses untuk melakukan Aksi ini, harap hubungi Administrator.',
  'limit_exceed': 'Anda melakukan terlalu banyak request. Mohon tunggu 30 detik.',
  'ip_not_valid': 'IP anda tidak Valid. Mohon melakukan Login ulang.',
  'ip_blocked': 'IP diblokir oleh Sistem. Mohon hubungi Administrator.',
  'browser_not_valid': 'Browser anda tidak Valid. Mohon melakukan Login ulang.',
  'validation_errors': 'Terjadi Kesalahan. Mohon periksa kembali inputan Anda!',
  'user_blocked': 'Akun diblokir oleh Sistem. Mohon hubungi Administrator.',
  'country_blocked': 'Anda mengakses dari Negara yang Tidak Diperbolehkan oleh Sistem. Mohon hubungi Administrator atau cek Koneksi VPN anda.',
  'already_requested': 'Anda telah melakukan Request sebelumnya, silahkan Cek Email anda.',
  'daily_quota_reach': 'Anda sudah mencapai kuota harian. Mohon menunggu hingga kuota harian direset pada hari berikutnya.',
  'No Agenda belum terbentuk, silahkan Create CTT terlebih dahulu': 'No Agenda belum terbentuk, silahkan Create CTT terlebih dahulu!',
  'duplikasi dibatalkan: data pada tahun target sudah ada untuk dir/div ini' : 'Duplikasi dibatalkan: Data pada tahun target sudah ada untuk Direktorat/Divisi ini.',
  'data already approved, cannot be updated' : 'Data sudah disetujui, tidak dapat diperbarui.',
  'unknown role' : 'Akun anda tidak memiliki akses untuk melakukan aksi ini, periksa role anda atau hubungi Administrator.',
  'Master Primer title already exists' : 'Judul Master Primer sudah ada, mohon ganti dengan yang lain.',
  'no data rows in xlsx file' : 'Tidak ada baris data dalam file .xlsx yang diunggah.',
};

export const errorMessage = (msg) =>
  {
    if (msg?.includes("Anda mencoba terlalu banyak.")) {
      return msg;
    }
    return messages[msg] || 'Sedang terjadi gangguan pada sistem. Mohon coba kembali atau hubungi Administrator';
  }
