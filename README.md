# Atlas SDK
## Any software in any programming language on any blockchain.

The Atlas SDK enables developers to execute traditional web2 languages like C, Javascript and Python on web3 environments. It works as a client to the ChainsAtlas API that compiles web2 code to bytecode compatible with the ChainsAtlas Virtualizatiom Unit.

The Virtualization Unit is a smart contract that contains a virtual machine capable of executing web2 code natively on blockchain. **Nothing is executed off-chain.** For more details, checkout the [ChainsAtlas Whitepaper](https://docsend.com/view/zgkukn7wsgimvf2w).

## Getting started

### Signup to get an API Key
To use the Atlas SDK, you will need an API Key. To generate it, you need to signup to the ChainsAtlas Dashboard at https://app.chainsatlas.com/signup

Once you signup, an API Key will be automatically generated and displayed to you at https://app.chainsatlas.com/dashboard.

### Installation
```
npm i @chainsatlas/atlas-sdk
# or
pnpm i @chainsatlas/atlas-sdk
# or
yarn add @chainsatlas/atlas-sdk
```

### Usage

#### Virtualization Unit Contract Deployment 

The V_UNIT_ABI and V_UNIT_BYTECODE constants are used to deploy a new Virtualization Unit contract.

```ts
// ethers v6
import { ethers } from 'ethers'
import { V_UNIT_ABI, V_UNIT_BYTECODE } from '@chainsatlas/atlas-sdk'

const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/eth');
const wallet = new ethers.Wallet('0x...', provider);
const factory = new ethers.ContractFactory(
    V_UNIT_ABI,
    V_UNIT_BYTECODE,
    wallet,
);
const contract = await factory.deploy();
await contract.waitForDeployment();
const vUnitAddress = await contract.getAddress();

// viem v2
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { V_UNIT_ABI, V_UNIT_BYTECODE } from '@chainsatlas/atlas-sdk'

const account = privateKeyToAccount('0x...'); 
const publicClient = createPublicClient({
chain: mainnet,
transport: http('https://rpc.ankr.com/eth')
});
const walletClient = createWalletClient({
  account, 
  chain: mainnet,
  transport: http('https://rpc.ankr.com/eth')
});
const hash = await walletClient.deployContract({
    abi: V_UNIT_ABI,
    bytecode: V_UNIT_BYTECODE
});
const receipt = await publicClient.waitForTransactionReceipt({ hash });
const vUnitAddress = receipt.contractAddress;

// web3 v4
import { Web3 } from 'web3'
import { V_UNIT_ABI, V_UNIT_BYTECODE } from '@chainsatlas/atlas-sdk'

const web3 = new Web3('https://rpc.ankr.com/eth');
const account = web3.eth.accounts.privateKeyToAccount('0x...');
const contract = new web3.eth.Contract(V_UNIT_ABI);
const contractDeployer = contract.deploy({
    data: "0x" + V_UNIT_BYTECODE,
});
const gas = await contractDeployer.estimateGas({
    from: account,
});
const tx = await contractDeployer.send({
    from: defaultAccount,
    gas,
    gasPrice: 10000000000,
});
const vUnitAddress = tx.options.address;
```

#### Client

An HTTP client responsible to compile web2 code to bytecode compatible with the Virtualization Unit.

```ts
import { Client } from '@chainsatlas/atlas-sdk'

const client = new Client("API KEY HERE");

// compile bytecode given the source code, file extension
// and number of arguments of the main function.
const clientBytecode = await client.compile(sourceCode, "c", 2);

// output: { bytecode: string; key: string; nargs: number; }
```

#### composeInput

An utility function responsible for adding dynamic inputs into the client bytecode returned by the ChainsAtlas API.

```ts
import { composeInput } from '@chainsatlas/atlas-sdk'

// compose input given the clientBytecode object
// returned from 'client.compile()' and arg values
// IMPORTANT: args array must have length equal to clientBytecode.nargs
const bytecodeInput = composeInput(clientBytecode, [42, 73]);

// output: string
```

#### Running bytecode on the Virtualization Unit

To run code on the Virtualization Unit, you must first compile the source code to bytecode compatible with the Virtualization Unit using `Client.compile()` and then add the necessary inputs with the `composeInput` utility function.

```ts
// ethers v6
import { ethers } from 'ethers'
import { V_UNIT_ABI } from '@chainsatlas/atlas-sdk'

const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/eth');
const wallet = new ethers.Wallet('0x...', provider);
const contract = new ethers.Contract(contractAddress, V_UNIT_ABI, wallet);
const txResponse = await contract.runBytecode(bytecodeInput);
const receipt = await txResponse.wait();

// viem v2
import { createPublicClient, createWalletClient, http, getContract } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { V_UNIT_ABI } from '@chainsatlas/atlas-sdk'

const account = privateKeyToAccount('0x...'); 
const publicClient = createPublicClient({
chain: mainnet,
transport: http('https://rpc.ankr.com/eth')
});
const walletClient = createWalletClient({
  account, 
  chain: mainnet,
  transport: http('https://rpc.ankr.com/eth')
});
const contract = getContract({
    address: vUnitAddress,
    abi: V_UNIT_ABI,
    client: { public: publicClient, wallet: walletClient }
});
const hash = await contract.write.runBytecode(bytecodeInput);
const receipt = await publicClient.waitForTransactionReceipt({ hash });

// web3 v4
import { Web3 } from 'web3'
import { V_UNIT_ABI, V_UNIT_BYTECODE } from '@chainsatlas/atlas-sdk'

const web3 = new Web3('https://rpc.ankr.com/eth');
const account = web3.eth.accounts.privateKeyToAccount('0x...');
const contract = new web3.eth.Contract(V_UNIT_ABI, vUnitAddress);
const receipt = await contract.methods.runBytecode(bytecodeInput)
    .send({
        from: account,
        gas: 1000000, // adjust as needed
        gasPrice: "10000000000"
    });
```

#### Getting Bytecode Return

If your bytecode returns a value upon execution, you can get the runtime return in hex format given a Virtualization Unit Contract Instance and the receipt of the `runBytecode` transaction.

```ts
// ethers v6
const eventFilter = contract.filters.ContractDeployed();
const eventTopicArray = await eventFilter.getTopicFilter();
const logs = receipt.logs.filter((log) =>
    log.topics.includes(eventTopicArray[0]),
);
const decodedLogs = logs.map((log) =>
    contract.interface.parseLog(log),
);
const bytecodeAddress = decodedLogs[0].args.bytecodeAddress;
const bytecodeOutput = await contract.getRuntimeReturn(bytecodeAddress);
```

## Supported Chains Status

| Chain      | Status      |
|------------|-------------|
| EVM chains | Supported   |
| AElf       | Supported   |
| Stellar    | In progress |

## Supported languages

| Language   | Status      |
|------------|-------------|
| C          | Supported   |
| Solidity   | In progress |
| JavaScript | Coming soon |
| Python     | Coming soon |

**IMPORTANT:** Make sure to use currently supported language features to avoid any errors. The ChainsAtlas' team is always working towards more features, so it is important to stay updated about latest developments. By [signing up to our dashboard](https://app.chainsatlas.com/signup), you will receive an email everytime we ship a new features. For more information, [see our docs on available language features](https://docs.chainsatlas.com/).

## Troubleshooting

If you encounter issues:

- Check the error message for guidance.
- Ensure API Key is correct.
- Ensure you are using a stable RPC.
- Contact us at info@chainsatlas.com

## Contributing

We welcome contributions! If you have suggestions, bug reports, or feature requests, please [open an issue on our GitHub repository](https://github.com/ChainsAtlas/atlas-sdk/issues).
