import chalk from 'chalk'
import ora from 'ora'
import { exec, pause, pad } from '../util/index.mjs'


const version = '5.27.2'

export const installArgoCD = async () => {

  const spinner = ora(pad(`Argo CD install version ${version}`))
  spinner.start()

  const installed = await checkExists(spinner)

  if (installed) {
    spinner.succeed(`Argo CD version ${version} previously installed and avaialable`)
    return
  }

  try {
    spinner.text = pad(`Argo CD installing version ${version} via Helm`)
    await installHelmChart(spinner)

    spinner.succeed(`Argo CD version ${version} successfully installed and now available`)
  }
  catch (error) {
    spinner.fail(`Argo CD failed to install`)
    throw error
  }
}

const checkExists = async (spinner) => {
  try {
    await exec(`kubectl get namespace argocd`)
    spinner.text = pad('Argo CD previous install exists - verifying rollout')

    await waitForRollout()
    await pause(5)
    return true
  }
  catch (error) {
    return false
  }
}

const installHelmChart = async (spinner) => {
  try {
    await exec(`helm install argocd argo/argo-cd --namespace argocd --create-namespace --version ${version}`)
    await pause(30)
  
    spinner.text = pad(`Argo CD helm chart applied - verifying rollout`)
    await waitForRollout()
    await pause(30)
  }
  catch (error) {
    throw Error(`Failed to install Argo CD`)
  }
}

const waitForRollout = async () => {
  await exec(`kubectl -n argocd rollout status deployment argocd-server`)
}
