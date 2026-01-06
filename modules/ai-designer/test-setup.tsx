/**
 * Test setup for AI Designer Modular Version
 * This file provides a quick way to test individual components
 */

import React from 'react';
import { ViewsDisplay } from './components/ViewsDisplay';
import { ChatInterface } from './components/ChatInterface';
import { RevisionHistory } from './components/RevisionHistory';
import { useEditorStore } from './store/editorStore';
import { useChatStore } from './store/chatStore';

// Test data
const TEST_VIEWS = {
  front: 'https://via.placeholder.com/400x500/FF0000/FFFFFF?text=Front+View',
  back: 'https://via.placeholder.com/400x500/00FF00/FFFFFF?text=Back+View',
  side: 'https://via.placeholder.com/400x500/0000FF/FFFFFF?text=Side+View',
  top: 'https://via.placeholder.com/400x500/FF00FF/FFFFFF?text=Top+View',
  bottom: 'https://via.placeholder.com/400x500/00FFFF/FFFFFF?text=Bottom+View',
};

const TEST_REVISIONS = [
  {
    id: 'rev-1',
    revisionNumber: 0,
    views: {
      front: { imageUrl: TEST_VIEWS.front },
      back: { imageUrl: TEST_VIEWS.back },
      side: { imageUrl: TEST_VIEWS.side },
      top: { imageUrl: TEST_VIEWS.top },
      bottom: { imageUrl: TEST_VIEWS.bottom },
    },
    editPrompt: 'Original design',
    editType: 'initial' as const,
    createdAt: new Date().toISOString(),
    isActive: false,
  },
  {
    id: 'rev-2',
    revisionNumber: 1,
    views: {
      front: { imageUrl: TEST_VIEWS.front },
      back: { imageUrl: TEST_VIEWS.back },
      side: { imageUrl: TEST_VIEWS.side },
      top: { imageUrl: TEST_VIEWS.top },
      bottom: { imageUrl: TEST_VIEWS.bottom },
    },
    editPrompt: 'Made it more colorful',
    editType: 'ai_edit' as const,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

/**
 * Component Test Harness
 * Use this to test individual components in isolation
 */
export function ComponentTestHarness() {
  const { setCurrentViews, setLoadingView } = useEditorStore();
  const { addMessage } = useChatStore();

  // Initialize test data
  React.useEffect(() => {
    // Set test views
    setCurrentViews(TEST_VIEWS);

    // Add test messages
    addMessage({
      id: 'msg-1',
      type: 'user',
      content: 'Make it more colorful',
      timestamp: new Date(),
    });

    addMessage({
      id: 'msg-2',
      type: 'ai',
      content: 'I\'ll make your product more colorful. Let me process that for you.',
      timestamp: new Date(),
    });

    addMessage({
      id: 'msg-3',
      type: 'success',
      content: 'Successfully updated the design!',
      timestamp: new Date(),
    });
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">AI Designer Component Test Harness</h1>

      {/* Test ViewsDisplay */}
      <section className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">ViewsDisplay Component</h2>
        <div className="h-96">
          <ViewsDisplay
            onViewClick={(view) => console.log('View clicked:', view)}
          />
        </div>
        <div className="mt-4 space-x-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => setLoadingView('front', true)}
          >
            Set Front Loading
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => setLoadingView('front', false)}
          >
            Clear Front Loading
          </button>
        </div>
      </section>

      {/* Test ChatInterface */}
      <section className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">ChatInterface Component</h2>
        <div className="h-96">
          <ChatInterface
            onSendMessage={(msg) => {
              console.log('Message sent:', msg);
              addMessage({
                id: `msg-${Date.now()}`,
                type: 'user',
                content: msg,
                timestamp: new Date(),
              });
            }}
          />
        </div>
      </section>

      {/* Test RevisionHistory */}
      <section className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">RevisionHistory Component</h2>
        <div className="h-96 w-64">
          <RevisionHistory
            revisions={TEST_REVISIONS}
            onRollback={(rev) => console.log('Rollback to:', rev)}
            onDelete={async (id) => {
              console.log('Delete revision:', id);
              return true;
            }}
          />
        </div>
      </section>
    </div>
  );
}

/**
 * Store Inspector
 * Use this to inspect Zustand store states
 */
export function StoreInspector() {
  const editorState = useEditorStore();
  const chatState = useChatStore();

  return (
    <div className="fixed bottom-4 left-4 p-4 bg-white border rounded-lg shadow-lg max-w-md max-h-96 overflow-auto">
      <h3 className="font-bold mb-2">Store Inspector</h3>

      <details className="mb-2">
        <summary className="cursor-pointer font-semibold">Editor Store</summary>
        <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
          {JSON.stringify({
            currentViews: editorState.currentViews,
            loadingViews: editorState.loadingViews,
            isEditing: editorState.isEditing,
            zoomLevel: editorState.viewport.zoomLevel,
          }, null, 2)}
        </pre>
      </details>

      <details>
        <summary className="cursor-pointer font-semibold">Chat Store</summary>
        <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
          {JSON.stringify({
            messageCount: chatState.messages.length,
            isProcessing: chatState.isProcessing,
            editPrompt: chatState.editPrompt,
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
