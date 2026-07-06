import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { i18n } from "./i18n";
import "./styles/tokhub.css";
import "./styles/platform.css";
import "./styles/admin.css";
import "./styles/app.css";
import { NotFoundPage } from "./pages/NotFoundPage";
import { modules, moduleElement } from "./modules/registry";
import { DEFAULT_ADMIN_PATH, adminPath, getAdminPath, legacyAdminPathToCurrent, routeWithAdminPath, setAdminPath } from "./lib/adminPath";
import { siteConfig } from "./lib/api";

const isProductionBuild = Boolean((import.meta as ImportMeta & { env?: { PROD?: boolean } }).env?.PROD);

if ("serviceWorker" in navigator && isProductionBuild) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </I18nextProvider>
);

function AppRoutes() {
  const [adminBase, setAdminBase] = useState(getAdminPath());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    siteConfig()
      .then((site) => {
        if (!active) return;
        setAdminBase(setAdminPath(site.adminPath));
      })
      .catch(() => {
        if (!active) return;
        setAdminBase(setAdminPath(DEFAULT_ADMIN_PATH));
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!loaded) {
    return <div className="card card-pad">正在加载站点配置...</div>;
  }

  return (
    <Routes>
      {modules.map((module) => (
        <Route path={routeWithAdminPath(module.path)} element={moduleElement(module)} key={`${module.id}:${adminBase}`} />
      ))}
      {adminBase !== DEFAULT_ADMIN_PATH ? (
        <Route path="/admin/*" element={<LegacyAdminRedirect />} />
      ) : (
        <Route path="/admin/*" element={<NotFoundPage />} />
      )}
      <Route path={`${adminPath()}/*`} element={<NotFoundPage />} />
      <Route path="/console/*" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function LegacyAdminRedirect() {
  const location = useLocation();
  const pathname = legacyAdminPathToCurrent(location.pathname);
  return <Navigate to={`${pathname}${location.search}${location.hash}`} replace />;
}
