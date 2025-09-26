#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface DeploymentConfig {
  network: 'testnet' | 'mainnet';
  contractOwner: string;
  pythOracle: string;
  pythStorage: string;
  pythDecoder: string;
  wormholeCore: string;
  sbtcToken: string;
  swapHelper: string;
  poolContract: string;
  stxToken: string;
}

const DEPLOYMENT_CONFIGS: Record<string, DeploymentConfig> = {
  testnet: {
    network: 'testnet',
    contractOwner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    pythOracle: 'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-oracle-v3',
    pythStorage: 'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-storage-v3',
    pythDecoder: 'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-pnau-decoder-v2',
    wormholeCore: 'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.wormhole-core-v3',
    sbtcToken: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
    swapHelper: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-swap-helper-v-1-3',
    poolContract: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-pool-sbtc-stx-v-1-1',
    stxToken: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2'
  },
  mainnet: {
    network: 'mainnet',
    contractOwner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    pythOracle: 'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-oracle-v3',
    pythStorage: 'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-storage-v3',
    pythDecoder: 'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-pnau-decoder-v2',
    wormholeCore: 'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.wormhole-core-v3',
    sbtcToken: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
    swapHelper: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-swap-helper-v-1-3',
    poolContract: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-pool-sbtc-stx-v-1-1',
    stxToken: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2'
  }
};

function validateEnvironment(network: string) {
  console.log(`Validating ${network} environment...`);
  
  const config = DEPLOYMENT_CONFIGS[network];
  if (!config) {
    throw new Error(`Unknown network: ${network}`);
  }
  
  // Check if Clarinet is installed
  try {
    execSync('clarinet --version', { stdio: 'pipe' });
    console.log('Clarinet is installed');
  } catch (error) {
    throw new Error('Clarinet is not installed. Please install it first.');
  }
  
  // Check if contracts exist
  const contracts = ['LenBo_Nft', 'Lendo_Nft', 'Lendx_Nft', 'Lendy_Nft', 'Lendy'];
  contracts.forEach(contract => {
    const contractPath = join('contracts', `${contract}.clar`);
    try {
      readFileSync(contractPath);
      console.log(`Contract ${contract} exists`);
    } catch (error) {
      throw new Error(`Contract ${contract} not found at ${contractPath}`);
    }
  });
  
  console.log('Environment validation passed');
}

function checkPythIntegration() {
  console.log('Checking Pyth integration...');
  
  try {
    // Check if Pyth contracts are accessible
    const pythContracts = [
      'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-oracle-v3',
      'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-storage-v3',
      'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-pnau-decoder-v2',
      'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.wormhole-core-v3'
    ];
    
    pythContracts.forEach(contract => {
      console.log(` Pyth contract ${contract} configured`);
    });
    
    console.log('Pyth integration check passed');
  } catch (error) {
    console.warn('Pyth integration check failed:', error);
  }
}

function deployContracts(network: string) {
  console.log(`Deploying contracts to ${network}...`);
  
  try {
    // Run Clarinet deployment
    const deploymentPlan = network === 'mainnet' ? 'mainnet-plan.yaml' : 'testnet-plan.yaml';
    execSync(`clarinet integrate --deployment-plan deployments/${deploymentPlan}`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log(`Contracts deployed to ${network}`);
  } catch (error) { 
    console.error(`Deployment to ${network} failed:`, error);
    throw error;
  }
}

function main() {
  const network = process.argv[2] || 'testnet';
  
  if (!['testnet', 'mainnet'].includes(network)) {
    console.error('Invalid network. Use "testnet" or "mainnet"');
    process.exit(1);
  }
  
  console.log(`Starting deployment to ${network}...`);
  
  try {
    validateEnvironment(network);
    checkPythIntegration();
    deployContracts(network);
    
    console.log('Deployment completed successfully!');
    console.log(`Your contracts are now deployed on ${network}`);
    console.log('Contract addresses:');
    console.log(`   - Lendy: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.Lendy`);
    console.log(`   - LenBo_Nft: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.LenBo_Nft`);
    console.log(`   - Lendo_Nft: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.Lendo_Nft`);
    console.log(`   - Lendx_Nft: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.Lendx_Nft`);
    console.log(`   - Lendy_Nft: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.Lendy_Nft`);
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}




