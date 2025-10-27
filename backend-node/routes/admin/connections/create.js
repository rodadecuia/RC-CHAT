module.exports = (pool) => async (req, res) => {
  const { company_id, name, channel_type, credentials } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO connections (company_id, name, channel_type, credentials) VALUES ($1, $2, $3, $4) RETURNING *',
      [company_id, name, channel_type, credentials]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
