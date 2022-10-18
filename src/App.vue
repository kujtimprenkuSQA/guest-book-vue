<script setup lang="ts">
import { onMounted, shallowRef } from "vue";

import { setupWalletSelector, WalletSelector } from "@near-wallet-selector/core";
import {setupModal, WalletSelectorModal} from "@near-wallet-selector/modal-ui";
import { setupLedger } from "@near-wallet-selector/ledger";

import { CONTRACT_ID } from "./constants";

declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

const selector = shallowRef<WalletSelector>();
const modal = shallowRef<WalletSelectorModal>();

onMounted(async () => {
  const _selector = await setupWalletSelector({
    network: "testnet",
    modules: [setupLedger()],
  });

  const _modal = setupModal(_selector,{ contractId: "CONTRACT_ID" });
  selector.value = _selector;
  modal.value = _modal;

  window.selector = _selector;
  window.modal = _modal;
});
</script>

<template>
  <h1>NEAR Guest Book</h1>
  <button v-if="modal" @click="modal.show()">Login</button>
</template>

<style>

</style>
