# Docker + Prisma ORM

Repositório de estudos de Docker e Prisma ORM usando uma API Node.js como projeto base. Cobre desde os fundamentos do Docker até o uso do Prisma com PostgreSQL rodando em container.

## O que você vai aprender

**Docker:**
- O que é Docker e como ele funciona por dentro
- Diferença entre virtualização e containers
- Criar e rodar containers a partir de um Dockerfile
- Gerenciar estados, logs e remoção de containers
- Usar volumes para persistir dados
- Orquestrar múltiplos containers com Docker Compose

**Prisma ORM:**
- Configurar o Prisma em um projeto Node.js/TypeScript
- Definir modelos no `schema.prisma`
- Criar e executar migrations
- Usar o Prisma Client para queries no banco
- Inspecionar o banco com o Prisma Studio

## Pré-requisitos

- [Docker Desktop](https://docs.docker.com/compose/) instalado (Windows: selecione WSL 2 na instalação)
- Node.js 24+ (apenas para rodar o projeto fora do Docker)

---

## Rodando o projeto

**1. Configure o arquivo `.env`:**

Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Abra o `.env` criado e preencha com os valores que desejar. Abaixo está um exemplo funcional:
```env
POSTGRESQL_USERNAME=postgres
POSTGRESQL_PASSWORD=postgres
POSTGRESQL_POSTGRES_PASSWORD=postgres
POSTGRESQL_DATABASE=api
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/api"
```

A `DATABASE_URL` é usada pelo Prisma para conectar ao banco. A porta `5433` é a porta do host mapeada para o PostgreSQL dentro do Docker.

**2. Suba o banco de dados:**
```bash
docker compose up postgres -d
```

O Docker vai baixar a imagem do PostgreSQL na primeira vez e subir o container em background. Aguarde alguns segundos até o banco estar pronto.

**3. Execute as migrations:**
```bash
npx prisma migrate dev
```

O Prisma lê o `schema.prisma`, cria as tabelas `users` e `questions` no banco e gera o client TypeScript em `src/generated/prisma/`. Rode esse comando sempre que modificar o schema.

**4. (Opcional) Popule o banco com dados iniciais:**
```bash
npx prisma db seed
```

Insere alguns usuários de exemplo para você testar as rotas sem precisar criar dados manualmente.

**5. (Opcional) Abra o Prisma Studio:**
```bash
npx prisma studio
```

Interface visual do banco, acessível em `http://localhost:5555`. Útil para inspecionar os dados sem precisar de um cliente SQL.

**6. Rode a API:**
```bash
npm run dev
```

A API sobe na porta `3333` com hot reload. Qualquer alteração nos arquivos TypeScript reinicia o servidor automaticamente.

Confirme que está funcionando:
```bash
curl http://localhost:3333/users
```

---

## Comandos Docker essenciais para este projeto

```bash
# Subir só o Postgres em background
docker compose up postgres -d

# Ver se o container está rodando
docker ps

# Ver logs do banco
docker logs postgres
docker logs -f postgres          # acompanhar em tempo real

# Parar o banco
docker compose down

# Parar e remover os dados do volume (banco zerado)
docker compose down --volumes

# Acessar o shell do container do banco
docker exec -it postgres /bin/bash
```

---

## 1. O que é Docker

Docker é uma plataforma que empacota, distribui e executa aplicações em ambientes isolados chamados **containers**. A ideia central é resolver o famoso problema "na minha máquina funciona". Com Docker, o que roda no seu PC roda igual no servidor de produção.

### Virtualização vs Containers

| Característica | VM (Virtualização) | Docker (Containers) |
|---|---|---|
| Sistema Operacional | Cada VM tem o seu (pesado) | Compartilha o kernel do host (leve) |
| Hardware | Virtualizado/emulado | Usa o hardware do host direto |
| Peso | Gigabytes | Megabytes |
| Tempo de boot | Minutos | Segundos/milissegundos |

VM é como construir uma casa nova para cada hóspede. Container é como quartos isolados no mesmo hotel.

### Como o isolamento funciona

- **Kernel**: coração do SO, faz a ligação entre software e hardware
- **CGroups**: limita o uso de CPU e memória de cada container — nenhum monopoliza o host
- **Namespaces**: isola recursos — cada container enxerga apenas seus próprios processos, arquivos e rede

### Conceitos principais

| Conceito | O que é |
|---|---|
| **Dockerfile** | Arquivo que define como a imagem será criada |
| **Imagem** | Pacote com tudo que a aplicação precisa: código, deps, runtime |
| **Container** | Uma instância de uma imagem em execução |
| **Host** | A máquina que roda o Docker (seu PC ou servidor) |
| **Docker Hub** | Registro público de imagens prontas para usar |

### Paridade de ambientes

É manter Desenvolvimento, Teste e Produção o mais parecidos possível. Com Docker, o container que você roda no seu PC é o mesmo que vai pro servidor — sem surpresas de versão, configuração ou dependência.

---

## 2. O Projeto Base

API HTTP em Node.js/TypeScript usada como base prática nos estudos.

```
GET    /users                    lista todos os usuários
GET    /users/:id                busca usuário por ID
POST   /users                    cria um novo usuário

GET    /questions                lista todas as perguntas
GET    /questions?title=termo    busca perguntas por título (sem distinção de maiúsculas)
POST   /questions                cria uma nova pergunta
PUT    /questions/:id            atualiza uma pergunta
DELETE /questions/:id            remove uma pergunta
```

### Configuração relevante

**tsconfig.json** — configurado para ES2024 com module `nodenext`:

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "nodenext",
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

**.nvmrc** — define a versão do Node usada no projeto:
```
lts/krypton
```

Usar `.nvmrc` é uma boa prática para garantir que todos no time usem a mesma versão do Node.

### Rodando fora do Docker

```bash
npm run dev      # watch mode com hot reload na porta 3333
npm run build    # compila TypeScript → dist/
npm start        # roda o output compilado
```

---

## 3. Container & Imagem

### Criando o Dockerfile

O Dockerfile define como a imagem da aplicação é construída. Cada instrução vira uma **layer** (camada) da imagem.

```dockerfile
FROM node:24-alpine3.20

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run build

EXPOSE 3333

CMD ["npm", "start"]
```

**Explicação de cada instrução:**

| Instrução | O que faz |
|---|---|
| `FROM node:24-alpine3.20` | Imagem base com Node 24 + Alpine Linux (distribuição leve, ideal para containers) |
| `WORKDIR /usr/src/app` | Cria e define o diretório de trabalho dentro da imagem |
| `COPY . .` | Copia os arquivos do projeto para dentro da imagem (respeitando o `.dockerignore`) |
| `RUN npm install` | Instala as dependências — roda durante o build |
| `RUN npm run build` | Compila o TypeScript para `dist/` — roda durante o build |
| `EXPOSE 3333` | Documenta que a aplicação usa a porta 3333 (não publica automaticamente) |
| `CMD ["npm", "start"]` | Comando executado quando o container inicia (não durante o build) |

> `RUN` roda durante o build da imagem. `CMD` roda quando um container é criado a partir dela.

### .dockerignore

Define o que **não** é enviado para dentro da imagem durante o build. Sem ele, `node_modules` e `dist` iriam junto, tornando a imagem desnecessariamente pesada.

```
node_modules
dist
Dockerfile
.git
.dockerignore
.gitignore
docker-compose.yaml
```

### Build e execução

```bash
# Listar imagens locais
docker image ls

# Listar containers em execução
docker ps

# Build da imagem (. indica que o Dockerfile está na pasta atual)
docker build -t api .

# Build especificando o Dockerfile explicitamente
docker build -t api -f Dockerfile .

# Criar e rodar um container (terminal fica preso nos logs)
docker run -p 3333:3333 api

# Rodar em background (terminal livre)
docker run -p 3333:3333 -d api
```

O formato do mapeamento de porta é `HOST:CONTAINER`. A porta `3333` do host aponta para a `3333` do container.

**Erro comum — porta já em uso:**
```
failed to bind host port 0.0.0.0:3333/tcp: address already in use
```
Para liberar a porta:
```bash
sudo fuser -k 3333/tcp
# ou pelo PID
kill -9 <PID>
```

### Gerenciando estados do container

Um container pode estar em execução, pausado, parado ou apenas criado.

```bash
docker ps                         # containers em execução
docker ps -a                      # todos (incluindo parados)

docker pause <CONTAINER_ID>       # pausa (não consome CPU, mas ocupa espaço)
docker unpause <CONTAINER_ID>     # remove a pausa

docker stop <CONTAINER_ID>        # para o container
docker start <CONTAINER_ID>       # inicia novamente um container parado
```

### Logs

Quando o container roda em background (`-d`), os logs não aparecem no terminal. Use `docker logs` para acessá-los.

```bash
docker logs <CONTAINER_ID>               # logs completos
docker logs -f <CONTAINER_ID>            # acompanha em tempo real (Ctrl+C para sair)
docker logs --tail 20 <CONTAINER_ID>     # últimas 20 linhas
```

### Histórico da imagem

```bash
docker history api          # mostra todas as layers e seus tamanhos
docker history api:latest   # mesmo, com tag explícita
```

Útil para ver quanto cada instrução do Dockerfile adicionou à imagem e entender de onde vem o tamanho dela.

### Tags e versionamento

A flag `-t` aceita o formato `nome:tag` para versionar imagens:

```bash
docker build -t api:v1 .
docker build -t api:v2 .
docker build -t api:v3 .

docker image ls
# api:v1   33b57fd5accc   307MB
# api:v2   143865bf28fb   307MB
# api:v3   94cb0243e98a   307MB

# Subir container com versão específica
docker run -p 3333:3333 -d api:v2
```

Cada build gera um Image ID único por tag. `docker rmi <id>` remove apenas aquela tag, não todas as versões.

### Removendo containers e imagens

```bash
# Remover container parado
docker rm <CONTAINER_ID>

# Forçar remoção de container em execução
docker rm -f <CONTAINER_ID>

# Remover todos os containers parados de uma vez
docker container prune

# Remover imagem
docker rmi <IMAGE_ID>
```

**Regras importantes:**
- Não dá pra remover container em execução sem `-f`
- Não dá pra remover imagem enquanto algum container a estiver referenciando (mesmo que parado)
- Solução: `docker container prune` primeiro, depois `docker rmi`

---

## 4. Volumes

### Efemeridade

Containers são **efêmeros por natureza** — descartáveis. Qualquer dado dentro de um container que não seja persistido externamente **some quando o container é removido**.

Existe uma diferença importante:

| Operação | O que acontece com os dados |
|---|---|
| `docker stop` + `docker start` | **Preservados** (o mesmo container foi pausado e reiniciado) |
| `docker run` (novo container) | **Perdidos** (nova instância limpa da imagem) |

A solução é usar **Volumes** para salvar dados fora do container.

### Acessando o shell do container

```bash
docker exec -it <CONTAINER_ID> //bin/sh
```

> Em imagens Alpine Linux, use `sh` — `bash` não está instalado por padrão.

```bash
# Isso vai falhar em Alpine:
docker exec -it <CONTAINER_ID> bash
# OCI runtime exec failed: exec: "bash": executable file not found in $PATH

# Isso funciona:
docker exec -it <CONTAINER_ID> //bin/sh
/usr/src/app #
```

### Criando e usando volumes

```bash
# Criar um volume nomeado
docker volume create api-volume

# Inspecionar o volume (mostra onde os dados ficam no host)
docker volume inspect api-volume

# Subir container com o volume montado
docker run -v api-volume:/usr/src/app -p 3333:3333 -d api

# Sintaxe alternativa (mais explícita, preferida em novos projetos)
docker run --mount source=api-volume,target=/usr/src/app -p 3333:3333 -d api

# Confirmar que o volume está montado
docker container inspect <CONTAINER_ID>
# Procure por "Mounts" no output
```

Formato do `-v`: `NOME_DO_VOLUME:CAMINHO_NO_CONTAINER`

### Persistência na prática

O dado vive **no volume**, não no container. Qualquer container que montar o mesmo volume no mesmo caminho enxerga os mesmos arquivos — independente de quantas vezes o container for destruído e recriado.

```
Container ──── responsável por rodar a aplicação (efêmero, pode ser destruído)
Volume    ──── responsável por guardar os dados (persistente, sobrevive ao container)
```

### Removendo volumes

```bash
docker volume ls                   # lista todos os volumes
docker volume rm <NOME>            # remove um volume

# ATENÇÃO: só funciona se nenhum container referenciar o volume
# (mesmo containers parados bloqueiam a remoção)
# Solução: remover os containers primeiro
docker container prune
docker volume rm api-volume
```

---

## 5. Docker Compose

### Por que usar

Quando o projeto tem múltiplos containers (API + banco + cache), gerenciá-los individualmente fica trabalhoso. O Compose resolve isso com um único arquivo `docker-compose.yaml` que descreve toda a stack.

Em vez de vários `docker run` com flags enormes, você tem:

```bash
docker compose up -d    # sobe tudo
docker compose down     # derruba tudo
```

### Instalação

**Windows:** baixe o Docker Desktop em [docs.docker.com/compose](https://docs.docker.com/compose/), execute o instalador e selecione **"Use WSL 2 em vez do Hyper-V"**.

Verifique:
```bash
docker compose version
```

### Usando imagem pronta do PostgreSQL

Antes do Compose, é possível subir um banco isolado com `docker run`:

```bash
docker run \
  --name db-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d bitnami/postgresql:latest
```

Usamos `bitnami/postgresql` em vez da imagem oficial `postgres` porque:
- Roda como usuário **não-root** por padrão (mais seguro)
- Base minimalista com menor superfície de ataque
- Varreduras frequentes de vulnerabilidades (CVE)

> Em produção: nunca use `postgres` como senha e prefira uma tag de versão específica (`bitnami/postgresql:16`) no lugar de `latest`.

### Conectando ao DBeaver

Três problemas comuns ao conectar `bitnami/postgresql` no DBeaver:

**Problema 1 — Variáveis de ambiente erradas**

A imagem bitnami usa nomes diferentes da imagem oficial:

| Imagem oficial (`postgres`) | Bitnami (`bitnami/postgresql`) |
|---|---|
| `POSTGRES_USER` | `POSTGRESQL_USERNAME` |
| `POSTGRES_PASSWORD` | `POSTGRESQL_PASSWORD` |
| _(não existe)_ | `POSTGRESQL_POSTGRES_PASSWORD` |

Misturar os nomes faz o container subir e cair silenciosamente. Verifique com `docker logs <id>`.

Comando correto para bitnami com as três variáveis obrigatórias:
```bash
docker run --name db-postgres \
  -e POSTGRESQL_USERNAME=postgres \
  -e POSTGRESQL_PASSWORD=postgres \
  -e POSTGRESQL_POSTGRES_PASSWORD=postgres \
  -p 5433:5432 \
  -d bitnami/postgresql:latest
```

**Problema 2 — SSL no DBeaver**

O DBeaver tenta SSL por padrão. Solução: na aba **SSL** da conexão, definir `sslmode = disable`.

**Problema 3 — Conflito com PostgreSQL local no Windows**

Se tiver PostgreSQL instalado no Windows na porta `5432`, o DBeaver conecta nele e a senha falha. Solução: mapear o container em outra porta (`-p 5433:5432`) e usar `5433` no DBeaver.

Teste de conexão via terminal:
```bash
psql -h localhost -U postgres -p 5433
# Se pedir senha e entrar no postgres=#, está funcionando
```

### O docker-compose.yaml

```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    image: nodejs-api
    container_name: api
    ports:
      - "3333:3333"
    depends_on:
      - postgres

  postgres:
    image: 'bitnami/postgresql:latest'
    container_name: postgres
    ports:
      - "5433:5432"
    environment:
      - POSTGRESQL_USERNAME=${POSTGRESQL_USERNAME}
      - POSTGRESQL_PASSWORD=${POSTGRESQL_PASSWORD}
      - POSTGRESQL_POSTGRES_PASSWORD=${POSTGRESQL_POSTGRES_PASSWORD}
      - POSTGRESQL_DATABASE=${POSTGRESQL_DATABASE}
    volumes:
      - database_data:/bitnami/postgresql

volumes:
  database_data:
```

**Pontos importantes:**
- `version` foi removido. O Docker ignora essa linha atualmente e avisa que está obsoleta
- Indentação define hierarquia no YAML — um espaço errado quebra o arquivo. Use sempre espaços, nunca tab
- Portas entre aspas (`"3333:3333"`) — boa prática para evitar que o YAML interprete como outro tipo de dado
- Variáveis de ambiente no formato `CHAVE=VALOR` (não `CHAVE: VALOR`)
- `depends_on`: garante que o `postgres` sobe antes da `api` (mas não garante que o banco está *pronto*, só que o container subiu)
- Volume `database_data` declarado na seção `volumes` — o Docker gerencia ele

**Por que a API não tem volume?**
A API não guarda dados persistentes. Apenas o banco precisa garantir que os dados sobrevivam ao ciclo de vida do container.

### Executando com Docker Compose

```bash
# Subir todos os containers em background
docker compose up -d

# Subir e forçar rebuild da imagem (use sempre que mudar o código ou Dockerfile)
docker compose up -d --build

# Derrubar containers e rede (imagens e volumes são mantidos)
docker compose down

# Derrubar tudo incluindo volumes e imagens
docker compose down --volumes --rmi all

# Acompanhar logs em tempo real
docker compose logs -f
```

**O que `up -d` faz na ordem:**
1. Baixa imagens que não existem localmente
2. Faz o build de imagens que têm `build:` configurado
3. Cria a rede padrão do projeto automaticamente
4. Cria os volumes declarados
5. Sobe os containers na ordem respeitando `depends_on`

**Cache de layers no rebuild:**

Na segunda execução do `--build`, o Docker reutiliza layers que não mudaram:
```
=> CACHED [2/5] WORKDIR /usr/src/app
=> CACHED [3/5] COPY . .
=> CACHED [4/5] RUN npm install
=> CACHED [5/5] RUN npm run build
```

Cada instrução do Dockerfile é uma layer. Se nada mudou naquela etapa, o Docker usa o cache — por isso o segundo build é muito mais rápido que o primeiro.

**O que `down` remove vs mantém:**

| O que é removido | O que permanece |
|---|---|
| Containers | Imagens |
| Rede criada pelo Compose | Volumes nomeados |

---

## Referência rápida de comandos

### Imagens

```bash
docker image ls                          # lista imagens locais
docker build -t nome .                   # build com nome
docker build -t nome:v1 .               # build com tag/versão
docker build -t nome -f Dockerfile .    # especifica o Dockerfile
docker history nome                      # histórico de layers
docker rmi <IMAGE_ID>                    # remove imagem
```

### Containers

```bash
docker ps                                # containers em execução
docker ps -a                             # todos os containers
docker run -p HOST:CONTAINER imagem      # cria e roda container
docker run -p 3333:3333 -d imagem       # roda em background
docker run -v volume:/caminho -p ... imagem  # com volume montado
docker stop <ID>                         # para container
docker start <ID>                        # inicia container parado
docker pause <ID>                        # pausa container
docker unpause <ID>                      # remove pausa
docker rm <ID>                           # remove container parado
docker rm -f <ID>                        # força remoção
docker container prune                   # remove todos os parados
docker exec -it <ID> //bin/sh           # acessa shell (Alpine)
docker logs <ID>                         # logs do container
docker logs -f <ID>                      # logs em tempo real
docker logs --tail 20 <ID>              # últimas 20 linhas
docker container inspect <ID>           # detalhes do container
```

### Volumes

```bash
docker volume create nome               # cria volume
docker volume ls                        # lista volumes
docker volume inspect nome              # detalhes do volume
docker volume rm nome                   # remove volume
```

### Docker Compose

```bash
docker compose up -d                    # sobe em background
docker compose up -d --build            # rebuild + sobe
docker compose down                     # derruba containers e rede
docker compose down --volumes --rmi all # derruba tudo
docker compose logs -f                  # logs em tempo real
docker compose build                    # só faz o build
```

---

## 6. Prisma ORM

### O que é

Prisma é um ORM (Object-Relational Mapper) para Node.js e TypeScript. Em vez de escrever SQL diretamente, você define seus modelos em um arquivo de schema e o Prisma gera um client com tipos e queries prontas.

### Instalação

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

O `prisma init` cria:
- `prisma/schema.prisma` — onde você define os modelos
- `.env` com a variável `DATABASE_URL`

### Configurando a conexão

No `.env`, aponte para o Postgres rodando no Docker:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/api"
```

### Comandos essenciais

```bash
# Criar uma migration a partir das mudanças no schema
npx prisma migrate dev --name nome-da-migration

# Aplicar migrations pendentes (sem criar nova)
npx prisma migrate deploy

# Sincronizar o schema sem criar migration (útil em desenvolvimento rápido)
npx prisma db push

# Abrir o Prisma Studio (interface visual do banco)
npx prisma studio

# Gerar/atualizar o Prisma Client após mudanças no schema
npx prisma generate

# Ver o status das migrations
npx prisma migrate status

# Resetar o banco (apaga tudo e reaaplica as migrations)
npx prisma migrate reset
```

### Exemplo de schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

### Fluxo de trabalho

```
Edita schema.prisma → npx prisma migrate dev → Prisma Client atualizado → usa no código
```

---

## Referências

- [Documentação oficial do Docker](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Bitnami PostgreSQL](https://hub.docker.com/r/bitnami/postgresql)
- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
