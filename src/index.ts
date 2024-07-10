/**
 * 1password-load-secrets-action
 */

import os from 'node:os'
import * as core from '@actions/core'
import { downloadTool, extractZip } from '@actions/tool-cache'
import { validateCli, read } from '@1password/op-js'

const exportEnv = core.getBooleanInput('export-env')
const unsetPrevious = core.getBooleanInput('unset-previous')

const env = {
  serviceAccountToken: 'OP_SERVICE_ACCOUNT_TOKEN',
  connectHost: 'OP_CONNECT_HOST',
  connectToken: 'OP_CONNECT_TOKEN',
  managedVariables: 'OP_MANAGED_VARIABLES'
}

const unloadSecrets = (): void => {
  core.info('Beginning unload...')
  if (process.env[env.managedVariables]) {
    process.env[env.managedVariables]?.split(',').forEach(e => {
      core.info(`Unloading ${e}`)
      core.exportVariable(e, undefined)
    })
  }
}

const validateAuth = (): void => {
  const serviceAccountToken = process.env[env.serviceAccountToken]
  const connect = process.env[env.connectHost] && process.env[env.connectToken]

  if (!connect && !serviceAccountToken)
    throw new Error(
      `Either ${env.serviceAccountToken} or both ${env.connectHost} & ${env.connectToken} must be present in the environment`
    )

  if (connect && serviceAccountToken)
    core.warning(
      'WARNING: Both authentication methods detected. Using Connect credentials.'
    )

  core.info(
    `Successfully authenticated with ${
      connect ? 'Connect' : 'Service account'
    }.`
  )
}

const generateURL = async (version: string): Promise<string> => {
  let arch: string = os.machine()
  switch (arch) {
    case 'x86_64':
      arch = 'amd64'
      break
    case 'i386':
      arch = '386'
      break
  }
  let platform: string = os.platform()
  platform = platform == 'win32' ? 'windows' : platform

  if (!['386', 'amd64', 'arm', 'arm64'].includes(arch))
    throw new Error(
      `Sorry, your operating system's architecture "${arch}" is unsupported`
    )

  if (!['darwin', 'freebsd', 'linux', 'openbsd', 'windows'].includes(platform))
    throw new Error(
      `Sorry, your operating system "${platform}" is unsupported`
    )

  return `https://cache.agilebits.com/dist/1P/op2/pkg/v${version}/op_${platform}_${arch}_v${version}.zip`
}

const installCli = async (): Promise<void> => {
  await validateCli()
    .then(async () => core.debug('"op" already installed'))
    .catch(async () => {
      core.info('Getting latest version')
      let version = (
        await (
          await fetch(
            'https://app-updates.agilebits.com/check/1/0/CLI2/en/2.0.0/N'
          )
        ).json()
      ).version

      core.info('"op" not found, installing...')
      const url = await generateURL(version)

      core.info(`Downloading "${url}"`)
      const op = await downloadTool(url)

      core.info(`Extracting ${op}`)
      const opPath = await extractZip(op)

      core.info(`Adding "op" to PATH`)
      core.addPath(opPath)
    })
}

const loadSecrets = async (): Promise<void> => {
  let envKeys: string[] = []

  Object.entries(process.env)
    .filter(([, v]) => v?.match(/^op:\/\//))
    .forEach(([k, v]) => {
      if (v) {
        core.info(`Loading "${k}"`)
        const secret = read.parse(v)

        core.setOutput(k, secret)
        if (exportEnv) {
          core.exportVariable(k, secret)
          envKeys.push(k)
        }

        core.setSecret(secret)
      }
    })

  if (exportEnv) core.exportVariable(env.managedVariables, envKeys.join())
}

;(async () => {
  try {
    if (unsetPrevious) unloadSecrets()

    validateAuth()

    await installCli()

    await loadSecrets()
  } catch (err) {
    core.setFailed(err instanceof Error ? err.message : 'Unknown Error')
  }
})()
