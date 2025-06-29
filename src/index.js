require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const { getClient, initializeDatabase } = require('./database');
const { loggerMiddleware, winstonLogger } = require('./logger');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// CRUD Endpoints

// GET - lista usuários
app.get('/usuarios', async (req, res) => {
  try {
    const client = await getClient();
    const result = await client.query('SELECT * FROM usuarios ORDER BY id');
    await client.end();
    res.json(result.rows);
  } catch (err) {
    winstonLogger.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// GET - busca usuário por ID
app.get('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await getClient();
    const result = await client.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    await client.end();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    winstonLogger.error('Erro ao buscar usuário:', err);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// POST - cria usuário
app.post('/usuarios', async (req, res) => {
  const { nome, email } = req.body;
  
  // Validação básica
  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

  try {
    const client = await getClient();
    const result = await client.query(
      'INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING *',
      [nome, email]
    );
    await client.end();
    res.status(201).json({ 
      message: 'Usuário criado com sucesso',
      usuario: result.rows[0]
    });
  } catch (err) {
    winstonLogger.error('Erro ao criar usuário:', err);
    if (err.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Email já cadastrado' });
    } else {
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }
});

// PUT - atualiza usuário
app.put('/usuarios/:id', async (req, res) => {
  const { nome, email } = req.body;
  const { id } = req.params;

  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

  try {
    const client = await getClient();
    const result = await client.query(
      'UPDATE usuarios SET nome=$1, email=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3 RETURNING *',
      [nome, email, id]
    );
    await client.end();
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ 
      message: 'Usuário atualizado com sucesso',
      usuario: result.rows[0]
    });
  } catch (err) {
    winstonLogger.error('Erro ao atualizar usuário:', err);
    if (err.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Email já cadastrado' });
    } else {
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }
});

// DELETE - remove usuário
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await getClient();
    const result = await client.query('DELETE FROM usuarios WHERE id=$1 RETURNING *', [id]);
    await client.end();
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ 
      message: 'Usuário excluído com sucesso',
      usuario: result.rows[0]
    });
  } catch (err) {
    winstonLogger.error('Erro ao excluir usuário:', err);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

// Endpoint para testar logs
app.get('/test-log', (req, res) => {
  winstonLogger.info('Endpoint de teste acessado');
  res.json({ 
    message: 'Log de teste enviado!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint para testar banco de dados
app.get('/test-db', async (req, res) => {
  try {
    const client = await getClient();
    
    // Testar conexão
    await client.query('SELECT NOW()');
    
    // Verificar se a tabela existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (!tableExists) {
      // Criar tabela
      await client.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    
    await client.end();
    
    res.json({ 
      message: 'Teste de banco de dados',
      database_connected: true,
      table_exists: tableExists,
      table_created: !tableExists,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    winstonLogger.error('Erro no teste de banco:', err);
    res.status(500).json({ 
      error: 'Erro no teste de banco de dados',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota base
app.get('/', (req, res) => {
  res.json({ 
    message: 'API P2 - Integração e Entrega Contínua',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      usuarios: '/usuarios',
      docs: '/api-docs',
      health: '/health',
      testLog: '/test-log'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  winstonLogger.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

const port = process.env.PORT || 3000;

// Inicializar aplicação
async function startServer() {
  try {
    // Inicializar banco de dados
    await initializeDatabase();
    
    // Iniciar servidor
    app.listen(port, () => {
      console.log(`🚀 API rodando na porta ${port}`);
      console.log(`📚 Documentação: http://localhost:${port}/api-docs`);
      console.log(`🧪 Teste de log: http://localhost:${port}/test-log`);
      console.log(`❤️ Health check: http://localhost:${port}/health`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

startServer();