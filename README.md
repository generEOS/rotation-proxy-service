# BP-Rotation-Service Backend

#### Background 
EOS is a Delegated Proof of Stake(DPoS) blockchain which means that token holders vote on block producers(BPs) to run the network. The top 21 BPs validate blocks and keep the network running with around 44 paid standby block producers as backup. In order to become a standby block producer, you must meet the minimum threshold of 100 EOS per day by gaining ~0.48% of the total vote. GenerEOS believe a greater spread of votes will result in more value being driven back into the ecosystem. Therefore, we have developed a rotating proxy script that rotates lower ranking BPs on the pay cusp or earning little income in and out of a proxy giving them additional income to drive back to the network.

#### Proxy Overview
* Continually votes for 30 BPs from rank 22 - 75
* The proxy will start with voting for BPs ranked 75 - 45
* Each day 1 BP is removed out of the proxy and replaced with the next
* Once all BPs have been voted the list will recycle

*Note: The list of BPs to vote for is currently pulled from the BP ranking (22 to 75), however it can easily be enhanced and customised to suit different proxy voting philosophies* 

#### How to setup the project?
```bash
$ npm install
$ [vi|vim] .env # Create project .env file with the following fields

##----------------------------------------------------------------##
    DFUSE_API_NETWORK=mainnet.eos.dfuse.io
    DFUSE_API_KEY=server_{...}
    SIGNING_PRIVATE_KEY={...}

    VOTER=aus1genereos
    PROXY={...}
    BP_NUM=30
    START_RANK=22
    END_RANK=75
    LOG=output.log
    LOG_ERROR=./logs/output_error.log
##----------------------------------------------------------------##

$ ts-node src/index.ts # or build to .js in the out folder
```
