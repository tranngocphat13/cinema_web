"use client";

import React from "react";
import ClientProvider from "@/components/forms/ClientProvider";
import { I18nProvider } from "@/components/i18n/i18nProvider";
import type { Lang } from "@/components/i18n/i18nProvider";

export default function AppProviders({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: Lang;
}) {
  return (
    <I18nProvider initialLang={initialLang}>
      <ClientProvider>{children}</ClientProvider>
    </I18nProvider>
  );
}
