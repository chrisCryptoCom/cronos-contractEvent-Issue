import { ethers } from "ethers";
import dotenv from "dotenv";
import sinon from "sinon";
dotenv.config();

const ETHEREUM_RPC="wss://eth-mainnet.alchemyapi.io/v2/EElfXQcZk-acQCjrLv4ERIBBdCBxCY2_"
const CRONOS_RPC="wss://cronos-testnet-3.crypto.org:8546/"

const RPC_URL = process.env.ETHEREUM
    ? ETHEREUM_RPC
    : CRONOS_RPC;

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const protocolName = process.env.ETHEREUM ? "ETHEREUM" : "CRONOS";
    console.log(`Running against ${protocolName} using RPC:`, RPC_URL);
    const provider = new ethers.providers.WebSocketProvider(RPC_URL ?? "");

    // This is the topic hash for a simple erc20 transfer event which should be present in almost every block
    const transferTopicHash =
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

    const logFilter = { topics: [transferTopicHash] };

    if (process.env.VERBOSE) {
        provider._websocket.addEventListener("message", function (event: any) {
            console.log("Received message", event.data);
        });
    }

    const spy = sinon.spy(provider._websocket, "send");

    provider.on(logFilter, () => console.log("ERC20 Transfer detected"));
    provider.on("block", (blockNumber) =>
        console.log("Detected new block with nr:", blockNumber)
    );

    await sleep(2000);
    if (process.env.VERBOSE) {
        console.log(
            "Sent ws messages: ",
            spy.getCalls().map((call: any) => call.args)
        );
    }

    while (true) {
        await sleep(10 ** 6);
    }
}

main()
    .then(() => process.exit())
    .catch(() => process.exit(1));

