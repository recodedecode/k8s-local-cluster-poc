import * as dotenv from 'dotenv'
import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'
import open from 'open'
import { validateConfiguration, getKeyNames, getKeys } from './lib/bootstrap-config.mjs'
import { exec, pause, pad } from './lib/util/index.mjs'
import * as fromTasks from './lib/tasks/index.mjs'
import { loginToAdminDashboard } from './lib/argo-dashboard-login.mjs'


dotenv.config()

const main = async () => {

  console.log(chalk.yellowBright.bold('\nBootstrap K8s'))
  console.log(`Checking for all required configuration settings.`)
  
  await validateConfiguration()
  console.log(`\nBeginning bootstrap process...\n`)

  const keys = getKeys()
  const keyNames = getKeyNames()

  const privateKey = keys[keyNames.sealedSecretPrivateKeyPath]
  const publicKey = keys[keyNames.sealedSecretPublicKeyPath]

  const repoName = keys[keyNames.repoName]
  const repoUsername = keys[keyNames.repoUsername]
  const repoUrl = keys[keyNames.repoUrl]
  const repoToken = keys[keyNames.repoToken]

  await fromTasks.installArgoCD()
  await fromTasks.installArgoRepo(repoName, repoUsername, repoUrl, repoToken)
  await fromTasks.installArgoOps()
  await fromTasks.installArgoSealedSecretCert(privateKey, publicKey)
  await fromTasks.installVendor()
  await fromTasks.installApps()

  console.log(chalk.yellowBright(`\nSuccessfully completed boostrapping K8s cluster and services.`))
  await openDashboard()
}

const openDashboard = async () => {
  console.log(`\nArgo CD Admin Dashboard is available with the following commands:\n`)
  console.log(chalk.cyan(`  kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo`))
  console.log(chalk.cyan(`  kubectl port-forward svc/argocd-server -n argocd 8080:443`))
  console.log('')

  const answers = await inquirer.prompt([{
    type: "confirm",
    name: "value",
    message: "Would you like to login to the Argo CD admin dashboard?",
    default: false,
  }])

  if ( ! answers.value) {
    return
  }

  await loginToAdminDashboard()
}

main()
