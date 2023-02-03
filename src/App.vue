<script setup lang="ts">
import { onMounted, shallowRef } from "vue";
import Content from "./components/Content.vue";

import { setupWalletSelector } from "@near-wallet-selector/core";
import {setupModal } from "@near-wallet-selector/modal-ui";
import { setupDefaultWallets } from "@near-wallet-selector/default-wallets";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupNearFi } from "@near-wallet-selector/nearfi";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNightlyConnect } from "@near-wallet-selector/nightly-connect";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { setupCoin98Wallet } from "@near-wallet-selector/coin98-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupOptoWallet } from "@near-wallet-selector/opto-wallet";
import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
import { setupNeth } from "@near-wallet-selector/neth";

import type { WalletSelector, AccountState } from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";

import { CONTRACT_ID } from "./constants";
import {setupXDEFI} from "@near-wallet-selector/xdefi";
import {setupNarwallets} from "@near-wallet-selector/narwallets";
import {setupFinerWallet} from "@near-wallet-selector/finer-wallet";

const selector = shallowRef<WalletSelector>();
const modal = shallowRef<WalletSelectorModal>();
const accountId = shallowRef<string | null>();
const accounts = shallowRef<Array<AccountState>>();

onMounted(async () => {
  const _selector = await setupWalletSelector({
    network: "testnet",
    modules: [
      ...(await setupDefaultWallets()),
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
      setupOptoWallet(),
      setupXDEFI(),
      setupNarwallets(),
      setupFinerWallet(),
      setupWalletConnect({
        projectId: "c4f79cc...",
        metadata: {
          name: "NEAR Wallet Selector",
          description: "Example dApp used by NEAR Wallet Selector",
          url: "https://github.com/near/wallet-selector",
          icons: ["https://avatars.githubusercontent.com/u/37784886"],
        },
      }),
      setupNightlyConnect({
        url: "wss://relay.nightly.app/app",
        appMetadata: {
          additionalInfo: "",
          application: "NEAR Wallet Selector",
          description: "Example dApp used by NEAR Wallet Selector",
          icon: "https://near.org/wp-content/uploads/2020/09/cropped-favicon-192x192.png",
        },
      }),
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
