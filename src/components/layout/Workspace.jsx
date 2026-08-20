import React, { useState, useEffect, useRef } from 'react';
import { Layout, Model, Actions, TabNode } from 'flexlayout-react';
import 'flexlayout-react/style/dark.css'; // use dark theme
import Sidebar from './Sidebar';
import MatrixBackground from '../../canvas/MatrixBackground';

// Import our panel components
import MarketDashboard from '../../pages/MarketDashboard';
import CurrencyCenter from '../../pages/CurrencyCenter';
import Vault from '../../pages/Vault';
import Settings from '../../pages/Settings';

const defaultConfig = {
    global: {
        tabEnableClose: true,
        tabEnableRename: false,
        tabSetEnableMaximize: true,
        splitterSize: 4,
        splitterExtra: 8,
        tabEnableFloat: true,
        tabSetTabStripHeight: 40,
    },
    borders: [
        {
            type: "border",
            location: "left",
            size: 260,
            children: [
                {
                    type: "tab",
                    enableClose: false,
                    name: "Navigation",
                    component: "sidebar",
                }
            ]
        }
    ],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 50,
                id: "main-tabset",
                children: [
                    {
                        type: "tab",
                        name: "Market",
                        component: "market",
                        id: "tab-market"
                    }
                ]
            }
        ]
    }
};

export default function Workspace({ user, onLogout }) {
    const [model, setModel] = useState(() => {
        // Try loading from localStorage
        const saved = localStorage.getItem('cyberhub_layout');
        if (saved) {
            try {
                return Model.fromJson(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load layout", e);
            }
        }
        return Model.fromJson(defaultConfig);
    });

    const layoutRef = useRef(null);

    // Save layout changes to localStorage
    const handleModelChange = () => {
        if (model) {
            localStorage.setItem('cyberhub_layout', JSON.stringify(model.toJson()));
        }
    };

    const handleAction = (action) => {
        return action;
    };

    const factory = (node) => {
        const component = node.getComponent();
        
        switch(component) {
            case 'sidebar':
                return <Sidebar user={user} onLogout={onLogout} layoutModel={model} />;
            case 'market':
                return <MarketDashboard />;
            case 'currencies':
                return <CurrencyCenter />;
            case 'vault':
                return <Vault user={user} />;
            case 'settings':
                return <Settings user={user} onLogout={onLogout} />;
            case 'chat':
                return <div style={{padding: 20, color: '#fff'}}>Chat Panel (WIP)</div>;
            default:
                return <div style={{padding: 20, color: '#fff'}}>Unknown Component: {component}</div>;
        }
    };

    return (
        <div style={{ display: 'flex', width: '100%', height: '100vh', position: 'relative' }}>
            <MatrixBackground />
            
            <div style={{ flex: 1, position: 'relative', zIndex: 10 }}>
                <Layout 
                    ref={layoutRef}
                    model={model} 
                    factory={factory} 
                    onModelChange={handleModelChange}
                    onAction={handleAction}
                    className="cyber-flexlayout"
                />
            </div>
            
            {/* Custom CSS overrides for flexlayout to match our theme */}
            <style>{`
                .cyber-flexlayout .flexlayout__layout {
                    background: transparent !important;
                }
                .cyber-flexlayout .flexlayout__tabset {
                    background: rgba(0, 0, 0, 0.4) !important;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .cyber-flexlayout .flexlayout__tabset_header {
                    background: rgba(0, 0, 0, 0.6) !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .cyber-flexlayout .flexlayout__tab_button {
                    background: transparent;
                    color: var(--text-muted);
                }
                .cyber-flexlayout .flexlayout__tab_button--selected {
                    background: rgba(6, 182, 212, 0.15) !important;
                    color: var(--accent-primary) !important;
                    border-bottom: 2px solid var(--accent-primary);
                }
                .cyber-flexlayout .flexlayout__border_left {
                    background: rgba(0, 0, 0, 0.5) !important;
                    border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                .cyber-flexlayout .flexlayout__border_button {
                    color: var(--text-muted);
                }
                .cyber-flexlayout .flexlayout__splitter {
                    background: transparent !important;
                }
                .cyber-flexlayout .flexlayout__splitter:hover {
                    background: var(--accent-primary) !important;
                    opacity: 0.5;
                }
            `}</style>
        </div>
    );
}
