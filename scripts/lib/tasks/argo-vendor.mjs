import chalk from 'chalk'
import ora from 'ora'
import { exec, pause, pad } from '../util/index.mjs'


export const installVendor = async () => {

  const spinner = ora(pad(`Argo Vendor install services`))
  spinner.start()

  const installed = await checkExists(spinner)

  if (installed) {
    spinner.succeed(`Argo Vendor services previously installed and available`)
    return
  }

  try {
    spinner.text = pad('Argo Vendor services creating and applying kustomize templates')
    await installKustomize(spinner)
    spinner.succeed(`Argo Vendor services successfully installed and now available`)
  }
  catch (error) {
    spinner.fail(`Argo Vendor services failed to install`)
    throw error
  }
}

const checkExists = async (spinner) => {
  try {
    await Promise.all([
      exec(`kubectl get namespace flipt`),
      exec(`kubectl get namespace kafka`),
      exec(`kubectl get namespace mariadb`),
      exec(`kubectl get namespace redis`),
    ])
    spinner.text = pad('Argo Vendor services previous install exists - verifying rollout')

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
    await exec(`kustomize build ./bootstrap/vendor > ./bootstrap/vendor/release.yaml`)
    await exec(`kubectl apply -f ./bootstrap/vendor/release.yaml`)
    await pause(30)

    spinner.text = pad(`Argo Vendor service templates applied - verifying rollout`)
    await waitForRollout()
    await pause(30)
  }
  catch (error) {
    throw Error(`Failed to install Vendor services`)
  }
}

const waitForRollout = async () => {
  await exec(`kubectl -n redis rollout status sts redis-master`)
}
