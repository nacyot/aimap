import {Command, Flags} from '@oclif/core'
import {copyFileSync, existsSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

export default class Init extends Command {
  static description = 'Initialize aimap configuration in the current project'
static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --force',
  ]
static flags = {
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Force initialization even if not in project root',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Init)
    
    // Check if we're in project root
    const projectRoot = this.findProjectRoot()
    const currentDir = process.cwd()
    
    if (!projectRoot) {
      this.error('Not in a git repository. Initialize git first with "git init"', {exit: 1})
    }
    
    if (currentDir !== projectRoot && !flags.force) {
      this.error(`Not in project root. Run from ${projectRoot} or use --force flag`, {exit: 1})
    }
    
    // Check if .aimap.yml already exists
    const targetFile = '.aimap.yml'
    if (existsSync(targetFile)) {
      this.error(`${targetFile} already exists in current directory`, {exit: 1})
    }
    
    // Find the .aimap.example.yml file
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const exampleFile = join(__dirname, '..', '..', '.aimap.example.yml')
    if (!existsSync(exampleFile)) {
      this.error('Could not find .aimap.example.yml template file', {exit: 1})
    }
    
    try {
      // Copy the example file
      copyFileSync(exampleFile, targetFile)
      this.log(`✅ Created ${targetFile} successfully!`)
      this.log('')
      this.log('Next steps:')
      this.log('1. Edit .aimap.yml to configure your agents and source directory')
      this.log('2. Create your rules in the .rules directory (or configured source)')
      this.log('3. Run "aimap build" to generate agent-specific configuration files')
    } catch (error) {
      this.error(`Failed to create configuration file: ${error}`, {exit: 1})
    }
  }

  private findProjectRoot(): null | string {
    let currentDir = process.cwd()
    const root = resolve('/')
    
    while (currentDir !== root) {
      if (existsSync(join(currentDir, '.git'))) {
        return currentDir
      }

      currentDir = resolve(currentDir, '..')
    }
    
    return null
  }
}