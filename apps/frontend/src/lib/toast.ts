/**
 * Minimal toast utility — wraps the browser's console.error for SSR safety and
 * injects a small DOM notification so the user sees it on screen.
 *
 * Replace this with react-hot-toast or sonner when the team decides on a lib.
 */

type ToastType = 'error' | 'success' | 'info';

function show(message: string, type: ToastType = 'info') {
  // Also log to console for debugging
  if (type === 'error') {
    console.error('[Toast]', message);
  } else {
    console.log('[Toast]', message);
  }

  // Inject a DOM notification
  const container = getOrCreateContainer();

  const el = document.createElement('div');
  el.setAttribute('role', 'alert');
  el.setAttribute('aria-live', 'assertive');
  el.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    animation: toastIn 0.2s ease forwards;
    max-width: 360px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#6366f1'};
  `;
  el.textContent = message;

  container.appendChild(el);

  // Auto-dismiss after 4 s
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
    el.style.transition = 'opacity 0.25s, transform 0.25s';
    setTimeout(() => el.remove(), 300);
  }, 4000);
}

function getOrCreateContainer() {
  const id = '__toast_container__';
  let c = document.getElementById(id);
  if (!c) {
    c = document.createElement('div');
    c.id = id;
    c.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    `;
    // Keyframe for entry animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes toastIn {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(c);
  }
  return c;
}

export const toast = {
  error:   (msg: string) => show(msg, 'error'),
  success: (msg: string) => show(msg, 'success'),
  info:    (msg: string) => show(msg, 'info'),
};
