import * as dotenv from 'dotenv'
import chalk from 'chalk'
import open from 'open'
import ora from 'ora'
import { exec, pause, pad } from './lib/util/index.mjs'


export const loginToAdminDashboard = async () => {
  
  const spinner = ora(pad('Open port-forwarding to Argo CD admin dashboard'))
  spinner.start()

  const { stdout } = await exec(`kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo`)

  setTimeout(() => {
    openDashboard(stdout, spinner)
  }, 2000)

  await exec(`kubectl port-forward svc/argocd-server -n argocd 8080:443`)
}

const openDashboard = async (secret, spinner) => {
  spinner.succeed('Argo CD admin dashboard available at https://localhost:8080\n')

  console.log(`Argo CD admin dashboard available at:\n`)
  console.log(chalk.cyan(` - https://localhost:8080`))
  console.log(chalk.cyan(` - username: admin`))
  console.log(chalk.cyan(` - password: ${secret}`))

  await pause()
  await open('https://localhost:8080')
}
