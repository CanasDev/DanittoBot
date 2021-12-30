import fs from 'fs';
import {
    Client,
    ClientOptions
} from 'eris';
import {
    Command
} from '../typings';
import botDB from "../models/botDB"
import guildDB from '../models/guildDB';
import cmds from '../models/cmds';
import {
    blue,
    green
} from 'chalk';
import Embed from "./Embed"

export default class DaniClient extends Client {
    commands: Array < Command > ;
    db: {
        bot: typeof botDB;
        guild: typeof guildDB;
        cmds: typeof cmds
    };
    embed: typeof Embed;
    constructor() {

        const clientOptions: ClientOptions = {
            allowedMentions: {
                everyone: false
            },
            intents: 32767,
            restMode: true,
            defaultImageFormat: 'png',
            defaultImageSize: 2048
        }

        super(process.env.DANITOKEN as string, clientOptions);
        this.commands = [];
        this.db = {
            bot: botDB,
            guild: guildDB,
            cmds: cmds
        }
        this.embed = Embed;
    }
    connect(): Promise < void > {
        return super.connect();
    }
    loadCommands(): void {

        fs.readdirSync('./src/commands').forEach(folder => {

            fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.ts')).forEach(file => {

                const DaniCommand = require(`../commands/${folder}/${file}`).default;
                this.commands.push(new DaniCommand(this));
                console.log(`A pasta ${blue(folder)} foi iniciada com ${green("sucesso")}`)

            });

        });
    }
    loadEvents(): void {
        console.log("usei a func load event")
        fs.readdirSync('./src/events').filter(f => f.endsWith('.ts')).forEach(f => {
            const DaniEvent = new(require(`../events/${f}`).default)(this);
            const eventName = f.split('.')[0];

            if (eventName === 'ready') {
                super.once('ready', (...args) => DaniEvent.run(...args));


            } else {
                super.on(eventName, (...args) => DaniEvent.run(...args));
            }
        })
    }

}