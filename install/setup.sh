#!/bin/bash

# Função para mostrar a mensagem de uso
show_usage() {
    echo -e     "Uso: \n\n      curl -sSL <URL_DO_SEU_SCRIPT_DE_INSTALACAO> | sudo bash -s [-b <branchname>] <frontend_host> <email>\n\n"
    echo -e "Exemplo: \n\n      curl -sSL <URL_DO_SEU_SCRIPT_DE_INSTALACAO> | sudo bash -s rc-chat.exemplo.com.br email@exemplo.com.br\n\n"
}

# Função para mensagem em vermelho
echored() {
   echo -ne "  \033[41m\033[37m\033[1m"
   echo -n "  $1"
   echo -e "  \033[0m"
}

# Função para mensagem em azul
echoblue() {
   echo -ne "  \033[44m\033[37m\033[1m"
   echo -n "  $1"
   echo -e "  \033[0m"
}

# Verifica se está rodando usando o bash

if ! [ -n "$BASH_VERSION" ]; then
   echo "Este script deve ser executado como utilizando o bash\n\n" 
   show_usage
   exit 1
fi

# testa se pediu branch
if [ "$1" = "-b" ] ; then
   BRANCH=$2
   shift
   shift
fi

# Verifica se está rodando como root
if [[ $EUID -ne 0 ]]; then
   echo "Este script deve ser executado como root" 
   exit 1
fi

# Verifica se os parâmetros estão corretos
if [ -z "$2" ]; then
    show_usage
    exit 1
fi

emailregex="^[a-z0-9!#\$%&'*+/=?^_\`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_\`{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?\$"

# Atribui os valores dos parâmetros a variáveis
if [ -n "$3" ] ; then
    backend_host="$1"
    backend_path=""
    frontend_host="$2"
    email="$3"
else 
    backend_host="$1"
    backend_path="\\/backend"
    frontend_host="$1"
    email="$2"
fi

emailregex="^[a-z0-9!#\$%&'*+/=?^_\`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_\`{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?\$"
if ! [[ $email =~ $emailregex ]] ; then
    echo "email inválido"
    show_usage
    exit 1
fi

echo ""
echoblue "                                               "
echoblue "  RC-CHAT - Site oficial https://rc-chat.com   "
echoblue "                                               "
echoblue "  Contato Whatsapp: +55 49 99981 2291          "
echoblue "                    https://wa.me/554999812291 "
echoblue "                                               "

if [ "$BRANCH" = "" ] ; then
   echo ""
   echored "                                               "
   echored "  Você está instalando o RC-CHAT Opensource    "
   echored "                                               "
   echored "  O RC-CHAT Opensource é um sistema de código  "
   echored "  aberto, disponível gratuitamente a partir    "
   echored "  da página do projeto: https://rc-chat.com    "
   echored "                                               "
   echored "  O RC-CHAT Opensource não pode ser vendido!   "
   echored "                                               "
   echored "  Se alguém te cobrou algo por este sistema    "
   echored "  é recomendado que solicite reembolso por     "
   echored "  se tratar de uma cobrança indevida.          "
   echored "                                               "
   echored "  Por ser um sistema opensource você pode      "
   echored "  prosseguir com a instalação mesmo assim e    "
   echored "  conhecer o sistema.                          "
   echored "                                               "
   echored "  Aperte CTRL-C para cancelar                  "
   echored "                                               "
   echored "  A instalação irá prosseguir em 30 segundos   "
   echored "                                               "
   echo ""
   sleep 30
   echo "Prosseguindo..."
fi

# salva pasta atual
CURFOLDER=${PWD}

# Passo 1: Providencia uma VPS zerada e aponta os hostnames do teu DNS para ela
# Passo 2: Instala o docker / apenas se já não tiver instalado
which docker > /dev/null || curl -sSL https://get.docker.com | sh

# Passo 2.1: Autenticação no GHCR
# ATENÇÃO: O token abaixo concede acesso para baixar pacotes. NÃO COMPARTILHE ESTE ARQUIVO.
GH_USER="rodadecuia"
GH_PAT="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"

echo "Autenticando no ghcr.io..."
echo "$GH_PAT" | docker login ghcr.io -u "$GH_USER" --password-stdin
if [ $? -gt 0 ] ; then
    echored "Falha no login do Docker. Verifique seu usuário e PAT."
    exit 1
fi

# Passo 3: Baixa o projeto e entra na pasta
# CORREÇÃO: Clona o repositório RC-CHAT no diretório 'rc-chat'
[ -d rc-chat ] || git clone https://github.com/rodadecuia/RC-CHAT.git rc-chat
cd rc-chat
if ! git diff-index --quiet HEAD -- ; then
  echo "Salvando alterações locais com git stash push"
  git stash push &> /dev/null
fi

echo "Atualizando repositório"
git fetch

if [ -n "${BRANCH}" ] ; then
  echo "Alterando para a branch ${BRANCH}"
  if git rev-parse --verify ${BRANCH}; then
    git checkout ${BRANCH}
  else
    if ! git checkout --track origin/$BRANCH; then
      echo "Erro ao alternar para a branch ${BRANCH}"
      exit 1
    fi
  fi
fi

echo "Atualizando área de trabalho"
if ! git pull &> pull.log; then
  echo "Falha ao Atualizar repositório, verifique arquivo pull.log"
  echo -e "\n\nAlterações precisam ser verificadas manualmente, procure suporte se necessário\n\n"
  exit 1
fi

# Passo 4: Configura os hostnames
# Copia o .env.example e faz as substituições
cp .env.example .env

cat .env \
  | sed -e "s/^FRONTEND_HOST=.*/FRONTEND_HOST=$frontend_host/g" \
  | sed -e "s/^BACKEND_URL=.*/BACKEND_URL=https:\/\/$backend_host$backend_path/g" \
  | sed -e "s/^FRONTEND_URL=.*/FRONTEND_URL=https:\/\/$frontend_host/g" \
  | sed -e "s/^EMAIL_ADDRESS=.*/EMAIL_ADDRESS=$email/g" \
  | sed -e "s/^VIRTUAL_HOST=.*/VIRTUAL_HOST=$backend_host/g" \
  | sed -e "s/^LETSENCRYPT_HOST=.*/LETSENCRYPT_HOST=$backend_host/g" \
  | sed -e "s/^LETSENCRYPT_EMAIL=.*/LETSENCRYPT_EMAIL=$email/g" \
  > .env.tmp && mv .env.tmp .env

## Adiciona configurações específicas para o backend se o backend_path for vazio (host separado)
if [ -z "$backend_path" ] ; then
  cat >> .env << EOF
# Configurações para backend em host separado
BACKEND_HOST=$backend_host
BACKEND_PROTOCOL=https
EOF
fi

DIDRESTORE=""

## baixa todos os componentes
docker compose --profile acme pull

if [ -f ${CURFOLDER}/retrieved_data.tar.gz ]; then
   echo "Dados de importação encotrados, iniciando o processo de carga..."

   [ -d retrieve ] || mkdir retrieve
   cp ${CURFOLDER}/retrieved_data.tar.gz retrieve
   
   tmplog=/tmp/loadretrieved-$$-${RANDOM}
   echo "" | docker compose run --rm -T -v ${PWD}/retrieve:/retrieve backend &> ${tmplog}-retrieve.log
   
   if [ $? -gt 0 ] ; then
      echo -e "\n\nErro ao carregar dados de retrieved_data.tar.gz.\n\nLog de erros pode ser encontrado em ${tmplog}-retrieve.log\n\n"
      exit 1
   fi
   
   if [ -f ${CURFOLDER}/public_data.tar.gz ]; then
      echo "Encontrado arquivo com dados para a pasta public, iniciando processo de restauração..."
      
      # CORREÇÃO: Nome do volume Docker
      docker volume create --name rc-chat_backend_public &> ${tmplog}-createpublic.log
      
      if [ $? -gt 0 ]; then
         echo -e "\n\nErro ao criar volume public\n\nLog de erros pode ser encontrado em ${tmplog}-createpublic.log\n\n"
         exit 1
      fi
      
      # CORREÇÃO: Nome do volume Docker
      cat ${CURFOLDER}/public_data.tar.gz | docker run -i --rm -v rc-chat_backend_public:/public alpine ash -c "tar -xzf - -C /public" &> ${tmplog}-restorepublic.log

      if [ $? -gt 0 ]; then
         echo -e "\n\nErro ao restaurar volume public\n\nLog de erros pode ser encontrado em ${tmplog}-restorepublic.log\n\n"
         exit 1
      fi
      
   fi
   
   # Evita restaurar backup após carga de dados, embora pouco provável
   DIDRESTORE=1
fi

if ! [ "${DIDRESTORE}" ]; then
    # CORREÇÃO: Nome do arquivo de backup
    latest_backup_file=$(ls -t ${CURFOLDER}/rc-chat-backup-*.tar.gz 2>/dev/null | head -n 1)
fi

if [ -n "${latest_backup_file}" ] && ! [ -d "backups" ]; then
    echo "Backup encontrado. Preparando para restauração..."

    mkdir backups

    # Cria um link para o arquivo ou pasta de backup no diretório de instalação
    ln "${latest_backup_file}" backups/

    # Executa o sidekick restore
    echo "" | docker compose run --rm -T sidekick restore
    
    if [ $? -gt 0 ] ; then
      echo "Falha ao restaurar backup"
      exit 1
    fi
    
    DIDRESTORE=1
fi

echo "Continuando a instalação..."

# Passo 6: Sobe os containers
if ! ( docker compose --profile acme down && docker compose --profile acme up -d ); then
    echo "Falha ao reiniciar containers"
    echo -e "\n\nAlterações precisam ser verificadas manualmente, procure suporte se necessário\n\n"
    exit 1
fi

cat << EOF
A geração dos certificados e a inicialização do serviço pode levar
alguns minutos.

Após isso você pode acessar o RC-CHAT pela URL

        https://${frontend_host}
        
EOF

[ "${DIDRESTORE}" ] || cat << EOF

O login é ${email} e a senha é 123456

EOF

[ "${DIDRESTORE}" ] && cat << EOF

Dados foram restaurados, logins e senhas são as mesmas do sistema de origem.

EOF

echo "Removendo imagens anteriores..."
docker system prune -af &> /dev/null
