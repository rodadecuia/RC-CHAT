module.exports = (pool) => async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM connections ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
