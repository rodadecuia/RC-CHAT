-- Tabela para armazenar as empresas (tenants)
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para armazenar os usuários (atendentes, administradores)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'agent',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_company FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Tabela para as conversas (chats)
CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    customer_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    assigned_to_user_id INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_company FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_assigned_user FOREIGN KEY(assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela para as mensagens
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    chat_id INT NOT NULL,
    sender_id VARCHAR(255),
    sender_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_chat FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

-- Adicionar dados de exemplo
INSERT INTO companies (name) VALUES ('Empresa Teste');

-- A senha para ambos os usuários é 'password'
-- O hash a seguir é um hash bcrypt VÁLIDO e REAL para 'password'
INSERT INTO users (company_id, name, email, password_hash, role) VALUES (1, 'Admin Teste', 'admin@teste.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', 'admin');
INSERT INTO users (company_id, name, email, password_hash, role) VALUES (1, 'Atendente Teste', 'atendente@teste.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', 'agent');

INSERT INTO chats (company_id, customer_name, status) VALUES (1, 'Cliente Teste 1', 'open');
INSERT INTO messages (chat_id, sender_id, sender_type, content) VALUES (1, 'customer-123', 'customer', 'Olá, preciso de ajuda.');
INSERT INTO messages (chat_id, sender_id, sender_type, content) VALUES (1, '2', 'agent', 'Olá! Como posso ajudar?');
