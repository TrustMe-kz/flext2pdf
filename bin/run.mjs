#!/usr/bin/env node

import { exec } from 'child_process';
import minimist from 'minimist';


// Constants

const ARGS = process.argv?.slice(2) ?? [];


// Variables

const args = minimist(ARGS);

const [ command, ...newArgs ] = args._ ?? [];


// Functions

function install(args) {
    const [ engineName ] = args ?? [];


    // Doing some checks

    if (!engineName) {
        console.error(`flext2pdf: The engine name is not specified: Try 'flext2pdf help' for more information`);
        return;
    }


    // Installing the engine

    console.log(`flext2pdf: Installing engine '${engineName}'...`);

    exec('npx playwright install ' + engineName, (error, stdout, stderr) => {
        if (error) {
            console.error(`flext2pdf: Error installing engine '${engineName}': ${error?.message ?? 'Unknown Error'}`);
            return;
        }

        if (stderr) console.error(stderr);

        console.log(stdout);
    });
}

function help(_args) {
    console.log('TBC');
}


switch (command) {
    case 'install':
        install(newArgs);
        break;

    case 'help':
    default:
        help(newArgs);
        break;
}
