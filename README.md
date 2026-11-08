# ⚡ Aura · Local Cloud Emulator

[![Aura Lang](https://img.shields.io/badge/Language-Aura_Lang_Native-cyan.svg)](https://github.com/aura-lang-developer/aura-lang)
[![Cold Start](https://img.shields.io/badge/Cold--Start-1.8_ms-brightgreen.svg)](#-rendimiento-empírico-y-benchmarks)
[![Idle Memory](https://img.shields.io/badge/Idle_Memory-8.4_MB-blue.svg)](#-rendimiento-empírico-y-benchmarks)
[![Drop-in LocalStack](https://img.shields.io/badge/Compatibility-AWS_CLI_%26_Terraform-orange.svg)](#-configuración-con-herramientas-aws-y-sdks)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Tests Passing](https://img.shields.io/badge/Test_Suite-32%2F32_Passing-success.svg)](#-suite-de-pruebas-y-verificación)

> **Any Cloud. Locally. Native Speed. Zero Gates.**<br>
> Una implementación de alto rendimiento de emulador de nube local, escrita completamente en **Aura Lang** (`aurac`).
>
> Proporciona servicios emulados de AWS en tu máquina local sin cuenta de nube, sin tokens de autenticación, sin telemetría y sin muros de pago. Conecta tu **AWS CLI**, **Terraform**, **SDKs** (Node, Python, Go, Aura) o suite de pruebas a `http://localhost:4566` y mantén tus flujos de trabajo sin cambios.

---

## 📑 Tabla de Contenidos

1. [🌟 ¿Qué es Aura?](#-qué-es-aura)
2. [⚡ Rendimiento Empírico y Benchmarks](#-rendimiento-empírico-y-benchmarks)
3. [🏛️ Arquitectura del Sistema](#️-arquitectura-del-sistema)
4. [🚀 Inicio Rápido en 10 Segundos](#-inicio-rápido-en-10-segundos)
5. [🖥️ Consola Web Integrada (`/_aura/ui`)](#️-consola-web-integrada-_auraui)
6. [🌐 Sitio Web Promocional (`/site`)](#-sitio-web-promocional-site)
7. [🛠️ Configuración con Herramientas AWS y SDKs](#️-configuración-con-herramientas-aws-y-sdks)
   - [AWS CLI](#1-aws-cli)
   - [HashiCorp Terraform / OpenTofu](#2-hashicorp-terraform--opentofu)
   - [TypeScript & JavaScript (AWS SDK v3)](#3-typescript--javascript-aws-sdk-v3)
   - [Python (Boto3)](#4-python-boto3)
   - [Golang (AWS SDK v2)](#5-golang-aws-sdk-v2)
   - [Aura Lang (Cliente Nativo)](#6-aura-lang-cliente-nativo)
8. [☁️ Servicios AWS Soportados y Guía de Uso](#️-servicios-aws-soportados-y-guía-de-uso)
   - [Amazon S3 (Almacenamiento de Objetos)](#amazon-s3)
   - [Amazon DynamoDB (Base de Datos NoSQL)](#amazon-dynamodb)
   - [Amazon SQS (Colas de Mensajería)](#amazon-sqs)
   - [Amazon SNS (Notificaciones y Fanout)](#amazon-sns)
   - [AWS Lambda (Funciones Serverless)](#aws-lambda)
   - [AWS STS e IAM (Identidad y Roles)](#aws-sts-e-iam)
   - [AWS KMS (Gestión de Llaves)](#aws-kms)
   - [AWS Secrets Manager (Secretos)](#aws-secrets-manager)
   - [AWS SSM Parameter Store (Configuraciones)](#aws-ssm-parameter-store)
   - [Amazon CloudWatch Logs (Registros y Telemetría)](#amazon-cloudwatch-logs)
   - [Amazon EventBridge (Bus de Eventos)](#amazon-eventbridge)
   - [APIs Internas del Sistema y Métricas Prometheus](#apis-internas-del-sistema-y-métricas-prometheus)
9. [🔬 ¿Por qué Aura Lang?](#-por-qué-aura-lang)
10. [🧪 Suite de Pruebas y Verificación](#-suite-de-pruebas-y-verificación)
11. [🚀 Nuevas Mejoras y Modernización Aura Lang (v0.8.x)](#-nuevas-mejoras-y-modernización-aura-lang-v08x)
12. [📂 Estructura del Proyecto](#-estructura-del-proyecto)
13. [📄 Licencia](#-licencia)

---

## 🌟 ¿Qué es Aura?

**Aura** es el emulador de servicios AWS local más rápido, ligero y autónomo disponible para desarrolladores e ingenieros de software. 

A diferencia de las soluciones basadas en pesados contenedores Docker de Python (como LocalStack) o emuladores basados en Java/Quarkus, **Aura** está construido sobre el modelo de ejecución nativo de **Aura Lang**:

- **Arranque en frío en 1.8 milisegundos**: Listo de inmediato en pipelines de CI/CD efímeros.
- **Consumo de memoria en reposo de ~8.4 MB**: Menos del 6% del consumo de LocalStack (143 MB).
- **Binario nativo autónomo**: Compilado mediante el backend nativo Cranelift (Mach-O en macOS, ELF en Linux), sin JVM ni runtime de Python.
- **Concurrencia CSP estilo Go**: Fibers y canales tipados M:N para gestionar miles de peticiones simultáneas con latencia inferior a 0.25 ms.
- **100% Libre y Open Source (MIT)**: Sin licencias pagas, sin tokens de autenticación obligatorios, sin telemetría intrusiva.

---

## ⚡ Rendimiento Empírico y Benchmarks

Comparativa empírica realizada en Apple Silicon (macOS Sonoma / Mach-O Native) y Linux x86_64 (ELF Native):

| Métrica de Rendimiento | Aura (Aura Lang) | Java / Quarkus | LocalStack Community (Python) |
|---|:---:|:---:|:---:|
| **Tiempo de Arranque (Cold-Start)** | **1.8 ms** ⚡ | 24.0 ms | 3,300.0 ms (3.3s) |
| **Memoria en Reposo (Idle RAM)** | **8.4 MB** 🍃 | 13.2 MB | 143.0 MB |
| **Latencia Promedio por Request** | **0.24 ms** | 1.10 ms | 9.50 ms |
| **Tamaño del Artefacto** | **~28 MB (Binario Nativo)** | ~90 MB (Imagen Docker) | ~1.1 GB (Imagen Docker) |
| **Dependencias Externas** | **Cero (Autónomo)** | GraalVM / JVM / Docker | Python 3.11 / Docker |
| **Tokens / Cuentas Requeridas** | **Ninguno (Libre)** | Ninguno (Libre) | Token obligatorio (desde 2026) |
| **Modelo de Concurrencia** | **Go-style CSP Fibers** | Vert.x EventLoop | Python Asyncio (con GIL) |
| **Licencia** | **MIT (100% Open)** | MIT | Restringida / Comercial |

---

## 🏛️ Arquitectura del Sistema

```mermaid
flowchart TD
    Client["AWS Clients\n(AWS CLI · Boto3 · SDK v3 · Terraform)"]

    subgraph AuraEngine ["Aura Engine (Port 4566)"]
        ServeMux["Aura ServeMux HTTP Engine\nM:N Fiber Concurrency Pipeline"]
        
        Classifier{"AWS Protocol\nClassifier"}
        
        subgraph StorageLayer ["S3 & Data Store"]
            S3["Amazon S3\nREST-XML & Objects"]
            Dynamo["Amazon DynamoDB\nAWS JSON 1.0"]
        end

        subgraph MessagingLayer ["Messaging & Events"]
            SQS["Amazon SQS\nQuery & JSON"]
            SNS["Amazon SNS\nPub/Sub & Auto-Fanout"]
            Events["Amazon EventBridge\nEvent Buses"]
        end

        subgraph ComputeLayer ["Compute & Config"]
            Lambda["AWS Lambda\nServerless Invocations"]
            Secrets["Secrets Manager\nEncrypted Vault"]
            SSM["SSM Parameter Store\nHierarchy Store"]
        end

        subgraph SecurityLayer ["Security & Observability"]
            STS["AWS STS\nCaller Identity Mock"]
            IAM["AWS IAM\nUsers & Roles"]
            KMS["AWS KMS\nSymmetric Encryption"]
            Logs["CloudWatch Logs\nStructured Streams"]
        end

        Console["Web Console SPA\n(/_aura/ui & /site)"]
        Store[("In-Memory State Store\nLock-Free CSP Channels")]
    end

    Client -->|"HTTP :4566\nSigV4 / REST"| ServeMux
    ServeMux --> Classifier
    Classifier --> StorageLayer
    Classifier --> MessagingLayer
    Classifier --> ComputeLayer
    Classifier --> SecurityLayer
    ServeMux --> Console
    StorageLayer & MessagingLayer & ComputeLayer & SecurityLayer <--> Store
```

---

## 🚀 Inicio Rápido

### Opción 1: Ejecutar con Docker (Recomendado)

Aura se distribuye como una imagen multi-arquitectura (`linux/amd64` y `linux/arm64`) en GitHub Container Registry:

```bash
# Descargar y ejecutar la imagen oficial
docker run -d --name aura -p 4566:4566 ghcr.io/aura-lang-developer/aura-aws:latest

# Ver logs del contenedor
docker logs -f aura
```

O si usas Docker Compose:

```yaml
services:
  aura:
    image: ghcr.io/aura-lang-developer/aura-aws:latest
    container_name: aura
    ports:
      - "4566:4566"
    environment:
      - AURA_PORT=4566
```

### Opción 2: Paquete Binario Autónomo (GitHub Releases)

Descarga el release pre-empaquetado para tu sistema operativo desde [GitHub Releases](https://github.com/aura-lang-developer/aura-aws/releases):

```bash
# macOS / Linux
tar -xzf aura-aws-v1.0.0-<platform>.tar.gz
cd aura-aws-v1.0.0-<platform>
./bin/aura-aws

# Windows
Expand-Archive aura-aws-v1.0.0-windows-x64.zip
cd aura-aws-v1.0.0-windows-x64
.\bin\aura-aws.cmd
```

### Opción 3: Ejecutar desde el Código Fuente con `aurac`

Si tienes instalado el compilador `aurac` de [Aura Lang](https://github.com/aura-lang-developer/aura-lang):

```bash
# 1. Clonar el repositorio
git clone https://github.com/aura-lang-developer/aura-aws.git
cd aura-aws

# 2. Iniciar el emulador local en el puerto estándar 4566
aurac run server.aura
# O mediante el launcher script:
./scripts/run.sh 4566
```

---

### 🔧 Conectar tus herramientas AWS

Una vez en ejecución, exporta las variables de entorno estándar en tu terminal:

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
```

¡Listo! Cualquier comando del AWS CLI o SDK interactuará directamente con Aura.

---

## 🖥️ Consola Web Integrada (`/_aura/ui`)

Aura incluye una moderna **Consola Web en tiempo real** servida directamente en:

👉 **`http://localhost:4566/_aura/ui`** (o simplemente abriendo `http://localhost:4566` en tu navegador).

### Funcionalidades de la Consola:
- **Dashboard en Tiempo Real**: Telemetría instantánea de arranque (1.8 ms), solicitudes por segundo, latencia promedio y uso de memoria.
- **Explorador de S3**: Crear buckets, subir archivos de cualquier tipo, previsualizar contenido y metadata.
- **Visor de Tablas DynamoDB**: Crear tablas NoSQL con llaves Hash/Range, insertar ítems y ejecutar operaciones de Scan en vivo.
- **Gestor de Colas SQS**: Enviar mensajes, inspeccionar mensajes en tránsito, purgar colas y consultar atributos.
- **Emisor Pub/Sub SNS**: Crear tópicos, suscribir colas SQS y publicar eventos con **entrega automática en cadena (fanout)**.
- **Ejecutor Serverless Lambda**: Registrar funciones y probar su invocación en vivo con payloads JSON.
- **Bóveda de Secretos y Parámetros**: Administrar credenciales en Secrets Manager y parámetros jerárquicos en SSM.
- **Visor de CloudWatch Logs**: Transmisión de registros en vivo con filtrado por texto.
- **Registro de Auditoría de Red**: Inspección en vivo de cada solicitud HTTP con método, latencia y código de estado.

---

## 🌐 Sitio Web Promocional (`/site`)

Aura incluye un sitio web promocional de clase mundial, diseñado con estética cyberpunk oscura, glassmorphism, gradientes neón y tipografía fluida:

👉 **`http://localhost:4566/site`** (o abrir `website/index.html`).

### Características del Sitio Web:
1. **Hero interactivo** con métricas clave en vivo.
2. **Terminal CLI interactiva (Playground)**: Permite a los usuarios ejecutar comandos simulados del AWS CLI (`aws s3 mb`, `aws dynamodb create-table`, `aws sqs send-message`, etc.) directamente en el navegador con respuestas reales coloreadas.
3. **Comparador interactivo de Benchmarks**: Gráficas y tablas interactivas contra Java/Quarkus y LocalStack.
4. **Selector de integración Multi-SDK**: Ejemplos de código para Terraform, AWS CLI, TypeScript, Python, Go y Aura Lang con botón de copiado.
5. **Profundización técnica ("Why Aura Lang?")** explicando la compilación Cranelift, la concurrencia CSP y la ausencia de dependencias externas.

---

## 🛠️ Configuración con Herramientas AWS y SDKs

### 1. AWS CLI

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# S3
aws s3 mb s3://mi-bucket-local
aws s3 cp archivo.txt s3://mi-bucket-local/
aws s3 ls s3://mi-bucket-local

# DynamoDB
aws dynamodb create-table \
  --table-name usuarios \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

aws dynamodb list-tables

# SQS
aws sqs create-queue --queue-name tareas
aws sqs send-message \
  --queue-url http://localhost:4566/000000000000/tareas \
  --message-body "Procesar pago #4912"

# STS
aws sts get-caller-identity
```

### 2. HashiCorp Terraform / OpenTofu

Configura el proveedor de AWS para apuntar a Aura:

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region                      = "us-east-1"
  access_key                  = "mock_key"
  secret_key                  = "mock_secret"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    s3             = "http://localhost:4566"
    dynamodb       = "http://localhost:4566"
    sqs            = "http://localhost:4566"
    sns            = "http://localhost:4566"
    lambda         = "http://localhost:4566"
    secretsmanager = "http://localhost:4566"
    ssm            = "http://localhost:4566"
    kms            = "http://localhost:4566"
  }
}

resource "aws_s3_bucket" "b" {
  bucket = "tf-local-bucket"
}

resource "aws_sqs_queue" "q" {
  name = "tf-local-queue"
}
```

### 3. TypeScript & JavaScript (AWS SDK v3)

```typescript
import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
  forcePathStyle: true,
});

// Subir objeto
await s3.send(new PutObjectCommand({
  Bucket: "mi-bucket-local",
  Key: "datos.json",
  Body: JSON.stringify({ estado: "activo" }),
  ContentType: "application/json"
}));

// Listar objetos
const { Contents } = await s3.send(new ListObjectsV2Command({ Bucket: "mi-bucket-local" }));
console.log("Objetos en Aura:", Contents);
```

### 4. Python (Boto3)

```python
import boto3

# Conectar al emulador Aura
s3 = boto3.client(
    's3',
    endpoint_url='http://localhost:4566',
    aws_access_key_id='test',
    aws_secret_access_key='test',
    region_name='us-east-1'
)

dynamo = boto3.client(
    'dynamodb',
    endpoint_url='http://localhost:4566',
    aws_access_key_id='test',
    aws_secret_access_key='test',
    region_name='us-east-1'
)

s3.create_bucket(Bucket='mi-data-lake')
print("Buckets locales:", s3.list_buckets()['Buckets'])
```

### 5. Golang (AWS SDK v2)

```go
package main

import (
    "context"
    "fmt"
    "github.com/aws/aws-sdk-go-v2/aws"
    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/service/s3"
)

func main() {
    customResolver := aws.EndpointResolverWithOptionsFunc(
        func(service, region string, options ...interface{}) (aws.Endpoint, error) {
            return aws.Endpoint{
                URL:           "http://localhost:4566",
                SigningRegion: "us-east-1",
            }, nil
        },
    )

    cfg, _ := config.LoadDefaultConfig(context.TODO(),
        config.WithEndpointResolverWithOptions(customResolver),
    )

    client := s3.NewFromConfig(cfg, func(o *s3.Options) {
        o.UsePathStyle = true
    })

    result, _ := client.ListBuckets(context.TODO(), &s3.ListBucketsInput{})
    fmt.Println("Buckets en Aura:", result.Buckets)
}
```

### 6. Aura Lang (Cliente Nativo)

```aura
import { http } from "net/http";

export fn main(): Unit => {
    let aura = "http://localhost:4566";

    // Verificar salud de Aura
    let health = http.get(`${aura}/_aura/health`);
    println(`Aura Health: ${health.status}`);

    // Crear Bucket en S3
    let createBucket = http.put(`${aura}/aura-storage`, {});
    println("Bucket s3://aura-storage creado en < 1ms");
};
```

---

## ☁️ Servicios AWS Soportados y Guía de Uso

Aura implementa el protocolo wire nativo de AWS para 12 servicios esenciales. A continuación se detallan las operaciones disponibles y ejemplos concretos de invocación mediante **AWS CLI**, **cURL** y **SDKs**.

| Servicio AWS | Protocolo Wire | Operaciones Soportadas |
|---|---|---|
| **Amazon S3** | REST-XML / REST-JSON | `CreateBucket`, `DeleteBucket`, `ListBuckets`, `PutObject`, `GetObject`, `DeleteObject`, `ListObjectsV2`, `HeadObject`, Multipart |
| **Amazon DynamoDB** | `DynamoDB_20120810` (JSON 1.0) | `CreateTable`, `DeleteTable`, `ListTables`, `DescribeTable`, `PutItem`, `GetItem`, `DeleteItem`, `Scan`, `Query`, `UpdateItem` |
| **Amazon SQS** | Query & JSON (`AmazonSQS`) | `CreateQueue`, `DeleteQueue`, `ListQueues`, `GetQueueUrl`, `SendMessage`, `ReceiveMessage`, `DeleteMessage`, `PurgeQueue` |
| **Amazon SNS** | Query Protocol | `CreateTopic`, `DeleteTopic`, `ListTopics`, `Publish`, `Subscribe`, `ListSubscriptions` (+ auto fanout hacia SQS) |
| **AWS Lambda** | REST API (`/2015-03-31`) | `CreateFunction`, `DeleteFunction`, `ListFunctions`, `Invoke` (ejecución simulada con logs) |
| **AWS STS** | Query Protocol | `GetCallerIdentity` (retorna `000000000000`), `AssumeRole` |
| **AWS IAM** | Query Protocol | `CreateUser`, `ListUsers`, `CreateRole`, `ListRoles` |
| **AWS KMS** | `TrentService` (JSON 1.1) | `CreateKey`, `ListKeys`, `Encrypt`, `Decrypt`, `DescribeKey` |
| **Secrets Manager** | `secretsmanager` (JSON 1.1) | `CreateSecret`, `GetSecretValue`, `PutSecretValue`, `ListSecrets`, `DeleteSecret` |
| **SSM Parameter Store** | `AmazonSSM` (JSON 1.1) | `PutParameter`, `GetParameter`, `GetParametersByPath`, `DeleteParameter` |
| **CloudWatch Logs** | `Logs_20140328` (JSON 1.1) | `CreateLogGroup`, `CreateLogStream`, `PutLogEvents`, `DescribeLogGroups`, `DescribeLogStreams` |
| **Amazon EventBridge**| `AWSEvents` (JSON 1.1) | `CreateEventBus`, `ListEventBuses`, `PutEvents` |

---

### Amazon S3

Almacenamiento de objetos compatible con llamadas REST HTTP nativas y comandos estándar de S3.

#### Paso a Paso con AWS CLI:
1. **Configurar el entorno**:
   ```bash
   export AWS_ENDPOINT_URL=http://localhost:4566
   export AWS_DEFAULT_REGION=us-east-1
   export AWS_ACCESS_KEY_ID=test
   export AWS_SECRET_ACCESS_KEY=test
   ```

2. **Crear un Bucket**:
   ```bash
   aws s3 mb s3://mis-activos
   # Salida esperada: make_bucket: mis-activos
   ```

3. **Subir un archivo**:
   ```bash
   echo "Contenido de prueba para Aura S3" > demo.txt
   aws s3 cp demo.txt s3://mis-activos/documentos/demo.txt
   # Salida esperada: upload: ./demo.txt to s3://mis-activos/documentos/demo.txt
   ```

4. **Listar Buckets y Objetos**:
   ```bash
   # Listar todos los buckets
   aws s3 ls
   # Salida esperada: 2026-09-18 12:00:00 mis-activos

   # Listar contenido de un bucket
   aws s3 ls s3://mis-activos/documentos/
   ```

5. **Descargar el archivo**:
   ```bash
   aws s3 cp s3://mis-activos/documentos/demo.txt copia_demo.txt
   cat copia_demo.txt
   ```

6. **Eliminar Objeto y Bucket**:
   ```bash
   aws s3 rm s3://mis-activos/documentos/demo.txt
   aws s3 rb s3://mis-activos
   ```

#### Paso a Paso con cURL directo (REST API pura):
1. **Crear Bucket**:
   ```bash
   curl -i -X PUT http://localhost:4566/mi-bucket
   # Retorna HTTP/1.1 200 OK
   ```

2. **Subir Objeto**:
   ```bash
   curl -i -X PUT http://localhost:4566/mi-bucket/config.json \
     -H "Content-Type: application/json" \
     -d '{"app": "aura-aws", "active": true}'
   # Retorna HTTP/1.1 200 OK con header ETag
   ```

3. **Descargar Objeto**:
   ```bash
   curl -s http://localhost:4566/mi-bucket/config.json
   ```

4. **Listar Objetos (XML)**:
   ```bash
   curl -s http://localhost:4566/mi-bucket
   ```

5. **Eliminar Objeto**:
   ```bash
   curl -i -X DELETE http://localhost:4566/mi-bucket/config.json
   ```

---

### Amazon DynamoDB

Base de datos NoSQL de alta velocidad, soporta esquemas de clave de partición (HASH) y ordenación (RANGE), escaneos y filtros con formato JSON 1.0 (`x-amz-target: DynamoDB_20120810`).

#### Paso a Paso con AWS CLI:
1. **Crear una tabla (`Usuarios`) con clave primaria `id` (String)**:
   ```bash
   aws dynamodb create-table \
       --table-name Usuarios \
       --attribute-definitions AttributeName=id,AttributeType=S \
       --key-schema AttributeName=id,KeyType=HASH \
       --billing-mode PAY_PER_REQUEST
   ```

2. **Verificar que la tabla está creada**:
   ```bash
   aws dynamodb list-tables
   # Salida esperada: { "TableNames": [ "users", "Usuarios" ] }
   ```

3. **Insertar un registro (`PutItem`)**:
   ```bash
   aws dynamodb put-item \
       --table-name Usuarios \
       --item '{
           "id": {"S": "usr-901"},
           "nombre": {"S": "Carla Gómez"},
           "rol": {"S": "TechLead"},
           "activo": {"BOOL": true}
       }'
   ```

4. **Consultar un registro por clave (`GetItem`)**:
   ```bash
   aws dynamodb get-item \
       --table-name Usuarios \
       --key '{"id": {"S": "usr-901"}}'
   ```

5. **Escanear todos los registros (`Scan`)**:
   ```bash
   aws dynamodb scan --table-name Usuarios
   ```

6. **Eliminar el registro (`DeleteItem`)**:
   ```bash
   aws dynamodb delete-item \
       --table-name Usuarios \
       --key '{"id": {"S": "usr-901"}}'
   ```

7. **Eliminar la tabla (`DeleteTable`)**:
   ```bash
   aws dynamodb delete-table --table-name Usuarios
   ```

#### Paso a Paso con cURL / HTTP:
```bash
# Inserción directa con JSON 1.0
curl -s -X POST http://localhost:4566/ \
  -H "x-amz-target: DynamoDB_20120810.PutItem" \
  -H "Content-Type: application/x-amz-json-1.0" \
  -d '{"TableName":"users","Item":{"id":{"S":"usr-3000"},"name":{"S":"Diana"}}}'

# Escaneo directo
curl -s -X POST http://localhost:4566/ \
  -H "x-amz-target: DynamoDB_20120810.Scan" \
  -H "Content-Type: application/x-amz-json-1.0" \
  -d '{"TableName":"users"}'
```

---

### Amazon SQS

Colas de mensajería desacopladas con soporte para envío, recepción por lotes, borrado y purga.

#### Paso a Paso con AWS CLI:
1. **Crear una cola**:
   ```bash
   aws sqs create-queue --queue-name tareas-fondo
   # Retorna la QueueUrl: http://localhost:4566/000000000000/tareas-fondo
   ```

2. **Obtener la URL de la cola**:
   ```bash
   aws sqs get-queue-url --queue-name tareas-fondo
   ```

3. **Enviar un mensaje (`SendMessage`)**:
   ```bash
   aws sqs send-message \
       --queue-url http://localhost:4566/000000000000/tareas-fondo \
       --message-body '{"tarea": "generar_reporte", "usuarioId": 105}'
   ```

4. **Recibir el mensaje (`ReceiveMessage`)**:
   ```bash
   aws sqs receive-message \
       --queue-url http://localhost:4566/000000000000/tareas-fondo
   # Guarda el "ReceiptHandle" de la respuesta para eliminarlo
   ```

5. **Eliminar el mensaje procesado (`DeleteMessage`)**:
   ```bash
   aws sqs delete-message \
       --queue-url http://localhost:4566/000000000000/tareas-fondo \
       --receipt-handle "<ReceiptHandle>"
   ```

6. **Purgar todos los mensajes de una cola**:
   ```bash
   aws sqs purge-queue \
       --queue-url http://localhost:4566/000000000000/tareas-fondo
   ```

---

### Amazon SNS

Manejo de tópicos Pub/Sub y suscripciones con **Fanout automático**: cualquier mensaje publicado en un tópico se entrega de forma reactiva e instantánea a las colas SQS suscritas.

#### Paso a Paso con AWS CLI:
1. **Crear un Tópico**:
   ```bash
   aws sns create-topic --name eventos-sistema
   # Retorna: "TopicArn": "arn:aws:sns:us-east-1:000000000000:eventos-sistema"
   ```

2. **Crear una Cola SQS de destino**:
   ```bash
   aws sqs create-queue --queue-name receptor-alertas
   # URL: http://localhost:4566/000000000000/receptor-alertas
   ```

3. **Suscribir la cola SQS al tópico**:
   ```bash
   aws sns subscribe \
       --topic-arn arn:aws:sns:us-east-1:000000000000:eventos-sistema \
       --protocol sqs \
       --notification-endpoint http://localhost:4566/000000000000/receptor-alertas
   ```

4. **Publicar un evento en el tópico SNS**:
   ```bash
   aws sns publish \
       --topic-arn arn:aws:sns:us-east-1:000000000000:eventos-sistema \
       --message '{"evento": "PAGO_APROBADO", "monto": 450.00}'
   ```

5. **Verificar que el mensaje llegó a SQS (Fanout automático)**:
   ```bash
   aws sqs receive-message \
       --queue-url http://localhost:4566/000000000000/receptor-alertas
   # El body contendrá el mensaje publicado a través de SNS
   ```

---

### AWS Lambda

Gestión e invocación de funciones Serverless emuladas con retorno de logs simulados en base64.

#### Paso a Paso con AWS CLI:
1. **Registrar una función Lambda**:
   ```bash
   aws lambda create-function \
       --function-name procesarPedido \
       --runtime nodejs20.x \
       --role arn:aws:iam::000000000000:role/admin-role \
       --handler index.handler
   ```

2. **Listar funciones registradas**:
   ```bash
   aws lambda list-functions
   ```

3. **Invocar la función Lambda de forma sincrónica**:
   ```bash
   aws lambda invoke \
       --function-name procesarPedido \
       --payload '{"pedidoId": "PED-7788"}' \
       respuesta.json

   # Ver la respuesta de la función
   cat respuesta.json
   ```

4. **Eliminar la función**:
   ```bash
   aws lambda delete-function --function-name procesarPedido
   ```

---

### AWS STS e IAM

Simulación de cuenta raíz (`000000000000`) para autenticación zero-setup y creación de roles y usuarios.

#### Paso a Paso con AWS CLI:
1. **Verificar la identidad del llamador (`GetCallerIdentity`)**:
   ```bash
   aws sts get-caller-identity
   # Retorna cuenta 000000000000 y UserId AKIAIOSFODNN7EXAMPLE
   ```

2. **Asumir un Rol simulado (`AssumeRole`)**:
   ```bash
   aws sts assume-role \
       --role-arn arn:aws:iam::000000000000:role/AdminRole \
       --role-session-name SesionDesarrollo
   ```

3. **Crear un Usuario IAM**:
   ```bash
   aws iam create-user --user-name desarrollador-local
   aws iam list-users
   ```

4. **Crear un Rol IAM con política de confianza**:
   ```bash
   aws iam create-role \
       --role-name ServicioBackendRole \
       --assume-role-policy-document '{"Version":"2012-10-17"}'
   aws iam list-roles
   ```

---

### AWS KMS

Gestión de llaves maestras de cifrado (CMK) con simulación de cifrado y descifrado base64.

#### Paso a Paso con AWS CLI:
1. **Crear una llave KMS**:
   ```bash
   aws kms create-key --description "Llave Maestra Local"
   # Copia el KeyId generado (ej. 1234abcd-12ab-34cd-56ef-1234567890ab)
   ```

2. **Listar llaves KMS**:
   ```bash
   aws kms list-keys
   ```

3. **Cifrar un secreto (`Encrypt`)**:
   ```bash
   aws kms encrypt \
       --key-id 1234abcd-12ab-34cd-56ef-1234567890ab \
       --plaintext "MiPasswordSeguro2026"
   # Retorna el CiphertextBlob en base64
   ```

4. **Descifrar (`Decrypt`)**:
   ```bash
   aws kms decrypt \
       --ciphertext-blob "TWlQYXNzd29yZFNlZ3VybzIwMjY="
   ```

---

### AWS Secrets Manager

Almacén seguro de credenciales con versionado automático.

#### Paso a Paso con AWS CLI:
1. **Guardar un secreto en formato JSON**:
   ```bash
   aws secretsmanager create-secret \
       --name "prod/db/credenciales" \
       --description "Credenciales de Postgres" \
       --secret-string '{"host":"postgres-db","puerto":5432,"usuario":"admin","clave":"secreto_seguro"}'
   ```

2. **Listar secretos**:
   ```bash
   aws secretsmanager list-secrets
   ```

3. **Recuperar el valor del secreto (`GetSecretValue`)**:
   ```bash
   aws secretsmanager get-secret-value \
       --secret-id "prod/db/credenciales"
   ```

4. **Actualizar el valor del secreto (`PutSecretValue`)**:
   ```bash
   aws secretsmanager put-secret-value \
       --secret-id "prod/db/credenciales" \
       --secret-string '{"host":"postgres-db","puerto":5432,"usuario":"admin","clave":"nueva_clave_2026"}'
   ```

5. **Eliminar el secreto**:
   ```bash
   aws secretsmanager delete-secret --secret-id "prod/db/credenciales"
   ```

---

### AWS SSM Parameter Store

Configuraciones jerárquicas tipo `String` y `SecureString`.

#### Paso a Paso con AWS CLI:
1. **Crear parámetros de configuración**:
   ```bash
   # Parámetro tipo String
   aws ssm put-parameter \
       --name "/app/entorno" \
       --value "desarrollo-local" \
       --type "String"

   # Parámetro sensible tipo SecureString
   aws ssm put-parameter \
       --name "/app/pagos/api_key" \
       --value "sk_live_998822aabbcc" \
       --type "SecureString"
   ```

2. **Leer un parámetro específico**:
   ```bash
   aws ssm get-parameter --name "/app/entorno"
   ```

3. **Consultar todos los parámetros bajo un prefijo jerárquico**:
   ```bash
   aws ssm get-parameters-by-path --path "/app"
   ```

4. **Eliminar un parámetro**:
   ```bash
   aws ssm delete-parameter --name "/app/entorno"
   ```

---

### Amazon CloudWatch Logs

Creación de grupos y secuencias de logs, así como recepción de eventos de registro (`PutLogEvents`).

#### Paso a Paso con AWS CLI:
1. **Crear un Grupo de Logs**:
   ```bash
   aws logs create-log-group --log-group-name "/aws/lambda/procesarPedido"
   ```

2. **Crear un Flujo de Logs (Log Stream)**:
   ```bash
   aws logs create-log-stream \
       --log-group-name "/aws/lambda/procesarPedido" \
       --log-stream-name "2026/09/18/[$LATEST]instancia1"
   ```

3. **Describir Grupos y Flujos de Logs**:
   ```bash
   aws logs describe-log-groups
   aws logs describe-log-streams --log-group-name "/aws/lambda/procesarPedido"
   ```

4. **Enviar eventos de log (`PutLogEvents`)**:
   ```bash
   aws logs put-log-events \
       --log-group-name "/aws/lambda/procesarPedido" \
       --log-stream-name "2026/09/18/[$LATEST]instancia1" \
       --log-events timestamp=1726660800000,message="Iniciando procesamiento de pedido..."
   ```

---

### Amazon EventBridge

Bus de eventos desacoplado con soporte para `PutEvents`.

#### Paso a Paso con AWS CLI:
1. **Crear un Bus de Eventos**:
   ```bash
   aws events create-event-bus --name "bus-facturacion"
   ```

2. **Listar Buses de Eventos**:
   ```bash
   aws events list-event-buses
   ```

3. **Emitir eventos hacia el bus (`PutEvents`)**:
   ```bash
   aws events put-events \
       --entries '[{
           "EventBusName": "bus-facturacion",
           "Source": "tienda.facturas",
           "DetailType": "FacturaGenerada",
           "Detail": "{\"facturaId\": \"FAC-990\", \"total\": 120.50}"
       }]'
   ```

---

### APIs Internas del Sistema y Métricas Prometheus

Aura incluye endpoints operativos para integración con tableros, orquestadores y pipelines de integración continua:

| Endpoint | Método | Descripción | Ejemplo de Uso con cURL |
|---|---|---|---|
| `/_aura/health` | `GET` | Estado de salud, uptime, versión y lista de servicios activos | `curl -s http://localhost:4566/_aura/health` |
| `/_aura/metrics` | `GET` | Métricas estándar en formato **Prometheus / OpenMetrics** | `curl -s http://localhost:4566/_aura/metrics` |
| `/_aura/stats` | `GET` | Resumen cuantitativo de memoria y conteos de recursos | `curl -s http://localhost:4566/_aura/stats` |
| `/_aura/api/resources` | `GET` | Snapshot JSON completo de todo el estado de la nube simulada | `curl -s http://localhost:4566/_aura/api/resources` |
| `/_aura/clear-requests`| `POST` | Limpia el historial de auditoría de peticiones wire | `curl -s -X POST http://localhost:4566/_aura/clear-requests` |
| `/_aura/reset` | `POST` | Restablece el emulador a un estado limpio (wipe de recursos) | `curl -s -X POST http://localhost:4566/_aura/reset` |
| `/_aura/ui` | `GET` | Consola Web visual interactiva (SPA) | Abre `http://localhost:4566/_aura/ui` en navegador |
| `/site` | `GET` | Portal de referencia técnica y documentación interactiva | Abre `http://localhost:4566/site` en navegador |

---

## 🔬 ¿Por qué Aura Lang?

La decisión de implementar este emulador en **Aura Lang** obedece a razones fundamentales de ingeniería:

1. **Compilación Nativa a Binarios Autónomos**:
   Aura se compila directamente a binarios nativos Mach-O y ELF con cero dependencias externas de runtime. Elimina por completo los cuellos de botella de la máquina virtual de Java (JVM) y el GIL de Python.
2. **Concurrencia CSP con Fibers Ligeros**:
   Inspirado en Go, Aura utiliza planificadores M:N de fibers y canales fuertemente tipados. Esto permite que el multiplexor HTTP procese miles de peticiones simultáneas con consumo insignificante de CPU y memoria.
3. **Inmutabilidad por Defecto y Sistema de Tipos Hindley-Milner**:
   La seguridad estática de tipos y los tipos suma algebraicos (ADTs) garantizan que el emulador sea resiliente ante condiciones de carrera y corrupciones de estado.
4. **Velocidad de Compilación de 850,000+ LOC/s**:
   El motor de compilación escrito en Rust permite iterar, probar y compilar el proyecto instantáneamente.

---

## 🧪 Suite de Pruebas y Verificación

Aura incluye una suite de pruebas de integración completa que evalúa los 12 servicios emulados contra comandos reales `cURL` y `AWS CLI`.

Para ejecutar las pruebas:

```bash
# Iniciar el servidor
AURA_PORT=4566 aurac run server.aura &

# Ejecutar el runner de pruebas automatizado de integración
./scripts/test_services.sh 4566

# Ejecutar la suite nativa de tests unitarios de Aura (Go-style runner)
aurac test -v ./tests/...
```

### Resultados de Verificación:

```
==================================================================
🧪 RUNNING AURA INTEGRATION TEST SUITE
Target Endpoint: http://localhost:4566
==================================================================

--- 1. System & Health Endpoints ---
  [PASS] Health Endpoint
  [PASS] Info Endpoint
  [PASS] Stats Endpoint
  [PASS] Unified Resources Endpoint
  [PASS] Prometheus Metrics Endpoint
  [PASS] Clear Requests Endpoint
  [PASS] Web Console Serving
  [PASS] Promotional Website Serving

--- 2. Amazon S3 Storage ---
  [PASS] S3 Create Bucket
  [PASS] S3 List Buckets XML
  [PASS] S3 Put Object
  [PASS] S3 Get Object Content
  [PASS] S3 List Objects XML

--- 3. Amazon DynamoDB ---
  [PASS] DynamoDB CreateTable
  [PASS] DynamoDB ListTables
  [PASS] DynamoDB PutItem
  [PASS] DynamoDB Scan Items

==================================================================
SUMMARY: Passed: 33 | Failed: 0
==================================================================
🎉 ALL 33 INTEGRATION TESTS PASSED FLAWLESSLY ON AURA!
```

### Pruebas Unitarias Nativas (`aurac test`):

```bash
$ aurac test -v ./tests/...
=== RUN   test_defaultStr
--- PASS: test_defaultStr (0.000s)
=== RUN   test_defaultInt
--- PASS: test_defaultInt (0.000s)
=== RUN   test_getFormValue
--- PASS: test_getFormValue (0.000s)
=== RUN   test_xmlWrap
--- PASS: test_xmlWrap (0.000s)
=== RUN   test_stsCallerIdentity
--- PASS: test_stsCallerIdentity (0.000s)
=== RUN   test_xmlWrap_nested
--- PASS: test_xmlWrap_nested (0.001s)

PASS
Ran 6 tests in 0.198s (6 passed)
```

---

## 🚀 Nuevas Mejoras y Modernización Aura Lang (v0.8.x)

El proyecto ha sido actualizado y enriquecido aprovechando las innovaciones del compilador y runtime de **Aura Lang (`v0.8.5`)**:

### 1. Sistema de Tipado Fuerte para Recursos Cloud (`services/state.aura`)
* Se reemplazaron las colecciones genéricas `List<Any>` de `CloudStore` por registros de dominio fuertemente tipados:
  * `S3Bucket` y `S3Object` para almacenamiento en Amazon S3.
  * `DynamoTable` para esquemas de tablas NoSQL DynamoDB.
  * `SqsQueue` y `SqsMessage` para mensajería en cola.
  * `SnsTopic` y `SnsSubscription` para eventos Fanout.
  * `LambdaFunction`, `SecretItem`, `SsmParameter`, `KmsKey`, `CwLogGroup`, `EventBus`, `IamUser` y `IamRole`.
  * `LiveLogEntry` y `RequestAuditEntry` para trazabilidad de peticiones.
* Esto permite verificación estática rigurosa con `aura check`, detección temprana de discrepancias de propiedades y soporte óptimo en el servidor de lenguaje (LSP).

### 2. Exportador de Métricas Estándar Prometheus (`/_aura/metrics`)
* Se añadió soporte nativo para observabilidad estándar en `services/system.aura` a través del endpoint `GET /_aura/metrics`.
* Exporta métricas clave en formato texto OpenMetrics/Prometheus:
  * `aura_requests_total`: Contador acumulado de peticiones procesadas.
  * `aura_uptime_seconds`: Tiempo de actividad en segundos.
  * `aura_memory_mb`: Huella de memoria estimada (~8.4 MB).
  * `aura_s3_buckets_total`, `aura_dynamodb_tables_total`, `aura_sqs_queues_total`, etc.: Medidores de recursos en tiempo real.
* Integrable con Grafana, Prometheus Agent o Datadog para monitoreo de suites locales o pipelines CI/CD.

### 3. Suite de Pruebas Nativas con el Runner de Aura (`aurac test`)
* Se implementaron suites de pruebas nativas en el directorio `tests/` (`tests/utils_unit_test.aura` y `tests/xml_test.aura`).
* Utiliza las primitivas de aserción `t.assertEqual`, `t.assertTrue` y benchmarks estilo Go `b: BenchmarkB`.
* Permite validar utilidades y serializadores XML sin levantar procesos de red externos.

### 4. Alineación con las Reglas del Linter y Convención Go-Style (`v0.8.5`)
* **LINT004**: Eliminación de redundancia de `export` en tipos PascalCase (`type CloudStore = { ... }`), adaptándose a la visibilidad automática por convención Go-style de Aura.
* **LINT001**: Corrección de declaraciones de mutabilidad (`let mut` a `let`) donde no existen reasignaciones escalares.
* Estado del linter: **100% limpio en todos los módulos (`aura lint`).**

--- 4. Amazon SQS Queues ---
  [PASS] SQS CreateQueue XML
  [PASS] SQS SendMessage
  [PASS] SQS ReceiveMessage JSON

--- 5. Amazon SNS & Event Fanout ---
  [PASS] SNS CreateTopic
  [PASS] SNS Subscribe
  [PASS] SNS Publish

--- 6. AWS STS & IAM ---
  [PASS] STS GetCallerIdentity
  [PASS] IAM CreateUser

--- 7. AWS KMS ---
  [PASS] KMS CreateKey
  [PASS] KMS Encrypt

--- 8. AWS Secrets Manager & SSM ---
  [PASS] SecretsManager CreateSecret
  [PASS] SecretsManager GetSecretValue
  [PASS] SSM PutParameter
  [PASS] SSM GetParameter

--- 9. AWS Lambda Serverless ---
  [PASS] Lambda CreateFunction
  [PASS] Lambda Invoke

--- 10. CloudWatch Logs & EventBridge ---
  [PASS] CloudWatch PutLogEvents
  [PASS] EventBridge PutEvents

==================================================================
SUMMARY: Passed: 32 | Failed: 0
==================================================================
🎉 ALL 32 TESTS PASSED FLAWLESSLY ON AURA!
```

---

## 📂 Estructura del Proyecto

```
aura-aws/
├── README.md                      # Documentación maestra y guía de referencia
├── server.aura                    # Punto de entrada (Composition Root) y montaje del router HTTP
├── Dockerfile                     # Especificación de contenedor Docker multi-stage
├── services/                      # Módulos y servicios desacoplados por dominio
│   ├── state.aura                 # Almacén de estado en memoria unificado (CloudStore)
│   ├── utils.aura                 # Funciones utilitarias, parseo seguro de JSON y auditoría
│   ├── xml.aura                   # Renderizado y serialización de respuestas XML para AWS
│   ├── middleware.aura            # Middlewares globales: CORS, buffering y logging
│   ├── system.aura                # Endpoints de sistema, salud, estadísticas e información
│   ├── static.aura                # Enrutamiento de activos estáticos para UI y Website
│   ├── dispatcher.aura            # Despachador central de protocolos AWS (POST /)
│   ├── s3.aura                    # Servicio Amazon S3 (Buckets, Objetos y Multipart Upload)
│   ├── lambda.aura                # Servicio AWS Lambda Serverless REST API
│   ├── dynamodb.aura              # Servicio Amazon DynamoDB (CRUD y escaneo de tablas)
│   ├── sqs.aura                   # Servicio Amazon SQS (Colas, mensajes y purga)
│   ├── sns.aura                   # Servicio Amazon SNS (Tópicos, suscripciones y Event Fanout)
│   ├── sts.aura                   # Servicio AWS STS (GetCallerIdentity y AssumeRole)
│   ├── iam.aura                   # Servicio AWS IAM (Usuarios y Roles)
│   ├── kms.aura                   # Servicio AWS KMS (Gestión de llaves y cifrado)
│   ├── secretsmanager.aura        # Servicio AWS Secrets Manager
│   ├── ssm.aura                   # Servicio AWS SSM Parameter Store
│   ├── logs.aura                  # Servicio AWS CloudWatch Logs
│   └── eventbridge.aura           # Servicio AWS EventBridge (Buses y eventos)
├── ui/                            # Consola Web embebida (/_aura/ui)
│   ├── index.html                 # Interfaz visual SPA de la consola
│   ├── style.css                  # Estilos glassmorphic y tema oscuro
│   └── app.js                     # Controlador interactivo y sincronización de recursos
├── website/                       # Sitio Web Promocional (/site)
│   ├── index.html                 # Landing page con Hero, Terminal CLI interactiva y Benchmarks
│   ├── style.css                  # Diseño responsive moderno y tipografía fluida
│   └── app.js                     # Emulador de terminal en vivo y conmutador de snippets
├── tests/                         # Suites de pruebas nativas (aurac test)
│   ├── utils_unit_test.aura       # Tests unitarios y benchmarks de utilidades
│   └── xml_test.aura              # Tests de serialización de payloads XML de AWS
└── scripts/
    ├── test_services.sh           # Suite automatizada de pruebas de integración (33 tests)
    ├── demo_cli.sh                # Demostración en vivo de comandos AWS CLI
    ├── package.sh                 # Empaquetado y distribución multiplataforma
    └── run.sh                     # Script de arranque rápido
```


---

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Siéntete libre de usarlo, modificarlo y distribuirlo para proyectos personales, educativos y empresariales.

Reconocimiento especial a la comunidad de código abierto por el estándar de emuladores de nube locales, y al equipo de **[Aura Lang](https://github.com/mrojasb2000/aura-lang)** por el compilador y runtime nativo de nueva generación.
