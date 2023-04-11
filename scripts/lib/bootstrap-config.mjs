import * as dotenv from 'dotenv'
import chalk from 'chalk'
import inquirer from 'inquirer'


let showKeyFailureMessage = true
const keys = {}


export const validateConfiguration = async () => {
  const keyNames = getKeyNames()
  const keysToCheck = [
    keyNames.sealedSecretPrivateKeyPath,
    keyNames.sealedSecretPublicKeyPath,
    keyNames.repoName,
    keyNames.repoUrl,
    keyNames.repoUsername,
    keyNames.repoToken,
  ]
  for (const keyName of keysToCheck) {
    await checkKey(keyName)
  }
  console.log(`All required configuration settings are present.`)
}

const checkKey = async (key) => {
  let defaultKeys = getDefaultKeys()

  if (defaultKeys[key]) {
    keys[key] = defaultKeys[key]
    return keys[key]
  }

  if (showKeyFailureMessage) {
    showKeyFailureMessage = false
    console.log(`One or more required configuration keys are missing.`)
    console.log(chalk.bold(`\nPlease provide the following values: \n`))
  }

  const prompts = getKeyPrompt()
  const answers = await inquirer.prompt([prompts[key]])
  keys[key] = answers.value
  return keys[key]
}

export const getKeys = () =>
  keys

export const getKeyNames = () => ({
  sealedSecretPrivateKeyPath: 'sealedSecretPrivateKeyPath',
  sealedSecretPublicKeyPath: 'sealedSecretPublicKeyPath',
  repoName: 'repoName',
  repoUrl: 'repoUrl',
  repoUsername: 'repoUsername',
  repoToken: 'repoToken',
})

const getDefaultKeys = () => ({
  sealedSecretPrivateKeyPath: process.env.SEALED_SECRET_PRIVATE_KEY,
  sealedSecretPublicKeyPath: process.env.SEALED_SECRET_PUBLIC_KEY,
  repoName: process.env.REPO_NAME,
  repoUrl: process.env.REPO_URL,
  repoUsername: process.env.REPO_USERNAME,
  repoToken: process.env.REPO_TOKEN,
})

const getKeyPrompt = () => ({
  sealedSecretPrivateKeyPath: {
    type: "input",
    name: "value",
    message: "The path to your private tls.key file for sealed secrets",
  },
  sealedSecretPublicKeyPath: {
    type: "input",
    name: "value",
    message: "The path to your public tls.crt file for sealed secrets",
  },
  repoName: {
    type: "input",
    name: "value",
    message: "The GitOps repository name",
  },
  repoUrl: {
    type: "input",
    name: "value",
    message: "The GitOps repository url",
  },
  repoUsername: {
    type: "input",
    name: "value",
    message: "The GitOps repository username",
  },
  repoToken: {
    type: "input",
    name: "value",
    message: "The GitOps repository access token",
  },
})
