<template>
  <BaseCard class="connected-status">
    <div class="connected-status__info">
      <DasAvatar
        v-if="connectedAccount.address"
        class="connected-status__avatar"
        :account="connectedAccount.address"
        size="35"
      />
      <Iconfont
        v-else
        class="connected-status__avatar"
        name="default-avatar"
        size="35"
      />
      <span
        v-if="loggedIn"
        class="connected-status__address-info"
      >
        <template v-if="reverseRecord.account && reverseRecord.is_valid">
          <span class="connected-status__reverse-record">{{ reverseRecord.account }}</span>
          <span
            class="connected-status__reverse-record__address"
            @click="onCopyAddress(connectedAccount.address)"
          >
            <Iconfont
              :name="connectedAccount.chain.icon"
              size="14"
            />
            {{ collapseString(connectedAccount.address, 6, 6) }}
            <Iconfont
              name="copy"
              color="#636D85"
              size="11"
            />
          </span>
        </template>
        <template v-else>
          <span
            class="connected-status__address"
            @click="onCopyAddress(connectedAccount.address)"
          >
            {{ collapseString(connectedAccount.address, 6, 6) }}
            <Iconfont
              class="connected-status__copy-icon"
              name="copy"
              color="#636D85"
              size="14"
            />
          </span>
          <span class="connected-status__wallet">
            <Iconfont
              :name="connectedAccount.chain.icon"
              size="16"
            />
            {{ connectedAccount.chain && connectedAccount.chain.name }}
          </span>
        </template>
      </span>
    </div>
    <div>
      <Button
        class="connected-status__actions__button"
        middle
        block
        @click="onConnectWallet"
      >
        <Iconfont
          class="connected-status__actions__icon"
          name="wallet"
          size="14"
          color="#636D85"
        />
        {{ loggedIn ? $tt('Switch') : $tt('Connect wallet') }}
      </Button>
    </div>
  </BaseCard>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import BaseCard from '~/components/card/BaseCard.vue'
import { mapState } from 'vuex'
import { IConnectedAccount, ME_KEYS } from '~/store/me'
import { collapseString, copyText } from '~/modules/tools'
import Iconfont from '~/components/icon/Iconfont.vue'
import Button from '~/components/Button.vue'
import { DasAvatar } from 'das-ui-shared'
import { IReverseRecordRes } from '~/services/Account'

export default defineComponent({
  name: 'ConnectedStatus',
  components: {
    BaseCard,
    Iconfont,
    Button,
    DasAvatar,
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapState({
      me: ME_KEYS.namespace
    }),
    loggedIn (): boolean {
      return this.me.loggedIn
    },
    connectedAccount (): IConnectedAccount {
      return this.me.connectedAccount
    },
    reverseRecord (): IReverseRecordRes {
      return this.me.reverseRecord
    }
  },
  mounted () {
    this.$store.dispatch(ME_KEYS.fetchReverseRecord)
  },
  methods: {
    collapseString,
    onConnectWallet () {
      this.$walletSdk.walletsConnect()
    },
    onCopyAddress (address: string) {
      copyText(address).then(() => {
        this.$toast('👌 ' + this.$tt('Copied'))
      })
    }
  }
})
</script>

<style lang="scss">
@import 'src/assets/variables';

.connected-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
}

.connected-status__info {
  display: flex;
  align-items: center;
}

.connected-status__avatar {
  margin-right: 9px;
}

.connected-status__address-info {
  display: flex;
  flex-direction: column;
}

.connected-status__address {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  line-height: 21px;
  cursor: pointer;
}

.connected-status__reverse-record {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  line-height: 21px;
}

.connected-status__copy-icon {
  margin-left: 6px;
}

.connected-status__actions__icon {
  margin-right: 8px;
}

.connected-status__actions__button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 242, 245, 0);
  border-radius: 8px;
  border: 1px solid #EFF2F5;
  font-weight: 400;
  height: 35px;
  color: $primary-font-color;

  &:hover {
    box-shadow: 0 6px 6px 0 rgb(0 0 0 / 4%);
  }
}

.connected-status__wallet {
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: 6px;
  grid-template-columns: 16px auto;
  font-size: 14px;
  font-weight: 400;
  color: $assist-font-color;
  line-height: 16px;
}

.connected-status__reverse-record__address {
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: 6px;
  grid-template-columns: 16px auto;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: #636D85;
  line-height: 16px;
  cursor: pointer;
}
</style>
