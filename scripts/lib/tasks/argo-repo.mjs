import chalk from 'chalk'
import ora from 'ora'
import { exec, pause, pad } from '../util/index.mjs'


export const installArgoRepo = async (name, username, repoUrl, token) => {

  const spinner = ora(pad(`Argo GitOps install repository - ${repoUrl}`))
  spinner.start()

  const installed = await checkExists(name)

  if (installed) {
    spinner.succeed(`Argo GitOps previously installed repository - ${repoUrl}`)
    return
  }

  try {
    spinner.text = pad(`Argo GitOps install repository - ${repoUrl}`)
    const yaml = createRepoYaml(name, username, repoUrl, token)
    await installYaml(yaml)
  
    spinner.succeed(`Argo GitOps successfully installed respository - ${repoUrl}`)
  }
  catch (error) {
    spinner.fail(`Argo GitOps failed to install repository - ${repoUrl}`)
    throw error
  }
}

const checkExists = async (name) => {
  try {
    await exec(`kubectl -n argocd get secrets ${name}`)
    return true
  }
  catch (error) {
    return false
  }
}

const installYaml = async (yaml) => {
  try {
    await exec(`export REPO_CONFIG=${JSON.stringify(JSON.stringify(yaml))} && echo $REPO_CONFIG | kubectl apply -f -`)
    await pause()
  }
  catch (error) {
    throw Error(`Failed to install Argo GitOps repository`)
  }
}

const createRepoYaml = (name, username, repoUrl, token) => ({
  apiVersion: 'v1',
  kind: 'Secret',
  metadata: {
    name: name,
    namespace: 'argocd',
    labels: {
      'argocd.argoproj.io/secret-type': 'repository'
    }
  },
  stringData: {
    url: repoUrl,
    password: token,
    username: username,
  }
})
