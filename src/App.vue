<script setup lang="ts">
import { onMounted, shallowRef } from "vue";
import Content from "./components/Content.vue";

import { setupWalletSelector } from "@near-wallet-selector/core";
import {setupModal } from "@near-wallet-selector/modal-ui";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";

import type { WalletSelector, AccountState } from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";

import { CONTRACT_ID } from "./constants";

const selector = shallowRef<WalletSelector>();
const modal = shallowRef<WalletSelectorModal>();
const accountId = shallowRef<string | null>();
const accounts = shallowRef<Array<AccountState>>();

onMounted(async () => {
  const _selector = await setupWalletSelector({
    network: "testnet",
    modules: [
      setupMyNearWallet(),
      setupLedger(),
      setupMathWallet(),
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
