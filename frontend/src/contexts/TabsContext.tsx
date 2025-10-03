import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
// import { useNavigate } from 'react-router-dom'; // <-- LINHA REMOVIDA

interface Tab {
    label: string;
    value: string;
}

interface TabsContextType {
    openTabs: Tab[];
    activeTab: string | false;
    setActiveTab: (value: string | false) => void;
    addTab: (tab: Tab) => void;
    closeTab: (value: string) => string;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const initialTabs: Tab[] = [{ label: 'Início', value: '/inicio' }];

export const TabsProvider = ({ children }: { children: ReactNode }) => {
    const [openTabs, setOpenTabs] = useState<Tab[]>(initialTabs);
    const [activeTab, setActiveTab] = useState<string | false>('/inicio');
    // const navigate = useNavigate(); // <-- LINHA REMOVIDA

    const addTab = (tab: Tab) => {
        if (!openTabs.find(t => t.value === tab.value)) {
            setOpenTabs(prevTabs => [...prevTabs, tab]);
        }
        setActiveTab(tab.value);
    };

    const closeTab = (valueToClose: string): string => {
        const tabIndex = openTabs.findIndex(t => t.value === valueToClose);
        const newTabs = openTabs.filter(t => t.value !== valueToClose);
        setOpenTabs(newTabs);

        if (activeTab !== valueToClose) {
            return activeTab || '/inicio';
        }

        const newActiveTab = newTabs[tabIndex - 1] || initialTabs[0];
        setActiveTab(newActiveTab.value);
        return newActiveTab.value;
    };

    return (
        <TabsContext.Provider value={{ openTabs, activeTab, setActiveTab, addTab, closeTab }}>
            {children}
        </TabsContext.Provider>
    );
};

export const useTabs = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('useTabs must be used within a TabsProvider');
    }
    return context;
};