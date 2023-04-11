import chalk from 'chalk'
import ora from 'ora'
import { exec, pause, pad } from '../util/index.mjs'


export const installArgoOps = async () => {

  const spinner = ora(pad(`Argo Ops install`))
  spinner.start()

  const installed = await checkExists(spinner)

  if (installed) {
    spinner.succeed(`Argo Ops previously installed and available`)
    return
  }

  try {
    spinner.text = pad(`Argo Ops creating and applying kustomize templates`)
    await installKustomize(spinner)
    spinner.succeed(`Argo Ops successfully installed and now available`)
  }
  catch (error) {
    spinner.fail(`Argo Ops failed to install`)
    throw error
  }
}

const checkExists = async (spinner) => {
  try {
    await Promise.all([
      exec(`kubectl get namespace ops`),
      exec(`kubectl get namespace replicator`),
      exec(`kubectl get namespace sealed-secrets`),
      exec(`kubectl get namespace ambassador`),
    ])
    spinner.text = pad('Argo Ops previous install exists - verifying rollout')

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
    await exec(`kustomize build ./bootstrap/ops > ./bootstrap/ops/release.yaml`)
    await exec(`kubectl apply -f ./bootstrap/ops/release.yaml`)
    await pause(30)

    spinner.text = pad(`Argo Ops tempates applied - verifying rollout`)
    await waitForRollout()
    await pause(30)
  }
  catch (error) {
    throw Error(`Failed to install Argo Ops`)
  }
}

const waitForRollout = async () => {
  await exec(`kubectl -n ambassador rollout status deployments traffic-manager`)
  await exec(`kubectl -n replicator rollout status deployment replicator-kubernetes-replicator`)
  await exec(`kubectl -n sealed-secrets rollout status deployment sealed-secrets`)
}
