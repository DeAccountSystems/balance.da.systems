<!--this components provide a framework for account list, including loading state/wireframe, frontend pagination, custom account item-->
<style lang="scss">
.account-list {
  .item_main {
    font-size: 16px;
    font-weight: 600;
    color: #11142D;
  }

  .item_tail {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #11142D;

    .iconfont {
      margin-left: 5px;
      color: #ACB9D9;
    }
  }

  .base-list-pager {
    margin-top: 20px;
    margin-bottom: 8px;
  }
}
</style>

<template>
  <BaseList class="account-list">
    <BaseListHeader v-if="showHeader">
      <div>DAS</div>
      <div>{{ $tt('Price') }}</div>
    </BaseListHeader>

    <template v-if="loading">
      <BaseListItem v-for="i in 10" :key="i">
        <template #head>
          <Wireframe shape="circle" height="24" width="24" />
        </template>
        <template #default>
          <Wireframe shape="round" height="20" width="100" />
        </template>
        <template #tail>
          <Wireframe shape="round" height="20" width="100" />
        </template>
      </BaseListItem>
    </template>

    <template v-else-if="accounts.length > 0">
      <slot v-for="account in accounts" :account="account" />
    </template>
    <template v-else>
      <slot name="notFound" />
    </template>

    <BaseListPager
      v-if="pages > 1"
      :current="current"
      :pages="pages"
      :noItems="true"
      @change="onChangePage"
    />
  </BaseList>
</template>

<script>
import BaseList from '~/components/list/BaseList'
import BaseListHeader from '~/components/list/BaseListHeader'
import BaseListItem from '~/components/list/BaseListItem'
import BaseListPager from '~/components/list/BaseListPager'
import Wireframe from '~/components/Wireframe'
import { computed, ref } from '@nuxtjs/composition-api'
import { DEFAULT_PAGE_SIZE } from '~/constant'

export default {
  name: 'ListAccount',
  components: {
    BaseList,
    BaseListItem,
    BaseListHeader,
    BaseListPager,
    Wireframe,
  },
  props: {
    accounts: {
      type: Array,
      default: () => []
    },
    loading: Boolean,
    showHeader: {
      type: Boolean,
      default: true
    },
    total: {
      type: Number,
      default: 0
    }
  },
  setup (props, { emit }) {
    const current = ref(1)
    const pages = computed(() => Math.ceil(props.total / DEFAULT_PAGE_SIZE))

    function onChangePage (i) {
      current.value = i
      emit('changePage', i)
    }

    return {
      pages,
      current,
      onChangePage,
    }
  }
}
</script>
