#!/bin/bash

# Função para mostrar a mensagem de uso
show_usage() {
    echo -e "Uso: \n"
    echo -e "  curl -sSL <URL_DO_SCRIPT> | sudo bash -s -- [opções] <frontend_host> <email>\n"
    echo -e "Opções:"
    echo -e "  --beta                  Instala a versão experimental (tag 'beta')."
    echo -e "  --dockerhub             Usa as imagens do Docker Hub em vez do GitHub (ghcr.io)."
    echo -e "  --branch <branchname>   Faz checkout de uma branch específica do repositório git.\n"
    echo -e "Exemplos: \n"
    echo -e "  Instalação Padrão (Produção do GHCR):"
    echo -e "    curl -sSL <URL_DO_SCRIPT> | sudo bash -s -- rc-chat.exemplo.com.br email@exemplo.com.br\n"
    echo -e "  Instalação da Versão Beta (do GHCR):"
    echo -e "    curl -sSL <URL_DO_SCRIPT> | sudo bash -s -- --beta rc-chat.exemplo.com.br email@exemplo.com.br\n"
    echo -e "  Instalação Padrão (do Docker Hub):"
    echo -e "    curl -sSL <URL_DO_SCRIPT> | sudo bash -s -- --dockerhub rc-chat.exemplo.com.br email@exemplo.com.br\n"
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

# Inicializa variáveis com valores padrão
BRANCH=""
export IMAGE_TAG="latest"
export IMAGE_PREFIX="ghcr.io/rodadecuia"

# Processa os argumentos de flag
while [[ "$1" =~ ^- ]]; do
  case $1 in
    --beta )
      export IMAGE_TAG="beta"
      shift
      ;;
    --dockerhub )
      export IMAGE_PREFIX="rodadecuiaapp"
      shift
      ;;
    --branch | -b )
      BRANCH="$2"
      shift 2
      ;;
    * )
      show_usage
      exit 1
      ;;
  esac
done

# Verifica se está rodando como root
if [[ $EUID -ne 0 ]]; then
   echo "Este script deve ser executado como root" 
   exit 1
fi

# Atribui os parâmetros restantes
frontend_host=$1
email=$2

# Verifica se os parâmetros principais estão corretos
if [ -z "$frontend_host" ] || [ -z "$email" ]; then
    show_usage
    exit 1
fi

emailregex="^[a-z0-9!#\$%&'*+/=?^_\`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_\`{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?\$"
if ! [[ $email =~ $emailregex ]] ; then
    echo "email inválido"
    show_usage
    exit 1
fi

# Define backend_host e backend_path
if [ -n "$3" ] ; then
    backend_host="$1"
    backend_path=""
    frontend_host="$2"
    email="$3"
else 
    backend_host="$frontend_host"
    backend_path="\\/backend"
fi

echo ""
echoblue "                                               "
echoblue "  RC-CHAT - Site oficial https://rc-chat.com   "
echoblue "                                               "
echoblue "  Contato Whatsapp: +55 49 99981 2291          "
echoblue "                    https://wa.me/554999812291 "
echoblue "                                               "

# Mensagem sobre o registro e a versão
echo ""
echoblue "  Configuração da Instalação:                  "
echoblue "  - Registro da Imagem: $IMAGE_PREFIX"
echoblue "  - Versão da Imagem  : $IMAGE_TAG"
echoblue "                                               "
echo ""

# Aviso para instalação Beta
if [ "$IMAGE_TAG" = "beta" ]; then
   echored "                                               "
   echored "  ATENÇÃO: Você está instalando a versão BETA.   "
   echored "  Esta é uma versão experimental e pode conter  "
   echored "  bugs ou instabilidades. Use por sua conta e   "
   echored "  risco.                                       "
   echored "                                               "
   echo ""
   sleep 10
fi

# salva pasta atual
CURFOLDER=${PWD}

# Passo 1: Providencia uma VPS zerada e aponta os hostnames do teu DNS para ela
# Passo 2: Instala o docker / apenas se já não tiver instalado
which docker > /dev/null || curl -sSL https://get.docker.com | sh

# Passo 3: Baixa o projeto e entra na pasta
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
echo "Baixando imagens de $IMAGE_PREFIX (versão: $IMAGE_TAG)..."
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
      
      docker volume create --name rc-chat_backend_public &> ${tmplog}-createpublic.log
      
      if [ $? -gt 0 ]; then
         echo -e "\n\nErro ao criar volume public\n\nLog de erros pode ser encontrado em ${tmplog}-createpublic.log\n\n"
         exit 1
      fi
      
      cat ${CURFOLDER}/public_data.tar.gz | docker run -i --rm -v rc-chat_backend_public:/public alpine ash -c "tar -xzf - -C /public" &> ${tmplog}-restorepublic.log

      if [ $? -gt 0 ]; then
         echo -e "\n\nErro ao restaurar volume public\n\nLog de erros pode ser encontrado em ${tmplog}-restorepublic.log\n\n"
         exit 1
      fi
      
   fi
   
   DIDRESTORE=1
fi

if ! [ "${DIDRESTORE}" ]; then
    latest_backup_file=$(ls -t ${CURFOLDER}/rc-chat-backup-*.tar.gz 2>/dev/null | head -n 1)
fi

if [ -n "${latest_backup_file}" ] && ! [ -d "backups" ]; then
    echo "Backup encontrado. Preparando para restauração..."

    mkdir backups
    ln "${latest_backup_file}" backups/

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
