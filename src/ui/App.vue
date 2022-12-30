<script setup lang="ts">
import { toRef } from 'vue'
import { ConfigProvider, Notify as VanNotify } from 'vant'
import { ZhiqiongApp } from '../lib/app'
import ActionsArea from './components/ActionsArea.vue'
import OptionDialog from './components/OptionDialog.vue'
const props = defineProps<{
    app: ZhiqiongApp
}>()
const app = toRef(props, 'app')
</script>

<template>
    <ConfigProvider theme="dark">
        <ActionsArea
            v-model:overlays="app.isShowOverlay"
            :hasOverlay="app.matchedOverlays.length > 0"
            @toggle-settings="app.showSettings = !app.showSettings"
        />
        <OptionDialog v-model="app.showSettings" :options="app.options" />
        <VanNotify class="zhiqiong-notification" :show="!!app.notify" :duration="0">
            <b class="zhiqiong-appname">志琼</b>
            <div class="zhiqiong-notitext">{{ app.notify }}</div>
            <div v-if="app.notifyProgress >= 0" class="zhiqiong-progess-bar">
                <div class="zhiqiong-progress-bar-inner" :style="{ width: app.notifyProgress + '%' }"></div>
            </div>
            <div class="zhiqiong-notify-line"></div>
        </VanNotify>
    </ConfigProvider>
</template>

<style lang="scss">
.zhiqiong-notification.van-notify {
    background-color: #ece5d8;
    box-sizing: border-box;
    height: 40px;
    color: #777;
    box-shadow: 0px 3px 17px 4px rgb(255 255 255 / 8%), 0px 4px 8px rgb(255 255 255 / 12%);
    overflow: visible;
    .zhiqiong-appname {
        position: absolute;
        left: 10px;
        bottom: 11px;
        background: #3b4353;
        color: #ece5d8;
        font-size: 12px;
        font-weight: normal;
        padding: 1px 4px;
        border-radius: 4px;
    }
    .zhiqiong-notitext {
        display: block;
        padding-bottom: 4px;
        padding-left: 30px;
    }
    .zhiqiong-notify-line {
        border-bottom: 4px solid #3b4353;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 4px;
        z-index: 22;
    }
    .zhiqiong-progess-bar {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 4px;
        z-index: 33;
        .zhiqiong-progress-bar-inner {
            width: 0;
            height: 100%;
            background: #ff9800;
            position: relative;
            transition: width 0.2s;
            &:after {
                content: ' ';
                position: absolute;
                right: 0;
                top: 0;
                bottom: 0;
                width: 5px;
                background: #ff9800;
                box-shadow: 0 0 10px 4px #ff9800, 0 0 5px 2px #ff9800;
            }
        }
    }
}
</style>
