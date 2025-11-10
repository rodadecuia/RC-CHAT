# RC-CHAT

## English

### About the Project

RC-CHAT is a communicator with CRM and helpdesk features that utilizes WhatsApp as a means of communication with clients.

### Objective

The objective of this project is to improve and keep open updates about the published RC-CHAT SaaS. Mainly focused on application quality and ease of installation and use.

### Very Quick Start on a public Server

There are Docker images provided from the project, so you can get **RC-CHAT** to work very easily on a public server (baremetal or VPS).

#### First setup

Before starting you must complete this checklist:

- [ ] Have a clean server running Ubuntu 20 or newer
- [ ] Ports 80 and 443 available and not filtered by firewall
- [ ] One hostname with configured DNS pointing to your server

After this, just log in to your server and issue the following command, replacing the hostnames you already configured and your email address:

```bash
curl -sSL <URL_DO_SEU_SCRIPT_DE_INSTALACAO> | sudo bash -s app.example.com name@example.com
```

After a few minutes you will have the server running at the hostname you defined.

The default login will be the email address provided in the installation command and the default password is `123456`, you must change it right away.

#### Upgrade

The upgrade is just easy as the instalation, you just need to login to your server using the same username you used on the installation and issue the following command:

```bash
curl -sSL <URL_DO_SEU_SCRIPT_DE_ATUALIZACAO> | sudo bash
```

Your server will go down and after some minutes it will be running in the latest released version.

#### Inspect logs

As all elements are running in containers the logs must be checked through the docker command.

You must login to your server using the same user you used for the installation.

First you need to move the current directory to the installation folder:

```bash
cd ~/rc-chat-docker-acme
```

After this you can get a full log report with the following command:

```bash
docker compose logs -t
```

If you want to "tail follow" the logs just add a `-f` parameter to that command:

```bash
docker compose logs -t -f

```

### Running from Source code Using Docker

For installation, you need to have Docker Community Edition and the Git client installed. It is ideal to find the best way to install these resources on your preferred operating system. [The official Docker installation guide can be found here](https://docs.docker.com/engine/install/).

In both cases, it is necessary to clone the repository, then open a command terminal:

```bash
git clone https://github.com/<SEU_USUARIO>/rc-chat.git
cd rc-chat
```

### Running Locally

By default, the configuration is set to run the system only on the local computer. To run it on a local network, you need to edit the `.env` file and change the backend and frontend addresses from `localhost` to the desired IP, for example, `192.168.0.10`.

To run the system, simply execute the following command:

```bash
docker compose --profile local up -d
```

On the first run, the system will initialize the databases and tables, and after a few minutes, RC-CHAT will be accessible through port 3000.

The default username is `admin@rc-chat.host`, and the default password is 123456.

The application will restart automatically after each server reboot.

Execution can be stopped with the command:

```bash
docker compose --profile local down
```

### Running and Serving on the Internet

Having a server accessible via the internet, it is necessary to adjust two DNS names of your choice, one for the backend and another for the frontend, and also an email address for certificate registration, for example:

* **backend:** api.rc-chat.example.com
* **frontend:** rc-chat.example.com
* **email:** rc-chat@example.com

You need to edit the `.env` file, defining these values in them.

If you want to use reCAPTCHA in the company signup, you also need to insert the secret and site keys in the `.env` file.

This guide assumes that the terminal is open and logged in with a regular user who has permission to use the `sudo` command to execute commands as root.

Being in the project's root folder, execute the following command to start the service:

```bash
sudo docker compose --profile acme up -d
```

On the first run, Docker will compile the code and create the containers, and then RC-CHAT will initialize the databases and tables. This operation can take quite some time, after which RC-CHAT will be accessible at the provided frontend address.

The default username is the email address provided on the `.env` file and the default password is 123456.

The application will restart automatically after each server reboot.

To terminate the service, use the following command:

```bash
sudo docker compose --profile acme down
```

### Important Notice

This project is not affiliated with Meta, WhatsApp, or any other company. The use of the provided code is the sole responsibility of the users and does not imply any liability for the author or project collaborators.

---

## Português

### Sobre o projeto

RC-CHAT é um comunicador com recursos de CRM e helpdesk que utiliza
Whatsapp como meio de comunicação com os clientes.

### Objetivo

Este projeto tem por objetivo melhorar e manter abertas as atualizações sobre o RC-CHAT
SaaS publicado. Principalmente direcionadas à qualidade da aplicação e à
facilidade de instalação e utilização.

### Início Muito Rápido em um Servidor Público

Existem imagens Docker fornecidas pelo projeto, então você pode fazer o **RC-CHAT** funcionar muito facilmente em um servidor público (baremetal ou VPS).

#### Primeira configuração

Antes de começar, você deve completar esta lista de verificação:

- [ ] Ter um servidor limpo rodando Ubuntu 20 ou mais recente
- [ ] Portas 80 e 443 disponíveis e não filtradas pelo firewall
- [ ] Um nome de host com DNS configurado apontando para o seu servidor

Após isso, basta fazer login no seu servidor e emitir o seguinte comando, substituindo os nomes de host que você já configurou e seu endereço de email:

```bash
curl -sSL <URL_DO_SEU_SCRIPT_DE_INSTALACAO> | sudo bash -s app.exemplo.com nome@exemplo.com
```

Após alguns minutos, você terá o servidor rodando no nome que você deu para o host.

O login padrão é o endereço de email fornecido no comando de instalação e a senha padrão é `123456`, você deve alterá-la imediatamente.

#### Atualização

A atualização é tão fácil quanto a instalação, você só precisa fazer login no seu servidor usando o mesmo nome de usuário que você usou na instalação e emitir o seguinte comando:

```bash
curl -sSL <URL_DO_SEU_SCRIPT_DE_ATUALIZACAO> | sudo bash
```

Seu servidor ficará fora do ar e após alguns minutos ele estará rodando na última versão lançada.

#### Inspecionar logs

Como todos os elementos estão rodando em containers, os logs devem ser verificados através do comando docker.

Você deve fazer login no seu servidor usando o mesmo usuário que você usou para a instalação.

Primeiro você precisa mover o diretório atual para a pasta de instalação:

```bash
cd ~/rc-chat-docker-acme
```

Após isso, você pode obter um relatório completo de logs com o seguinte comando:

```bash
docker compose logs -t
```

Se você quiser "seguir" os logs em tempo real, basta adicionar um parâmetro `-f` a esse comando:

```bash
docker compose logs -t -f
```

### Rodando o projeto a partir do Código Fonte usando Docker:

Para a
instalação é necessário ter o Docker Community Edition e o cliente Git
instalados. O ideal é buscar a melhor forma de instalar estes recursos no
sistema operacional de sua preferência. [O guia oficial de instalação do
Docker pode ser encontrado aqui](https://docs.docker.com/engine/install/).


Em ambos os casos é necessário clonar o repositório, necessário então abrir
um terminal de comandos:

```bash
git clone https://github.com/<SEU_USUARIO>/rc-chat.git
cd rc-chat
```

### Rodando localmente

Por padrão a configuração está ajustada para executar o sistema apenas no
próprio computador. Para executar em uma rede local é necessário editar o
arquivo `.env` e alterar os endereços
de backend e frontend de `localhost` para o ip desejado, por exemplo
`192.168.0.10`

Para executar o sistema basta executar o comando abaixo:

```bash
docker compose --profile local up -d
```

Na primeira execução o sistema vai inicializar os bancos de dados e tabelas,
e após alguns minutos o RC-CHAT estará acessível pela porta 3000

O usuário padrão é `admin@rc-chat.host` e a senha padrão é `123456`

A aplicação irá se reiniciar automaticamente a cada reboot do servidor.

A execução pode ser interrompida com o comando:

```bash
docker compose --profile local down
```


### Rodando e servindo na internet

Tendo um servidor acessível pela internet, é necessário ajustar dois nomes
de DNS a sua escolha, um para o backend e outro para o frontend, e também um
endereço de email para cadastro dos certificados, por exemplo:

* **backend:** api.rc-chat.exemplo.com.br
* **frontend:** rc-chat.exemplo.com.br
* **email:** rc-chat@exemplo.com.br

É necessário editar o arquivo `.env`
definindo neles estes valores.

Se desejar utilizar reCAPTCHA na inscrição de empresas também é necessário
inserir as chaves secretas e de site no arquivo `.env`.

Este guia presume que o terminal está aberto e logado com um usuário comum
que tem permissão para utilizar o comando `sudo` para executar comandos como
root.

Estando então na pasta raiz do projeto, executa-se o seguinte comando para
iniciar o serviço:

```bash
sudo docker compose --profile acme up -d
```

Na primeira execução o Docker irá fazer a compilação do código e criação dos
conteiners, e após isso o RC-CHAT vai inicializar os bancos de dados e
tabelas. Esta operação pode levar bastante tempo, depois disso o RC-CHAT
estará acessível pelo endereço fornecido para oo frontend.

O usuário padrão será o endereço de email fornecido na configuração do arquivo `.env` e a senha padrão é `123456`

A aplicação irá se reiniciar automaticamente a cada reboot do servidor.

Para encerrar o serviço utiliza-se o seguinte comando:

```bash
sudo docker compose --profile acme down
```

### Aviso Importante

Este projeto não está afiliado à Meta, WhatsApp ou qualquer outra empresa.
A utilização do código fornecido é de responsabilidade exclusiva dos usuários
e não implica em qualquer responsabilidade para o autor ou colaboradores do projeto.
