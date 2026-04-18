#!/usr/bin/env node

import { exec } from 'child_process';


// Constants

const ARGS = process.argv?.slice(2) ?? [];


// Variables

const [ command, ...newArgs ] = ARGS ?? [];


// Functions

function sync(args) {
    const [ arg ] = args ?? [];


    // Doing some checks

    if (!arg) {
        console.error(`flext2pdf: The target name is not specified: Try 'flext2pdf help' for more information`);
        return;
    }

    if (arg !== 'assets') {
        console.error(`flext2pdf: Unsupported target '${arg}': Try 'flext2pdf help' for more information`);
        return;
    }


    // Syncing the assets

    exec('./bin/sync-assets.mjs', (error, stdout, stderr) => {

        // Doing some checks

        if (error) {
            console.error(error?.message ?? 'flext2pdf: Unable to sync the assets: Unknown Error');
            return;
        }


        if (stderr)
            console.error(stderr);
        else
            console.log(stdout);
    });
}

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

        // Doing some checks

        if (error) {
            console.error(`flext2pdf: Unable to install engine '${engineName}': ${error?.message ?? 'Unknown Error'}`);
            return;
        }


        if (stderr)
            console.error(stderr);
        else
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

    case 'sync':
        sync(newArgs);
        break;

    case 'help':
    default:
        help(newArgs);
        break;
}
