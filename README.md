# 1Password Load Secrets Action

> Loads secrets into your GitHub runner from 1Password

An improved-upon implementation of [Load secrets from 1Password](https://github.com/marketplace/actions/load-secrets-from-1password) by [1Password](https://github.com/1Password)

## Features

- Cached install of 1Password CLI
- <u>**Windows**</u> runner support

## Usage

```yaml
jobs:
  runs_on:
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
```


## Acknowledgements

- Thanks to [1Password]((https://github.com/1Password)) for developing such a great product
