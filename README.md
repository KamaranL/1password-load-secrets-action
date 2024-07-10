# 1Password Load Secrets Action

> Loads secrets into your GitHub runner from 1Password

[![view on GitHub](https://badgen.net/github/license/KamaranL/1password-load-secrets-action)](https://github.com/KamaranL/1password-load-secrets-action/blob/HEAD/LICENSE.txt)
[![view on GitHub](https://badgen.net/github/release/KamaranL/1password-load-secrets-action/stable)](https://github.com/KamaranL/1password-load-secrets-action)

An improved-upon implementation of [Load secrets from 1Password](https://github.com/marketplace/actions/load-secrets-from-1password) by [1Password](https://github.com/1Password)

Refer to [1Password's developer documentation](https://developer.1password.com/docs/ci-cd/github-actions/) for more on how you can use this action.

## Features

- Persistent install of 1Password CLI throughout the entire job
- <u>**Windows**</u> runner support
- All the original features from [Load secrets from 1 Password](https://github.com/marketplace/actions/load-secrets-from-1password)

## Usage

```yaml
on: workflow_dispatch
jobs:
  matrix_jobs:
    strategy:
      matrix:
        os: ['ubuntu', 'macos', 'windows']
    runs-on: ${{ matrix.os }}-latest
    continue-on-error: true
    env:
      OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_TOKEN }}
    steps:
      - uses: KamaranL/1password-load-secrets-action@v1
        env:
          GH_TOKEN: op://Integrations/GitHub.kamaranl.CICD/credential

      - run: |
          Write-Host "GH_TOKEN: $env:GH_TOKEN"
        shell: powershell
        if: matrix.os == 'windows'

      - run: |
          echo "GH_TOKEN: $GH_TOKEN"
        if: matrix.os != 'windows'

      - run: op whoami
```


## Acknowledgements

- Thanks to [1Password]((https://github.com/1Password)) for developing such a great product
