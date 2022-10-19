<script setup lang="ts">
import Big from "big.js";
import { Account } from "../interfaces/account";

const props = defineProps<{
  account: Account;
  onSubmit: (event: any) => void;
}>()

const maxValue = Big(props.account.amount)
    .div(10 ** 24)
    .toString()
</script>

<template>
  <form @submit.prevent="onSubmit">
    <fieldset id="fieldset">
      <p>Sign the guest book, {{ account.account_id }}!</p>
      <p class="highlight">
        <label for="message">Message:</label>
        <input autoComplete="off" autoFocus id="message" required />
      </p>
      <p>
        <label for="donation">Donation (optional):</label>
        <input
            autocomplete="off"
            value="'0'"
            id="donation"
            max="{{ maxValue }}"
            min="0"
            step="0.01"
            type="number"
        />
        <span title="NEAR Tokens">Ⓝ</span>
      </p>
      <p>
        <label for="multiple">Multiple Transactions:</label>
        <input id="multiple" type="checkbox" />
      </p>
      <button type="submit">Sign</button>
    </fieldset>
  </form>
</template>
