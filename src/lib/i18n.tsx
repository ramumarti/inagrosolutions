"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "es";
type Translations = Record<string, string>;

const translations: Record<Language, Translations> = {
  en: {
    "app.name": "IASOLUTIONS",
    "app.tagline": "Your micro applications portal",
    "login.title": "Welcome Back",
    "login.email": "Email",
    "login.password": "Password",
    "login.submit": "Sign In",
    "login.forgot": "Forgot Password?",
    "login.signup": "Don't have an account? Sign Up",
    "signup.title": "Create Account",
    "signup.firstName": "First Name",
    "signup.lastName": "Last Name",
    "signup.submit": "Create Account",
    "signup.login": "Already have an account? Sign In",
    "signup.success": "Account created! Please check your email to verify.",
    "forgot.title": "Reset Password",
    "forgot.submit": "Send Recovery Link",
    "forgot.back": "← Back to Sign In",
    "forgot.success": "Recovery link sent. Check your email.",
    "welcome.title": "Welcome to IASOLUTIONS!",
    "welcome.subtitle": "We are preparing something amazing for you.",
    "welcome.badge": "Coming Soon",
    "welcome.hello": "Hello, {name} 👋",
    "welcome.footer": "We will notify you when everything is ready.",
    "welcome.logout": "Sign Out",
    "toast.verified": "Email Confirmed! Your account has been verified.",
    "toast.error": "An error occurred.",
    "toast.authlinkfailed": "Authentication link failed or expired.",
    "dashboard.microApps": "Micro Apps",
    "dashboard.app1": "Micro App #1",
    "dashboard.search": "Search... ⌘K",
    "dashboard.profile": "Profile",
    "dashboard.settings": "Settings",
    "dashboard.logout": "Logout",
    "dashboard.users": "Total Users",
    "dashboard.sessions": "Active Sessions",
    "dashboard.conversions": "Conversions",
    "dashboard.revenue": "Revenue",
    "dashboard.vsLastMonth": "vs last month",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.action1": "New Campaign",
    "dashboard.action2": "Generate Report",
    "dashboard.action3": "System Settings",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.activity1": "User Sarah signed up",
    "dashboard.activity2": "Server deployment successful",
    "dashboard.activity3": "Database backup completed",
    "dashboard.time1": "2 mins ago",
    "dashboard.time2": "1 hour ago",
    "dashboard.time3": "3 hours ago",
    "dashboard.revenueTrend": "Revenue Trend",
    "dashboard.userGrowth": "User Growth",
    "gdpr.accept": "I accept the Privacy Policy",
    "gdpr.privacyPolicy": "Privacy Policy",
    "gdpr.cookiePolicy": "Cookie Policy",
    "gdpr.legalNotice": "Legal Notice",
    "cookies.title": "We use cookies",
    "cookies.description": "We use cookies to improve your experience and analyze traffic. By continuing to browse, you accept our use of cookies.",
    "cookies.accept": "Accept All",
    "cookies.settings": "Settings",
    "legal.title": "Legal Information",
    "legal.lastUpdated": "Last updated",
  },
  es: {
    "app.name": "IASOLUTIONS",
    "app.tagline": "Tu portal de micro aplicaciones",
    "login.title": "Bienvenido de nuevo",
    "login.email": "Correo electrónico",
    "login.password": "Contraseña",
    "login.submit": "Iniciar Sesión",
    "login.forgot": "¿Olvidaste tu contraseña?",
    "login.signup": "¿No tienes cuenta? Regístrate",
    "signup.title": "Crear Cuenta",
    "signup.firstName": "Nombre",
    "signup.lastName": "Apellido",
    "signup.submit": "Crear Cuenta",
    "signup.login": "¿Ya tienes cuenta? Inicia sesión",
    "signup.success": "¡Cuenta creada! Revisa tu correo para verificarla.",
    "forgot.title": "Restablecer Contraseña",
    "forgot.submit": "Enviar enlace de recuperación",
    "forgot.back": "← Volver a iniciar sesión",
    "forgot.success": "Enlace de recuperación enviado. Revisa tu correo.",
    "welcome.title": "¡Bienvenido a IASOLUTIONS!",
    "welcome.subtitle": "Estamos preparando algo increíble para ti.",
    "welcome.badge": "Próximamente",
    "welcome.hello": "Hola, {name} 👋",
    "welcome.footer": "Te notificaremos cuando todo esté listo.",
    "welcome.logout": "Cerrar Sesión",
    "toast.verified": "¡Email Confirmado! Tu cuenta ha sido verificada.",
    "toast.error": "Ocurrió un error.",
    "toast.authlinkfailed": "El enlace de autenticación falló o expiró.",
    "dashboard.microApps": "Micro Apps",
    "dashboard.app1": "Micro App #1",
    "dashboard.search": "Buscar... ⌘K",
    "dashboard.profile": "Perfil",
    "dashboard.settings": "Configuración",
    "dashboard.logout": "Cerrar Sesión",
    "dashboard.users": "Usuarios Totales",
    "dashboard.sessions": "Sesiones Activas",
    "dashboard.conversions": "Conversiones",
    "dashboard.revenue": "Ingresos",
    "dashboard.vsLastMonth": "vs mes pasado",
    "dashboard.quickActions": "Acciones Rápidas",
    "dashboard.action1": "Nueva Campaña",
    "dashboard.action2": "Generar Reporte",
    "dashboard.action3": "Ajustes del Sistema",
    "dashboard.recentActivity": "Actividad Reciente",
    "dashboard.activity1": "El usuario Sarah se registró",
    "dashboard.activity2": "Despliegue de servidor exitoso",
    "dashboard.activity3": "Copia de seguridad completada",
    "dashboard.time1": "Hace 2 mins",
    "dashboard.time2": "Hace 1 hora",
    "dashboard.time3": "Hace 3 horas",
    "dashboard.revenueTrend": "Tendencia de Ingresos",
    "dashboard.userGrowth": "Crecimiento de Usuarios",
    "gdpr.accept": "Acepto la Política de Privacidad",
    "gdpr.privacyPolicy": "Política de Privacidad",
    "gdpr.cookiePolicy": "Política de Cookies",
    "gdpr.legalNotice": "Aviso Legal",
    "cookies.title": "Usamos cookies",
    "cookies.description": "Utilizamos cookies para mejorar tu experiencia y analizar el tráfico. Al continuar navegando, aceptas nuestro uso de cookies.",
    "cookies.accept": "Aceptar todas",
    "cookies.settings": "Configuración",
    "legal.title": "Información Legal",
    "legal.lastUpdated": "Última actualización",
  }
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Language;
    if (saved && (saved === "en" || saved === "es")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  const t = (key: string, params?: Record<string, string>) => {
    let text = translations[language][key] || key;
    if (params) {
      Object.keys(params).forEach(p => {
        text = text.replace(`{${p}}`, params[p]);
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
