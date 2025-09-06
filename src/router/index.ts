import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/theme-preview",
      name: "ThemePreview",
      component: () => import("~/views/ThemePreview.vue"),
    },
  ],
})

export default router
