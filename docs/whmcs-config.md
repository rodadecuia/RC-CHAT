# Guia de Configuração da Integração com WHMCS

Este documento detalha os passos necessários para configurar a integração completa entre o RC-CHAT e o seu painel WHMCS, incluindo a automação de faturas, o login unificado (SSO) para seus clientes e a sincronização de tickets.

## Visão Geral

A integração permite que o RC-CHAT:
1.  **Automatize o Status do Cliente:** Ative, suspenda ou cancele o acesso de um cliente no RC-CHAT com base no status do serviço dele no WHMCS.
2.  **Login Unificado (SSO):** Permita que seus clientes façam login no RC-CHAT usando o e-mail da sua conta WHMCS e a senha do **produto/serviço** que eles contrataram no WHMCS.
3.  **Sincronize Planos:** Garanta que o plano do cliente no RC-CHAT corresponda sempre ao plano que ele pagou no WHMCS.
4.  **Criação Automática de Empresas:** Se um cliente WHMCS tentar fazer login e a empresa correspondente ainda não existir no RC-CHAT, o sistema a criará automaticamente.
5.  **Sincronização de Tickets (RC-CHAT -> WHMCS):** Ao fechar um ticket no RC-CHAT, o sistema pode automaticamente adicionar o histórico da conversa ao ticket correspondente no WHMCS e fechá-lo.

## Passo 1: Configuração no RC-CHAT (`.env`)

A primeira etapa é configurar as variáveis de ambiente no arquivo `.env` do seu RC-CHAT (localizado em `/opt/rc-chat/.env`).

Abra o arquivo e preencha a seção `#-- Integração WHMCS --#` com os seguintes dados:

```ini
#-- Integração WHMCS --#
WHMCS_API_URL=https://seu-dominio-whmcs.com/includes/api.php
WHMCS_API_IDENTIFIER=seu_api_identifier
WHMCS_API_SECRET=seu_api_secret
WHMCS_PANEL_URL=https://seu-dominio-whmcs.com/admin/supporttickets.php?action=viewticket&id=
```

#### Onde encontrar cada informação:

-   `WHMCS_API_URL`: A URL da API do seu WHMCS. Geralmente, é o seu domínio WHMCS seguido de `/includes/api.php`.
-   `WHMCS_API_IDENTIFIER` e `WHMCS_API_SECRET`:
    1.  No seu painel WHMCS, vá para **Setup > Staff Management > Manage API Credentials**.
    2.  Crie um novo "API Credential".
    3.  Associe a um usuário administrador.
    4.  Copie o "Identifier" e o "Secret" gerados.
-   `WHMCS_PANEL_URL`: (Opcional) Usado para criar links diretos para tickets.

## Passo 2: Permissões da API e Webhooks

Para que a integração funcione corretamente, você precisa garantir que as credenciais de API e os webhooks no WHMCS tenham as permissões necessárias.

### Permissões da API

Ao criar as credenciais de API no WHMCS (Passo 1), certifique-se de que o "Role" associado a elas tenha permissão para as seguintes ações:

-   `AddTicketReply`: Para adicionar o histórico de conversas aos tickets.
-   `UpdateTicket`: Para fechar tickets no WHMCS.
-   `UpdateClient`: Para atualizar o status do cliente (ativo, inativo, etc.).
-   `GetClientsProducts`: Para buscar os produtos/serviços de um cliente e sincronizar o plano e a data de vencimento.
-   `GetClientsDetails`: Para buscar os detalhes de um cliente (nome, e-mail, etc.).
-   `AddClient`: Para criar um novo cliente no WHMCS se ele não existir.
-   `OpenTicket`: Para abrir um novo ticket no WHMCS a partir do RC-CHAT.

### Eventos de Webhook (Opcional, para automação completa)

Se você deseja que o WHMCS notifique o RC-CHAT sobre eventos de faturamento e serviço, configure um webhook com os seguintes eventos:

1.  No seu painel WHMCS, vá para **Setup > Developer Tools > Webhooks**.
2.  Crie um novo webhook e aponte para a URL: `https://seu-dominio-rchat.com/api/webhooks/whmcs`.
3.  Na seção de eventos, marque:
    -   `InvoicePaid`: Para reativar o serviço no RC-CHAT quando uma fatura é paga.
    -   `AfterModuleCreate`: Para ativar um novo serviço no RC-CHAT.
    -   `AfterModuleSuspend`: Para suspender o serviço no RC-CHAT.
    -   `AfterModuleUnsuspend`: Para reativar o serviço no RC-CHAT.
    -   `AfterModuleTerminate`: Para cancelar o serviço no RC-CHAT.

## Passo 3: Mapeamento de Planos (Crucial para o SSO)

Para que a sincronização de planos e o login funcionem, você precisa conectar os planos do RC-CHAT com os produtos do WHMCS.

1.  No seu painel de administrador do RC-CHAT, vá para a seção de **Planos**.
2.  Para cada plano que você deseja integrar (ex: "Básico", "Premium"), edite-o.
3.  Preencha o campo **"ID do Produto no WHMCS"** com o ID do produto correspondente no seu WHMCS. Você pode encontrar o ID do produto em **Setup > Products/Services > Products/Services** no seu WHMCS.

Este mapeamento é o que permite ao RC-CHAT saber qual plano ativar para um cliente quando ele faz login ou quando um pagamento é confirmado.

## Passo 4: Ativar a Integração de Tickets

Para ativar a sincronização de tickets do RC-CHAT para o WHMCS:

1.  No seu painel de administrador do RC-CHAT, vá para **Configurações**.
2.  Na seção **Serviços Externos**, encontre a opção **"Conectar ticket com WHMCS"**.
3.  Mude a opção para **"Ativado"**.

Com essa opção ativada, sempre que um ticket vinculado a um cliente WHMCS for fechado no RC-CHAT, o sistema irá automaticamente adicionar o histórico da conversa ao ticket correspondente no WHMCS e fechá-lo.

## Passo 5: Configurar o Login do Cliente

Para que o login unificado funcione, você precisa garantir que:

1.  **O Cliente Tenha uma Senha no Serviço:**
    -   No WHMCS, ao visualizar o produto/serviço de um cliente, há campos para "Username" e "Password".
    -   O RC-CHAT usará o **e-mail do cliente** como nome de usuário e a **senha definida neste campo** para autenticação.
    -   Certifique-se de que seus clientes saibam qual senha usar.

2.  **Criação Automática de Empresas no RC-CHAT:**
    -   Com a nova funcionalidade, se um cliente WHMCS tentar fazer login e a empresa correspondente ainda não existir no RC-CHAT, o sistema a criará automaticamente.
    -   O nome da empresa será obtido dos detalhes do cliente no WHMCS.
    -   Um usuário administrador padrão será criado para essa nova empresa, usando o e-mail do cliente WHMCS e uma senha aleatória.
    -   O plano da empresa será associado com base no "ID do Produto no WHMCS" configurado nos planos do RC-CHAT.

## Passo 6: Usando o Protocolo do WHMCS nas Mensagens

Com a integração ativa, você pode usar o ID do ticket do WHMCS como número de protocolo nas mensagens automáticas do RC-CHAT.

Para isso, use a variável `{{protocolo}}` ou `{{whmcsTicketId}}` nas suas mensagens de saudação, transferência, etc.

**Exemplo:**

Na configuração de uma fila, você pode definir a mensagem de saudação como:

`"Olá! Seu atendimento foi registrado com o protocolo #{{protocolo}}."`

Se o ticket estiver vinculado a um ticket do WHMCS, a variável será substituída pelo ID do ticket do WHMCS. Caso contrário, ela usará o ID interno do ticket do RC-CHAT.

Com essas configurações, seu sistema estará totalmente integrado, automatizando o gerenciamento de clientes e simplificando a experiência de login.
