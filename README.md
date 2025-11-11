# RC-CHAT

## Sobre o projeto

RC-CHAT é um comunicador com recursos de CRM e helpdesk que utiliza o WhatsApp como meio de comunicação com os clientes.

## Objetivo

Este projeto tem por objetivo melhorar e manter abertas as atualizações sobre o RC-CHAT SaaS publicado, com foco principal na qualidade da aplicação e na facilidade de instalação e utilização.

## Guia de Instalação Automatizada

Este guia descreve como instalar o RC-CHAT em um servidor de forma automatizada usando nosso script de instalação. O script cuida da configuração do ambiente, do Docker e da inicialização dos serviços.

### Pré-requisitos

Antes de executar o script, certifique-se de que você tem:

1.  **Um Servidor (VPS):** Uma máquina virtual limpa com uma distribuição Linux recente. **Ubuntu 22.04 LTS** é recomendado.
2.  **Registros DNS Configurados:** Você precisa que o domínio (ou subdomínio) que você vai usar para o sistema esteja apontando para o endereço de IP do seu servidor. Por exemplo, se você vai acessar o sistema em `rc-chat.meudominio.com`, crie um **registro DNS do tipo A** para `rc-chat.meudominio.com` apontando para o IP do seu servidor.
3.  **Acesso Root:** O script precisa ser executado com privilégios de superusuário (`sudo`).

### Comando de Instalação

Para iniciar a instalação, conecte-se ao seu servidor via SSH e execute o seguinte comando. Ele irá baixar e executar o script de instalação diretamente.

```sh
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/main/install/setup.sh | sudo bash -s [opções] <host_frontend> <email>
```

#### Parâmetros Obrigatórios

-   `<host_frontend>`: O domínio principal que você usará para acessar o sistema. Ex: `rc-chat.meudominio.com`.
-   `<email>`: Seu endereço de e-mail. Ele será usado para o login inicial e para gerar os certificados de segurança SSL/TLS com Let's Encrypt.

#### Opções (Flags)

Você pode personalizar a instalação usando as seguintes flags opcionais:

| Flag          | Descrição                                                                                                                            |
| :------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| `--beta`      | Instala a versão de testes (`beta`) em vez da versão estável (`latest`). Ideal para testar novos recursos antes de irem para produção. |
| `--dockerhub` | Puxa as imagens Docker do **Docker Hub** (`rodadecuiaapp`) em vez do registro padrão do **GitHub** (`ghcr.io/rodadecuia`).            |
| `--branch`    | (Avançado) Faz o checkout de uma branch específica do repositório Git antes da instalação. Útil para desenvolvedores.                 |

### Exemplos de Uso

Aqui estão alguns exemplos para os cenários mais comuns.

#### 1. Instalação Padrão (Produção)

Esta é a instalação recomendada para a maioria dos usuários. Ela usa a imagem `latest` (estável) do registro do GitHub (GHCR).

```sh
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/main/install/setup.sh | sudo bash -s rc-chat.meudominio.com admin@meudominio.com
```

#### 2. Instalação da Versão Beta

Para testar as funcionalidades mais recentes que ainda estão em desenvolvimento.

```sh
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/main/install/setup.sh | sudo bash -s --beta rc-chat.meudominio.com admin@meudominio.com
```

#### 3. Instalação Usando o Docker Hub

Caso o registro do GitHub (GHCR) esteja indisponível ou você prefira usar o Docker Hub.

```sh
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/main/install/setup.sh | sudo bash -s --dockerhub rc-chat.meudominio.com admin@meudominio.com
```

#### 4. Instalação da Versão Beta a partir do Docker Hub

Você pode combinar as flags para cenários mais específicos.

```sh
curl -sSL https://raw.githubusercontent.com/rodadecuia/RC-CHAT/main/install/setup.sh | sudo bash -s --beta --dockerhub rc-chat.meudominio.com admin@meudominio.com
```

### O que o Script Faz?

1.  **Verifica o Ambiente:** Garante que Docker e Git estão instalados.
2.  **Clona ou Atualiza o Repositório:** Baixa a versão mais recente do código do RC-CHAT.
3.  **Configura o Ambiente:** Cria o arquivo `.env` com base nos domínios e e-mail que você forneceu.
4.  **Baixa as Imagens Docker:** Puxa as imagens corretas (`latest` ou `beta`) do registro correto (`GHCR` ou `Docker Hub`) com base nas flags que você usou.
5.  **Inicia os Serviços:** Sobe todos os contêineres necessários (backend, frontend, banco de dados, etc.) usando `docker compose`.
6.  **Gera Certificados SSL:** Configura o Nginx Proxy para obter certificados SSL/TLS gratuitos e renová-los automaticamente.

Após a conclusão, o sistema estará acessível na URL fornecida. O login inicial será o e-mail informado e a senha padrão é `123456`.

### Como Atualizar uma Instalação Existente

Para atualizar sua instalação para a versão mais recente, **basta executar o mesmo comando de instalação que você usou originalmente**. O script é inteligente e irá:

1.  Puxar a versão mais recente do código do repositório Git.
2.  Baixar as imagens Docker mais recentes (`latest` ou `beta`).
3.  Reiniciar os contêineres com a nova versão.

Seus dados e configurações no banco de dados serão preservados.

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
