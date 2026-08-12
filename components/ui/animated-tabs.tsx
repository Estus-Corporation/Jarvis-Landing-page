"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

// Adaptado do componente recebido: trocamos os tokens shadcn que este
// projeto nao tem (bg-primary, text-foreground, outline-ring, var(--radius))
// pelos equivalentes do sistema monocromatico daqui, e o import de
// framer-motion virou motion/react (mesmo pacote "motion", e a convencao
// usada em todo o resto do site). O truque da bolha (layoutId + spring)
// continua identico ao original.
export function AnimatedTabs({
  tabs,
  defaultTab,
  onChange,
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className="flex space-x-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={cn(
            "relative rounded-full px-3 py-1.5 text-sm font-medium text-white outline-none transition focus-visible:outline-2 focus-visible:outline-white/50",
            activeTab !== tab.id && "hover:text-white/60"
          )}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          {activeTab === tab.id && (
            <motion.span
              layoutId="bubble"
              className="absolute inset-0 z-10 rounded-full bg-white mix-blend-difference"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
