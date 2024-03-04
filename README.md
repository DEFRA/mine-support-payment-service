[![Known Vulnerabilities](https://snyk.io/test/github/DEFRA/ffc-demo-payment-service/badge.svg?targetFile=package.json)](https://snyk.io/test/github/DEFRA/ffc-demo-payment-service?targetFile=package.json)

# FFC Demo Payment Service

Digital service mock to claim public money in the event property subsides into mine shaft.  The payment service subscribes to a message queue for new claims and saves a monthly payment schedule in a Postgresql database.  It also subscribes to the queue for new calculations and updates the value to pay in the database.

## Prerequisites

- Access to an instance of an
[Azure Service Bus](https://docs.microsoft.com/en-us/azure/service-bus-messaging/)(ASB).
- Docker
- Docker Compose

Optional:
- Kubernetes
- Helm

### Azure Service Bus
This service depends on a valid Azure Service Bus connection string for
asynchronous communication.  The following environment variables need to be set
in any non-production (`process.env.NODE_ENV !== production`)
environment before the Docker container is started. When deployed
into an appropriately configured AKS cluster (where
[Azure Workload Identity](https://learn.microsoft.com/en-us/azure/aks/workload-identity-overview) is
configured) the micro-service will use Azure Workload Identity configured on the deployment helm template which is included in the application helm chart.
| Name                               | Description                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| MESSAGE_QUEUE_HOST                 | Azure Service Bus hostname, e.g. `myservicebus.servicebus.windows.net`                       |
| MESSAGE_QUEUE_PASSWORD             | Azure Service Bus SAS policy key                                                             |
| MESSAGE_QUEUE_USER                 | Azure Service Bus SAS policy name, e.g. `RootManageSharedAccessKey`                          |

## Environment variables

The following environment variables are required by the application container. Values for development are set in the Docker Compose configuration. Default values for production-like deployments are set in the Helm chart and may be overridden by build and release pipelines.

| Name                           | Description                             | Required  | Default                   | Valid                       | Notes                                                                             |
| ----                           | -----------                             | :-------: | -------                   | -----                       | -----                                                                             |
| APPINSIGHTS_CLOUDROLE          | Role used for filtering metrics         | no        |                           |                             | Set to `ffc-demo-payment-service-local` in docker compose files                   |
| APPINSIGHTS_INSTRUMENTATIONKEY | Key for application insight             | no        |                           |                             | App insights only enabled if key is present. Note: Silently fails for invalid key |
| B2C_CLIENT_ID                  | Client ID of B2C OpenID Connect app     | no        |                           |                             |                                                                                   |
| B2C_CLIENT_SECRET              | Client Secret of B2C OpenID Connect app | no        |                           |                             |                                                                                   |
| B2C_URL                        | OAuth URL of B2C OpenID Connect app     | no        |                           |                             |                                                                                   |
| NODE_ENV                       | Node environment                        | no        | development               | development,test,production |                                                                                   |
| PAYMENT_QUEUE_ADDRESS          | 'Payment' message queue name            | no        | payment                   |                             |                                                                                   |
| PORT                           | Port number                             | no        | 3004                      |                             |                                                                                   |
| POSTGRES_HOST                  | Host of database server                 | no        | ffc-demo-payment-postgres |                             | the service can be run against an external database by setting the database host and schema credentials as env vars |
| POSTGRES_SCHEMA_PASSWORD       | Password of schema user                 | no        | ppp                       |                             | see above                                                                         |
| POSTGRES_SCHEMA_NAME           | Name of postgres schema                 | no        | public                    |                             | see above                                                                         |
| POSTGRES_SCHEMA_USER           | schema user account                     | no        | postgres                  |                             | see above                                                                         |
| OIDC_PROVIDER                  | set the OIDC provider to use            | no        | dev                       | dev, okta, b2c              |                                                                                   |
| OKTA_AUTH_SERVER_ID            | ID of Okta custom authorisation server  | no        |                           |                             |                                                                                   |
| OKTA_CLIENT_ID                 | Client ID of Okta OpenID Connect app    | no        |                           |                             |                                                                                   |
| OKTA_DOMAIN                    | Okta domain, i.e. `mysite.okta.com`     | no        |                           |                             |                                                                                   |
| SCHEDULE_QUEUE_ADDRESS         | 'Schedule' message queue name           | no        | schedule                  |                             |                                                                                   |

## Building the project locally

The API can be secured using JWT access tokens, verified against an [Okta](https://www.okta.com/) authentication server, B2C, or disabled for local development.

Okta specific environment variables must be set if `OIDC_PROVIDER` is set to `"okta"`.
A valid Okta OpenID Connect application is required, and the Okta domain, client ID, and Custom Authorisation
Server ID must be set in the environment variables `OKTA_DOMAIN`, `OKTA_CLIENT_ID`, and `OKTA_AUTH_SERVER_ID` respectively.

B2C specific environment variables must be set if `OIDC_PROVIDER` is set to `"b2c"`.
A valid B2C OpenID Connect application is required, and the B2C client ID, Client Secret, Oauth URL, and URL of the site
must be set in the environment variable `B2C_CLIENT_ID`, `B2C_CLIENT_SECRET`, and `B2C_URL` respectively.

## How to run tests

A convenience script is provided to run automated tests in a containerised environment. The first time this is run, container images required for testing will be automatically built. An optional `--build` (or `-b`) flag may be used to rebuild these images in future (for example, to apply dependency updates).

```
# Run tests
scripts/test

# Rebuild images and run tests
scripts/test --build
```

This runs tests via a `docker-compose run` command. If tests complete successfully, all containers, networks and volumes are cleaned up before the script exits. If there is an error or any tests fail, the associated Docker resources will be left available for inspection.

Alternatively, unit tests may be run locally via npm:

```
# Run unit tests without Docker
npm run test:unit
```

The [package.json](package.json) contains scripts to run the different suites of tests individually: `test:unit`,
`test:integration`, and `test:pact`. Unit tests may be run locally with the appropriate environment variables found in the [docker-compose](docker-compose.yaml) file.

Tests that rely on containers to provide databases may be run by passing the suite to be run to the docker-compose command. An example command to run the integration tests is shown below.

`docker-compose -f docker-compose.yaml -f docker-compose.test.yaml run ffc-demo-payment-service sh -c "npm run test:integration"`

Running the integration tests locally requires access to ASB, this can be
achieved by setting the following environment variables:

`MESSAGE_QUEUE_HOST`, `MESSAGE_QUEUE_PASSWORD`, `MESSAGE_QUEUE_USER`.
`PAYMENT_QUEUE_ADDRESS` & `SCHEDULE_QUEUE_ADDRESS`
must be set to valid, developer specific queues that are available on ASB, e.g.
for the payment queue that would be `ffc-demo-payment-<initials>` where
`<initials>` are the initials of the developer.

### Contract testing

Contract testing has been introduced to the service, using the Pact toolkit. Tests are located in test/contract and run as part of a full test run, or can be run in isolation via `npm run test:pact`. The tests verify that the requirements of the 'Pact', a JSON file located in test/contract/pact, are met. This file is generated by the contract test run in the payment web app (ffc-demo-payment-web) and should be kept up-to-date with any changes until a Pact broker is implemented.

## Running the application

The application is designed to run in containerised environments, using Docker Compose in development and Kubernetes in production.

### Deploy to Kubernetes

For production deployments, 2 helm charts are included in the `.\helm` folder.
- `ffc-demo-payment-service-infra` for Application infrastructure deployment (servicebus queues, topics, storage accounts) using [`adp-aso-helm-library`](https://github.com/DEFRA/adp-aso-helm-library)
- `ffc-demo-payment-service` for Application deployment using [`adp-helm-library`](https://github.com/DEFRA/adp-helm-library)

These helm charts take developer inputs from [values.yaml](/helm/ffc-demo-payment-service/values.yaml) and [values.yaml](/helm/ffc-demo-payment-service-infra/values.yaml). On running the [`CI pipeline`](.azuredevops/build.yaml) the images and helm charts are built and published to environment level Azure Container Registries.

### Build container image

Container images are built using Docker Compose, with the same images used to run the service with either Docker Compose or Kubernetes.

### Build the service
  * `docker-compose build`

### Start and stop the service

Use Docker Compose to run service locally.

The service uses [Liquibase](https://www.liquibase.org/) to manage database migrations. To ensure the appropriate migrations have been run the utility script `scripts/start` may be run to execute the migrations, then the application.

Alternatively the steps can be run manually:
* run migrations
  * `docker-compose -f docker-compose.migrate.yaml run --rm database-up`
* start
  * `docker-compose up`
* stop
  * `docker-compose down` or CTRL-C

Additional Docker Compose files are provided for scenarios such as linking to other running services.

Link to other services and expose inspection Artemis and Postgres ports:
* `docker network create ffc-demo`
* `docker-compose -f docker-compose.yaml -f docker-compose.link.yaml -f docker-compose.override.yaml up`

### Database migrations
Database migrations can be run locally using the below command which applies the liquibase changelog defined in `changelog` directory by running the migration scripts in `scripts/migration`. 
```
docker-compose -f docker-compose.migrate.yaml run --rm database-up
```
While commiting the code changes to git repository, as part of CI pipeline, a new database migration image is created from `db-migration.Dockerfile` dockerfile. This contains the necessary scripts, liquibase changelog files. This image has Azure CLI installed in it and applies database migrations using Azure Workload Identity associated with the database migration job. 

### Test the service

This service reacts to messages retrieved from an Azure Service Bus.

`docker-compose up` to start the service with a connection to the configured Azure Service Bus instance and developer queues.

Alternatively test messages can be sent via a client that supports sending to Azure Service Bus.

Sample valid JSON for each message queue is:

```
# Sample payment queue message
{
  "claimId": "MINE123",
  "value": 190.96
}

# Sample schedule queue message
{
  "claimId": "MINE123"
}
```


**Database**

The insertion of records into the postgres db can be checked using psql. For example

```
PGPASSWORD={password} psql -h localhost -p 5432 -d ffc_demo_payments -U postgres --command "select * from schedules"
PGPASSWORD={password} psql -h localhost -p 5432 -d ffc_demo_payments -U postgres --command "select * from payments"
```
Note: the dev postgres password is defined in docker-compose.yaml

### Link to sibling services

To test interactions with sibling services in the FFC demo application, it is necessary to connect each service to an external Docker network, along with shared dependencies such as databases. The most convenient approach for this is to start the entire application stack from the [`ffc-demo-development`](https://github.com/DEFRA/ffc-demo-development) repository.

It is also possible to run a limited subset of the application stack. See the [`ffc-demo-development`](https://github.com/DEFRA/ffc-demo-development) README for instructions.

#### Accessing the pod

By default, the service is not exposed via an endpoint within Kubernetes.

Access may be granted by forwarding a local port to the deployed pod:

```
# Forward local port to the Kubernetes deployment
kubectl port-forward --namespace=ffc-demo deployment/ffc-demo-payment-service 3004:3004
```

Once the port is forwarded, the service can be accessed and tested in the same way as described in the "Test the service" section above.

#### Probes

The service has both an Http readiness probe and an Http liveness probe configured to receive at the below end points.

Readiness: `/healthy`
Liveness: `/healthz`

The readiness probe will test for both the availability of a PostgreSQL database and the two active message queue connections.

Sequelize's `authenticate` function is used to test database connectivity.  This function tries to run a basic query within the database.

## Build Pipeline

The [CI Pipeline](.azuredevops/build.yaml) does the following
- The application is validated
- The application is tested
- The application is built into deployable artifacts (images and helm charts)
- Pushing the artifacts to Azure Container Registry

A detailed description on the build pipeline [wiki page](https://github.com/DEFRA/ado-pipeline-common/blob/main/docs/AppBuildAndDeploy.md) 

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
