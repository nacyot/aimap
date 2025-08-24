import {Command} from '@oclif/core'
import {readFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

export default class Version extends Command {
  static description = 'Display version information'

  public async run(): Promise<void> {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const packageJsonPath = join(__dirname, '..', '..', 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    
    this.log(`aimap version ${packageJson.version}`)
  }
}