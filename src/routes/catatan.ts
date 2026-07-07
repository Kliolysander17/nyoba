import { Hono } from 'hono'
import { createClient } from '@libsql/client' // 1. Senjata baru kita!

const catatan = new Hono()

const db = createClient({
  url: 'libsql://website-nyoba-kliolysander17.aws-ap-northeast-1.turso.io',    
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM0MDYzNDMsImlkIjoiMDE5ZjNiMzYtNDMwMS03NzY2LTg1ZmMtZjFkNjQ2NDk1ZDgzIiwia2lkIjoiSlZiWGRlTWhPZUVtMDlmQnlYM1lFVERNb2c2Sk8yTVk2cnd5NnMzZUNVUSIsInJpZCI6IjI3YzI0OTgwLWVlYzEtNGRjZS1hNTA5LWJjMTliMGI0YmZhNyJ9.lWqrnrhfOTSMhEGT8ZZISdMwSOExB7SLHPRgBRw4u6yV-aHn9WI2AD4cYlHp2opYzP-CtpYnuIZkswnagwc1CA' 
})

db.execute(`
  CREATE TABLE IF NOT EXISTS catatan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isi TEXT
  )
`)

catatan.get('/', async (c) => {
  const hasil = await db.execute('SELECT * FROM catatan')
  return c.json(hasil.rows) 
})

catatan.post('/', async (c) => {
  const body = await c.req.json()
  
  if (!body.isi || body.isi.trim() === '') {
    return c.json({ pesan: 'Ditolak: Isi catatan tidak boleh kosong!' }, 400)
  }

  const operasi = await db.execute({
    sql: 'INSERT INTO catatan (isi) VALUES (?)',
    args: [body.isi]
  })

  return c.json({ 
    pesan: 'Catatan sukses disimpan di Cloud!', 
    id_baru: Number(operasi.lastInsertRowid) 
  })
})

catatan.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const operasi = await db.execute({
    sql: 'UPDATE catatan SET isi = ? WHERE id = ?',
    args: [body.isi, id]
  })

  if (operasi.rowsAffected === 0) return c.json({ pesan: 'Catatan tidak ditemukan!' }, 404)
  return c.json({ pesan: 'Catatan berhasil diperbarui di Cloud!' })
})

catatan.delete('/:id', async (c) => {
  const id = c.req.param('id')
  
  const operasi = await db.execute({
    sql: 'DELETE FROM catatan WHERE id = ?',
    args: [id]
  })
  
  if (operasi.rowsAffected === 0) return c.json({ pesan: 'Catatan tidak ditemukan!' }, 404)
  return c.json({ pesan: 'Catatan berhasil dihapus dari Cloud!' })
})

export default catatan