# Guia de Configuração da Integração com WHMCS

Este documento detalha os passos necessários para configurar a integração completa entre o RC-CHAT e o seu painel WHMCS, incluindo a automação de faturas e o login unificado (SSO) para seus clientes.

## Visão Geral

A integração permite que o RC-CHAT:
1.  **Automatize o Status do Cliente:** Ative, suspenda ou cancele o acesso de um cliente no RC-CHAT com base no status do serviço dele no WHMCS.
2.  **Login Unificado (SSO):** Permita que seus clientes façam login no RC-CHAT usando o e-mail e a senha do **produto/serviço** que eles contrataram no WHMCS.
3.  **Sincronize Planos:** Garanta que o plano do cliente no RC-CHAT corresponda sempre ao plano que ele pagou no WHMCS.

## Passo 1: Configuração no RC-CHAT (`.env`)

A primeira etapa é configurar as variáveis de ambiente no arquivo `.env` do seu RC-CHAT (localizado em `/opt/rc-chat/.env`).

Abra o arquivo e preencha a seção `#-- Integração WHMCS --#` com os seguintes dados:

```ini
#-- Integração WHMCS --#
WHMCS_API_URL=https://seu-dominio-whmcs.com/includes/api.php
WHMCS_API_IDENTIFIER=seu_api_identifier
WHMCS_API_SECRET=seu_api_secret
WHMCS_PANEL_URL=https://seu-dominio-whmcs.com/admin/supporttickets.php?action=viewticket&id=
WHMCS_WEBHOOK_TOKEN=SuaSenhaSecretaParaOWebhook
```

#### Onde encontrar cada informação:

-   `WHMCS_API_URL`: A URL da API do seu WHMCS. Geralmente, é o seu domínio WHMCS seguido de `/includes/api.php`.
-   `WHMCS_API_IDENTIFIER` e `WHMCS_API_SECRET`:
    1.  No seu painel WHMCS, vá para **Setup > Staff Management > Manage API Credentials**.
    2.  Crie um novo "API Credential".
    3.  Associe a um usuário administrador.
    4.  Copie o "Identifier" e o "Secret" gerados.
-   `WHMCS_PANEL_URL`: (Opcional) Usado para criar links diretos para tickets.
-   `WHMCS_WEBHOOK_TOKEN`: **Crie uma senha forte e segura**. Ela será usada para validar os webhooks. Ex: `senha_forte_!@#$_2025`.

## Passo 2: Mapeamento de Planos (Crucial para o SSO)

Para que a sincronização de planos e o login funcionem, você precisa conectar os planos do RC-CHAT com os produtos do WHMCS.

1.  No seu painel de administrador do RC-CHAT, vá para a seção de **Planos**.
2.  Para cada plano que você deseja integrar (ex: "Básico", "Premium"), edite-o.
3.  Preencha o campo **"ID do Produto no WHMCS"** com o ID do produto correspondente no seu WHMCS. Você pode encontrar o ID do produto em **Setup > Products/Services > Products/Services** no seu WHMCS.

Este mapeamento é o que permite ao RC-CHAT saber qual plano ativar para um cliente quando ele faz login ou quando um pagamento é confirmado.

## Passo 3: Configuração de Webhooks no WHMCS

Os webhooks são a forma como o WHMCS notifica o RC-CHAT sobre eventos importantes (como pagamentos e cancelamentos) em tempo real.

1.  No seu painel WHMCS, vá para **Setup > Developer Tools > Webhooks**.
2.  Clique em **"Add New Webhook"**.
3.  **Nome:** Dê um nome, como "Integração RC-CHAT".
4.  **Endpoint URL:** Coloque a URL do seu RC-CHAT, seguida do caminho do webhook.
    ```
    https://seu-dominio-rchat.com/webhooks/whmcs
    ```
    *(Substitua `seu-dominio-rchat.com` pelo seu domínio real)*
5.  **Secret:** Cole aqui **exatamente a mesma senha** que você definiu em `WHMCS_WEBHOOK_TOKEN` no seu arquivo `.env`.
6.  **Eventos:** Marque os eventos que você deseja que notifiquem o RC-CHAT. Os mais importantes são:
    -   `InvoicePaid`: Quando uma fatura é paga.
    -   `AfterModuleCreate`: Quando um novo serviço é ativado.
    -   `AfterModuleSuspend`: Quando um serviço é suspenso.
    -   `AfterModuleUnsuspend`: Quando um serviço é reativado.
    -   `AfterModuleTerminate`: Quando um serviço é cancelado.
7.  Salve o Webhook.

## Passo 4: Configurar o Login do Cliente

Para que o login unificado funcione, você precisa garantir que:

1.  **O Cliente Tenha uma Senha no Serviço:**
    -   No WHMCS, ao visualizar o produto/serviço de um cliente, há campos para "Username" e "Password".
    -   O RC-CHAT usará o **e-mail do cliente** como nome de usuário e a **senha definida neste campo** para autenticação.
    -   Certifique-se de que seus clientes saibam qual senha usar.

2.  **O `whmcsClientId` esteja no RC-CHAT:**
    -   No painel de administrador do RC-CHAT, ao editar uma `Company` (Empresa), há um campo chamado **"WHMCS Client ID"**.
    -   Este campo **precisa ser preenchido** com o ID do cliente correspondente no WHMCS para que o login funcione.

Com essas configurações, seu sistema estará totalmente integrado, automatizando o gerenciamento de clientes e simplificando a experiência de login.
