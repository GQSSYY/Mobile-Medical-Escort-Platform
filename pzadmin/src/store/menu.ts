import { defineStore } from "pinia";

export interface MenuMeta {
  id: string;
  name: string;
  icon?: string;
  path: string;
  describe?: string;
}

export interface MenuItem {
  path?: string;
  meta?: MenuMeta;
  children?: MenuItem[];
  component?: unknown;
}

interface PersistedMenuState {
  isCollapse?: boolean;
  selectMenu?: MenuMeta[];
  routerList?: MenuItem[];
  menuActive?: string;
}

interface MenuState {
  isCollapse: boolean;
  selectMenu: MenuMeta[];
  routerList: MenuItem[];
  menuActive: string;
}

const defaultState: MenuState = {
  isCollapse: false,
  selectMenu: [],
  routerList: [],
  menuActive: "1-1",
};

function loadState(): MenuState {
  try {
    const raw = localStorage.getItem("v3pz");
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw) as { menu?: PersistedMenuState };
    return { ...defaultState, ...(parsed.menu || {}) };
  } catch {
    localStorage.removeItem("v3pz");
    return { ...defaultState };
  }
}

function serializeRoutes(routes: MenuItem[]): MenuItem[] {
  return routes.map(({ component: _component, children, ...route }) => ({
    ...route,
    ...(children ? { children: serializeRoutes(children) } : {}),
  }));
}

export const useMenuStore = defineStore("menu", {
  state: loadState,
  actions: {
    persist() {
      const state = {
        isCollapse: this.isCollapse,
        selectMenu: this.selectMenu,
        routerList: serializeRoutes(this.routerList),
        menuActive: this.menuActive,
      };
      localStorage.setItem("v3pz", JSON.stringify({ menu: state }));
    },
    collapseMenu() {
      this.isCollapse = !this.isCollapse;
      this.persist();
    },
    addMenu(payload: MenuMeta) {
      if (!this.selectMenu.some((item) => item.path === payload.path)) {
        this.selectMenu.push(payload);
        this.persist();
      }
    },
    updateMenuActive(value: string) {
      this.menuActive = value;
      this.persist();
    },
    closeMenu(item: MenuMeta) {
      const index = this.selectMenu.findIndex((value) => value.path === item.path);
      if (index >= 0) {
        this.selectMenu.splice(index, 1);
        this.persist();
      }
    },
    setDynamicMenu(payload: MenuItem[]) {
      const modules = import.meta.glob("../views/**/**/*.vue");
      const bindComponents = (routes: MenuItem[]) => routes.forEach((route) => {
        if (route.children) bindComponents(route.children);
        else if (route.meta?.path) route.component = modules[`../views${route.meta.path}/index.vue`];
      });
      bindComponents(payload);
      this.routerList = payload;
      this.persist();
    },
  },
});
