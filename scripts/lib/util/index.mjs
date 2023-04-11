import util from 'util'
import child_process from 'child_process'
import chalk from 'chalk'


export const exec = util.promisify(child_process.exec)

export const run = async (cmd, log = false) => {
  try {
    await exec(cmd)
  }
  catch (error) {
    if (log) { 
      console.log(chalk.red(error.message))
    }
    throw error
  }
}

export const pause = async (seconds = 2) => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

export const pad = (text) => {
  return `${text}\n\n`
}
