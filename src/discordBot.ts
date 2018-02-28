import * as Discord from 'discord.js'
import Bot from './bot'
import MusicBot from './bot/music'
import SystemBot from './bot/system'

export default class DiscordBot {
  client = new Discord.Client()
  bots: Bot[]

  private token = process.env.DISCORD_TOKEN
  private prefix = process.env.DISCORD_PREFIX

  constructor () {
    this.client.on('message', this.onMessage.bind(this))
    this.bots = Array.from(this.prepareBots()).filter(bot => bot.initialize(this))
  }

  async start () {
    await this.client.login(this.token)
  }

  private async onMessage (message: Discord.Message) {
    if (!this.prefix) return
    if (message.content.indexOf(this.prefix) === -1) return

    const args = message.content.substr(this.prefix.length).trim().split(' ').map(x => x.trim()).filter(x => x.length)
    if (!args.length) return

    const commandName = args.shift()
    if (!commandName) return

    for (const bot of this.bots) {
      if (await bot.invokeCommand(message, commandName, ...args)) return
    }

    message.channel.send(`:information_source: Command \`${commandName}\` is unknown. Please use \`help\` to get a list of available commands.`)
  }

  private * prepareBots (): IterableIterator<Bot> {
    yield new SystemBot(this)
    yield new MusicBot(this)
  }
}