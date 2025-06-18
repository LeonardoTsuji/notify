# Notify

Um serviço de notificações que permite enviar mensagens através de diferentes canais como email, SMS e outros meios de comunicação.

## 🚀 Tecnologias

- Node.js
- TypeScript
- Fastify
- RabbitMQ
- SendGrid
- Twilio
- Resend
- MailerSend

## 📋 Pré-requisitos

- Node.js (versão LTS recomendada)
- PNPM (versão 10.5.2 ou superior)
- Docker e Docker Compose

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone [URL_DO_REPOSITÓRIO]
cd notify
```

2. Instale as dependências:

```bash
pnpm install
```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configurações do servidor
PORT=3000
HOST=localhost

# Configurações dos serviços de email
SENDGRID_API_KEY=sua_chave_aqui
RESEND_API_KEY=sua_chave_aqui
MAILERSEND_API_KEY=sua_chave_aqui

# Configurações do Twilio
TWILIO_ACCOUNT_SID=seu_sid_aqui
TWILIO_AUTH_TOKEN=seu_token_aqui

# Configurações do RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

4. Inicie o RabbitMQ usando Docker Compose:

```bash
docker-compose up -d
```

## 🚀 Executando o projeto

### Desenvolvimento

```bash
pnpm dev
```

### Produção

```bash
pnpm build
pnpm start
```

## 📚 Documentação da API

A documentação da API está disponível através do Swagger UI. Após iniciar o servidor, você pode acessar:

- Swagger UI: `http://localhost:3000/documentation`
- Especificação OpenAPI: `http://localhost:3000/documentation/json`

A documentação inclui:

- Todos os endpoints disponíveis
- Parâmetros necessários
- Exemplos de requisições e respostas
- Schemas de validação usando Zod

## 📦 Estrutura do Projeto

```
src/
├── server.ts          # Ponto de entrada da aplicação
├── routes/            # Rotas da API
├── services/          # Serviços de negócio
├── schemas/           # Schemas de validação
└── config/            # Configurações da aplicação
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC.
