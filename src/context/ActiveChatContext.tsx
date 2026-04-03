import { createContext, useContext, useRef } from 'react';
import type { ReactNode } from 'react';

// Guardamos el conversationId activo en un ref (no necesita re-render)
const ActiveChatContext = createContext<{ activeConversationId: React.MutableRefObject<string | null> } | undefined>(undefined);

export function ActiveChatProvider({ children }: { children: ReactNode }) {
    const activeConversationId = useRef<string | null>(null);
    return (
        <ActiveChatContext.Provider value={{ activeConversationId }}>
            {children}
        </ActiveChatContext.Provider>
    );
}

export function useActiveChat() {
    const context = useContext(ActiveChatContext);
    if (!context) throw new Error('useActiveChat debe usarse dentro de ActiveChatProvider');
    return context;
}
