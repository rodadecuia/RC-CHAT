# RC-CHAT

## Sobre o projeto

RC-CHAT é um comunicador com recursos de CRM e helpdesk que utiliza o WhatsApp como meio de comunicação com os clientes.

## Objetivo

Este projeto tem por objetivo melhorar e manter abertas as atualizações sobre o RC-CHAT SaaS publicado, com foco principal na qualidade da aplicação e na facilidade de instalação e utilização.

## Guia de Instalação e Atualização

Este guia descreve como instalar e atualizar o RC-CHAT em um servidor de forma automatizada. O script é inteligente e interativo, cuidando de toda a configuração do ambiente.

### Pré-requisitos

1.  **Um Servidor (VPS):** Uma máquina virtual limpa com uma distribuição Linux recente. **Ubuntu 22.04 LTS** é recomendado.
2.  **Registros DNS Configurados:** Você precisa que o domínio (ou subdomínio) que você vai usar para o sistema esteja apontando para o endereço de IP do seu servidor.
3.  **Acesso Root:** O script precisa ser executado com privilégios de superusuário (`sudo`).

### Processo de Instalação (Primeira Vez)

A instalação é feita em 2 passos simples:

#### 1º Passo: Baixar o Script de Instalação

Conecte-se ao seu servidor via SSH e baixe o script de instalação com o seguinte comando:

```sh
<<<<<<< Updated upstream
<<<<<<< Updated upstream
curl -sSLO https://raw.githubusercontent.com/rodadecuia/RC-CHAT/main/install/setup.sh
=======
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/stable/install/setup.sh | sudo bash -s -- [opções] <host_frontend> <email>
>>>>>>> Stashed changes
=======
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/stable/install/setup.sh | sudo bash -s -- [opções] <host_frontend> <email>
>>>>>>> Stashed changes
```

#### 2º Passo: Executar o Assistente de Instalação

Dê permissão de execução ao script e rode-o com `sudo`. O script irá iniciar um assistente interativo que fará as perguntas necessárias para configurar o sistema.

```sh
<<<<<<< Updated upstream
<<<<<<< Updated upstream
chmod +x setup.sh
sudo ./setup.sh
=======
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/stable/install/setup.sh | sudo bash -s -- rc-chat.meudominio.com admin@meudominio.com
>>>>>>> Stashed changes
=======
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/stable/install/setup.sh | sudo bash -s -- rc-chat.meudominio.com admin@meudominio.com
>>>>>>> Stashed changes
```

O assistente irá perguntar sobre:
-   O modo de domínio (único ou separado para backend/frontend).
-   Os nomes dos domínios.
-   Seu e-mail (para o certificado SSL).
-   A versão a ser instalada (Produção ou Beta).
-   A origem das imagens (GitHub ou Docker Hub).

Após confirmar as configurações, o script cuidará de todo o resto.

### Como Atualizar uma Instalação Existente

Manter seu sistema atualizado é ainda mais fácil.

Basta executar o mesmo comando no seu servidor (não é necessário baixar o script novamente se você já o tem):

```sh
<<<<<<< Updated upstream
<<<<<<< Updated upstream
sudo ./setup.sh
=======
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/stable/install/setup.sh | sudo bash -s -- --beta rc-chat.meudominio.com admin@meudominio.com
>>>>>>> Stashed changes
=======
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/stable/install/setup.sh | sudo bash -s -- --beta rc-chat.meudominio.com admin@meudominio.com
>>>>>>> Stashed changes
```

O script irá detectar sua instalação existente, ler suas configurações atuais e baixar as últimas imagens para atualizar o sistema, preservando todos os seus dados.

#### Forçando Mudanças na Atualização

Você pode usar flags para mudar a versão ou a origem das imagens durante uma atualização.

**Exemplo 1: Mudar para a versão Beta**
```sh
<<<<<<< Updated upstream
<<<<<<< Updated upstream
sudo ./setup.sh --beta
=======
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/stable/install/setup.sh | sudo bash -s -- --dockerhub rc-chat.meudominio.com admin@meudominio.com
>>>>>>> Stashed changes
=======
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/stable/install/setup.sh | sudo bash -s -- --dockerhub rc-chat.meudominio.com admin@meudominio.com
>>>>>>> Stashed changes
```

**Exemplo 2: Mudar para usar imagens do Docker Hub**
```sh
<<<<<<< Updated upstream
<<<<<<< Updated upstream
sudo ./setup.sh --dockerhub
=======
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/stable/install/setup.sh | sudo bash -s -- --beta --dockerhub rc-chat.meudominio.com admin@meudominio.com
>>>>>>> Stashed changes
=======
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/stable/install/setup.sh | sudo bash -s -- --beta --dockerhub rc-chat.meudominio.com admin@meudominio.com
>>>>>>> Stashed changes
```

### O que o Script Faz?

1.  **Detecta o Modo:** Verifica se é uma nova instalação ou uma atualização.
2.  **Coleta Informações:** Faz perguntas (na 1ª vez) ou lê o `.env` (nas atualizações).
3.  **Instala Dependências:** Garante que Docker e Git estão instalados.
4.  **Configura o Ambiente:** Baixa os arquivos `docker-compose.yml` e `.env` e os configura corretamente.
5.  **Baixa as Imagens Docker:** Puxa a versão correta (`latest` ou `beta`) da origem correta (`GHCR` ou `Docker Hub`).
6.  **Inicia os Serviços:** Sobe todos os contêineres necessários usando `docker compose`.
7.  **Gera Certificados SSL:** Configura o Nginx Proxy para obter certificados SSL/TLS gratuitos e renová-los automaticamente.

Após a conclusão, o sistema estará acessível na URL fornecida. Em uma nova instalação, a senha padrão é `123456`.

## Rodando o projeto a partir do Código Fonte (Desenvolvimento)

Para a instalação de desenvolvimento, é necessário ter o Docker Community Edition e o cliente Git instalados. [O guia oficial de instalação do Docker pode ser encontrado aqui](https://docs.docker.com/engine/install/).

Primeiro, clone o repositório:

```bash
git clone https://github.com/rodadecuia/RC-CHAT.git
cd rc-chat
```

### Rodando localmente

Por padrão, a configuração está ajustada para executar o sistema apenas no próprio computador. Para executar em uma rede local, é necessário editar o arquivo `.env` e alterar os endereços de backend e frontend de `localhost` para o IP desejado (ex: `192.168.0.10`).

Para executar o sistema em modo de desenvolvimento local, use o seguinte comando:

```bash
docker compose --profile local up -d
```

Na primeira execução, o sistema vai inicializar os bancos de dados e tabelas, e após alguns minutos o RC-CHAT estará acessível pela porta 3000. O usuário padrão é `admin@rc-chat.host` e a senha padrão é `123456`.

A aplicação irá se reiniciar automaticamente a cada reboot do servidor. Para interromper a execução, use o comando:

```bash
docker compose --profile local down
```

### Rodando e servindo na internet (Desenvolvimento)

Tendo um servidor acessível pela internet, é necessário ajustar dois nomes de DNS a sua escolha, um para o backend e outro para o frontend, e também um endereço de email para cadastro dos certificados, por exemplo:

*   **backend:** `api.rc-chat.exemplo.com.br`
*   **frontend:** `rc-chat.exemplo.com.br`
*   **email:** `rc-chat@exemplo.com.br`

É necessário editar o arquivo `.env` definindo neles estes valores. Se desejar utilizar reCAPTCHA na inscrição de empresas, também é necessário inserir as chaves secretas e de site no arquivo `.env`.

Estando na pasta raiz do projeto, execute o seguinte comando para iniciar o serviço:

```bash
sudo docker compose --profile acme up -d
```

Na primeira execução, o Docker irá fazer a compilação do código e criação dos contêineres. Esta operação pode levar bastante tempo. Depois disso, o RC-CHAT estará acessível pelo endereço fornecido para o frontend.

O usuário padrão será o endereço de email fornecido na configuração do arquivo `.env` e a senha padrão é `123456`.

Para encerrar o serviço, utilize o seguinte comando:

```bash
sudo docker compose --profile acme down
```

## Aviso Importante

Este projeto não é afiliado à Meta, WhatsApp ou qualquer outra empresa. A utilização do código fornecido é de responsabilidade exclusiva dos usuários e não implica em qualquer responsabilidade para o autor ou colaboradores do projeto.
