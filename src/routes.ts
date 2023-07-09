import {Express, Request, Response} from 'express';
import { ethers } from 'ethers';
import NFTAbi from '../contracts/abis/nft.json'
import FLPAbi from '../contracts/abis/FLP.json'
import USDTAbi from '../contracts/abis/USDT.json'
import AuctionAbi from '../contracts/abis/auction.json'
import * as dotenv from "dotenv";
import {readJSON, writeJSON} from "./utils/connect"

dotenv.config()

const NFT_ADDRESS = "0x22f76B1a6fF9a126CB28C4111c78FbE09D83fD20"
const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"
const FLP_ADDRESS = "0xF52254b56ad7482A1721fc9B4B3e7F1ba793E0a9"
const USDT_ADDRESS = "0x039E52Ed19D21EfEaD66d0F4a668140bbDAdEf4d"
const AUCTION_ADDRESS = "0x803C270AbEFfc7c2321EF37BB9d1A0424FD29DC6"


const getNFTAbi = () => NFTAbi;
const getFLPAbi = () => FLPAbi;
const getUSDTAbi = () => USDTAbi;
const getAuctionAbi = () => AuctionAbi;

const getSigner = async () => {
    let provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_TESTNET);
    const PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY || "";
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    return signer
}

function routes(app: Express) {
    app.get('/heathcheck', (req: Request, res: Response) => res.sendStatus(200));

    app.post('/grant-role', async (req: Request, res: Response) => {
        let message = "This address already had Minter Role!"
        try {
            const address = req.body.address;
            if (address.length === 42 && address.startsWith("0x")){
                const data = readJSON();
                if (data["listMinterAddress"].length > 10000) {
                    message = "Already reach the limitition of number minter address!"
                }
                else{
                    if (!data["listMinterAddress"].includes(address)){
                        data["listMinterAddress"].push(address);
                        const signer = await getSigner();
                        
                        const nftContract = new ethers.Contract(NFT_ADDRESS, getNFTAbi(), signer);
                        const transaction = await nftContract.grantRole(MINTER_ROLE, address, {gasLimit: 300000, gasPrice: 18000000000});
                        const tx = await transaction.wait();
                        if (tx.events.length > 0){
                            const transactionHash = tx.events[0].transactionHash;
                            message = "Add Minter Role successfully! Transaction hash: " + transactionHash;
                            writeJSON(data);
                        } else {
                            message = "This address already had Minter Role!"
                        }
                    }
                }
            }                
        } catch (e: any) {
            message = "Error: " + e.message;
        }
        console.log(message);
        return res.status(200).send(message);
    });

    app.post('/faucet-bnb', async (req: Request, res: Response) => {
        let message = "Do nothing";
        const address = req.body.address;
        if (address.length === 42 && address.startsWith("0x")){
            const tx = {
                to: address,
                value: ethers.utils.parseEther('0.1'),
                gasLimit: 300000, gasPrice: 18000000000
            };
            try{
                const data = readJSON(); 
                if (data["faucetBNBAddress"].indexOf(address) < 0){
                    const signer = await getSigner();
                    const transaction = await signer.sendTransaction(tx);
                    const recept = await transaction.wait();
                    message = recept.transactionHash;
                    data["faucetBNBAddress"].push(address);
                    writeJSON(data);
                } else {
                    message = "This address has already been used as a faucet before!"
                }
            }
            catch (err:any){
                message = "Error: " + err.message;
            }
        }
        return res.status(200).send(message);
    })

    app.post('/faucet-flp', async (req: Request, res: Response) => {
        let message = "Do nothing";
        const address = req.body.address;
        if (address.length === 42 && address.startsWith("0x")){
            try{
                const signer = await getSigner();
                const flpContract = new ethers.Contract(FLP_ADDRESS, getFLPAbi(), signer);
                const transaction = await flpContract.transfer(address, ethers.utils.parseEther('10000'), {gasLimit: 300000, gasPrice: 18000000000});
                const recept = await transaction.wait();
                message = recept.transactionHash;
            }
            catch (err:any){
                message = "Error: " + err.message;
            }
        }
        return res.status(200).send(message);
    })

    app.post('/faucet-usdt', async (req: Request, res: Response) => {
        let message = "Do nothing";
        const address = req.body.address;
        if (address.length === 42 && address.startsWith("0x")){
            try{
                const signer = await getSigner();
                const usdtContract = new ethers.Contract(USDT_ADDRESS, getUSDTAbi(), signer);
                const transaction = await usdtContract.transfer(address, ethers.utils.parseEther('10000'), {gasLimit: 300000, gasPrice: 18000000000});
                const recept = await transaction.wait();
                message = recept.transactionHash;
            }
            catch (err:any){
                message = "Error: " + err.message;
            }
        }
        return res.status(200).send(message);
    })

    app.post('/finish-auction', async (req: Request, res: Response) => {
        let message = "Do nothing";
        const auctionId = req.body.auctionId;
        try {
            const signer = await getSigner();
            const auctionContract = new ethers.Contract(AUCTION_ADDRESS, getAuctionAbi(), signer);
            const transaction = await auctionContract.finishAuction(auctionId, {gasLimit: 300000,  gasPrice:15000000000});
            const recept = await transaction.wait();
            message = recept.transactionHash;
            // console.log(transaction)
        } catch (err:any){
            message = "Error: " + err.message;
        }
        return res.status(200).send(message);
    })

}

export default routes;