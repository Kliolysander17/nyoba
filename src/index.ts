import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'

// 1. IMPORT (Panggil) aplikasi mini catatan yang baru kita buat
import catatanRoute from './routes/catatan'

const app = new Hono()
app.use('*', logger())

// 2. SAMBUNGKAN! Semua pengunjung ke '/catatan' akan diarahkan ke file catatanRoute
app.route('/catatan', catatanRoute)

// -- Sisa rute aslimu yang lain biarkan saja di sini --
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <title>Catatanku</title>
      <style>
        body { font-family: sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
        input { padding: 10px; width: 70%; border: 1px solid #ccc; border-radius: 4px; }
        button { padding: 10px 15px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        ul { list-style: none; padding: 0; }
        
        /* Modifikasi CSS agar tombol berada di sebelah kanan teks */
        li { background: #f4f4f4; margin-bottom: 8px; padding: 15px; border-radius: 4px; border-left: 5px solid #007bff; display: flex; justify-content: space-between; align-items: center; }
        .aksi-btn { display: flex; gap: 5px; }
        .btn-edit { background: #ffc107; color: black; padding: 5px 10px; }
        .btn-hapus { background: #dc3545; padding: 5px 10px; }
      </style>
    </head>
    <body>
      <h1>📝 Aplikasi Catatan Hono</h1>
      
      <form id="form-catatan">
        <input type="text" id="input-isi" placeholder="Tulis catatan baru di sini..." required>
        <button type="submit">Simpan</button>
      </form>

      <ul id="daftar-catatan">
        <li><i>Memuat catatan...</i></li>
      </ul>

      <script>
        const daftar = document.getElementById('daftar-catatan');
        const form = document.getElementById('form-catatan');
        const input = document.getElementById('input-isi');

        // 1. Fungsi Membaca Data (GET)
        async function muatCatatan() {
          const respons = await fetch('/catatan');
          const data = await respons.json();
          
          daftar.innerHTML = '';
          data.forEach(catatan => {
            // Menyuntikkan HTML baru yang dilengkapi tombol Edit dan Hapus
            daftar.innerHTML += \`
              <li>
                <span>\${catatan.isi}</span>
                <div class="aksi-btn">
                  <button class="btn-edit" onclick="editCatatan(\${catatan.id}, '\${catatan.isi}')">Edit</button>
                  <button class="btn-hapus" onclick="hapusCatatan(\${catatan.id})">Hapus</button>
                </div>
              </li>
            \`;
          });
        }

        // 2. Fungsi Menambah Data (POST)
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          await fetch('/catatan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isi: input.value })
          });
          input.value = '';
          muatCatatan(); 
        });

        // 3. Fungsi Mengubah Data (PUT)
        async function editCatatan(id, isiLama) {
          // Memunculkan kotak dialog bawaan browser untuk mengetik teks baru
          const teksBaru = prompt('Edit catatan kamu:', isiLama);
          
          // Jika tidak kosong dan isinya berubah, kirim ke server
          if (teksBaru && teksBaru.trim() !== '' && teksBaru !== isiLama) {
            await fetch('/catatan/' + id, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isi: teksBaru })
            });
            muatCatatan(); // Refresh tampilan
          }
        }

        // 4. Fungsi Menghapus Data (DELETE)
        async function hapusCatatan(id) {
          // Memunculkan kotak dialog konfirmasi penghapusan
          const yakin = confirm('Yakin ingin menghapus catatan ini?');
          if (yakin) {
            await fetch('/catatan/' + id, { method: 'DELETE' });
            muatCatatan(); // Refresh tampilan
          }
        }

        // Panggil fungsi saat web dibuka
        muatCatatan();
      </script>
    </body>
    </html>
  `)
})

app.get('/profil/:nama', (c) => {
  const namaPengguna = c.req.param('nama')
  return c.text(`Selamat datang di ${namaPengguna}!`)
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})