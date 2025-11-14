# GET /contacts/exportCsv

**Controller Function:** `ContactController.exportCsv`

## Description
(Adicione uma descrição do que este endpoint faz)

## Requisição
### Cabeçalhos
- `Authorization`: `Bearer <SEU_TOKEN>` (Obrigatório para a maioria dos endpoints)
(Adicione outros cabeçalhos específicos se souber, ex: `Content-Type: application/json`)

### Parâmetros de Caminho
(Liste os parâmetros de caminho como `:id`, `:companyId` aqui, ex: `id`: O identificador único do anúncio.)

### Parâmetros de Consulta
(Liste os parâmetros de consulta se aplicável, ex: `page`: Número da página para paginação.)

### Corpo da Requisição
(Forneça um exemplo de corpo de requisição JSON para requisições POST/PUT)

```json
{
  // Propriedades de exemplo
}
```

## Resposta
### Sucesso (200 OK)
(Forneça um exemplo de resposta JSON de sucesso)

```json
{
  // Exemplo de resposta de sucesso
}
```

### Respostas de Erro
- `401 Não Autorizado`: Se o token de autenticação estiver ausente ou inválido.
- `403 Proibido`: Se o usuário autenticado não tiver as permissões necessárias (ex: `isAdmin`, `isSuper`).
- `404 Não Encontrado`: Se o recurso não existir.
- `500 Erro Interno do Servidor`: Para erros inesperados do servidor.
(Adicione outros códigos de erro e mensagens específicas se souber)
