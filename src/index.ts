import { EosClient } from './client'
import { config, client, customizedFetch } from './helper' 
import path, { resolve } from 'path'
import fs from 'fs'

require('dotenv').config({ path: resolve(__dirname,'../.env') })

// import winston from 'winston'
// const logger = winston.createLogger({
//   level:  'info',
//   format: winston.format.simple(),
//   transports:  [
//     new winston.transports.File({ filename: process.env.LOG_ERROR, level: 'error' }),
//     new winston.transports.File({ filename: process.env.LOG })
//   ]
// });

const log_path = 'logs'
if (!fs.existsSync(log_path)) {
      fs.mkdirSync(log_path)
}
const logger = require('simple-node-logger').createSimpleLogger(path.join(log_path, <string>process.env.LOG))

const bp_num     = Number(process.env.BP_NUM)
const start_rank = Number(process.env.START_RANK)
const end_rank   = Number(process.env.END_RANK)

const eos = new EosClient(config, client, customizedFetch)

function compare(a: any, b: any) {
    if (a.json.total_votes > b.json.total_votes) {
        return 1
    } 
    if (a.json.total_votes < b.json.total_votes) {
        return -1
    }
    return 0
}

function rotate(nums: any, k: number) {
    return nums.slice(k).concat(nums.slice(0,k))
}

async function fetchBPs() { 
    try {
        let obj : any = {
            producers: []
        }
        const response  = await eos.fetchTable('eosio','eosio','producers')
        const producers = response.result.sort(compare).reverse().slice(start_rank-1,end_rank-1)
        for (let i = 0; i < end_rank - start_rank; i++) {
            obj.producers.push({ id: i, name: producers[i].json.owner })
        }
        return obj
    } catch (error) {
        logger.error(error.message, ' at ', new Date().toJSON())
        return {}
    }
}

async function vote(bps: any) {
    try {
        logger.info('-----*Start VOTE*----')        
        let voted_bps : string[] = []
        for (let i = end_rank - start_rank - bp_num; i < end_rank - start_rank; i++) {
            voted_bps.push(bps.producers[i].name)
        }
        logger.info('-----*Producer List*----' + '\n' + voted_bps)
        let data = {
            voter: process.env.VOTER,
            proxy: process.env.PROXY,
            producers: voted_bps
        }
        // Note: 'votepermission' is a custom permission
        // let response  = eos.pushTrx('eosio','voteproducer',<string>process.env.VOTER,'votepermission',data)
        // logger.info('-----*STATUS*----' + '\n' + JSON.stringify(response, null, 2))
        bps.producers = rotate(bps.producers, 1)
        logger.info('-----*End VOTE*----')        
    } catch (error) {
        logger.error(error.message, ' at ', new Date().toJSON())
    }
    // client.release()
}

let bps : any = {} // Initialize BPs Global Variable

async function start() {
    bps = await fetchBPs()
}

start()

setInterval(async function() {
    bps = await start()
}, 60*1000)
// }, 60 * 60 * 24 * 30 * 1000) // Each 30 DAYS 

setInterval(function() {
    vote(bps)
}, 10*1000)
// }, 60 * 60 * 24 * 1000) // Each DAY - for 30 DAYS