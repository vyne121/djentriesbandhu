import type { Config } from "@react-router/dev/config";
export default {
  ssr: false,
  prerender: ["/", "/zene", "/koncertek", "/epk", "/shop", "/adatvedelem", "/404"],
} satisfies Config;
