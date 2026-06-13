import { useState } from "react";
import classes from "./DiaryTabs.module.css";

type Tab = { id: string; label: string };
const TABS: Tab[] = [
  { id: "written", label: "작성한 일기" },
  { id: "read", label: "열람한 일기" },
];

type Props = { onChange?: (tabId: string) => void };

export default function DiaryTabs({ onChange }: Props) {
  const [activeTab, setActiveTab] = useState("written");

  const handleClick = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <div className={classes.tablist} role="tablist" aria-label="일기 탭">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`${classes.tab} ${
            activeTab === tab.id ? classes.active : ""
          }`}
          onClick={() => handleClick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
