import chalk from 'chalk'
import ora from 'ora'
import { exec, pause, pad } from '../util/index.mjs'


export const installArgoSealedSecretCert = async (privateKey, publicKey) => {

  const spinner = ora(pad(`Argo Sealed Secrets install custom cert`))
  spinner.start()

  const installed = await checkExists(spinner)

  if (installed) {
    spinner.succeed(`Argo Sealed Secrets custom cert previously installed and available`)
    return
  }

  try {
    spinner.text = pad(`Argo Sealed Secrets installing custom cert`)
    await installKustomize(spinner, privateKey, publicKey)
    spinner.succeed(`Argo Sealed Secrets custom cert successfully installed and now available`)
  }
  catch (error) {
    spinner.fail(`Argo Sealed Secrets custom cert failed to install`)
    throw error
  }
}

const checkExists = async (spinner) => {
  try {
    await exec(`kubectl get namespace sealed-secrets`)
    await exec(`kubectl -n sealed-secrets get secrets sealed-secrets-poc`)
    spinner.text = pad('Argo Sealed Secrets custom cert previous install exists - verifying rollout')

    await pause()
    await waitForRollout()
    return true
  }
  catch (error) {
    return false
  }
}

const installKustomize = async (spinner, privateKey, publicKey) => {
  try {
    await exec(`kubectl -n sealed-secrets create secret tls sealed-secrets-poc --cert="${publicKey}" --key="${privateKey}"`)
    await exec(`kubectl -n sealed-secrets label secret sealed-secrets-poc sealedsecrets.bitnami.com/sealed-secrets-key=active`)
    spinner.text = pad('Argo Sealed Secrets installed custom cert and restarting controller')
  
    await pause()
    await exec(`kubectl delete --all pods --namespace=sealed-secrets`)
  
    await pause(30)
    await waitForRollout()
    await pause(30)
  }
  catch (error) {
    throw Error(`Failed to install Argo Sealed Secrets custom cert`)
  }
}

const waitForRollout = async () => {
  await exec(`kubectl -n sealed-secrets rollout status deployment sealed-secrets`)
}
