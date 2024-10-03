// src/App.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config'; // Import the config

function App() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [etherAmount, setEtherAmount] = useState("");
  const [tokensToReceive, setTokensToReceive] = useState(0);

  // Load Web3 and contract
  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      loadContract(web3Instance);
    } else {
      toast.error("Please install MetaMask!");
    }
  }, []);

  // Load the smart contract
  const loadContract = async (web3Instance) => {
    const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    setContract(contractInstance);

    const price = await contractInstance.methods.tokenPrice().call();
    setTokenPrice(price);
  };

  // Connect wallet
  const connectWallet = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
    toast.success("Wallet connected!");
  };

  // Calculate tokens + bonus
  const calculateTokens = (etherValue) => {
    const tokens = (etherValue * 1e18) / tokenPrice;
    const bonus = (tokens * 5) / 100;
    setTokensToReceive(tokens + bonus);
  };

  // Buy tokens
  const buyTokens = async () => {
    if (!account) {
      toast.error("Please connect your wallet first!");
      return;
    }

    try {
      await contract.methods.buyTokens().send({
        from: account,
        value: web3.utils.toWei(etherAmount, 'ether'),
      });
      toast.success("Tokens purchased successfully!");
    } catch (error) {
      toast.error("Transaction failed!");
      console.error(error);
    }
  };

  return (
    <div className="App">
      <h1>Private Token Sale</h1>
      <button onClick={connectWallet}>Connect Wallet</button>

      {account && <p>Connected as: {account}</p>}

      <div className="buy-section">
        <input
          type="number"
          placeholder="Enter Ether amount"
          value={etherAmount}
          onChange={(e) => {
            setEtherAmount(e.target.value);
            calculateTokens(e.target.value);
          }}
        />
        <button onClick={buyTokens}>Buy Tokens</button>
      </div>

      {tokensToReceive > 0 && (
        <p>You will receive: {tokensToReceive} tokens (including 5% bonus)</p>
      )}

      <ToastContainer />
    </div>
  );
}

export default App;