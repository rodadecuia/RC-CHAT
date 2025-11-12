#!/bin/bash

# --- Funções de Utilidade ---
show_usage() {
    echo -e "Uso: \n"
    echo -e "  Para instalar ou atualizar, execute:"
    echo -e "    sudo ./setup.sh [opções]\n"
    echo -e "Opções (principalmente para atualizações):"
    echo -e "  --beta                  Muda a instalação para a versão experimental (beta)."
    echo -e "  --dockerhub             Muda a origem das imagens para o Docker Hub."
    echo -e "  --branch <branchname>   Força o uso de uma branch específica do repositório git.\n"
    echo -e "Na primeira execução, o script será interativo e fará as perguntas necessárias."
}

echored() {
   echo -ne "  \033[41m\033[37m\033[1m"; echo -n "  $1"; echo -e "  \033[0m"
}

echoblue() {
   echo -ne "  \033[44m\033[37m\033[1m"; echo -n "  $1"; echo -e "  \033[0m"
}

# --- Início do Script ---

# Verifica se está rodando usando o bash
if ! [ -n "$BASH_VERSION" ]; then
   echo "Este script deve ser executado como utilizando o bash (use: sudo bash setup.sh)"
   show_usage
   exit 1
fi

# Verifica se está rodando como root
if [[ $EUID -ne 0 ]]; then
   echo "Este script deve ser executado como root (use: sudo ./setup.sh)"
   exit 1
fi

# --- Variáveis e Detecção de Modo ---
INSTALL_DIR="/opt/rc-chat"
IS_UPDATE="false"

# Define valores padrão que podem ser sobrescritos por flags
BRANCH=""
export IMAGE_TAG="latest"
export IMAGE_PREFIX="ghcr.io/rodadecuia"

# Processa flags para permitir overrides na atualização
while [[ "$1" =~ ^- ]]; do
  case $1 in
    --beta ) export IMAGE_TAG="beta"; shift ;;
    --dockerhub ) export IMAGE_PREFIX="rodadecuiaapp"; shift ;;
    --branch | -b ) BRANCH="$2"; shift 2 ;;
    * ) show_usage; exit 1 ;;
  esac
done

# Verifica se é uma atualização ou nova instalação
if [ -f "$INSTALL_DIR/.env" ]; then
    IS_UPDATE="true"
fi

# --- Lógica Principal: Instalação vs. Atualização ---

if [ "$IS_UPDATE" = "true" ]; then
    ### MODO ATUALIZAÇÃO ###
    echo "Detectada instalação existente. Iniciando processo de atualização..."
    cd "$INSTALL_DIR" || exit 1
    # Carrega as variáveis do .env para obter os hosts e email
    frontend_host=$(grep -E "^FRONTEND_HOST=" .env | cut -d '=' -f2)
    backend_host=$(grep -E "^VIRTUAL_HOST=" .env | cut -d '=' -f2)
    email=$(grep -E "^LETSENCRYPT_EMAIL=" .env | cut -d '=' -f2)
    
    if [ "$frontend_host" = "$backend_host" ]; then
        backend_path="\\/backend"
    else
        backend_path=""
    fi

else
    ### MODO NOVA INSTALAÇÃO (INTERATIVO) ###
    echo "Nenhuma instalação encontrada. Iniciando assistente de configuração..."
    
    while true; do
        read -p "A instalação usará um domínio único ou domínios separados? (1-Único, 2-Separado) [1]: " domain_mode
        domain_mode=${domain_mode:-1}
        case $domain_mode in
            1) backend_path="\\/backend"; break ;;
            2) backend_path=""; break ;;
            *) echo "Opção inválida. Por favor, escolha 1 ou 2." ;;
        esac
    done

    if [ -z "$backend_path" ]; then
        read -p "Digite o domínio do Backend (ex: api.meudominio.com): " backend_host
        read -p "Digite o domínio do Frontend (ex: app.meudominio.com): " frontend_host
    else
        read -p "Digite o domínio principal da aplicação (ex: rc-chat.meudominio.com): " frontend_host
        backend_host=$frontend_host
    fi

    emailregex="^[a-z0-9!#\$%&'*+/=?^_\`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_\`{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?\$"
    while true; do
        read -p "Digite seu e-mail (para o certificado SSL): " email
        if [[ $email =~ $emailregex ]]; then
            break
        else
            echo "Formato de e-mail inválido. Tente novamente."
        fi
    done

    while true; do
        read -p "Qual versão instalar? (1-Produção, 2-Beta) [1]: " version_choice
        version_choice=${version_choice:-1}
        case $version_choice in
            1) export IMAGE_TAG="latest"; break ;;
            2) export IMAGE_TAG="beta"; break ;;
            *) echo "Opção inválida. Por favor, escolha 1 ou 2." ;;
        esac
    done

    while true; do
        read -p "De onde baixar as imagens? (1-GitHub/GHCR, 2-Docker Hub) [1]: " registry_choice
        registry_choice=${registry_choice:-1}
        case $registry_choice in
            1) export IMAGE_PREFIX="ghcr.io/rodadecuia"; break ;;
            2) export IMAGE_PREFIX="rodadecuiaapp"; break ;;
            *) echo "Opção inválida. Por favor, escolha 1 ou 2." ;;
        esac
    done
fi

# --- Execução Comum ---

echo ""
echoblue "  RC-CHAT - Site oficial https://rc-chat.com   "
echoblue "  Contato Whatsapp: +55 54 36421111            "
echoblue "                    https://wa.me/555436421111 "
echo ""

echoblue "  Resumo da Operação:                        "
echoblue "  - Operação: $([ "$IS_UPDATE" = "true" ] && echo "Atualização" || echo "Nova Instalação")"
echoblue "  - Registro: $IMAGE_PREFIX"
echoblue "  - Versão  : $IMAGE_TAG"
[ -n "$backend_path" ] && echoblue "  - Modo    : Domínio Único" || echoblue "  - Modo    : Domínios Separados"
echoblue "  - Frontend: $frontend_host"
echoblue "  - Backend : $backend_host"
echo ""

if [ "$IS_UPDATE" = "false" ]; then
    read -p "As configurações estão corretas? Deseja continuar? (S/n): " confirm
    if [[ ! "$confirm" =~ ^[Ss]$ ]] && [ -n "$confirm" ]; then
        echo "Instalação cancelada."
        exit 1
    fi
fi

if [ "$IMAGE_TAG" = "beta" ]; then
   echored "  ATENÇÃO: Você está usando a versão BETA.       "
   echored "  Esta é uma versão experimental.                "
   sleep 5
fi

which docker > /dev/null || curl -sSL https://get.docker.com | sh
if ! command -v git &> /dev/null; then
    echo "Git não encontrado. Instalando git..."; apt-get update; apt-get install -y git;
fi

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR" || exit 1

echo "Obtendo arquivos de configuração mais recentes..."
rm -rf rc-chat-temp
git clone https://github.com/rodadecuia/RC-CHAT.git rc-chat-temp
if [ $? -ne 0 ]; then echored "Falha ao obter arquivos de configuração."; exit 1; fi

if [ "$IS_UPDATE" = "false" ]; then cp rc-chat-temp/.env.example ./.env; fi
cp rc-chat-temp/docker-compose.yml ./docker-compose.yml
cp rc-chat-temp/install/setup.sh ./setup.sh
chmod +x ./setup.sh

rm -rf rc-chat-temp

sed -i "s|^FRONTEND_HOST=.*|FRONTEND_HOST=$frontend_host|" ./.env
sed -i "s|^BACKEND_URL=.*|BACKEND_URL=https:\/\/$backend_host$backend_path|" ./.env
sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=https:\/\/$frontend_host|" ./.env
sed -i "s|^EMAIL_ADDRESS=.*|EMAIL_ADDRESS=$email|" ./.env
sed -i "s|^VIRTUAL_HOST=.*|VIRTUAL_HOST=$backend_host|" ./.env
sed -i "s|^LETSENCRYPT_HOST=.*|LETSENCRYPT_HOST=$backend_host|" ./.env
sed -i "s|^LETSENCRYPT_EMAIL=.*|LETSENCRYPT_EMAIL=$email|" ./.env

mkdir -p backups

echo "Baixando imagens de $IMAGE_PREFIX (versão: $IMAGE_TAG)..."
docker compose --profile acme pull
echo "Parando containers atuais (se existirem)..."
docker compose --profile acme down
echo "Iniciando containers..."
docker compose --profile acme up -d

cat << EOF
A geração dos certificados e a inicialização do serviço pode levar
alguns minutos.

Após isso você pode acessar o RC-CHAT pela URL: https://${frontend_host}

EOF

if [ "$IS_UPDATE" = "false" ]; then
cat << EOF
O login é ${email} e a senha padrão é 123456
Lembre-se de alterar a senha no primeiro acesso.

EOF
    echo "Nova instalação concluída com sucesso!"
else
    echo "Sistema atualizado com sucesso!"
fi

echo "Os arquivos de configuração estão em: $INSTALL_DIR"
echo "Para futuras atualizações, navegue para $INSTALL_DIR e execute 'sudo ./setup.sh'"
echo "Removendo imagens Docker antigas..."
docker system prune -af &> /dev/null
