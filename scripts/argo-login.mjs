import { loginToAdminDashboard } from './lib/argo-dashboard-login.mjs'


const main = async () => {
  await loginToAdminDashboard()
}

main()
