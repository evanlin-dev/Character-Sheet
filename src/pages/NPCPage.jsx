import { Link } from "react-router-dom";
import Sidebar, { SidebarBtn } from "src/components/Sidebar";
import NPCManager from "src/components/NPCManager";

export default function NPCPage() {
  return (
    <>
      <Sidebar>
        {(closeSidebar) => (
          <>
            <SidebarBtn onClick={closeSidebar}>
              <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Character Sheet</Link>
            </SidebarBtn>
            <SidebarBtn onClick={closeSidebar}>
              <Link to="/dm" style={{ color: "inherit", textDecoration: "none" }}>DM Screen</Link>
            </SidebarBtn>
          </>
        )}
      </Sidebar>
      <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--parchment)", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(42,24,16,0.02) 2px, rgba(42,24,16,0.02) 4px)", pointerEvents: "none", opacity: 0.5 }} />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="header">
            <h1>NPC Manager</h1>
            <Link to="/dm" className="dm-screen-button">DM Screen</Link>
            <div className="subtitle">Non-Player Characters</div>
          </div>
          <NPCManager />
        </div>
      </div>
    </>
  );
}