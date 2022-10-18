<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  shallowRef
} from "vue";

// import type { Message } from "../../interfaces/message";
// import type { Submitted } from "../form/form.component";

import { providers, utils } from "near-api-js";
import { distinctUntilChanged, map, Subscription } from "rxjs";
import { Buffer} from "buffer";
import { CONTRACT_ID } from "../constants";


import type {
  AccountView,
  CodeResult,
} from "near-api-js/lib/providers/provider";
import type { Transaction } from "@near-wallet-selector/core";
import type { WalletSelector, AccountState } from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";

import type { Account } from "../interfaces/account";
import type { MessageType } from "../interfaces/messageType";
import SignIn from "./SignIn.vue";
import Message from "./Message.vue";
import Form from "./Form.vue";


const SUGGESTED_DONATION = "0";
const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;

const account = shallowRef<Account | null>();
const messages = shallowRef<Array<MessageType>>();
const subscription = shallowRef<Subscription>();
const currentAccounts = shallowRef<Array<AccountState>>();
const currentAccountId = shallowRef<string | null >()

const { selector, modal, accountId, accounts } = defineProps<{
  selector: WalletSelector;
  modal: WalletSelectorModal;
  accountId: string | null;
  accounts: Array<AccountState>;
}>();

const getAccount = async () =>{
  if (!accountId) {
    return null;
  }

  const { network } = selector.options;
  const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

  return provider
      .query<AccountView>({
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
      })
      .then((data) => ({
        ...data,
        account_id: accountId,
      }));
}

const signIn = () => {
  modal.show();
};

const signOut = async () => {
  const wallet = await selector.wallet();

  wallet.signOut().catch((err) => {
    console.log("Failed to sign out");
    console.error(err);
  });
}

const switchWallet = () => {
  modal.show();
}

const getMessages = () => {
  const { network } = selector.options;
  const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

  return provider
      .query<CodeResult>({
        request_type: "call_function",
        account_id: CONTRACT_ID,
        method_name: "getMessages",
        args_base64: "",
        finality: "optimistic",
      })
      .then((res) => JSON.parse(Buffer.from(res.result).toString()));
}

const switchAccount = () => {
  const currentIndex = accounts.findIndex(
      (x) => x.accountId === accountId
  );
  const nextIndex =
      currentIndex < accounts.length - 1 ? currentIndex + 1 : 0;

  const nextAccountId = accounts[nextIndex].accountId;

  selector.setActiveAccount(nextAccountId);

  alert("Switched account to " + nextAccountId);
}

const onVerifyOwner = async () => {
  const wallet = await selector.wallet();
  try {
    const owner = await wallet.verifyOwner({
      message: "test message for verification",
    });

    if (owner) {
      alert(`Signature for verification: ${JSON.stringify(owner)}`);
    }
  } catch (err) {
    const message =
        err instanceof Error ? err.message : "Something went wrong";
    alert(message);
  }
}

const subscribeToEvents = () => {
  subscription.value = selector.store.observable
      .pipe(
          map((state) => state.accounts),
          distinctUntilChanged()
      )
      .subscribe((nextAccounts) => {
        console.log("Accounts Update", nextAccounts);

        currentAccounts.value = nextAccounts;
        currentAccountId.value =
            nextAccounts.find((account) => account.active)?.accountId || null;

        getAccount().then((accountData) => {
          account.value = accountData;
        });
      });
}

const addMessages = async (message: string, donation: string, multiple: boolean) => {
  const { contract } = selector.store.getState();
  const wallet = await selector.wallet();

  if (!multiple) {
    return wallet
        .signAndSendTransaction({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          signerId: currentAccountId.value!,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "addMessage",
                args: { text: message },
                gas: BOATLOAD_OF_GAS,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                deposit: utils.format.parseNearAmount(donation)!,
              },
            },
          ],
        })
        .catch((err) => {
          alert("Failed to add message");
          console.log("Failed to add message");

          throw err;
        });
  }

  const transactions: Array<Transaction> = [];

  for (let i = 0; i < 2; i += 1) {
    transactions.push({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      signerId: currentAccountId.value!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      receiverId: contract!.contractId,
      actions: [
        {
          type: "FunctionCall",
          params: {
            methodName: "addMessage",
            args: {
              text: `${message} (${i + 1}/2)`,
            },
            gas: BOATLOAD_OF_GAS,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            deposit: utils.format.parseNearAmount(donation)!,
          },
        },
      ],
    });
  }

  return wallet.signAndSendTransactions({ transactions }).catch((err) => {
    alert("Failed to add messages");
    console.log("Failed to add messages");

    throw err;
  });
}

const onSubmit = (e: SubmitEvent) => {
  //@ts-ignore
  const { fieldset, message, donation, multiple } = e.target.elements;

  fieldset.disabled = true;

  addMessages(message.value, donation.value || "0", multiple.checked)
      .then(() => {
        return getMessages()
            .then((nextMessages) => {
              messages.value = nextMessages;
              message.value = "";
              donation.value = SUGGESTED_DONATION;
              fieldset.disabled = false;
              multiple.checked = false;
              message.focus();
            })
            .catch((err) => {
              alert("Failed to refresh messages");
              console.log("Failed to refresh messages");
              throw err;
            });
      })
      .catch((err) => {
        console.error(err);

        fieldset.disabled = false;
      });
};

onMounted(async () => {
  currentAccountId.value = accountId;
  currentAccounts.value = accounts;

  const [messagesData, accountData] = await Promise.all([
    getMessages(),
    getAccount(),
  ]);

  account.value = accountData;
  messages.value = messagesData;

  subscribeToEvents();
});
onUnmounted(() => {
  subscription.value!.unsubscribe();
});
</script>

<template>
  <template v-if="account">
    <div>
      <button @click="signOut">Log out</button>
      <button @click="switchWallet">Switch Provider</button>
      <button @click="onVerifyOwner">Verify Owner</button>
      <button v-if="accounts.length > 1" @click="switchAccount">
        Switch Account
      </button>
    </div>
    <Form :account="account" :onSubmit="onSubmit" />
    <Message :messages="messages" />
  </template>
  <template v-else>
    <div>
      <button @click="signIn">Log in</button>
    </div>
    <SignIn />
  </template>
</template>
