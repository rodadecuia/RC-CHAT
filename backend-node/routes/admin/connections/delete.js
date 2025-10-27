module.exports = (pool) => async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM connections WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
