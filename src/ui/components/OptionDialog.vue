<script setup lang="ts">
import { Popup as VanPopup, CellGroup as VanCellGroup, Field as VanField, Switch as VanSwitch } from 'vant'
import { toRef } from 'vue'
import { ZhiqiongGlobalOptions } from '../../lib/store'
const props = defineProps<{
    modelValue: boolean
    options: ZhiqiongGlobalOptions
}>()
defineEmits(['update:modelValue'])
const options = toRef(props, 'options')
</script>

<template>
    <van-popup
        :show="modelValue"
        position="bottom"
        :style="{ height: '250px' }"
        @update:show="$emit('update:modelValue', $event)"
    >
        <section class="zhiqiong-options">
            <h1>
                志琼·设置
                <i
                    class="van-badge__wrapper van-icon van-icon-cross van-popup__close-icon van-popup__close-icon--top-right van-haptics-feedback"
                    role="button"
                    tabindex="0"
                    @click="$emit('update:modelValue', false)"
                ></i>
            </h1>
            <van-cell-group inset>
                <van-field name="switch" label="网络请求优化">
                    <template #input>
                        <van-switch v-model="options.enableAjaxHook" />
                    </template>
                </van-field>
            </van-cell-group>
        </section>
    </van-popup>
</template>

<style lang="scss">
.zhiqiong-options {
    width: 100%;
    display: block;
    max-width: 500px;
    margin: 0 auto;
    h1 {
        font-size: 18px;
        font-weight: normal;
        color: #ccc;
        padding: 15px 20px;
        position: relative;
    }
}
</style>
