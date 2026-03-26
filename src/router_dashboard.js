import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from './DashboardLayout.vue'
import Accueil from './components/Home.vue'
import Module from './components/Module.vue'
import Modules from './components/Modules.vue'
import Ruchers from './components/Ruchers.vue'
import Profil from './components/Profile.vue'
import Carnet from './components/Carnet.vue'
import Deconnexion from './components/Deconnexion.vue'
import Login from './components/Login.vue'
import CreateAccount from './components/CreateAccount.vue'
import ForgotPass from './components/ForgotPass.vue'
import apiService from './services/api.service'
import { authToken } from './user'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/inscription',
    component: CreateAccount,
    meta: { guestOnly: true }
  },
  {
    path: '/forgot-password',
    component: ForgotPass,
    meta: { guestOnly: true }
  },
  {
    path: '/Dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/Dashboard/home' },
      { path: 'home', component: Accueil },
      { path: 'modules', component: Modules },
      { path: 'module/:moduleId?', component: Module, props: true },//va injecter automatiquement le paramètre dans ton composant comme une prop.
      { path: 'profil', component: Profil }, 
      { path: 'carnet', component: Carnet },
      { path: 'ruchers', component: Ruchers },
      { path: 'deconnexion', component: Deconnexion },
    ]
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes,   
})

router.beforeEach(async (to, from, next) => {
  // Vérifier les deux clés possibles pour le token (compatibilité)
  const isLoggedIn = localStorage.getItem("token") || localStorage.getItem("authToken");
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    if (!token) {
      return next("/login");
    }
    // Vérification serveur du token
    try {
      await apiService.verifyToken(authToken); // Endpoint backend qui renvoie 200 si token valide, 401 si non
      return next(); // token valide
    } catch (err) {
      // Token invalide ou expiré
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      return next("/login");
    }
  }

  else if (to.meta.guestOnly && isLoggedIn) {
    next("/Dashboard/home");
  }
  else {
    next();
  }
});


