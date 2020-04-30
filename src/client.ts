import { DfuseClient, TransactionLifecycle, InboundMessage, InboundMessageType, waitFor } from '@dfuse/client'

import { Api, JsonRpc } from 'eosjs'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import { TextDecoder, TextEncoder } from 'text-encoding'
import fetch from 'node-fetch'
import ws from 'ws'

;(global as any).fetch = fetch
;(global as any).WebSocket = ws

export class EosClient {
    /**
     * EOS-DFUSE Client
     */
    private config: any
    public  client: DfuseClient
    public  rpc   : JsonRpc
    public  api   : Api
    
    /**
     * @param config 
     * @param client 
     * @param fetch 
     */
    constructor(config: any, client: DfuseClient, fetch: any) {
        this.config = config
        this.client = client
        const signatureProvider = new JsSignatureProvider([this.config.privateKey])
        const rpc = new JsonRpc(this.client.endpoints.restUrl, { fetch: fetch })
        
        this.rpc = rpc
        this.api = new Api({
            rpc,
            signatureProvider,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder()
        })
    }

    async getHeadInfo() {
        return await this.rpc.get_info()
    }

    async streamHeadInfo() {
        const stream = await this.client.streamHeadInfo((message: InboundMessage) => {
            if (message.type === InboundMessageType.LISTENING) {
                console.log(this.prettyJson(message.data))
            }

            if (message.type === InboundMessageType.HEAD_INFO) {
                console.log(this.prettyJson(message.data))
            }
        })
        await waitFor(15000)
        await stream.close()
    }

    /**
     * @param accounts 
     */
    async streamAccount(accounts: string) {
        const stream = await this.client.streamActionTraces(
            {
                accounts: accounts,
                with_inline_traces: true,
                with_dbops:    true,
                with_dtrxops:  true,
                with_ramops:   true,
                with_tableops: true
            },
            (message: InboundMessage<any>) => {
              if (message.type === InboundMessageType.LISTENING) {
                console.log(this.prettyJson(message.data))
                return
              }
        
              if (message.type === InboundMessageType.ACTION_TRACE) {
                console.log(this.prettyJson(message.data))
                return
              }

              if (message.type === InboundMessageType.ERROR) {
                console.log(this.prettyJson(message.data))
                return
              }
            }
          )
          await waitFor(15000)
          await stream.close()
    }

    /**
     * @param account 
     */
    async getAccount(account: string): Promise<boolean> {
        return await this.rpc.get_account(account)
    }

    /**
     * @param account 
     */
    async hasAccount(account: string): Promise<boolean> {
        const response = await this.client.stateTable('eosio', account, 'userres')
        return response.rows.length > 0
      }

      /**
       * @param account 
       * @param action 
       * @param actor 
       * @param permission 
       * @param data 
       * @param _options 
       */
    async pushTrx(account: string, action: string, actor: string, permission: string = 'active', data: any, _options?: any): Promise<{ result: any }> {
        const trx = {
            account: account,
            name: action,
            authorization: [
                {
                    actor: actor,
                    permission: permission
                }
            ],
            data: data
        }
        const options  = _options == undefined ? { blocksBehind: 360, expireSeconds: 3600 } : _options
        const response = await this.api.transact(
            {
                actions: [trx]
            }, 
            options
        )
        return { result: response }
    }

    /**
     * @param account 
     * @param scope 
     * @param table 
     * @param _key 
     * @param _options 
     * @param _atBlock 
     */
    async fetchTable(account: string, scope: string, table: any, _key?: string, _options?: any, _atBlock?: number): Promise<{ result: any }> {
        const options = _options == undefined ? { blockNum: _atBlock === undefined ? undefined : _atBlock } : _options
        if (_key == undefined) {
            const response = await this.client.stateTable<any>(
                account,
                scope,
                table,
                options
            ) 
            return { result: response.rows }
        } else {
            const response = await this.client.stateTableRow<any>(
                account,
                scope,
                table,
                _key,
                options
            )
            return { result: response.row }
        }
    }

    /**
     * @param id 
     */
    async fetchTrx(id: string): Promise<TransactionLifecycle> {
        return await this.client.fetchTransaction(id)
    }

    /**
     * Helper functions
     */
    printResult(result: any, startTime: Date, endTime: Date) {
        console.log('Transaction push result ' + this.prettyJson(result) + '\n')
    
        const elapsed = (endTime.getTime() - startTime.getTime()) / 1000.0
        console.log(`Pushed with guaranteed '${this.config.guaranteed}' in '${elapsed}' seconds` + '\n')
    
        const networkMatch = this.client.endpoints.restUrl.match(
            /https:\/\/(mainnet|testnet|kylin).eos.dfuse.io/
        )
        if (networkMatch !== null && networkMatch[1] != null) {
            let network = networkMatch[1] + '.'
            if (network === 'mainnet') {
                network = ''
            }   
    
            console.log(`- https://${network}eosq.app/tx/${result.transaction_id}` + '\n')
        }
    }

    prettyJson(input: any): string {
        return JSON.stringify(input, null, 2)
    }
}