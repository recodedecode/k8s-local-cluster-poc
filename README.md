> ***IMPORTANT:** This repo is a Proof of Concept used to demonstrate how a team might have a "quick start" for launching a Kubernetes Argo based cluster locally for development purposes. This does not represent any companies work or contain any sensitive information that is not for demo purposes only.*
>
> *It was smashed down rather quickly so there's sure to be gaps.*

# K8s Local Cluster POC

This is the GitOps proof-of-concept repo for a kubernetes application and associated services. Its purpose is to show how a local dev environment can be easily shared and stood up using Kubernetes.

The repo has a quickstart `npm run bootstrap` command that will spin up all the necessary services in the required order. It is necessary to have setup the `.env` file and added the appropriate certificates beforehand. We use a bootstrap script because we can't rely soley on Argo to setup the shared dependencies such as Argo itself and the custom certificates used for Sealed Secrets as well as the auth token necessary for setting up the Argo private repository. These steps must happen in order and certain applications must be available before they can be run.

While it's easy enough to replicate applications in a cluster using [vcluster](https://www.vcluster.com/) (or something like) this is for bootstrapping a local cluster from zero to hero.


## Contents

* [Before you begin](#before-you-begin)
* [Quick start](#quick-start)
* [Github container registry auth](#github-container-registry-auth)

## Before You Begin
You will need to ensure you have the appropriate certs available in order to unseal sealed secrets. These are not provided in this repo but you can easily create your own.

## Strcture
This repo is setup for GitOps with following conventions:

* `acme` - holds the unique "product" application services.
* `bootstrap` - holds the launching projects and applications for Argo CD.
* `certs` - is where you would likely store you copy of the Sealed Secrets custom certs.
* `ops` - key operational services used by vendor and application services.
* `scripts` - simple nodejs scripts used for bootstrapping the local cluster to make it easier.
* `vendor` - external vendor services/applications needed by the application.

## Quick Start
You can quickly install Argo with it's configuration, services and applications using a pre-built startup script.
You will need to ensure you have the correct environment variables available as well as the public and private key for the custom Sealed Secret setup.

```
npm install

npm run bootstrap
```


## Github Container Registry Auth
In order to pull containers from the GH Container Registry a read package token is required. You will need to create the token and then encode and add it to the appropriate sealed secret [ghcr-auth.yaml](../acme/ghcr-auth.yaml).

In this POC we have a demo example which will be replicated to any namespace prefixed with `acme-`. This provides a single place to keep the secret while having it replicate to the needed namespaces rather than repeating this process as your application services grow.

##### Encode the auth credentials

```
kubectl create secret docker-registry ghcr-login-secret --docker-server=https://ghcr.io --docker-username=$YOUR_GITHUB_USERNAME --docker-password=$YOUR_GITHUB_TOKEN --docker-email=$YOUR_EMAIL --namespace=$NAMESPACE
```

##### OR

```
echo -n '{"auths":{"https://ghcr.io":{"username":"<username>","password":"<pat>","email":"<email>", "auth":"dXNlcm5hbWU6cGFzc3dvcmQ="}}}' | base64
```

##### Add to a temporary secet yaml file.

```
# ghcr-auth.temp.yaml
apiVersion: v1
kind: Secret
type: kubernetes.io/dockerconfigjson
metadata:
  name: ghcr-auth
  namespace: acme
data:
  .dockerconfigjson: eyJhdXRocyI6eyJodHRwczovL2doY3IuaW8iOnsidXNlcm5hbWUiOiI8dXNlcm5hbWU+IiwicGFzc3dvcmQiOiI8cGF0PiIsImVtYWlsIjoiPGVtYWlsPiIsICJhdXRoIjoiZFhObGNtNWhiV1U2Y0dGemMzZHZjbVE9In19fQ==
```

##### Encode Sealed Secret
Run the following command and ensure the resulting file is located at `acme/ghcr-auth.yaml`.

```
cat ghcr-auth.temp.yaml | kubeseal \
    --controller-namespace sealed-secrets \
    --controller-name sealed-secrets \
    --format yaml \
    > ghcr-auth.yaml
```
