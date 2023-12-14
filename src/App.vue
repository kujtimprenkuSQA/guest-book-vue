<script setup lang="ts">
import { onMounted, shallowRef } from "vue";
import Content from "./components/Content.vue";

import { setupWalletSelector } from "@near-wallet-selector/core";
import {setupModal } from "@near-wallet-selector/modal-ui";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupNearFi } from "@near-wallet-selector/nearfi";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { setupCoin98Wallet } from "@near-wallet-selector/coin98-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
import { setupNeth } from "@near-wallet-selector/neth";
import { setupNearSnap } from "@near-wallet-selector/near-snap";
import { setupRamperWallet } from "@near-wallet-selector/ramper-wallet";
import { setupNearMobileWallet } from "@near-wallet-selector/near-mobile-wallet";
import { setupMintbaseWallet } from "@near-wallet-selector/mintbase-wallet"

import type { WalletSelector, AccountState } from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";

import { CONTRACT_ID } from "./constants";
import {setupXDEFI} from "@near-wallet-selector/xdefi";
import {setupNarwallets} from "@near-wallet-selector/narwallets";
import {setupBitgetWallet} from "@near-wallet-selector/bitget-wallet";

const selector = shallowRef<WalletSelector>();
const modal = shallowRef<WalletSelectorModal>();
const accountId = shallowRef<string | null>();
const accounts = shallowRef<Array<AccountState>>();

onMounted(async () => {
  const _selector = await setupWalletSelector({
    network: "mainnet",
    modules: [
      setupNearWallet(),
      setupSender(),
      setupMathWallet(),
      setupNightly(),
      setupMeteorWallet(),
      setupHereWallet(),
      setupCoin98Wallet(),
      setupWelldoneWallet(),
      setupNearFi(),
      setupNeth({ bundle: false }),
      setupXDEFI(),
      setupNarwallets(),
      setupNearSnap(),
      setupRamperWallet(),
      setupNearMobileWallet(),
      setupMintbaseWallet(),
        setupBitgetWallet(),
      setupWalletConnect({
        projectId: process.env.WALLETCONNECT_PROJECT_ID,
        metadata: {
          name: "NEAR Wallet Selector",
          description: "Example dApp used by NEAR Wallet Selector",
          url: "https://github.com/near/wallet-selector",
          icons: ["https://avatars.githubusercontent.com/u/37784886"],
        },
      })
    ],
  });

  const _modal = setupModal(_selector,{ contractId: CONTRACT_ID });
  selector.value = _selector;
  modal.value = _modal;

  const state = _selector.store.getState();

  accounts.value = state.accounts;
  accountId.value =
      state.accounts.find((account) => account.active)?.accountId || null;

  window.selector = _selector;
  window.modal = _modal;
});
</script>

<template>
  <h1>NEAR Guest Book</h1>
  <Content
      v-if="selector"
      :selector="selector"
      :modal="modal"
      :accountId="accountId"
      :accounts="accounts"
  />
</template>

<style>

</style>
