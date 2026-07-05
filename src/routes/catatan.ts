import { Hono } from 'hono'
import Database from 'better-sqlite3'

// 1. Membuat "Aplikasi Mini" khusus untuk catatan
const catatan = new Hono()

// 2. Membuka brankas database
const db = new Database('data.db')

// Rute GET: Mengambil data
// Perhatikan: Rutenya sekarang cukup '/' saja, tidak perlu '/catatan' lagi
catatan.get('/', (c) => {
  const semuaCatatan = db.prepare('SELECT * FROM catatan').all()
  return c.json(semuaCatatan)
})

// Rute POST: Menambah data
catatan.post('/', async (c) => {
  const body = await c.req.json()
  if (!body.isi || body.isi.trim() === '')
    return c.json({
      pesan: 'Catatan harus memiliki isi!'
    }, 400) 
  const operasi = db.prepare('INSERT INTO catatan (isi) VALUES (?)').run(body.isi)
  return c.json({ pesan: 'Catatan berhasil disimpan!', id_baru: operasi.lastInsertRowid })
})

// Rute PUT: Mengubah data
catatan.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const operasi = db.prepare('UPDATE catatan SET isi = ? WHERE id = ?').run(body.isi, id)
  
  if (operasi.changes === 0) return c.json({ pesan: 'Catatan tidak ditemukan!' }, 404)
  return c.json({ pesan: 'Catatan berhasil diperbarui!' })
})

// Rute DELETE: Menghapus data
catatan.delete('/:id', (c) => {
  const id = c.req.param('id')
  const operasi = db.prepare('DELETE FROM catatan WHERE id = ?').run(id)
  
  if (operasi.changes === 0) return c.json({ pesan: 'Catatan tidak ditemukan!' }, 404)
  return c.json({ pesan: 'Catatan berhasil dihapus!' })
})

// 3. Mengekspor "Aplikasi Mini" ini agar bisa dipakai di file utama
export default catatan