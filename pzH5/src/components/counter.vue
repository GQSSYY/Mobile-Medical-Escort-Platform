<template>
  {{ formater }}
</template>

<script setup lang="ts">
  import { ref, onUnmounted, watch } from "vue";

  const props = defineProps({
    // 初始秒数（毫秒）
    second: {
      type: Number,
      default: 0,
    },
    // 备用格式（当前逻辑未显式使用，保留结构）
    format: {
      type: String,
      default: "MM-dd hh:mm",
    },
    // 显示格式
    sformat: {
      type: String,
      default: "hh:mm:ss",
    },
    // 后缀
    suffix: {
      type: String,
      default: "",
    },
  });

  const emit = defineEmits(["counterOver"]);

  // 倒计时显示内容
  const formater = ref("");
  // 定时器引用
  let timer: any = null;

  /**
   * 核心格式化函数
   * 使用 padStart 简化补零逻辑，去除复杂的正则循环
   */
  const formatTime = (ts: number) => {
    if (ts <= 0) return props.sformat.replace(/hh|mm|ss/g, "00") + props.suffix;

    const h = Math.floor((ts / 3600000) % 24).toString().padStart(2, "0");
    const m = Math.floor((ts / 60000) % 60).toString().padStart(2, "0");
    const s = Math.floor((ts / 1000) % 60).toString().padStart(2, "0");

    return props.sformat
      .replace("hh", h)
      .replace("mm", m)
      .replace("ss", s) + props.suffix;
  };

  //倒计时启动逻辑
  const startCountdown = () => {
    // 清理已有定时器，防止叠加
    if (timer) clearInterval(timer);

    let remaining = props.second;

    // 初始显示
    formater.value = formatTime(remaining);

    timer = setInterval(() => {
      remaining -= 1000;

      if (remaining <= 0) {
        clearInterval(timer);
        formater.value = formatTime(0);
        emit("counterOver");
        return;
      }

      formater.value = formatTime(remaining);
    }, 1000);
  };

  // 监听初始秒数变化（如列表重新加载时），重新启动倒计时
  watch(() => props.second, () => {
    startCountdown();
  }, { immediate: true });

  // 组件销毁时必须清理定时器，防止内存泄漏
  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });
</script>
