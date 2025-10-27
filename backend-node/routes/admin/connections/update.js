module.exports = (pool) => async (req, res) => {
  const { id } = req.params;
  const { name, status, credentials } = req.body;
  try {
    const result = await pool.query(
      'UPDATE connections SET name = $1, status = $2, credentials = $3 WHERE id = $4 RETURNING *',
      [name, status, credentials, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Conexão não encontrada.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
