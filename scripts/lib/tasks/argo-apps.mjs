import chalk from 'chalk'
import ora from 'ora'
import { exec, pause, pad } from '../util/index.mjs'


export const installApps = async () => {

  const spinner = ora(pad(`Argo Acme install applications`))
  spinner.start()

  const installed = await checkExists(spinner)

  if (installed) {
    spinner.succeed(`Argo Acme applications previously installed and available`)
    return
  }

  try {
    spinner.text = pad('Argo Acme applications creating and applying kustomize templates')
    await installKustomize(spinner)
    spinner.succeed(`Argo Acme applications successfully installed and now available`)
  }
  catch (error) {
    spinner.fail(`Argo Acme applications failed to install`)
    throw error
  }
}

const checkExists = async (spinner) => {
  try {
    await Promise.all([
      exec(`kubectl get namespace acme-api`),
    ])
    spinner.text = pad('Argo Acme applications previous install exists - verifying rollout')

    await pause()
    await waitForRollout()
    return true
  }
  catch (error) {
    return false
  }
}

const installKustomize = async (spinner) => {
  try {
    await exec(`kustomize build ./bootstrap/acme > ./bootstrap/acme/release.yaml`)
    await exec(`kubectl apply -f ./bootstrap/acme/release.yaml`)
    await pause(30)

    spinner.text = pad(`Argo Acme application templates applied - verifying rollout`)
    await waitForRollout()
    await pause(30)
  }
  catch (error) {
    throw Error(`Failed to install Acme applications`)
  }
}

const waitForRollout = async () => {
  await exec(`kubectl -n acme-api rollout status deployment api`)
}
