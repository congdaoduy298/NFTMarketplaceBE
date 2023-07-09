"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const nft_json_1 = __importDefault(require("../contracts/abis/nft.json"));
const FLP_json_1 = __importDefault(require("../contracts/abis/FLP.json"));
const USDT_json_1 = __importDefault(require("../contracts/abis/USDT.json"));
const auction_json_1 = __importDefault(require("../contracts/abis/auction.json"));
const dotenv = __importStar(require("dotenv"));
const connect_1 = require("./utils/connect");
dotenv.config();
const NFT_ADDRESS = "0x22f76B1a6fF9a126CB28C4111c78FbE09D83fD20";
const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
const FLP_ADDRESS = "0xF52254b56ad7482A1721fc9B4B3e7F1ba793E0a9";
const USDT_ADDRESS = "0x039E52Ed19D21EfEaD66d0F4a668140bbDAdEf4d";
const AUCTION_ADDRESS = "0x803C270AbEFfc7c2321EF37BB9d1A0424FD29DC6";
const getNFTAbi = () => nft_json_1.default;
const getFLPAbi = () => FLP_json_1.default;
const getUSDTAbi = () => USDT_json_1.default;
const getAuctionAbi = () => auction_json_1.default;
const getSigner = () => __awaiter(void 0, void 0, void 0, function* () {
    let provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_TESTNET);
    const PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY || "";
    const signer = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
    return signer;
});
function routes(app) {
    app.get('/heathcheck', (req, res) => res.sendStatus(200));
    app.post('/grant-role', (req, res) => __awaiter(this, void 0, void 0, function* () {
        let message = "This address already had Minter Role!";
        try {
            const address = req.body.address;
            if (address.length === 42 && address.startsWith("0x")) {
                const data = (0, connect_1.readJSON)();
                if (data["listMinterAddress"].length > 10000) {
                    message = "Already reach the limitition of number minter address!";
                }
                else {
                    if (!data["listMinterAddress"].includes(address)) {
                        data["listMinterAddress"].push(address);
                        const signer = yield getSigner();
                        const nftContract = new ethers_1.ethers.Contract(NFT_ADDRESS, getNFTAbi(), signer);
                        const transaction = yield nftContract.grantRole(MINTER_ROLE, address, { gasLimit: 300000, gasPrice: 18000000000 });
                        const tx = yield transaction.wait();
                        if (tx.events.length > 0) {
                            const transactionHash = tx.events[0].transactionHash;
                            message = "Add Minter Role successfully! Transaction hash: " + transactionHash;
                            (0, connect_1.writeJSON)(data);
                        }
                        else {
                            message = "This address already had Minter Role!";
                        }
                    }
                }
            }
        }
        catch (e) {
            message = "Error: " + e.message;
        }
        console.log(message);
        return res.status(200).send(message);
    }));
    app.post('/faucet-bnb', (req, res) => __awaiter(this, void 0, void 0, function* () {
        let message = "Do nothing";
        const address = req.body.address;
        if (address.length === 42 && address.startsWith("0x")) {
            const tx = {
                to: address,
                value: ethers_1.ethers.utils.parseEther('0.1'),
                gasLimit: 300000, gasPrice: 18000000000
            };
            try {
                const data = (0, connect_1.readJSON)();
                if (data["faucetBNBAddress"].indexOf(address) < 0) {
                    const signer = yield getSigner();
                    const transaction = yield signer.sendTransaction(tx);
                    const recept = yield transaction.wait();
                    message = recept.transactionHash;
                    data["faucetBNBAddress"].push(address);
                    (0, connect_1.writeJSON)(data);
                }
                else {
                    message = "This address has already been used as a faucet before!";
                }
            }
            catch (err) {
                message = "Error: " + err.message;
            }
        }
        return res.status(200).send(message);
    }));
    app.post('/faucet-flp', (req, res) => __awaiter(this, void 0, void 0, function* () {
        let message = "Do nothing";
        const address = req.body.address;
        if (address.length === 42 && address.startsWith("0x")) {
            try {
                const signer = yield getSigner();
                const flpContract = new ethers_1.ethers.Contract(FLP_ADDRESS, getFLPAbi(), signer);
                const transaction = yield flpContract.transfer(address, ethers_1.ethers.utils.parseEther('10000'), { gasLimit: 300000, gasPrice: 18000000000 });
                const recept = yield transaction.wait();
                message = recept.transactionHash;
            }
            catch (err) {
                message = "Error: " + err.message;
            }
        }
        return res.status(200).send(message);
    }));
    app.post('/faucet-usdt', (req, res) => __awaiter(this, void 0, void 0, function* () {
        let message = "Do nothing";
        const address = req.body.address;
        if (address.length === 42 && address.startsWith("0x")) {
            try {
                const signer = yield getSigner();
                const usdtContract = new ethers_1.ethers.Contract(USDT_ADDRESS, getUSDTAbi(), signer);
                const transaction = yield usdtContract.transfer(address, ethers_1.ethers.utils.parseEther('10000'), { gasLimit: 300000, gasPrice: 18000000000 });
                const recept = yield transaction.wait();
                message = recept.transactionHash;
            }
            catch (err) {
                message = "Error: " + err.message;
            }
        }
        return res.status(200).send(message);
    }));
    app.post('/finish-auction', (req, res) => __awaiter(this, void 0, void 0, function* () {
        let message = "Do nothing";
        const auctionId = req.body.auctionId;
        try {
            const signer = yield getSigner();
            const auctionContract = new ethers_1.ethers.Contract(AUCTION_ADDRESS, getAuctionAbi(), signer);
            const transaction = yield auctionContract.finishAuction(auctionId, { gasLimit: 300000, gasPrice: 15000000000 });
            const recept = yield transaction.wait();
            message = recept.transactionHash;
            // console.log(transaction)
        }
        catch (err) {
            message = "Error: " + err.message;
        }
        return res.status(200).send(message);
    }));
}
exports.default = routes;
