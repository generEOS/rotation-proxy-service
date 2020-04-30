import { createDfuseClient } from '@dfuse/client'

import fetch, { Request, RequestInit, Response } from 'node-fetch'
import { resolve } from 'path'

require('dotenv').config({ path: resolve(__dirname,'../.env') })
export const config = readConfig()
export const client = createDfuseClient({
    apiKey:  config.dfuseApiKey,
    network: config.network
})

export async function customizedFetch (input: string | Request, init: RequestInit): Promise<Response> {
    if (init.headers === undefined) {
        init.headers = {}
    }
    const apiTokenInfo = await client.getTokenInfo()

    const headers = init.headers as { [name: string]: string }
    headers['Authorization'] = `Bearer ${apiTokenInfo.token}`
    headers['X-Eos-Push-Guarantee'] = config.guaranteed

    return fetch(input, init)
}

/**
 * Helper functions
 */
function readConfig() {
    const network    = process.env.DFUSE_API_NETWORK || 'mainnet.eos.dfuse.io'
    const guaranteed = process.env.PUSH_GUARANTEED   || 'handoffs:2' // Or 'in-block', 'irreversible', 'handoff:1', 'handoffs:2', 'handoffs:3'
    
    const dfuseApiKey = process.env.DFUSE_API_KEY
    if (dfuseApiKey === undefined) {
        console.log(
            'You must have a \'process.env.DFUSE_API_KEY\' environment variable containing your dfuse API key.'
        )
        process.exit(1)
    }

    const privateKey = process.env.SIGNING_PRIVATE_KEY
    if (privateKey === undefined) {
        console.log(
            'You must have a \'SIGNING_PRIVATE_KEY\' environment variable containing private used to sign.'
        )
        process.exit(1)
    }

    return {
        network,
        guaranteed,
        dfuseApiKey: dfuseApiKey!,
        privateKey : privateKey!,
    }
}